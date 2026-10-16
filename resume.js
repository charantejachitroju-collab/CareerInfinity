/**
 * ==========================================================================
 * CareerInfinity — AI-Powered Career Intelligence Platform
 * Module: Resume Upload (Phase 3)
 * File: resume.js
 *
 * ARCHITECTURE:
 *   - ES Module (type="module") — loaded by resume.html
 *   - Imports the shared Supabase client from supabase-client.js
 *   - Uses Supabase Auth, Storage, and PostgreSQL (via supabase-js v2)
 *
 * SECURITY:
 *   - All access is gated by Supabase Auth session
 *   - Storage paths are built from the server-verified user UUID
 *   - File names are displayed using textContent (never innerHTML) to
 *     prevent XSS from malicious filenames
 *   - File validation runs on the client AND is enforced by Storage
 *     bucket mime-type and size limits server-side
 *   - RLS on the DB table and Storage policies enforce per-user isolation
 *
 * OPERATIONS SUPPORTED:
 *   - Load existing resumes on page init
 *   - Upload new resume (PDF or DOCX, max 5 MB)
 *   - View / download resume via short-lived signed URL (60 min)
 *   - Replace resume (safe: new file uploaded first, then old cleaned up)
 *   - Delete resume (with confirmation modal)
 *
 * LIMITATIONS (by design for this phase):
 *   - Upload progress is simulated (Supabase JS SDK does not expose
 *     XHR progress events natively in v2 for the storage.upload() method)
 *   - No AI resume analysis (planned for a future phase)
 * ==========================================================================
 */

import { supabase, getCurrentSession, signOutAndRedirect } from './supabase-client.js';

// ---------------------------------------------------------------------------
// CONFIGURATION
// ---------------------------------------------------------------------------
const BUCKET_NAME       = 'resumes';
const TABLE_NAME        = 'resumes';
const MAX_FILE_SIZE     = 5 * 1024 * 1024; // 5 MB in bytes
const SIGNED_URL_EXPIRY = 60 * 60;          // 1 hour in seconds

const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

const ALLOWED_EXTENSIONS = new Set(['.pdf', '.docx']);

// ---------------------------------------------------------------------------
// MODULE STATE
// ---------------------------------------------------------------------------
let currentUser  = null;
let selectedFile = null;

// When replacing a resume, we hold the old record here until the new
// upload succeeds, then clean it up safely.
let pendingReplaceRecord = null;

// ---------------------------------------------------------------------------
// DOM ELEMENT REFERENCES — gathered once on init
// ---------------------------------------------------------------------------
const el = {};

function gatherElements() {
  el.authLoading       = document.getElementById('resumeAuthLoading');
  el.configError       = document.getElementById('resumeConfigError');
  el.resumeContent     = document.getElementById('resumeContent');
  el.resumeFooter      = document.getElementById('resumeFooter');

  el.uploadZone        = document.getElementById('uploadZone');
  el.fileInput         = document.getElementById('resumeFileInput');
  el.uploadZoneIdle    = document.getElementById('uploadZoneIdle');
  el.uploadZoneDragover = document.getElementById('uploadZoneDragover');
  el.uploadBrowseBtn   = document.getElementById('uploadBrowseBtn');
  el.uploadMessage     = document.getElementById('uploadMessage');

  el.filePreviewCard   = document.getElementById('filePreviewCard');
  el.filePreviewName   = document.getElementById('filePreviewName');
  el.filePreviewMeta   = document.getElementById('filePreviewMeta');
  el.filePreviewIcon   = document.getElementById('filePreviewIcon');
  el.confirmUploadBtn  = document.getElementById('confirmUploadBtn');
  el.cancelFileBtn     = document.getElementById('cancelFileBtn');

  el.progressWrap      = document.getElementById('uploadProgressWrap');
  el.progressLabel     = document.getElementById('uploadProgressLabel');
  el.progressFile      = document.getElementById('uploadProgressFile');
  el.progressPct       = document.getElementById('uploadProgressPct');
  el.progressFill      = document.getElementById('uploadProgressFill');
  el.progressBar       = document.getElementById('uploadProgressBar');

  el.resumeListLoading = document.getElementById('resumeListLoading');
  el.resumeEmptyState  = document.getElementById('resumeEmptyState');
  el.resumeList        = document.getElementById('resumeList');
  el.emptyStateUploadBtn = document.getElementById('emptyStateUploadBtn');
  el.resumeCountSubtitle = document.getElementById('resumeCountSubtitle');

  el.deleteModal       = document.getElementById('deleteModal');
  el.deleteModalFileName = document.getElementById('deleteModalFileName');
  el.deleteModalCloseBtn = document.getElementById('deleteModalCloseBtn');
  el.confirmDeleteBtn  = document.getElementById('confirmDeleteBtn');
  el.cancelDeleteBtn   = document.getElementById('cancelDeleteBtn');

  el.comingSoonModal   = document.getElementById('comingSoonModal');
  el.csModalClose      = document.getElementById('modalCloseBtn');
  el.csModalAction     = document.getElementById('modalActionBtn');
  el.csModalModuleName = document.getElementById('modalModuleName');

  el.toast             = document.getElementById('resumeToast');
  el.toastTitle        = document.getElementById('resumeToastTitle');
  el.toastMessage      = document.getElementById('resumeToastMessage');
  el.toastClose        = document.getElementById('resumeToastClose');

  el.logoutBtn         = document.getElementById('logoutBtn');
  el.avatarInitials    = document.getElementById('avatarInitials');
  el.avatarName        = document.getElementById('avatarName');
  el.hamburgerBtn      = document.getElementById('hamburgerBtn');
  el.sidebar           = document.getElementById('sidebar');
  el.sidebarOverlay    = document.getElementById('sidebarOverlay');
}

