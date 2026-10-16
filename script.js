/**
 * ==========================================================================
 * CareerInfinity — AI-Powered Career Intelligence Platform
 * Module: Authentication (Phase 1)
 * File: script.js
 *
 * Description:
 * Client-side validation, password visibility toggling, real-time strength
 * metering, and simulated authentication flows.
 *
 * NOTE FOR MENTOR REVIEW:
 * This script provides rich client-side UX feedback and validation.
 * Client-side validation alone is NEVER a substitute for backend authentication.
 * In Phase 2, this module will connect to Firebase Authentication or a secure
 * REST/GraphQL backend API with JWT / HTTP-only session cookies.
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize common UI utilities
  initPasswordToggles();
  initToast();

  // Page-specific initialization based on active form
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');

  if (loginForm) {
    initLoginForm(loginForm);
  }

  if (signupForm) {
    initSignupForm(signupForm);
  }
});

/* ==========================================================================
   1. Password Visibility Toggle Handler
   ========================================================================== */
/**
 * Enables eye-icon button toggling between hidden and plain text passwords.
 * Compatible with multiple password inputs across any page.
 */
function initPasswordToggles() {
  const toggleButtons = document.querySelectorAll('.password-toggle-btn');

  toggleButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const targetId = button.getAttribute('data-target');
      const passwordInput = document.getElementById(targetId);

      if (!passwordInput) return;

      const isPassword = passwordInput.getAttribute('type') === 'password';
      const eyeOpenIcon = button.querySelector('.eye-open-icon');
      const eyeClosedIcon = button.querySelector('.eye-closed-icon');

      if (isPassword) {
        // Reveal password
        passwordInput.setAttribute('type', 'text');
        button.setAttribute('aria-label', 'Hide password');
        if (eyeOpenIcon) eyeOpenIcon.style.display = 'none';
        if (eyeClosedIcon) eyeClosedIcon.style.display = 'block';
      } else {
        // Mask password
        passwordInput.setAttribute('type', 'password');
        button.setAttribute('aria-label', 'Show password as plain text');
        if (eyeOpenIcon) eyeOpenIcon.style.display = 'block';
        if (eyeClosedIcon) eyeClosedIcon.style.display = 'none';
      }
    });
  });
}

/* ==========================================================================
   2. Validation Helper Functions
   ========================================================================== */

/**
 * Validates standard email structure using RFC 5322 standard pattern.
 * @param {string} email
 * @returns {boolean}
 */
function isValidEmail(email) {
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  return emailRegex.test(email.trim());
}

/**
 * Validates full name has at least 2 non-whitespace characters.
 * @param {string} name
 * @returns {boolean}
 */
function isValidName(name) {
  return name.trim().length >= 2;
}

/**
 * Checks password against robust criteria:
 * - At least 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one digit
 * @param {string} password
 * @returns {boolean}
 */
function isValidPassword(password) {
  if (password.length < 8) return false;
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  return hasLower && hasUpper && hasNumber;
}

/**
 * Evaluates password strength and returns score (0 to 4), label, and CSS class.
 * @param {string} password
 * @returns {{score: number, label: string, className: string}}
 */
function evaluatePasswordStrength(password) {
  if (!password || password.length === 0) {
    return { score: 0, label: 'Password strength: Empty', className: '' };
  }

  let score = 0;
  if (password.length >= 8) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password) || password.length >= 12) score++;

  switch (score) {
    case 1:
      return { score: 1, label: 'Password strength: Weak', className: 'strength-weak' };
    case 2:
      return { score: 2, label: 'Password strength: Fair', className: 'strength-fair' };
    case 3:
      return { score: 3, label: 'Password strength: Good', className: 'strength-good' };
    case 4:
      return { score: 4, label: 'Password strength: Strong', className: 'strength-strong' };
    default:
      return { score: 0, label: 'Password strength: Very Weak', className: 'strength-weak' };
  }
}

/* ==========================================================================
   3. Accessible Error Display Helpers
   ========================================================================== */

/**
 * Displays error state on a form-group and sets accessibility attributes.
 * @param {HTMLElement} groupElement - The .form-group container
 * @param {HTMLInputElement} inputElement - The active input
 * @param {string} message - Error description
 */
