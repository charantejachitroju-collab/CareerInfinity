-- =============================================================================
-- CareerInfinity — AI-Powered Career Intelligence Platform
-- Module: Resume Upload (Phase 3)
-- File: supabase/resumes.sql
--
-- PURPOSE:
--   Run this entire file in the Supabase SQL Editor
--   (Dashboard → SQL Editor → New Query → Paste → Run).
--
-- WHAT IT DOES:
--   1. Creates the `resumes` table in the public schema.
--   2. Enables Row Level Security (RLS) on the table.
--   3. Creates RLS policies so each user can ONLY access their own rows.
--   4. Creates a Storage bucket named `resumes` (private).
--   5. Creates Storage RLS policies so each user can ONLY access files
--      stored under their own UUID folder path.
--
-- STEP-BY-STEP MANUAL CHECKLIST (run once per Supabase project):
--   [ ] Open your Supabase project → SQL Editor
--   [ ] Click "New Query"
--   [ ] Paste this entire file
--   [ ] Click "Run"
--   [ ] Verify: go to Table Editor → confirm "resumes" table appears
--   [ ] Verify: go to Storage → confirm "resumes" bucket appears as Private
--   [ ] Verify: go to Authentication → Policies → confirm policies appear
-- =============================================================================


-- =============================================================================
-- SECTION 1: RESUMES TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.resumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL CHECK (char_length(file_name) > 0 AND char_length(file_name) <= 500),
  storage_path TEXT NOT NULL CHECK (char_length(storage_path) > 0),
  file_type TEXT NOT NULL CHECK (
    file_type IN (
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    )
  ),
  file_size BIGINT NOT NULL CHECK (file_size > 0 AND file_size <= 5242880),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.resumes IS 'Stores metadata for resume files uploaded by authenticated users. The actual file bytes live in Supabase Storage under the "resumes" bucket. Each row references one storage object path.';
COMMENT ON COLUMN public.resumes.storage_path IS 'Internal Supabase Storage object path. Format: <user_uuid>/<file_uuid>.<ext>. Generated server-side — never trust user input for this value.';
COMMENT ON COLUMN public.resumes.file_name IS 'Original filename as provided by the user. Display only — always escape before rendering to prevent XSS.';


-- =============================================================================
-- SECTION 2: INDEXES
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON public.resumes (user_id);
CREATE INDEX IF NOT EXISTS idx_resumes_created_at ON public.resumes (created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_resumes_storage_path ON public.resumes (storage_path);


-- =============================================================================
-- SECTION 3: AUTO-UPDATE updated_at TRIGGER
-- =============================================================================

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_resumes_updated_at ON public.resumes;
CREATE TRIGGER trigger_resumes_updated_at
  BEFORE UPDATE ON public.resumes
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();


-- =============================================================================
-- SECTION 4: ROW LEVEL SECURITY (RLS) — DATABASE TABLE
-- =============================================================================

ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;

-- POLICY 1: SELECT — users can read only their own resume records
DROP POLICY IF EXISTS "resumes_select_own" ON public.resumes;
CREATE POLICY "resumes_select_own"
  ON public.resumes FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- POLICY 2: INSERT — users can only insert rows where user_id = their own UUID
DROP POLICY IF EXISTS "resumes_insert_own" ON public.resumes;
CREATE POLICY "resumes_insert_own"
  ON public.resumes FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- POLICY 3: UPDATE — users can only update their own rows
DROP POLICY IF EXISTS "resumes_update_own" ON public.resumes;
CREATE POLICY "resumes_update_own"
  ON public.resumes FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- POLICY 4: DELETE — users can only delete their own rows
DROP POLICY IF EXISTS "resumes_delete_own" ON public.resumes;
CREATE POLICY "resumes_delete_own"
  ON public.resumes FOR DELETE TO authenticated
  USING (user_id = auth.uid());


-- =============================================================================
-- SECTION 5: STORAGE BUCKET
-- =============================================================================

-- Create a PRIVATE storage bucket named "resumes".
-- Private = no public URL access. Files accessed via authenticated signed URLs only.
-- If the bucket already exists, this updates its settings (safe to re-run).
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'resumes',
  'resumes',
  FALSE,
  5242880,
  ARRAY[
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public             = EXCLUDED.public,
  file_size_limit    = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;


-- =============================================================================
-- SECTION 6: STORAGE RLS POLICIES
-- =============================================================================
-- Storage path format: <user_uuid>/<file_uuid>.<ext>
-- We verify the first path segment equals auth.uid()::text to enforce ownership.
-- =============================================================================

-- POLICY: SELECT (download / read) — own files only
DROP POLICY IF EXISTS "storage_resumes_select_own" ON storage.objects;
CREATE POLICY "storage_resumes_select_own"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'resumes'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- POLICY: INSERT (upload) — own folder only
DROP POLICY IF EXISTS "storage_resumes_insert_own" ON storage.objects;
CREATE POLICY "storage_resumes_insert_own"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'resumes'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- POLICY: UPDATE (replace / overwrite) — own files only
DROP POLICY IF EXISTS "storage_resumes_update_own" ON storage.objects;
CREATE POLICY "storage_resumes_update_own"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'resumes'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'resumes'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- POLICY: DELETE — own files only
DROP POLICY IF EXISTS "storage_resumes_delete_own" ON storage.objects;
CREATE POLICY "storage_resumes_delete_own"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'resumes'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );


-- =============================================================================
-- VERIFICATION QUERIES (run separately to confirm setup)
-- =============================================================================
-- SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'resumes';
-- SELECT policyname, cmd, qual FROM pg_policies WHERE tablename = 'resumes';
-- SELECT id, name, public, file_size_limit FROM storage.buckets WHERE id = 'resumes';
-- SELECT policyname, cmd FROM pg_policies WHERE tablename = 'objects' AND policyname LIKE 'storage_resumes%';