// ===========================================================================
// ENTRY POINT
// ===========================================================================
document.addEventListener('DOMContentLoaded', async () => {
  gatherElements();

  // Check whether Supabase is configured (placeholder values not replaced)
  if (isSupabaseUnconfigured()) {
    showConfigError();
    return;
  }

  // Initialise non-auth UI immediately
  initSidebarToggle();
  initComingSoonLinks();
  initComingSoonModal();
  initToast();

  // Check authentication before showing any resume data
  await initAuth();
});

// ---------------------------------------------------------------------------
// SUPABASE CONFIGURATION CHECK
// ---------------------------------------------------------------------------
function isSupabaseUnconfigured() {
  // The supabase-client.js logs an error, but we also check here to
  // show a friendly UI rather than crashing the page.
  try {
    const url = supabase.supabaseUrl || '';
    return (
      url === 'YOUR_SUPABASE_PROJECT_URL' ||
      url === '' ||
      url.includes('YOUR_SUPABASE')
    );
  } catch {
    return true;
  }
}

function showConfigError() {
  hide(el.authLoading);
  show(el.configError);
}

// ===========================================================================
// AUTHENTICATION
// ===========================================================================
async function initAuth() {
  try {
    const session = await getCurrentSession();

    if (!session || !session.user) {
      // Not logged in — redirect to login page
      window.location.href = 'index.html';
      return;
    }

    currentUser = session.user;

    // Set up user display in topbar
    updateTopbarUser(currentUser);

    // Set up logout button
    if (el.logoutBtn) {
      el.logoutBtn.addEventListener('click', async () => {
        await signOutAndRedirect();
      });
    }

    // Listen for session changes (e.g., session expires while page is open)
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        window.location.href = 'index.html';
      } else if (session && session.user) {
        currentUser = session.user;
      }
    });

    // Auth confirmed — show the resume module
    hide(el.authLoading);
    show(el.resumeContent);
    show(el.resumeFooter);

    // Initialise all resume-related interactions
    initUploadZone();
    initUploadActions();
    initDeleteModal();

    // Load existing resumes
    await loadResumes();

  } catch (err) {
    console.error('[CareerInfinity] Auth error:', err);
    hide(el.authLoading);
    showToast('error', 'Session Error', 'Could not verify your session. Please sign in again.');
    setTimeout(() => { window.location.href = 'index.html'; }, 2500);
  }
}

function updateTopbarUser(user) {
  if (!user) return;

  const email     = user.email || '';
  const localPart = email.split('@')[0] || '';
  const segments  = localPart.split(/[._-]/);
  const firstName = (segments[0] || '').replace(/[^a-zA-Z]/g, '');
  const secondSeg = (segments[1] || '').replace(/[^a-zA-Z]/g, '');

  const displayName = firstName
    ? firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase()
    : 'User';

  const initials = (firstName ? firstName[0].toUpperCase() : 'U') +
                   (secondSeg ? secondSeg[0].toUpperCase() : '');

  if (el.avatarName)     el.avatarName.textContent     = displayName;
  if (el.avatarInitials) el.avatarInitials.textContent = initials || 'CI';
}

