/**
 * ==========================================================================
 * CareerInfinity — AI-Powered Career Intelligence Platform
 * Module: Supabase Client Configuration
 * File: supabase-client.js
 *
 * PURPOSE:
 *   Single shared Supabase client for all modules (resume, profile, etc.).
 *   Import this via <script type="module"> or a regular <script> tag.
 *
 * HOW TO CONFIGURE:
 *   1. Go to your Supabase project → Settings → API
 *   2. Copy your "Project URL" and your "anon / public" key
 *   3. Replace the placeholder values below with your real values
 *   4. NEVER use the "service_role" key here — it bypasses RLS
 *
 * SECURITY NOTE:
 *   The anon/public key is safe to include in browser JavaScript ONLY
 *   because Supabase Row Level Security (RLS) is enabled on all tables
 *   and the Storage bucket is private. The key alone cannot access
 *   data that RLS policies forbid.
 *
 *   DO NOT commit real secrets to Git.
 *   This file contains your anon key (publishable) — NOT service_role.
 * ==========================================================================
 */

// ---------------------------------------------------------------------------
// CONFIGURATION — Replace these two values with your Supabase project details
// ---------------------------------------------------------------------------
const SUPABASE_URL = 'YOUR_SUPABASE_PROJECT_URL';
// Example: 'https://xyzabcdefgh.supabase.co'

const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_PUBLIC_KEY';
// Example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
// Found at: Supabase Dashboard → Settings → API → "anon public" key
// This is the PUBLISHABLE key — safe for browser code when RLS is enabled.
// NEVER use the "service_role" key in browser JavaScript.

// ---------------------------------------------------------------------------
// Validation — check that placeholders have been replaced
// ---------------------------------------------------------------------------
if (
  SUPABASE_URL === 'YOUR_SUPABASE_PROJECT_URL' ||
  SUPABASE_ANON_KEY === 'YOUR_SUPABASE_ANON_PUBLIC_KEY'
) {
  console.error(
    '[CareerInfinity] ⚠️  Supabase is not configured.\n' +
    'Open supabase-client.js and replace SUPABASE_URL and SUPABASE_ANON_KEY\n' +
    'with your real Supabase project values from:\n' +
    'Supabase Dashboard → Settings → API'
  );
}

// ---------------------------------------------------------------------------
// Create and export the Supabase client
// Using the ESM CDN build of @supabase/supabase-js v2
// ---------------------------------------------------------------------------
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    // Persist the session across page reloads using localStorage.
    // This is safe — Supabase stores only the JWT token, not passwords.
    persistSession: true,
    // Automatically refresh the JWT before it expires (default: true)
    autoRefreshToken: true,
    // Detect the session from the URL hash after OAuth or magic link redirects
    detectSessionInUrl: true,
  },
});

// ---------------------------------------------------------------------------
// Convenience: get the currently authenticated user's session
// Returns null if the user is not logged in.
// ---------------------------------------------------------------------------
export async function getCurrentSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    console.error('[CareerInfinity] Failed to get session:', error.message);
    return null;
  }
  return data.session;
}

// ---------------------------------------------------------------------------
// Convenience: get the current user object (shortcut)
// ---------------------------------------------------------------------------
export async function getCurrentUser() {
  const session = await getCurrentSession();
  return session ? session.user : null;
}

// ---------------------------------------------------------------------------
// Convenience: sign out and redirect to login page
// ---------------------------------------------------------------------------
export async function signOutAndRedirect() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('[CareerInfinity] Logout error:', error.message);
  }
  // Always redirect, even if signOut had an error (session may be invalid)
  window.location.href = 'index.html';
}
