/**
 * ==========================================================================
 * CareerInfinity — AI-Powered Career Intelligence Platform
 * Module: Dashboard (Phase 2)
 * File: dashboard.js
 *
 * Description:
 * Controls all interactive behaviour on the Dashboard page:
 *   - Mobile sidebar toggle (hamburger menu)
 *   - User display name from sessionStorage (safe, no passwords stored)
 *   - Logout (clears session data, redirects to index.html)
 *   - "Coming Soon" modal for locked navigation items
 *   - Notification and avatar button demo feedback
 *   - Search input interaction
 *   - Progress bar animation on page load
 *   - Current date in welcome message
 *
 * NOTE FOR MENTOR REVIEW:
 * This script uses only sessionStorage for a simple username display.
 * NO passwords or sensitive data are stored. All data shown on this
 * dashboard is sample / demonstration data only.
 * In Phase 3, this will connect to a real backend API or Firebase.
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  initUserDisplay();
  initSidebarToggle();
  initLogout();
  initComingSoonLinks();
  initModal();
  initNotificationBtn();
  initAvatarBtn();
  initSearchInput();
  animateProgressBars();
  setWelcomeGreeting();
});

/* ==========================================================================
   1. USER DISPLAY
   --------------------------------------------------------------------------
   Safely reads the user's display name from sessionStorage.
   The login page stores ONLY the email (not the password) under the key
   'ci_demo_user'. We extract and display the name portion safely.
   If nothing is stored, we fall back to "Welcome to CareerInfinity".
   ========================================================================== */
function initUserDisplay() {
  // Read the demo user email stored by the login page (no password stored)
  const storedEmail = sessionStorage.getItem('ci_demo_user') || '';

  const greetingEl  = document.getElementById('topbarGreeting');
  const avatarNameEl = document.getElementById('avatarName');
  const initialsEl  = document.getElementById('avatarInitials');

  let displayName = 'Career User';
  let initials    = 'CI';

  if (storedEmail) {
    // Derive a friendly name from the email's local part (before the @)
    const localPart = storedEmail.split('@')[0] || '';
    if (localPart) {
      // Convert "jane.doe" or "janedoe" into "Jane"
      const firstName = localPart
        .split(/[._-]/)[0]          // take first segment
        .replace(/[^a-zA-Z]/g, '')  // strip non-letters
        .toLowerCase();
      if (firstName.length > 0) {
        displayName = firstName.charAt(0).toUpperCase() + firstName.slice(1);
        initials = firstName.charAt(0).toUpperCase();
        // If there's a second segment, add its initial too
        const secondPart = localPart.split(/[._-]/)[1];
        if (secondPart && secondPart.length > 0) {
          initials += secondPart.charAt(0).toUpperCase();
        }
      }
    }
  }

  // Update the DOM safely using textContent (never innerHTML — prevents XSS)
  if (greetingEl) {
    greetingEl.textContent = storedEmail
      ? `Welcome back, ${displayName}!`
      : 'Welcome to CareerInfinity!';
  }
  if (avatarNameEl) avatarNameEl.textContent = displayName;
  if (initialsEl)   initialsEl.textContent   = initials;
}

/* ==========================================================================
   2. WELCOME GREETING WITH DATE
   --------------------------------------------------------------------------
   Adds the current day and date to the topbar subtext so it feels dynamic.
   ========================================================================== */
function setWelcomeGreeting() {
  const subtextEl = document.getElementById('topbarSubtext');
  if (!subtextEl) return;

  const now = new Date();
  const dayName = now.toLocaleDateString('en-US', { weekday: 'long' });
  const dateStr = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  subtextEl.textContent = `${dayName}, ${dateStr} — Here's your career intelligence overview.`;
}

/* ==========================================================================
   3. MOBILE SIDEBAR TOGGLE
   --------------------------------------------------------------------------
   Hamburger button opens/closes the sidebar on small screens.
   The sidebar-overlay darkens the background and closes the sidebar on tap.
   ========================================================================== */