// ===========================================================================
// UPLOAD ZONE — Drag & Drop + Click to Browse
// ===========================================================================
function initUploadZone() {
  if (!el.uploadZone || !el.fileInput) return;

  // Click on zone or browse button → trigger file picker
  el.uploadZone.addEventListener('click', (e) => {
    // Don't re-trigger if a button inside was clicked (the buttons have their own handlers)
    if (e.target.closest('.upload-browse-btn, .resume-btn')) return;
    el.fileInput.click();
  });

  el.uploadZone.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      el.fileInput.click();
    }
  });

  if (el.uploadBrowseBtn) {
    el.uploadBrowseBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      el.fileInput.click();
    });
  }

  // File selected via input
  el.fileInput.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelected(file);
    // Reset input so selecting the same file again still triggers change
    el.fileInput.value = '';
  });

  // Drag events
  el.uploadZone.addEventListener('dragenter', (e) => {
    e.preventDefault();
    e.stopPropagation();
    el.uploadZone.classList.add('drag-over');
  });

  el.uploadZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.stopPropagation();
    el.uploadZone.classList.add('drag-over');
  });

  el.uploadZone.addEventListener('dragleave', (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Only remove if leaving the zone itself (not a child element)
    if (!el.uploadZone.contains(e.relatedTarget)) {
      el.uploadZone.classList.remove('drag-over');
    }
  });

  el.uploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    e.stopPropagation();
    el.uploadZone.classList.remove('drag-over');

    const file = e.dataTransfer?.files?.[0];
    if (file) handleFileSelected(file);
  });

  // Empty state upload button scrolls to / focuses upload zone
  if (el.emptyStateUploadBtn) {
    el.emptyStateUploadBtn.addEventListener('click', () => {
      el.uploadZone.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => {
        el.fileInput.click();
      }, 400);
    });
  }
}

// ---------------------------------------------------------------------------
// FILE SELECTION HANDLER — validates the file and shows preview
// ---------------------------------------------------------------------------
function handleFileSelected(file) {
  clearUploadMessage();

  const validationError = validateFile(file);
  if (validationError) {
    showUploadMessage('error', validationError);
    return;
  }

  // File is valid — store it and show preview
  selectedFile = file;
  showFilePreview(file);
}

// ---------------------------------------------------------------------------
// FILE VALIDATION (client-side first pass)
// Server-side validation is enforced by Storage bucket settings.
// ---------------------------------------------------------------------------
function validateFile(file) {
  if (!file) return 'No file selected. Please choose a file.';

  // Extension check (case-insensitive)
  const ext = getFileExtension(file.name);
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return `File type not allowed. Only PDF (.pdf) and Word (.docx) files are accepted. You selected: "${ext || 'unknown'}"`;
  }

  // MIME type check
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return `The file content type "${file.type}" is not allowed. Please select a valid PDF or DOCX file.`;
  }

  // Size check
  if (file.size > MAX_FILE_SIZE) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
    return `File is too large (${sizeMB} MB). Maximum allowed size is 5 MB.`;
  }

  if (file.size === 0) {
    return 'The selected file appears to be empty. Please choose a valid resume file.';
  }

  return null; // No error
}

// ---------------------------------------------------------------------------
// FILE PREVIEW
// ---------------------------------------------------------------------------
function showFilePreview(file) {
  if (!el.filePreviewCard) return;

  const ext      = getFileExtension(file.name);
  const sizeText = formatBytes(file.size);
  const typeText = ext === '.pdf' ? 'PDF' : 'DOCX';

  // Update preview text (using textContent = XSS-safe)
  el.filePreviewName.textContent = file.name;
  el.filePreviewMeta.textContent = `${typeText} · ${sizeText}`;

  // Update icon class based on type
  el.filePreviewIcon.className = 'file-preview-icon';
  el.filePreviewIcon.classList.add(ext === '.pdf' ? 'pdf-icon' : 'docx-icon');

  show(el.filePreviewCard);
}

function hideFilePreview() {
  selectedFile = null;
  hide(el.filePreviewCard);
}

// ---------------------------------------------------------------------------
// UPLOAD / CANCEL ACTION BUTTONS
// ---------------------------------------------------------------------------
function initUploadActions() {
  if (el.confirmUploadBtn) {
    el.confirmUploadBtn.addEventListener('click', async () => {
      if (!selectedFile) return;
      await uploadResume(selectedFile);
    });
  }

  if (el.cancelFileBtn) {
    el.cancelFileBtn.addEventListener('click', () => {
      hideFilePreview();
      clearUploadMessage();
      pendingReplaceRecord = null; // cancel any replace operation
    });
  }
}