function setFieldError(groupElement, inputElement, message) {
  if (!groupElement) return;

  groupElement.classList.add('has-error');
  if (inputElement) {
    inputElement.setAttribute('aria-invalid', 'true');
  }

  const errorMessageEl = groupElement.querySelector('.error-message span');
  if (errorMessageEl && message) {
    errorMessageEl.textContent = message;
  }
}

/**
 * Clears error state from a form-group.
 * @param {HTMLElement} groupElement - The .form-group container
 * @param {HTMLInputElement} inputElement - The active input
 */
function clearFieldError(groupElement, inputElement) {
  if (!groupElement) return;

  groupElement.classList.remove('has-error');
  if (inputElement) {
    inputElement.setAttribute('aria-invalid', 'false');
  }
}

/* ==========================================================================
   4. Login Page Controller
   ========================================================================== */
function initLoginForm(form) {
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const emailGroup = document.getElementById('emailGroup');
  const passwordGroup = document.getElementById('passwordGroup');
  const submitBtn = document.getElementById('submitLoginBtn');
  const autoFillBtn = document.getElementById('fillDemoCredentialsBtn');
  const forgotPasswordLink = document.getElementById('forgotPasswordLink');

  // Real-time clearing of error on typing
  emailInput.addEventListener('input', () => {
    if (isValidEmail(emailInput.value)) {
      clearFieldError(emailGroup, emailInput);
    }
  });

  passwordInput.addEventListener('input', () => {
    if (passwordInput.value.length > 0) {
      clearFieldError(passwordGroup, passwordInput);
    }
  });

  // Quick Auto-fill button for mentor demonstration
  if (autoFillBtn) {
    autoFillBtn.addEventListener('click', () => {
      emailInput.value = 'mentor@careerinfinity.ai';
      passwordInput.value = 'DemoPass123!';
      clearFieldError(emailGroup, emailInput);
      clearFieldError(passwordGroup, passwordInput);
      showToast(
        'Demo Credentials Loaded',
        'Ready to test. Click "Sign In to CareerInfinity" to simulate authorization.'
      );
    });
  }

  // Forgot password mock feedback
  if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener('click', (e) => {
      e.preventDefault();
      showToast(
        'Password Reset Triggered (Demo)',
        'In Phase 2, a password reset link will be dispatched via Firebase Auth or SendGrid.'
      );
    });
  }

  // Form submission handler
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    let hasErrors = false;
    let firstInvalidInput = null;

    // Validate email
    const emailValue = emailInput.value.trim();
    if (!emailValue) {
      setFieldError(emailGroup, emailInput, 'Please enter your email address.');
      hasErrors = true;
      if (!firstInvalidInput) firstInvalidInput = emailInput;
    } else if (!isValidEmail(emailValue)) {
      setFieldError(emailGroup, emailInput, 'Please enter a valid email address (e.g., name@domain.com).');
      hasErrors = true;
      if (!firstInvalidInput) firstInvalidInput = emailInput;
    } else {
      clearFieldError(emailGroup, emailInput);
    }

    // Validate password
    const passwordValue = passwordInput.value;
    if (!passwordValue) {
      setFieldError(passwordGroup, passwordInput, 'Please enter your password.');
      hasErrors = true;
      if (!firstInvalidInput) firstInvalidInput = passwordInput;
    } else {
      clearFieldError(passwordGroup, passwordInput);
    }

    // Focus first invalid element for accessibility
    if (hasErrors) {
      if (firstInvalidInput) firstInvalidInput.focus();
      return;
    }

    // All validation passed: Simulate asynchronous network call
    simulateAuthRequest(submitBtn, () => {
      // Store only the demo email (NOT the password) for dashboard display.
      // This is safe: we never store passwords in sessionStorage.
      // In Phase 2, real Firebase Auth will manage the user session.
      sessionStorage.setItem('ci_demo_user', emailValue);
      sessionStorage.setItem('ci_demo_active', 'true');

      showToast(
        'Sign In Successful — Loading Dashboard',
        `Welcome! Redirecting to your CareerInfinity Dashboard...`
      );

      // Navigate to the dashboard after a short delay so the user sees the toast
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 1400);
    });
  });
}

/* ==========================================================================
   5. Signup Page Controller
   ========================================================================== */