function initSidebarToggle() {
  const hamburgerBtn   = document.getElementById('hamburgerBtn');
  const sidebar        = document.getElementById('sidebar');
  const sidebarOverlay = document.getElementById('sidebarOverlay');

  if (!hamburgerBtn || !sidebar || !sidebarOverlay) return;

  function openSidebar() {
    sidebar.classList.add('sidebar-open');
    sidebarOverlay.classList.add('overlay-visible');
    sidebarOverlay.removeAttribute('aria-hidden');
    hamburgerBtn.setAttribute('aria-expanded', 'true');
    hamburgerBtn.setAttribute('aria-label', 'Close navigation menu');
    // Trap focus inside sidebar on mobile for accessibility
    sidebar.focus && sidebar.focus();
  }

  function closeSidebar() {
    sidebar.classList.remove('sidebar-open');
    sidebarOverlay.classList.remove('overlay-visible');
    sidebarOverlay.setAttribute('aria-hidden', 'true');
    hamburgerBtn.setAttribute('aria-expanded', 'false');
    hamburgerBtn.setAttribute('aria-label', 'Open navigation menu');
  }

  hamburgerBtn.addEventListener('click', () => {
    const isOpen = sidebar.classList.contains('sidebar-open');
    isOpen ? closeSidebar() : openSidebar();
  });

  // Clicking the overlay closes the sidebar
  sidebarOverlay.addEventListener('click', closeSidebar);

  // ESC key closes the sidebar (accessibility best practice)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && sidebar.classList.contains('sidebar-open')) {
      closeSidebar();
      hamburgerBtn.focus(); // return focus to trigger element
    }
  });
}

/* ==========================================================================
   4. LOGOUT
   --------------------------------------------------------------------------
   Clears the demo session data (only the email display key, not passwords)
   and redirects to index.html. Safe for a frontend prototype.
   ========================================================================== */
function initLogout() {
  const logoutBtn = document.getElementById('logoutBtn');
  if (!logoutBtn) return;

  logoutBtn.addEventListener('click', () => {
    // Clear the demo session key (only non-sensitive display name / email)
    sessionStorage.removeItem('ci_demo_user');
    sessionStorage.removeItem('ci_demo_active');

    // In Phase 3: this is where Firebase signOut() will go:
    // import { getAuth, signOut } from "firebase/auth";
    // signOut(auth).then(() => { window.location.href = 'index.html'; });

    // Frontend-only redirect back to the login page
    window.location.href = 'index.html';
  });
}

/* ==========================================================================
   5. "COMING SOON" NAVIGATION LINKS
   --------------------------------------------------------------------------
   Any sidebar link with the class .coming-soon-link will intercept the click
   and open a modal explaining that the module isn't built yet.
   This is honest — we never pretend the functionality exists.
   ========================================================================== */
function initComingSoonLinks() {
  const links = document.querySelectorAll('.coming-soon-link');

  links.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault(); // stop navigation

      const moduleName = link.getAttribute('data-module') || 'this module';
      openComingSoonModal(moduleName);
    });
  });
}

/* ==========================================================================
   6. COMING SOON MODAL CONTROLLER
   --------------------------------------------------------------------------
   Opens/closes the dialog modal with the module name injected safely.
   Uses the HTML `hidden` attribute for show/hide to work with screen readers.
   ========================================================================== */
function initModal() {
  const modal         = document.getElementById('comingSoonModal');
  const closeBtn      = document.getElementById('modalCloseBtn');
  const actionBtn     = document.getElementById('modalActionBtn');

  if (!modal) return;

  function closeModal() {
    modal.hidden = true;
    document.body.style.overflow = ''; // re-enable body scrolling
    // Return focus to the element that triggered the modal
    if (modal._triggerElement) {
      modal._triggerElement.focus();
      modal._triggerElement = null;
    }
  }

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (actionBtn) actionBtn.addEventListener('click', closeModal);

  // Close on overlay backdrop click (outside the card)
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // ESC key closes the modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.hidden) closeModal();
  });
}

/**
 * Opens the Coming Soon modal with the module name.
 * @param {string} moduleName - Human-readable module name (e.g., "My Profile")
 */
