<div align="center">

# 🚀 CareerInfinity
### AI-Powered Career Intelligence Platform

[![Phase](https://img.shields.io/badge/Phase-3%3A%20Resume%20Upload-7c3aed?style=for-the-badge)](#)
[![Status](https://img.shields.io/badge/Status-Active%20Development-22c55e?style=for-the-badge)](#)
[![Tech](https://img.shields.io/badge/Tech-HTML5%20%7C%20CSS3%20%7C%20Supabase-4f46e5?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/License-MIT-64748b?style=for-the-badge)](#)

*Navigate your career with predictive AI intelligence.*

[View Login Page](#getting-started) · [View Signup Page](#getting-started) · [View Dashboard](#getting-started) · [Report a Bug](../../issues) · [Future Roadmap](#roadmap)

</div>

---

## 📋 Table of Contents

- [About the Project](#about-the-project)
- [Technology Stack](#technology-stack)
- [Modules Built](#modules-built)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Important Limitations](#important-limitations)
- [Roadmap](#roadmap)
- [Git Workflow](#git-workflow)
- [Contributing](#contributing)

---

## About the Project

**CareerInfinity** is an AI-powered career intelligence platform that helps professionals and students navigate career paths using:

- 📊 Predictive labor-market telemetry
- 🧠 Skill gap diagnostics and analytics
- 🎯 AI-driven trajectory modeling
- 💼 Real-time salary benchmarking

This project is developed **modularly, one phase at a time**, under mentor guidance. Each phase introduces a focused set of features without disrupting earlier work.

> **Current Status:** Phase 2 — Dashboard Module (UI Prototype)

---

## Technology Stack

| Layer | Technology | Purpose |
|:------|:-----------|:--------|
| Structure | HTML5 (Semantic) | Accessible, SEO-friendly page markup |
| Styling | CSS3 + Custom Properties | Design system tokens, animations, responsive layout |
| Logic | Vanilla JavaScript (ES6+) | Form validation, DOM interaction, UI state, routing |
| Typography | Google Fonts — *Plus Jakarta Sans* | Modern, professional brand typeface |
| **Phase 3 (Planned)** | Firebase Authentication | Real user sign-in, registration, and session management |
| **Phase 4 (Planned)** | Node.js / Express or Next.js | Backend API and server-side rendering |

---

## Modules Built

### ✅ Module 1 — Login Page (`index.html` + `style.css` + `script.js`)
- [x] Email address and password input fields
- [x] Show / Hide password toggle button with SVG eye icons
- [x] "Remember this device" checkbox
- [x] Real-time client-side validation (email format, empty field detection)
- [x] Accessible error messages with `aria-invalid` and `role="alert"`
- [x] Auto-fill helper button for mentor / reviewer demonstrations
- [x] Simulated loading spinner → redirects to dashboard on success
- [x] "Forgot password?" link (ready for Phase 3 reset flow)
- [x] Navigation link to the registration page

### ✅ Module 2 — Registration Page (`signup.html`)
- [x] Full name, email, create password, and confirm password fields
- [x] Real-time 4-segment password strength meter (Weak → Fair → Good → Strong)
- [x] Password requirements: 8+ characters, uppercase, lowercase, and a number
- [x] Confirm password matching validation
- [x] Terms of Service and Privacy Policy agreement checkbox
- [x] Accessible error messages on all fields
- [x] Simulated loading state and success toast notification
- [x] Navigation link back to the login page

### ✅ Module 3 — Dashboard (`dashboard.html` + `dashboard.css` + `dashboard.js`)

**A. Sidebar Navigation**
- [x] CareerInfinity logo and brand name
- [x] Dashboard (active), My Profile, Skills Assessment, Career Roadmap, Learning Resources, Job Opportunities, Settings
- [x] Each non-built module clearly labelled as "Soon" with a badge
- [x] Functional Logout button that clears session and returns to `index.html`
- [x] Collapsible sidebar on mobile with hamburger menu

**B. Top Navigation Bar**
- [x] Dynamic welcome message with user's name (from demo session) and current date
- [x] Search field (UI complete, search functionality is Phase 3)
- [x] Notification bell icon (Coming Soon modal)
- [x] User avatar with initials and display name
- [x] Responsive mobile hamburger toggle

**C. Overview Stat Cards (4 cards)**
- [x] Skills Identified — with trend indicator
- [x] Learning Progress — with mini progress bar
- [x] Career Goals — with quarter achievement note
- [x] Courses Completed — with weekly trend
- [x] All labelled as "Sample" demonstration data

**D. Career Development Section**
- [x] Career Readiness Score with animated progress bar (74/100 — sample)
- [x] Current Learning Goals with 3 progress bars
- [x] Recommended Next Steps (numbered action list)
- [x] Weekly Learning Activity bar chart (pure SVG, 7-day view — sample)
- [x] Recent Activity feed (4 activity items — sample)

**E. Skills Overview**
- [x] 6 skills: Python, Machine Learning, Data Analysis, SQL, Communication, Data Visualization
- [x] Animated progress bars with colour coding
- [x] Skill level labels (Beginner / Intermediate / Advanced)
- [x] Clearly labelled as demonstration values, not from a real assessment

**F. Career Action Panel**
- [x] 4 action cards: Explore Career Paths, Build My Learning Roadmap, Improve My Skills, Explore Job Opportunities
- [x] Each card clearly shows "Coming Soon — Phase X" with a pill badge
- [x] Hover animations and premium card design

**Accessibility**
- [x] All interactive elements have unique IDs and descriptive `aria-label` attributes
- [x] Progress bars use `role="progressbar"` with `aria-valuenow`, `aria-valuemin`, `aria-valuemax`
- [x] Modal uses `role="dialog"`, `aria-modal="true"`, focus management, and ESC key close
- [x] Keyboard-friendly with visible `:focus-visible` states on all controls
- [x] Screen reader text via `.sr-only` utility class

### ✅ Shared Design System
- [x] Dark navy blue canvas (`#0a0f1d`) with ambient purple radial gradients
- [x] Vibrant purple / indigo accent palette (`#7c3aed`, `#4f46e5`)
- [x] CSS Custom Properties design token system (same tokens across all pages)
- [x] Smooth micro-animations on hover, focus, and card entrance
- [x] Responsive layout: sidebar + main on desktop, hamburger menu on mobile

---

## Project Structure

```
CareerInfinity/
│
├── index.html          # Module 1 — Login page (Sign In)
├── signup.html         # Module 1 — Registration page (Create Account)
├── style.css           # Shared design system stylesheet (auth pages)
├── script.js           # Auth: validation, password toggles, login → dashboard redirect
│
├── dashboard.html      # Module 3 — Career Intelligence Dashboard
├── dashboard.css       # Dashboard-specific styles (extends design system)
├── dashboard.js        # Dashboard: sidebar, logout, modal, animations, user display
│
├── .gitignore          # Git exclusion rules (secrets, OS files, future build artifacts)
└── README.md           # This file
│
│   ── Planned Future Directories ──
│
├── profile/            # Phase 3 — My Profile page (planned)
├── skills/             # Phase 4 — Skill Gap Diagnostic Engine (planned)
├── roadmap/            # Phase 4 — Career Roadmap Generator (planned)
├── jobs/               # Phase 5 — Job Recommendation Feed (planned)
└── api/                # Backend API / Firebase Cloud Functions (planned)
```

---

## Getting Started

No build tools or package installation required. Open with any modern browser.

### Prerequisites
- A modern web browser (Chrome, Edge, Firefox, Safari)
- [VS Code](https://code.visualstudio.com/) (recommended editor)
- [Live Server Extension](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) for VS Code (recommended for development)

### Running Locally

**Method 1 — VS Code Live Server (Recommended)**
1. Clone or download this repository to your machine.
2. Open the project folder in VS Code:  
   `File → Open Folder...`
3. Install the **Live Server** extension if not already installed (`Ctrl+Shift+X` → search "Live Server").
4. Right-click `index.html` in the Explorer panel and select **"Open with Live Server"**.
5. Your browser will open at `http://127.0.0.1:5500/index.html`.

**Method 2 — Direct Browser Open**
1. Navigate to the project folder in Windows Explorer.
2. Double-click `index.html`. It will open in your default browser.
3. Fill in the demo credentials and click Sign In to reach the Dashboard.

**Method 3 — Python HTTP Server (Command Line)**
```bash
# Run from the project directory
python -m http.server 3000

# Then visit:
# http://localhost:3000
```

### Test Credentials (Login Page Demo)
| Field | Value |
|:------|:------|
| Email | `mentor@careerinfinity.ai` |
| Password | `DemoPass123!` |

> **Tip:** Click the **Auto-Fill** button on the login page to populate these instantly, then click **Sign In to CareerInfinity** to reach the dashboard.

---

## Important Limitations

> **⚠️ This is a frontend-only UI prototype — Phase 2.**

### What this prototype does NOT have:
- ❌ **No real authentication** — login validation is client-side only. Anyone can bypass it via DevTools.
- ❌ **No real database** — all data is hardcoded sample / demonstration data.
- ❌ **No real AI** — skill assessments, career scores, and recommendations are static sample values.
- ❌ **No real job listings** — job opportunity data is not connected to any live job market feed.
- ❌ **No passwords stored** — only a display email is kept in `sessionStorage` for the demo greeting. It is removed on Logout.
- ❌ **No real skill assessment** — the skills progress bars are demonstration values, not calculated from any real test.

### What IS ready for the future:
- ✅ The `script.js` login flow is structured so Firebase Authentication can be swapped in with minimal changes (see comments in the file).
- ✅ The `dashboard.js` data functions are isolated so they can be replaced with real API fetch calls.
- ✅ The CSS design system uses Custom Properties, making theming and extension straightforward.
- ✅ All ARIA roles and keyboard navigation are in place for a production-quality accessible UI.

---

## Roadmap

| Phase | Module | Status |
|:------|:-------|:-------|
| **Phase 1** | 🔐 Authentication Module (Login + Registration UI) | ✅ Complete |
| **Phase 2** | 📊 Career Intelligence Dashboard (UI + Sample Data) | ✅ Complete |
| **Phase 3** | 🔗 Firebase Auth Integration (Real sign-in, session, password reset) | 🔜 Planned |
| **Phase 4** | 👤 My Profile Page (Skills, experience, and career goals form) | 🔜 Planned |
| **Phase 5** | 🧠 Skill Gap Diagnostic Engine (Role benchmarking) | 🔜 Planned |
| **Phase 6** | 🗺️ Career Roadmap Generator (Personalized upskilling plan) | 🔜 Planned |
| **Phase 7** | 📄 AI Resume Analyzer (Upload, score, and improve resume) | 🔜 Planned |
| **Phase 8** | 💼 Job Recommendation Feed (Live matching with job market) | 🔜 Planned |

---

## Git Workflow

### Committing the Dashboard Module
```bash
# 1. Check which files changed
git status

# 2. Stage all new and modified files
git add .

# 3. Commit with a clear, descriptive message
git commit -m "feat(dashboard): Add CareerInfinity dashboard UI"

# 4. Push to GitHub
git push
```

### What this commit includes
| File | Change |
|:-----|:-------|
| `dashboard.html` | **New** — Full dashboard layout (sidebar, topbar, stats, chart, skills, actions) |
| `dashboard.css` | **New** — Premium dark dashboard styles (navy/purple design system) |
| `dashboard.js` | **New** — Sidebar toggle, logout, modal, animations, user display |
| `script.js` | **Modified** — Login now redirects to `dashboard.html` after success |
| `README.md` | **Modified** — Updated to reflect Phase 2 completion |

### Phase 3 — Resume Upload Module (Current)

| File | Status | Description |
|:-----|:-------|:------------|
| `resume.html` | **Created** | Resume page: sidebar, breadcrumb, upload zone, resume list |
| `resume.css` | **Created** | Resume styles — builds on dashboard.css design tokens |
| `resume.js` | **Created** | ES module: upload, view, replace, delete with Supabase |
| `supabase-client.js` | **Created** | Shared Supabase JS client — configure URL + anon key here |
| `supabase/resumes.sql` | **Created** | Table, RLS policies, Storage bucket, Storage policies |
| `dashboard.html` | **Modified** | Added My Resume nav link |
| `.gitignore` | **Modified** | Added Supabase config exclusion entries |
| `README.md` | **Modified** | Updated with Phase 3 documentation |

---

## Supabase Setup — Step-by-Step Checklist

Run this once before using the Resume Upload module.

**Step 1 — Create Supabase Project**
- Go to supabase.com, sign in, click New Project
- Set a name (e.g. careerinfinity), database password, and region
- Wait ~1 minute for provisioning

**Step 2 — Run SQL Schema**
- Supabase Dashboard → SQL Editor → New Query
- Copy everything from `supabase/resumes.sql` and paste, then click Run
- Verify in Table Editor that the `resumes` table exists
- Verify in Storage that the `resumes` bucket exists as Private
- Verify in Auth → Policies that 8 policies exist (4 table + 4 storage)

**Step 3 — Configure Supabase Client**
- Supabase Dashboard → Settings → API
- Copy Project URL and anon/public key
- Open `supabase-client.js`, replace the two placeholder values
- NEVER use the service_role key in browser code

**Step 4 — Enable Email Auth**
- Authentication → Providers → confirm Email is enabled
- For local testing: Authentication → Settings → disable email confirmation

**Step 5 — Connect Login Page to Supabase Auth**
- Open `script.js`, find `simulateAuthRequest()`
- Replace with: `supabase.auth.signInWithEmailAndPassword({ email, password })`
- On success: `window.location.href = 'dashboard.html'`
- On error: display the error message using `setFieldError()`

---

## Resume Module Features

**Supported file types:** PDF (.pdf) and Word (.docx)
**Maximum file size:** 5 MB (enforced client-side and by Storage bucket)
**Storage:** Private Supabase Storage bucket — no public URLs
**Access:** Short-lived signed URLs (1 hour) generated on demand
**Security:** RLS on DB table + Storage policies enforce per-user isolation
**XSS protection:** All user-supplied filenames displayed via textContent only

---

## Manual Test Plan

| Test | Expected Result |
|:-----|:----------------|
| Upload valid PDF under 5 MB | Succeeds, file appears in resume list |
| Upload valid DOCX under 5 MB | Succeeds, file appears in resume list |
| Upload file over 5 MB | Client rejects with size error, no upload |
| Upload unsupported type (.jpg) | Client rejects with type error, no upload |
| Open resume.html without login | Redirected to index.html |
| Click View on uploaded resume | File opens in new tab via signed URL |
| Replace resume, new upload succeeds | New file active, old file cleaned up |
| Replace resume, new upload fails | Old resume still available |
| Delete resume, confirm in modal | File removed from Storage and DB |
| User B tries to access User A file | Supabase 403 — Storage RLS blocks it |
| Insert DB row with another user_id | DB RLS blocks it |
| View page on mobile 375px | Responsive layout, all buttons accessible |
| Drag and drop valid PDF | Preview shown, upload succeeds |

---

## Known Limitations

- Login page still uses simulated auth — connect script.js to Supabase Auth for full end-to-end testing
- Upload progress bar is animated through estimated stages (Supabase JS SDK v2 does not expose XHR byte-level progress events)
- No AI resume analysis in this phase — planned for Phase 5
- No in-browser PDF preview — files open in a new tab via signed URL
- Email confirmation must be disabled for local testing (or verify email before first login)

---

## Future Development Plans

| Phase | Feature |
|:------|:--------|
| Phase 2 (done) | Dashboard — sample data, progress bars, activity chart |
| Phase 3 (current) | Resume upload, view, replace, delete — Supabase Storage + DB |
| Phase 4 | My Profile — full Supabase integration, avatar upload |
| Phase 5 | AI Resume Analysis — extract skills, experience, education |
| Phase 6 | Skills Assessment Module |
| Phase 7 | Career Roadmap Generation |
| Phase 8 | Job Matching and Recommendations |

---

## Git Workflow

```bash
git add .
git commit -m "Add secure resume upload with Supabase Storage"
git push
```

---

## Contributing

This project is developed privately under mentor guidance. Contributions and suggestions from the mentor are welcomed through GitHub Issues, Pull Requests, and GitHub Discussions.

---

CareerInfinity — AI-Powered Career Intelligence Platform
Built with HTML5, CSS3, Vanilla JavaScript, and Supabase
Phase 3: Resume Upload Module