function initSignupForm(form) {
  const fullNameInput = document.getElementById('fullName');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const confirmPasswordInput = document.getElementById('confirmPassword');
  const agreeTermsCheckbox = document.getElementById('agreeTerms');

  const fullNameGroup = document.getElementById('fullNameGroup');
  const emailGroup = document.getElementById('emailGroup');
  const passwordGroup = document.getElementById('passwordGroup');
  const confirmPasswordGroup = document.getElementById('confirmPasswordGroup');
  const termsGroup = document.getElementById('termsGroup');

  const strengthMeterBar = document.getElementById('strengthMeterBar');
  const strengthText = document.getElementById('passwordStrengthText');
  const submitBtn = document.getElementById('submitSignupBtn');
  const termsLink = document.getElementById('termsLink');
  const privacyLink = document.getElementById('privacyLink');

  // Terms mock links
  [termsLink, privacyLink].forEach((link) => {
    if (link) {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        showToast(
          'Policy Preview (Demo)',
          'Standard platform terms and data privacy policies will be linked here.'
        );
      });
    }
  });

  // Dynamic Password Strength Meter Updater
  passwordInput.addEventListener('input', () => {
    const pwd = passwordInput.value;
    const strength = evaluatePasswordStrength(pwd);

    // Update Meter UI classes
    strengthMeterBar.className = 'strength-meter-bar ' + strength.className;
    strengthText.textContent = strength.label;

    if (isValidPassword(pwd)) {
      clearFieldError(passwordGroup, passwordInput);
    }

    // If confirm password has value, re-check match
    if (confirmPasswordInput.value.length > 0) {
      if (confirmPasswordInput.value === pwd) {
        clearFieldError(confirmPasswordGroup, confirmPasswordInput);
      }
    }
  });

  // Real-time checks on user typing
  fullNameInput.addEventListener('input', () => {
    if (isValidName(fullNameInput.value)) {
      clearFieldError(fullNameGroup, fullNameInput);
    }
  });

  emailInput.addEventListener('input', () => {
    if (isValidEmail(emailInput.value)) {
      clearFieldError(emailGroup, emailInput);
    }
  });

  confirmPasswordInput.addEventListener('input', () => {
    if (confirmPasswordInput.value === passwordInput.value) {
      clearFieldError(confirmPasswordGroup, confirmPasswordInput);
    }
  });

  agreeTermsCheckbox.addEventListener('change', () => {
    if (agreeTermsCheckbox.checked) {
      clearFieldError(termsGroup, agreeTermsCheckbox);
    }
  });

  // Form submission handler
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    let hasErrors = false;
    let firstInvalidInput = null;

    // 1. Full name validation
    if (!isValidName(fullNameInput.value)) {
      setFieldError(fullNameGroup, fullNameInput, 'Please enter your full name (minimum 2 characters).');
      hasErrors = true;
      if (!firstInvalidInput) firstInvalidInput = fullNameInput;
    } else {
      clearFieldError(fullNameGroup, fullNameInput);
    }

    // 2. Email validation
    const emailValue = emailInput.value.trim();
    if (!emailValue) {
      setFieldError(emailGroup, emailInput, 'Please enter your email address.');
      hasErrors = true;
      if (!firstInvalidInput) firstInvalidInput = emailInput;
    } else if (!isValidEmail(emailValue)) {
      setFieldError(emailGroup, emailInput, 'Please enter a valid email address (e.g., name@domain.com).');
      hasErrors = true;
      if (!firstInvalidInput) firstInvalidInput = emailInput;
    } else {
      clearFieldError(emailGroup, emailInput);
    }

    // 3. Password requirements validation
    const pwdValue = passwordInput.value;
    if (!isValidPassword(pwdValue)) {
      setFieldError(
        passwordGroup,
        passwordInput,
        'Password must be at least 8 characters and include uppercase, lowercase, and a number.'
      );
      hasErrors = true;
      if (!firstInvalidInput) firstInvalidInput = passwordInput;
    } else {
      clearFieldError(passwordGroup, passwordInput);
    }

    // 4. Confirm password validation
    const confirmPwdValue = confirmPasswordInput.value;
    if (!confirmPwdValue) {
      setFieldError(confirmPasswordGroup, confirmPasswordInput, 'Please confirm your password.');
      hasErrors = true;
      if (!firstInvalidInput) firstInvalidInput = confirmPasswordInput;
    } else if (confirmPwdValue !== pwdValue) {
      setFieldError(confirmPasswordGroup, confirmPasswordInput, 'Passwords do not match. Please re-enter.');
      hasErrors = true;
      if (!firstInvalidInput) firstInvalidInput = confirmPasswordInput;
    } else {
      clearFieldError(confirmPasswordGroup, confirmPasswordInput);
    }

    // 5. Terms acceptance checkbox
    if (!agreeTermsCheckbox.checked) {
      setFieldError(termsGroup, agreeTermsCheckbox, 'You must agree to the Terms of Service to continue.');
      hasErrors = true;
      if (!firstInvalidInput) firstInvalidInput = agreeTermsCheckbox;
    } else {
      clearFieldError(termsGroup, agreeTermsCheckbox);
    }

    // Focus first invalid element for accessibility
    if (hasErrors) {
      if (firstInvalidInput) firstInvalidInput.focus();
      return;
    }

    // All validation passed: Simulate asynchronous network call
    simulateAuthRequest(submitBtn, () => {
      showToast(
        'Account Registration Simulated!',
        `Welcome, ${fullNameInput.value.trim()}! Validation succeeded. Next step: connect Firebase createUserWithEmailAndPassword().`
      );
    });
  });
}