function openComingSoonModal(moduleName) {
  const modal      = document.getElementById('comingSoonModal');
  const moduleNameEl = document.getElementById('modalModuleName');

  if (!modal) return;

  // Inject the module name safely (textContent = no XSS risk)
  if (moduleNameEl) moduleNameEl.textContent = moduleName;

  // Remember which element triggered the modal (for focus management)
  modal._triggerElement = document.activeElement;

  modal.hidden = false;
  document.body.style.overflow = 'hidden'; // prevent background scrolling

  // Move focus into the modal for keyboard users
  const firstFocusable = modal.querySelector('button, [tabindex]:not([tabindex="-1"])');
  if (firstFocusable) {
    setTimeout(() => firstFocusable.focus(), 50);
  }
}

/* ==========================================================================
   7. NOTIFICATION BUTTON (Demo)
   --------------------------------------------------------------------------
   Shows a brief inline message — placeholder for a real notification system.
   ========================================================================== */
function initNotificationBtn() {
  const btn = document.getElementById('notificationBtn');
  if (!btn) return;

  btn.addEventListener('click', () => {
    openComingSoonModal('Notifications Panel');
  });
}

/* ==========================================================================
   8. AVATAR BUTTON (Demo)
   --------------------------------------------------------------------------
   Opens the Coming Soon modal for the profile panel.
   ========================================================================== */
function initAvatarBtn() {
  const btn = document.getElementById('avatarBtn');
  if (!btn) return;

  btn.addEventListener('click', () => {
    openComingSoonModal('User Profile Panel');
  });
}

/* ==========================================================================
   9. SEARCH INPUT (Demo Interaction)
   --------------------------------------------------------------------------
   The search field provides UI feedback. Real search is a future feature.
   ========================================================================== */
function initSearchInput() {
  const searchInput = document.getElementById('dashboardSearch');
  if (!searchInput) return;

  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const query = searchInput.value.trim();
      if (query.length > 0) {
        // For now: show a Coming Soon modal. In a future phase, this will
        // search across dashboard sections, skills, goals, etc.
        openComingSoonModal(`Dashboard Search for "${query}"`);
        searchInput.value = '';
        searchInput.blur();
      }
    }
  });
}

/* ==========================================================================
   10. PROGRESS BAR ANIMATION
   --------------------------------------------------------------------------
   All progress bars start at width:0 and animate to their target width on
   load. This is purely visual and works without JavaScript — CSS does the
   animation — but JS triggers the animation after a short delay so users
   can see the bars "fill up" after the page renders.
   ========================================================================== */
function animateProgressBars() {
  /**
   * How it works:
   * The bars already have their target widths in the HTML as inline styles
   * (e.g., style="width: 78%;"). We read those values, set them to 0 first,
   * then after a small delay restore the original values so the CSS
   * transition plays visually.
   */
  const bars = document.querySelectorAll(
    '.skill-bar-fill, .goal-bar-fill, .readiness-bar-fill, .stat-mini-bar-fill'
  );

  bars.forEach((bar) => {
    const targetWidth = bar.style.width; // e.g., "78%"
    bar.style.width = '0%';             // start at 0

    // Wait for the browser to paint the 0% width, then animate to target
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        bar.style.width = targetWidth; // CSS transition takes over
      });
    });
  });
}

/* ==========================================================================
   FUTURE PHASE NOTES (for mentor discussion)
   --------------------------------------------------------------------------
   When connecting this dashboard to a real backend (Phase 3+):

   1. Replace sessionStorage with a proper auth session check:
      - Firebase: onAuthStateChanged(auth, (user) => { ... })
      - If user is not authenticated, redirect to index.html immediately.

   2. Replace all hardcoded sample data with real API calls:
      const response = await fetch('/api/v1/dashboard', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();

   3. Use a loading skeleton state while data fetches, then populate the UI.

   4. For the skills chart, consider using Chart.js or D3.js for richer
      interactive visualisations with real data.

   5. Implement proper Content Security Policy (CSP) headers on the server.
   ========================================================================== */