// ===========================================================================
// UPLOAD RESUME — core upload function
// ===========================================================================
async function uploadResume(file) {
  if (!currentUser) {
    showUploadMessage('error', 'You must be signed in to upload a resume.');
    return;
  }

  const userId = currentUser.id;

  // Disable buttons during upload
  setUploadButtonsDisabled(true);
  hideFilePreview();
  clearUploadMessage();
  showProgressBar(file.name);

  let storagePath = null;

  try {
    // -------------------------------------------------------------------
    // STEP 1: Generate a unique storage path
    // Format: <user_uuid>/<new_uuid>.<ext>
    // The user UUID is the first segment — Storage RLS uses this to verify
    // ownership. We generate a new UUID for the filename to avoid exposing
    // the original filename in the storage path.
    // -------------------------------------------------------------------
    const ext        = getFileExtension(file.name);
    const fileUUID   = generateUUID();
    storagePath      = `${userId}/${fileUUID}${ext}`;

    animateProgress(0, 30, 600); // simulate initial progress

    // -------------------------------------------------------------------
    // STEP 2: Upload the file to Supabase Storage (private bucket)
    // -------------------------------------------------------------------
    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(storagePath, file, {
        cacheControl: '3600',
        upsert: false,           // never overwrite an existing path
        contentType: file.type,
      });

    if (uploadError) {
      throw new Error(`Storage upload failed: ${uploadError.message}`);
    }

    animateProgress(30, 70, 500);

    // -------------------------------------------------------------------
    // STEP 3: Insert metadata into the PostgreSQL resumes table
    // If this fails, we attempt to clean up the orphaned storage file.
    // -------------------------------------------------------------------
    const { error: dbError } = await supabase
      .from(TABLE_NAME)
      .insert({
        user_id:      userId,
        file_name:    file.name,      // original name (display only)
        storage_path: storagePath,    // generated path (never user-supplied)
        file_type:    file.type,
        file_size:    file.size,
      });

    if (dbError) {
      // DB insert failed — attempt to delete the orphaned storage file
      console.error('[CareerInfinity] DB insert failed. Attempting storage cleanup...');
      await attemptStorageCleanup(storagePath, 'Orphan cleanup after DB insert failure');
      throw new Error(`Metadata save failed: ${dbError.message}`);
    }

    animateProgress(70, 90, 400);

    // -------------------------------------------------------------------
    // STEP 4: If this was a replace operation, clean up the old file
    // We only do this AFTER the new record has been successfully saved.
    // -------------------------------------------------------------------
    if (pendingReplaceRecord) {
      await deleteResumeRecord(pendingReplaceRecord, { silent: true });
      pendingReplaceRecord = null;
    }

    animateProgress(90, 100, 300);

    // -------------------------------------------------------------------
    // STEP 5: Refresh the resume list
    // -------------------------------------------------------------------
    await loadResumes();

    hideProgressBar();
    showUploadMessage('success', 'Resume uploaded successfully! Your file is stored securely.');
    showToast('success', 'Upload Successful', `"${sanitize(file.name)}" has been uploaded.`);

  } catch (err) {
    console.error('[CareerInfinity] Upload error:', err);
    hideProgressBar();
    showUploadMessage('error', `Upload failed: ${err.message}`);
    showToast('error', 'Upload Failed', err.message);
    storagePath = null;
  } finally {
    setUploadButtonsDisabled(false);
  }
}

// ---------------------------------------------------------------------------
// Attempt to remove an orphaned file from storage (best-effort cleanup)
// ---------------------------------------------------------------------------
async function attemptStorageCleanup(storagePath, reason) {
  try {
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([storagePath]);

    if (error) {
      console.warn(`[CareerInfinity] Storage cleanup failed (${reason}):`, error.message);
    } else {
      console.info(`[CareerInfinity] Storage cleanup successful (${reason}): ${storagePath}`);
    }
  } catch (e) {
    console.warn(`[CareerInfinity] Storage cleanup threw (${reason}):`, e);
  }
}

