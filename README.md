<div align="center">

# 🚀 CareerInfinity
### AI-Powered Career Intelligence Platform

[![Phase](https://img.shields.io/badge/Phase-1%3A%20Authentication-7c3aed?style=for-the-badge)](#)
[![Status](https://img.shields.io/badge/Status-Active%20Development-22c55e?style=for-the-badge)](#)
[![Tech](https://img.shields.io/badge/Tech-HTML5%20%7C%20CSS3%20%7C%20JavaScript-4f46e5?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/License-MIT-64748b?style=for-the-badge)](#)

*Navigate your career with predictive AI intelligence.*

[View Login Page](#getting-started) · [View Signup Page](#getting-started) · [Report a Bug](../../issues) · [Future Roadmap](#roadmap)

</div>

---

## 📋 Table of Contents

- [About the Project](#about-the-project)
- [Technology Stack](#technology-stack)
- [Phase 1 Features](#phase-1-features-authentication-module)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Important Security Note](#important-security-note)
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

> **Current Status:** Phase 1 — Authentication Module (UI Prototype)

---

## Technology Stack

| Layer | Technology | Purpose |
|:------|:-----------|:--------|
| Structure | HTML5 (Semantic) | Accessible, SEO-friendly page markup |
| Styling | CSS3 + Custom Properties | Design system tokens, animations, responsive layout |
| Logic | Vanilla JavaScript (ES6+) | Form validation, DOM interaction, UI state |
| Typography | Google Fonts — *Plus Jakarta Sans* | Modern, professional brand typeface |
| **Phase 2 (Planned)** | Firebase Authentication | Real user sign-in, registration, and session management |
| **Phase 3 (Planned)** | Node.js / Express or Next.js | Backend API and server-side rendering |

---

## Phase 1 Features: Authentication Module

### ✅ Login Page (`index.html`)
- [x] Email address and password input fields
- [x] Show / Hide password toggle button with SVG eye icons
- [x] "Remember this device" checkbox
- [x] Real-time client-side validation (email format, empty field detection)
- [x] Accessible error messages with `aria-invalid` and `role="alert"`
- [x] Auto-fill helper button for mentor / reviewer demonstrations
- [x] Simulated loading spinner and success toast notification
- [x] "Forgot password?" link (ready for Phase 2 reset flow)
- [x] Navigation link to the registration page

### ✅ Registration Page (`signup.html`)
- [x] Full name, email, create password, and confirm password fields
- [x] Real-time 4-segment password strength meter (Weak → Fair → Good → Strong)
- [x] Password requirements: 8+ characters, uppercase, lowercase, and a number
- [x] Confirm password matching validation
- [x] Terms of Service and Privacy Policy agreement checkbox
- [x] Accessible error messages on all fields
- [x] Simulated loading state and success toast notification
- [x] Navigation link back to the login page

### ✅ Shared Design System (`style.css`)
- [x] Dark navy blue canvas (`#0a0f1d`) with ambient purple radial gradients
- [x] Vibrant purple / indigo accent palette (`#7c3aed`, `#4f46e5`)
- [x] White card elevation with soft layered shadows
- [x] Responsive layout: two-column split on desktop, stacked card on mobile
- [x] Smooth micro-animations on hover, focus, error display, and toast entrance
- [x] CSS Custom Properties design token system for easy theming

---

## Project Structure

```
CareerInfinity/
│
├── index.html          # Phase 1 — Login page (Sign In)
├── signup.html         # Phase 1 — Registration page (Create Account)
├── style.css           # Shared design system stylesheet
├── script.js           # Client-side validation, password toggles, simulation logic
│
├── .gitignore          # Git exclusion rules (secrets, OS files, future build artifacts)
└── README.md           # This file
│
│   ── Planned Future Directories ──
│
├── dashboard/          # Phase 2 — Career Intelligence Dashboard (planned)
├── resume/             # Phase 3 — AI Resume Analyzer (planned)
├── skills/             # Phase 4 — Skill Gap Diagnostic Engine (planned)
├── jobs/               # Phase 5 — Job Recommendation Feed (planned)
└── api/                # Backend API / Firebase Cloud Functions (planned)
```

---

## Getting Started

No build tools or package installation required for Phase 1. Open with any modern browser.

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
5. Your browser will open at `http://127.0.0.1:5500/index.html` with live-reload on save.

**Method 2 — Direct Browser Open**
1. Navigate to the project folder in Windows Explorer.
2. Double-click `index.html`. It will open in your default browser.
3. Use the navigation links at the bottom of the card to switch between Login and Sign Up pages.

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

> **Tip:** Click the **Auto-Fill** button on the login page to populate these instantly.

---

## Important Security Note

> **⚠️ This is a UI prototype — not a production authentication system.**

Client-side JavaScript validation is a **User Experience (UX) tool**, not a security boundary. Anyone can open browser DevTools and bypass client-side checks. In this Phase 1 prototype:

- No credentials are transmitted to any server.
- No data is stored anywhere — all interactions are UI simulations.
- The form architecture in `script.js` is deliberately structured so that Firebase Authentication (or any backend API) can be integrated in Phase 2 with **minimal code changes**.

**Phase 2 will add real security** using:
- **Firebase Authentication** (`signInWithEmailAndPassword`, `createUserWithEmailAndPassword`)
- Server-side input validation
- HTTP-only session cookies or JWT tokens
- HTTPS enforcement

---

## Roadmap

| Phase | Module | Status |
|:------|:-------|:-------|
| **Phase 1** | 🔐 Authentication Module (Login + Registration UI) | ✅ Complete |
| **Phase 2** | 🔗 Firebase Auth Integration (Real sign-in, session, password reset) | 🔜 Planned |
| **Phase 3** | 📊 Career Intelligence Dashboard (Skill analytics, telemetry) | 🔜 Planned |
| **Phase 4** | 📄 AI Resume Analyzer (Upload, score, and improve resume) | 🔜 Planned |
| **Phase 5** | 🧠 Skill Gap Diagnostic Engine (Role benchmarking) | 🔜 Planned |
| **Phase 6** | 💼 Job Recommendation Feed (Live matching with job market) | 🔜 Planned |
| **Phase 7** | 🎓 Learning Path Generator (Personalized upskilling plans) | 🔜 Planned |

---

## Git Workflow

### Initial Setup (First Time Only)
```bash
# 1. Initialize Git inside the project folder
git init

# 2. Stage all files (respecting .gitignore)
git add .

# 3. Make your first commit
git commit -m "feat(auth): initial release — Phase 1 authentication module"

# 4. Rename the branch to main
git branch -M main

# 5. Link to your GitHub repository (replace YOUR_USERNAME with your GitHub handle)
git remote add origin https://github.com/YOUR_USERNAME/CareerInfinity.git

# 6. Push to GitHub
git push -u origin main
```

### Daily Development Workflow
```bash
# Check which files have been changed
git status

# Stage all changed files
git add .

# OR stage specific files only
git add index.html style.css

# Commit with a descriptive message
git commit -m "fix(login): improve password toggle accessibility label"

# Push your changes to GitHub
git push
```

### Commit Message Conventions
Good commit messages help your mentor understand what changed and why.

| Prefix | Meaning | Example |
|:-------|:--------|:--------|
| `feat` | New feature added | `feat(signup): add real-time password strength meter` |
| `fix` | Bug fix | `fix(login): correct email validation regex` |
| `style` | Visual/CSS change only | `style(card): update card border radius to 20px` |
| `refactor` | Code restructured (no feature change) | `refactor(script): extract validation into helper functions` |
| `docs` | Documentation update | `docs: update README with Phase 2 roadmap` |
| `chore` | Housekeeping (gitignore, configs) | `chore: add node_modules to .gitignore` |

---

## Contributing

This project is developed privately under mentor guidance. Contributions and suggestions from the mentor are welcomed through:

1. **GitHub Issues** — for tracking bugs and feature requests.
2. **Pull Requests** — for reviewing proposed code changes.
3. **GitHub Discussions** — for architecture and design decisions.

---

<div align="center">

**CareerInfinity** &nbsp;·&nbsp; AI-Powered Career Intelligence Platform  
Built with ❤️ using HTML5, CSS3 & Vanilla JavaScript  
Phase 1: Authentication Module

</div>