/* ==========================================================================
   6. Network Request Simulation Helper
   ========================================================================== */
/**
 * Simulates a realistic network request with loading state and button lock.
 * @param {HTMLButtonElement} button
 * @param {Function} onComplete
 */
function simulateAuthRequest(button, onComplete) {
  if (!button) return;

  const originalText = button.querySelector('.btn-text')?.textContent || '';
  button.classList.add('is-loading');
  button.disabled = true;

  // Simulate 1.2 second latency of cloud authentication
  setTimeout(() => {
    button.classList.remove('is-loading');
    button.disabled = false;
    if (onComplete) onComplete();
  }, 1200);
}

/* ==========================================================================
   7. Toast Notification Controller
   ========================================================================== */
let toastTimeoutId = null;

function initToast() {
  const closeBtn = document.getElementById('toastCloseBtn');
  if (closeBtn) {
    closeBtn.addEventListener('click', hideToast);
  }
}

/**
 * Displays a non-intrusive floating status toast.
 * @param {string} title
 * @param {string} message
 */
function showToast(title, message) {
  const toast = document.getElementById('feedbackToast');
  const titleEl = document.getElementById('toastTitle');
  const messageEl = document.getElementById('toastMessage');

  if (!toast || !titleEl || !messageEl) return;

  titleEl.textContent = title;
  messageEl.textContent = message;

  toast.classList.add('show');

  if (toastTimeoutId) {
    clearTimeout(toastTimeoutId);
  }

  // Auto-dismiss after 6 seconds
  toastTimeoutId = setTimeout(() => {
    hideToast();
  }, 6000);
}

function hideToast() {
  const toast = document.getElementById('feedbackToast');
  if (toast) {
    toast.classList.remove('show');
  }
}

/* ==========================================================================
   FUTURE FIREBASE AUTHENTICATION INTEGRATION BLUEPRINT (PHASE 2)
   --------------------------------------------------------------------------
   In the next development phase, you can replace the simulateAuthRequest()
   with the Firebase v9+ Modular Web SDK:

   import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
   import {
     getAuth,
     signInWithEmailAndPassword,
     createUserWithEmailAndPassword
   } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "careerinfinity.firebaseapp.com",
     projectId: "careerinfinity",
     storageBucket: "careerinfinity.appspot.com",
     messagingSenderId: "...",
     appId: "..."
   };

   const app = initializeApp(firebaseConfig);
   const auth = getAuth(app);

   // For Login:
   // signInWithEmailAndPassword(auth, email, password)
   //   .then((userCredential) => { window.location.href = "dashboard.html"; })
   //   .catch((error) => { setFieldError(..., error.message); });

   // For Signup:
   // createUserWithEmailAndPassword(auth, email, password)
   //   .then((userCredential) => { ... })
   //   .catch((error) => { ... });
   ========================================================================== */