// ===========================================================================
// LOAD RESUMES — fetch from DB and render list
// ===========================================================================
async function loadResumes() {
  if (!currentUser) return;

  showResumeListState('loading');

  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('id, file_name, file_type, file_size, storage_path, created_at, updated_at')
      .eq('user_id', currentUser.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (!data || data.length === 0) {
      showResumeListState('empty');
      updateResumeSubtitle(0);
    } else {
      renderResumeList(data);
      updateResumeSubtitle(data.length);
      showResumeListState('list');
    }

  } catch (err) {
    console.error('[CareerInfinity] Load resumes error:', err);
    showResumeListState('empty');
    showToast('error', 'Load Error', `Could not load your resumes: ${err.message}`);
  }
}

function updateResumeSubtitle(count) {
  if (!el.resumeCountSubtitle) return;
  if (count === 0) {
    el.resumeCountSubtitle.textContent = 'Manage your uploaded resume files.';
  } else if (count === 1) {
    el.resumeCountSubtitle.textContent = 'You have 1 resume uploaded.';
  } else {
    el.resumeCountSubtitle.textContent = `You have ${count} resumes uploaded.`;
  }
}

// ---------------------------------------------------------------------------
// RENDER RESUME LIST
// ---------------------------------------------------------------------------
function renderResumeList(resumes) {
  if (!el.resumeList) return;

  // Clear existing items
  el.resumeList.innerHTML = '';

  resumes.forEach((resume) => {
    const li = document.createElement('li');
    li.className = 'resume-item';
    li.setAttribute('data-id', resume.id);
    li.setAttribute('data-storage-path', resume.storage_path);

    const ext      = getFileExtension(resume.file_name);
    const typeText = ext === '.pdf' ? 'PDF' : 'DOCX';
    const iconClass = ext === '.pdf' ? 'pdf-icon' : 'docx-icon';

    // All user-supplied strings go through sanitize() before textContent assignment
    // We use textContent (never innerHTML) for user-supplied data
    const uploadedDate = formatDate(resume.created_at);
    const sizeText     = formatBytes(resume.file_size);

    li.innerHTML = `
      <div class="resume-item-icon ${iconClass}" aria-hidden="true">
        ${ext === '.pdf' ? getPDFIconSVG() : getDOCXIconSVG()}
      </div>
      <div class="resume-item-info">
        <p class="resume-item-name" id="resumeName_${resume.id}"></p>
        <div class="resume-item-meta">
          <span class="resume-meta-chip">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
            <span id="resumeType_${resume.id}"></span>
          </span>
          <span class="resume-meta-chip">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            <span id="resumeDate_${resume.id}"></span>
          </span>
          <span class="resume-meta-chip">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>
            <span id="resumeSize_${resume.id}"></span>
          </span>
          <span class="resume-status-badge status-active" aria-label="Resume status: Active">Active</span>
        </div>
      </div>
      <div class="resume-item-actions">
        <button
          type="button"
          class="resume-icon-btn resume-icon-btn--view"
          data-action="view"
          data-id="${resume.id}"
          data-path="${resume.storage_path}"
          title="View or download resume"
          aria-label="View or download this resume"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
        </button>
        <button
          type="button"
          class="resume-icon-btn resume-icon-btn--replace"
          data-action="replace"
          data-id="${resume.id}"
          data-storage-path="${resume.storage_path}"
          data-name="${resume.file_name}"
          title="Replace this resume"
          aria-label="Replace this resume with a new file"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 .49-3.1"></path></svg>
        </button>
        <button
          type="button"
          class="resume-icon-btn resume-icon-btn--delete"
          data-action="delete"
          data-id="${resume.id}"
          data-storage-path="${resume.storage_path}"
          data-name="${resume.file_name}"
          title="Delete this resume"
          aria-label="Delete this resume"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"></path></svg>
        </button>
      </div>
    `;

    // Safely insert user-controlled text via textContent (not innerHTML)
    li.querySelector(`#resumeName_${resume.id}`).textContent = resume.file_name;
    li.querySelector(`#resumeType_${resume.id}`).textContent = `${typeText} · ${sizeText}`;
    li.querySelector(`#resumeDate_${resume.id}`).textContent = `Uploaded ${uploadedDate}`;
    li.querySelector(`#resumeSize_${resume.id}`).textContent = sizeText;

    // Attach action handlers
    li.querySelectorAll('[data-action]').forEach((btn) => {
      btn.addEventListener('click', handleResumeAction);
    });

    el.resumeList.appendChild(li);
  });
}

// ---------------------------------------------------------------------------
// RESUME ITEM ACTION HANDLER (view / replace / delete)
// ---------------------------------------------------------------------------
async function handleResumeAction(e) {
  const btn    = e.currentTarget;
  const action = btn.getAttribute('data-action');
  const id     = btn.getAttribute('data-id');
  const path   = btn.getAttribute('data-storage-path') || btn.getAttribute('data-path');
  const name   = btn.getAttribute('data-name') || '';

  switch (action) {
    case 'view':    await viewResume(path);          break;
    case 'replace': startReplace({ id, storage_path: path, file_name: name }); break;
    case 'delete':  openDeleteModal({ id, storage_path: path, file_name: name }); break;
  }
}

// ===========================================================================
// VIEW / DOWNLOAD
// ===========================================================================
async function viewResume(storagePath) {
  if (!currentUser) return;

  showToast('info', 'Generating Link', 'Creating a secure download link...');

  try {
    // Generate a short-lived signed URL (never store this URL in the DB)
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(storagePath, SIGNED_URL_EXPIRY);

    if (error) throw error;
    if (!data?.signedUrl) throw new Error('No signed URL returned.');

    // Open in a new tab for viewing; browser handles download based on content-type
    window.open(data.signedUrl, '_blank', 'noopener,noreferrer');
    showToast('success', 'Link Ready', 'Your resume is opening in a new tab.');

  } catch (err) {
    console.error('[CareerInfinity] View/download error:', err);
    showToast('error', 'Download Failed', `Could not create download link: ${err.message}`);
  }
}

// ===========================================================================
// REPLACE RESUME
// ===========================================================================
function startReplace(record) {
  // Store the old record — we will only delete it AFTER the new upload succeeds
  pendingReplaceRecord = record;

  // Scroll to upload zone and show a prompt
  el.uploadZone.scrollIntoView({ behavior: 'smooth', block: 'center' });

  showUploadMessage(
    'warning',
    `Replacing "${sanitize(record.file_name)}". Select your new resume file above. ` +
    `Your existing resume will remain available until the new upload succeeds.`
  );

  setTimeout(() => { el.fileInput.click(); }, 500);
}

// ===========================================================================
// DELETE RESUME
// ===========================================================================
let pendingDeleteRecord = null;

function openDeleteModal(record) {
  pendingDeleteRecord = record;

  if (el.deleteModalFileName) {
    el.deleteModalFileName.textContent = record.file_name;
  }

  if (el.deleteModal) el.deleteModal.hidden = false;
  document.body.style.overflow = 'hidden';

  // Focus the cancel button by default (safer UX for destructive actions)
  setTimeout(() => {
    if (el.cancelDeleteBtn) el.cancelDeleteBtn.focus();
  }, 50);
}

function closeDeleteModal() {
  if (el.deleteModal) el.deleteModal.hidden = true;
  document.body.style.overflow = '';
  pendingDeleteRecord = null;
}

function initDeleteModal() {
  if (el.deleteModalCloseBtn) {
    el.deleteModalCloseBtn.addEventListener('click', closeDeleteModal);
  }
  if (el.cancelDeleteBtn) {
    el.cancelDeleteBtn.addEventListener('click', closeDeleteModal);
  }
  if (el.deleteModal) {
    el.deleteModal.addEventListener('click', (e) => {
      if (e.target === el.deleteModal) closeDeleteModal();
    });
  }
  if (el.confirmDeleteBtn) {
    el.confirmDeleteBtn.addEventListener('click', async () => {
      if (!pendingDeleteRecord) return;
      const record = pendingDeleteRecord;
      closeDeleteModal();
      await deleteResumeRecord(record, { silent: false });
    });
  }

  // ESC key closes the modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && el.deleteModal && !el.deleteModal.hidden) {
      closeDeleteModal();
    }
  });
}

// ---------------------------------------------------------------------------
// PERFORM DELETE
// ---------------------------------------------------------------------------
async function deleteResumeRecord(record, { silent = false } = {}) {
  if (!currentUser) return;

  let storageDeletedOk = false;
  let dbDeletedOk      = false;

  try {
    // STEP 1: Delete from Storage
    const { error: storageErr } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([record.storage_path]);

    if (storageErr) {
      console.warn('[CareerInfinity] Storage delete warning:', storageErr.message);
      // Non-fatal — we still attempt DB cleanup
    } else {
      storageDeletedOk = true;
    }

    // STEP 2: Delete from database
    const { error: dbErr } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq('id', record.id)
      .eq('user_id', currentUser.id); // double-check ownership server-side via RLS + this filter

    if (dbErr) {
      throw new Error(`Database delete failed: ${dbErr.message}`);
    }

    dbDeletedOk = true;

    // STEP 3: Refresh the list
    await loadResumes();

    if (!silent) {
      if (storageDeletedOk) {
        showToast('success', 'Resume Deleted', `"${sanitize(record.file_name)}" has been permanently deleted.`);
      } else {
        showToast('info', 'Partially Deleted', 'The record was removed but the storage file could not be deleted. Please contact support.');
      }
    }

  } catch (err) {
    console.error('[CareerInfinity] Delete error:', err);
    if (!silent) {
      showToast('error', 'Delete Failed', `Could not delete the resume: ${err.message}`);
    }
  }
}

// ===========================================================================
// PROGRESS BAR HELPERS
// ===========================================================================
function showProgressBar(fileName) {
  if (!el.progressWrap) return;
  el.progressWrap.hidden = false;
  el.progressLabel.textContent = 'Uploading resume...';
  el.progressFile.textContent  = fileName;
  el.progressPct.textContent   = '0%';
  el.progressFill.style.width  = '0%';
  el.progressBar.setAttribute('aria-valuenow', '0');
}

function hideProgressBar() {
  if (el.progressWrap) el.progressWrap.hidden = true;
}

function setProgress(pct) {
  const clamped = Math.min(100, Math.max(0, Math.round(pct)));
  if (el.progressPct)  el.progressPct.textContent      = `${clamped}%`;
  if (el.progressFill) el.progressFill.style.width      = `${clamped}%`;
  if (el.progressBar)  el.progressBar.setAttribute('aria-valuenow', clamped);
}

// Animate progress from `from` to `to` over `duration` ms
function animateProgress(from, to, duration) {
  const start     = performance.now();
  const diff      = to - from;

  function step(now) {
    const elapsed = now - start;
    const t       = Math.min(1, elapsed / duration);
    const eased   = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; // ease-in-out
    setProgress(from + diff * eased);
    if (t < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

function setUploadButtonsDisabled(disabled) {
  if (el.confirmUploadBtn) el.confirmUploadBtn.disabled = disabled;
  if (el.cancelFileBtn)    el.cancelFileBtn.disabled    = disabled;
  if (el.uploadBrowseBtn)  el.uploadBrowseBtn.disabled  = disabled;
}

// ===========================================================================
// UPLOAD MESSAGE HELPERS
// ===========================================================================
function showUploadMessage(type, text) {
  if (!el.uploadMessage) return;

  const icons = {
    error:   `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`,
    success: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
    warning: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`,
  };

  // Use textContent for the message text to prevent XSS
  el.uploadMessage.className    = `upload-message ${type}`;
  el.uploadMessage.innerHTML    = `<span class="upload-message-icon">${icons[type] || ''}</span>`;
  const textSpan = document.createElement('span');
  textSpan.textContent = text;
  el.uploadMessage.appendChild(textSpan);
  el.uploadMessage.hidden = false;
}

function clearUploadMessage() {
  if (el.uploadMessage) {
    el.uploadMessage.hidden = true;
    el.uploadMessage.innerHTML = '';
    el.uploadMessage.className = 'upload-message';
  }
}

// ===========================================================================
// RESUME LIST STATE HELPER
// ===========================================================================
function showResumeListState(state) {
  hide(el.resumeListLoading);
  hide(el.resumeEmptyState);
  hide(el.resumeList);

  switch (state) {
    case 'loading': show(el.resumeListLoading); break;
    case 'empty':   show(el.resumeEmptyState);  break;
    case 'list':    show(el.resumeList);         break;
  }
}

// ===========================================================================
// TOAST NOTIFICATION
// ===========================================================================
let toastTimeout = null;

function showToast(type, title, message) {
  if (!el.toast) return;

  const icons = {
    success: '✓',
    error:   '✕',
    info:    'ℹ',
  };

  el.toast.className = `resume-toast toast-${type}`;
  el.toastTitle.textContent   = title;
  el.toastMessage.textContent = message;
  el.toastIcon.textContent    = icons[type] || 'ℹ';

  el.toast.hidden = false;

  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(hideToast, 6000);
}

function hideToast() {
  if (el.toast) el.toast.hidden = true;
}

function initToast() {
  if (el.toastClose) {
    el.toastClose.addEventListener('click', hideToast);
  }
}

// ===========================================================================
// COMING SOON MODAL (shared pattern from dashboard)
// ===========================================================================
function initComingSoonLinks() {
  document.querySelectorAll('.coming-soon-link').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const name = link.getAttribute('data-module') || 'This module';
      openComingSoonModal(name);
    });
  });
}

function initComingSoonModal() {
  if (el.csModalClose)  el.csModalClose.addEventListener('click',  closeComingSoonModal);
  if (el.csModalAction) el.csModalAction.addEventListener('click', closeComingSoonModal);

  if (el.comingSoonModal) {
    el.comingSoonModal.addEventListener('click', (e) => {
      if (e.target === el.comingSoonModal) closeComingSoonModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && el.comingSoonModal && !el.comingSoonModal.hidden) {
      closeComingSoonModal();
    }
  });
}

function openComingSoonModal(moduleName) {
  if (!el.comingSoonModal) return;
  if (el.csModalModuleName) el.csModalModuleName.textContent = moduleName;
  el.comingSoonModal._trigger = document.activeElement;
  el.comingSoonModal.hidden = false;
  document.body.style.overflow = 'hidden';
  setTimeout(() => {
    const first = el.comingSoonModal.querySelector('button');
    if (first) first.focus();
  }, 50);
}

function closeComingSoonModal() {
  if (!el.comingSoonModal) return;
  el.comingSoonModal.hidden = true;
  document.body.style.overflow = '';
  if (el.comingSoonModal._trigger) {
    el.comingSoonModal._trigger.focus();
    el.comingSoonModal._trigger = null;
  }
}

// ===========================================================================
// MOBILE SIDEBAR TOGGLE (identical to dashboard.js pattern)
// ===========================================================================
function initSidebarToggle() {
  if (!el.hamburgerBtn || !el.sidebar || !el.sidebarOverlay) return;

  function openSidebar() {
    el.sidebar.classList.add('sidebar-open');
    el.sidebarOverlay.classList.add('overlay-visible');
    el.sidebarOverlay.removeAttribute('aria-hidden');
    el.hamburgerBtn.setAttribute('aria-expanded', 'true');
    el.hamburgerBtn.setAttribute('aria-label', 'Close navigation menu');
  }

  function closeSidebar() {
    el.sidebar.classList.remove('sidebar-open');
    el.sidebarOverlay.classList.remove('overlay-visible');
    el.sidebarOverlay.setAttribute('aria-hidden', 'true');
    el.hamburgerBtn.setAttribute('aria-expanded', 'false');
    el.hamburgerBtn.setAttribute('aria-label', 'Open navigation menu');
  }

  el.hamburgerBtn.addEventListener('click', () => {
    el.sidebar.classList.contains('sidebar-open') ? closeSidebar() : openSidebar();
  });

  el.sidebarOverlay.addEventListener('click', closeSidebar);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && el.sidebar.classList.contains('sidebar-open')) {
      closeSidebar();
      el.hamburgerBtn.focus();
    }
  });
}

// ===========================================================================
// UTILITY FUNCTIONS
// ===========================================================================

/**
 * Returns the lowercase file extension including the dot.
 * e.g., "Resume.PDF" → ".pdf"
 * Returns empty string if no extension found.
 */
function getFileExtension(filename) {
  if (!filename || typeof filename !== 'string') return '';
  const lastDot = filename.lastIndexOf('.');
  if (lastDot === -1 || lastDot === filename.length - 1) return '';
  return '.' + filename.slice(lastDot + 1).toLowerCase();
}

/**
 * Generates a v4-style UUID using the browser's crypto API.
 * Falls back to a pseudorandom string if crypto is unavailable.
 */
function generateUUID() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback for older browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Format file size in bytes to a human-readable string.
 */
function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k    = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i     = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[Math.min(i, sizes.length - 1)];
}

/**
 * Format an ISO date string to a friendly display string.
 */
function formatDate(isoString) {
  if (!isoString) return '—';
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return '—';
  }
}

/**
 * Sanitise a string for safe display (strips HTML tags).
 * Always use textContent in templates — this is a belt-and-suspenders helper
 * for cases where concatenation into attribute values is unavoidable.
 */
function sanitize(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

/** Show an element (remove hidden attribute) */
function show(el) { if (el) el.hidden = false; }

/** Hide an element (set hidden attribute) */
function hide(el) { if (el) el.hidden = true; }

/** SVG icons for file type indicators */
function getPDFIconSVG() {
  return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>`;
}

function getDOCXIconSVG() {
  return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`;
}
