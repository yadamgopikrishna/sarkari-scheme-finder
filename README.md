# Sarkari Scheme Finder 🏛️
### Government Scheme Eligibility & Recommendation Portal for Indian Citizens

A modern, responsive, full-stack **MERN (MongoDB, Express.js, React.js, Node.js)** application designed for Indian citizens to automatically discover Central, State, and Union Territory welfare schemes tailored to their demographic, financial, occupational, educational, and agricultural profile.

---

## 📑 Table of Contents
1. [Project Overview & Key Objectives](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [Complete File & Folder Structure](#3-complete-file--folder-structure)
4. [Prerequisites & System Requirements](#4-prerequisites--system-requirements)
5. [Step-by-Step Execution Process](#5-step-by-step-execution-process)
6. [Default Login Credentials](#6-default-login-credentials)
7. [Core Eligibility Engine Architecture](#7-core-eligibility-engine-architecture)
8. [Multilingual Support (8 Indian Languages)](#8-multilingual-support)
9. [AI Scheme Assistant](#9-ai-scheme-assistant)
10. [REST API Endpoints Reference](#10-rest-api-endpoints-reference)
11. [Data Security & Privacy Principles](#11-data-security--privacy-principles)

---

## 1. Project Overview

### Key Objectives:
- **Comprehensive Coverage:** Supports Central Government schemes (e.g., PM-KISAN, PMAY, PM-JAY, APY, PM Mudra, PM SVANidhi, PM Vishwakarma) and State Government schemes across all 28 States and 8 Union Territories (e.g., Andhra Pradesh Thalliki Vandanam, NTR Bharosa Pension, Rythu Bharosa; Maharashtra Ladki Bahin; Karnataka Gruha Lakshmi; Tamil Nadu Pudhumai Penn; Telangana Rythu Bharosa; UP Kanya Sumangala).
- **7-Step Eligibility Wizard:** Citizens complete a simple, multi-step questionnaire (Basic Info → Economic Info → Education → Occupation → Special Categories → Agriculture → Housing & Family).
- **Dynamic Matching Engine:** Evaluates numerical constraints (age min/max, income ceilings, landholding acres) and categorical rules (occupations, states, genders, disability benchmarks, ration card categories) without hard-coding rules into the frontend.
- **Percentage Score & Condition Checklist:** Returns percentage match (e.g. `95% Match`, `82% Match`) with detailed checklists (`✓ Age requirement satisfied`, `✓ State satisfied`, `⚠ Land ownership document needs verification`).
- **Dynamic Admin Dashboard:** Portal administrators can add, edit, verify, or deactivate schemes and update eligibility rules without code changes.
- **Official Verification Stamp:** Clear distinction of verified official government portals with "Information last verified on DD/MM/YYYY".

---

## 2. Technology Stack

### Frontend:
- **Framework:** React.js (v18) with Vite bundler
- **Routing:** React Router DOM (v6) with protected citizen and admin routes
- **Styling:** Tailwind CSS with an official Indian Government digital aesthetic (Navy `#0B2545`, Saffron `#E86100`, Emerald `#107E3E`)
- **Icons:** Lucide React
- **API Client:** Axios with JWT authorization header interceptors
- **Responsive Design:** Mobile-first layout tested across 320px, 375px, 768px, 1024px, and 1440px

### Backend:
- **Runtime:** Node.js (v18+)
- **Server Framework:** Express.js
- **Database:** MongoDB & Mongoose ODM
- **Authentication:** JSON Web Tokens (JWT) & bcryptjs password hashing
- **Security:** Helmet HTTP headers, CORS, Express rate-limiting, server-side validation, error handling middleware

### Optional AI Module:
- **Scheme Assistant AI:** Grounded natural-language query processor that queries verified MongoDB scheme records, explains why each scheme matches, lists required documents, provides official links, and includes mandatory disclaimers.

---

## 3. Complete File & Folder Structure

```text
fsd-2 project/
├── client/                               # Frontend React + Vite Application
│   ├── public/                           # Static assets
│   ├── src/
│   │   ├── components/                   # Reusable UI Components
│   │   │   ├── AdminRoute.jsx            # Admin route protection
│   │   │   ├── AiAssistantModal.jsx      # Floating AI Chatbot Assistant widget
│   │   │   ├── Footer.jsx                # Gov styled footer with helplines & legal disclaimer
│   │   │   ├── LanguageSelector.jsx      # 8 Indian languages selector dropdown
│   │   │   ├── Navbar.jsx                # Responsive navbar with tricolor ribbon & badges
│   │   │   ├── NotificationDropdown.jsx  # Notification alert dropdown with unread badge
│   │   │   ├── ProtectedRoute.jsx        # Authenticated citizen route guard
│   │   │   └── SchemeCard.jsx            # Scheme card with match pill & condition checklist
│   │   ├── context/                      # React Context Providers
│   │   │   ├── AuthContext.jsx           # JWT session, login, register, profile state
│   │   │   └── LanguageContext.jsx       # Active language state with persistence
│   │   ├── pages/                        # View Pages
│   │   │   ├── AdminDashboardPage.jsx    # Analytics, Scheme CRUD, Rule Builder, User Manager
│   │   │   ├── BrowseSchemesPage.jsx     # Catalog search, state/category filters, pagination
│   │   │   ├── CompareSchemesPage.jsx    # Side-by-side comparison table (up to 4 schemes)
│   │   │   ├── DashboardPage.jsx         # Citizen dashboard with profile & audit history
│   │   │   ├── EligibilityFormPage.jsx   # 7-step accessible eligibility wizard
│   │   │   ├── ForgotPasswordPage.jsx    # Password recovery UI
│   │   │   ├── HomePage.jsx              # Hero banner, live counters, categories, 4-step guide
│   │   │   ├── LoginPage.jsx             # Citizen & Admin login with demo credentials
│   │   │   ├── NotFoundPage.jsx          # 404 Error page
│   │   │   ├── RegisterPage.jsx          # Registration without Aadhaar or sensitive PII
│   │   │   ├── ResultsPage.jsx           # "Schemes You May Be Eligible For" recommendations
│   │   │   ├── SavedSchemesPage.jsx      # Bookmarked schemes management
│   │   │   └── UserProfilePage.jsx       # Profile details & password update
│   │   ├── services/
│   │   │   └── api.js                    # Axios instance with auth token interceptor
│   │   ├── translations/
│   │   │   └── translations.js           # Full dictionary for 8 Indian languages
│   │   ├── App.jsx                       # Main App component with route mappings
│   │   ├── index.css                     # Tailwind directives, scrollbar & tricolor styling
│   │   └── main.jsx                      # Root render with Context Providers
│   ├── index.html                        # HTML5 document with emblem icon & Inter font
│   ├── package.json                      # Client dependencies & Vite scripts
│   ├── postcss.config.js                 # PostCSS Tailwind config
│   ├── tailwind.config.js                # Tailwind theme colors (sarkari-navy, saffron, emerald)
│   └── vite.config.js                    # Vite configuration with /api backend proxy
│
├── server/                               # Backend Node.js + Express API Server
│   ├── config/
│   │   └── db.js                         # Mongoose MongoDB connection
│   ├── controllers/
│   │   ├── adminController.js            # Analytics, scheme CRUD, verification & user management
│   │   ├── aiController.js               # Grounded AI Scheme Assistant chat handler
│   │   ├── authController.js             # User registration, login, and profile updates
│   │   ├── eligibilityController.js      # Multi-step eligibility calculation & audit history
│   │   ├── metaController.js             # States, UTs, districts, and scheme categories
│   │   ├── notificationController.js     # System alerts & deadline notifications
│   │   ├── savedSchemeController.js      # Bookmark save, list, and removal
│   │   └── schemeController.js           # Public catalog, filters, search, and view counter
│   ├── middleware/
│   │   ├── adminMiddleware.js            # Admin role-based access authorization
│   │   ├── authMiddleware.js             # JWT bearer verification & optional auth
│   │   └── errorMiddleware.js            # 404 handler & centralized error response
│   ├── models/
│   │   ├── Category.js                   # Categories schema with icon names
│   │   ├── EligibilityCheck.js           # Citizen eligibility query logs for analytics
│   │   ├── Notification.js               # Announcements, updates, and deadline reminders
│   │   ├── SavedScheme.js                # Citizen bookmarked schemes schema
│   │   ├── Scheme.js                     # Flexible Scheme schema with structured rules & indexes
│   │   ├── StateDistrict.js              # 36 States/UTs with official districts
│   │   └── User.js                       # Citizen & Admin schema (bcrypt hashed, NO Aadhaar)
│   ├── routes/
│   │   ├── adminRoutes.js                # /api/admin/*
│   │   ├── aiRoutes.js                   # /api/chat
│   │   ├── authRoutes.js                 # /api/auth/*
│   │   ├── eligibilityRoutes.js          # /api/eligibility/*
│   │   ├── metaRoutes.js                 # /api/meta/*
│   │   ├── notificationRoutes.js         # /api/notifications/*
│   │   ├── savedSchemeRoutes.js          # /api/saved-schemes/*
│   │   └── schemeRoutes.js               # /api/schemes/*
│   ├── seed/
│   │   ├── runSeed.js                    # Database runner script to populate MongoDB
│   │   └── seedData.js                   # 23+ realistic Central/State schemes, 36 States/UTs, Admin
│   ├── services/
│   │   ├── aiAssistantService.js         # Intent extraction & grounded scheme answering
│   │   └── eligibilityEngine.js          # Core rule evaluation, match score & checklist generator
│   ├── .env                              # Server environment variables (PORT, MONGODB_URI, JWT)
│   ├── package.json                      # Server dependencies & scripts
│   └── server.js                         # Express server entry point, rate-limiter, security headers
│
├── README.md                             # Comprehensive technical documentation & run guide
└── .gitignore                            # Git ignore rules for node_modules, .env, dist
```

---

## 4. Prerequisites & System Requirements

Before running the application, ensure the following are installed:
1. **Node.js**: Version `18.x` or higher (Recommended: `v20.x` or `v24.x`).
2. **NPM**: Version `9.x` or higher.
3. **MongoDB**: A running MongoDB instance locally (`mongodb://127.0.0.1:27017`) or MongoDB Atlas URI.

---

## 5. Step-by-Step Execution Process

### Step 1: Clone or Open the Project
Open a terminal in the project root:
```bash
cd "g:\fsd-2 project"
```

---

### Step 2: Configure Server Environment Variables
Verify or edit `server/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/sarkari_scheme_finder
JWT_SECRET=sarkari_scheme_secret_key_2026_secure_jwt_token_auth
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

---

### Step 3: Install Backend Dependencies & Seed Database
In your terminal, navigate to the `server/` directory:
```bash
cd server
npm install
npm run seed
```
**Output should confirm:**
- 36 States & Union Territories inserted
- 11 Categories inserted
- 23 Central & State Schemes inserted
- Default Admin & Demo Citizen accounts created

---

### Step 4: Start the Backend Server
From `server/`:
```bash
npm start
# OR for live reload:
npm run dev
```
The server will output:
```text
[Server] Sarkari Scheme Finder running in development mode on port 5000
[Database] MongoDB Connected: 127.0.0.1/sarkari_scheme_finder
```

---

### Step 5: Install Frontend Dependencies & Start Client
Open a new terminal window and navigate to the `client/` directory:
```bash
cd client
npm install
npm run dev
```
The Vite development server will start:
```text
VITE ready in 690 ms
➜  Local:   http://localhost:5173/
```
Open **http://localhost:5173** in your web browser.

---

## 6. Default Login Credentials

### 1. Administrative Portal:
- **URL:** [http://localhost:5173/login](http://localhost:5173/login) (Click Admin Panel in Navbar)
- **Email:** `admin@sarkari.gov.in`
- **Password:** `Admin@12345`
- **Role:** Administrator (full CRUD access to schemes, verification dates, analytics, citizen user manager).

### 2. Demo Citizen Account:
- **URL:** [http://localhost:5173/login](http://localhost:5173/login)
- **Email:** `citizen@sarkari.gov.in`
- **Password:** `Citizen@12345`
- **Role:** Citizen (preloaded with a sample profile from Andhra Pradesh: 42 yrs, Farmer, ₹95,000 income, White ration card).

*New citizens can also register instantly via the `/register` page with no Aadhaar required.*

---

## 7. Core Eligibility Engine Architecture

The Eligibility Engine (`server/services/eligibilityEngine.js`) evaluates citizen inputs against MongoDB schemes:

1. **State & Location Matching:**
   - Central schemes apply to all 36 States & UTs.
   - State schemes strictly match the applicant's state (e.g. resident of Andhra Pradesh qualifies for Thalliki Vandanam & NTR Bharosa; disqualified from Maharashtra or UP state schemes).
2. **Age Bounds:**
   - Verifies if `user.age` satisfies `minAge <= user.age <= maxAge`.
3. **Gender Restrictions:**
   - Dedicated women welfare schemes (e.g. PM Ujjwala, Ladki Bahin, Pudhumai Penn, Kanya Sumangala) verify female gender.
4. **Income Ceiling:**
   - Compares annual family income with the scheme ceiling (e.g. ₹2.5 Lakhs for PM-JAY, ₹3 Lakhs for PMAY).
5. **Occupation & Special Criteria:**
   - PM-KISAN, Rythu Bharosa evaluate landholding acres and farmer category.
   - PwD schemes check benchmark disability percentage (≥ 40%).
   - Pensions evaluate senior citizen age (≥ 60) and BPL priority.
6. **Weighted Score & Checklist:**
   - Returns percentage (e.g. `95% Match`, `82% Match`).
   - Labels status as **"You may be eligible"** instead of guaranteeing government sanction.
   - Lists verified conditions (`✓ ...`) and required document checks (`⚠ ...`).

---

## 8. Multilingual Support

A dedicated language selector in the navigation bar supports **8 major Indian languages**:
1. **English** (Default)
2. **తెలుగు** (Telugu)
3. **हिन्दी** (Hindi)
4. **தமிழ்** (Tamil)
5. **ಕನ್ನಡ** (Kannada)
6. **മലയാളം** (Malayalam)
7. **मराठी** (Marathi)
8. **বাংলা** (Bengali)

All navigation links, buttons, headers, questionnaire steps, categories, and legal advisory notices update instantaneously without page reloads.

---

## 9. AI Scheme Assistant

The floating **Scheme Assistant AI** widget (bottom-right) accepts natural-language queries:
- **Example:** *"I am a 65-year-old farmer from Andhra Pradesh with an annual income of ₹80,000. What schemes should I check?"*
- **Execution:**
  1. Extracts demographic attributes (Age: 65, State: Andhra Pradesh, Occupation: Farmer, Income: ₹80,000).
  2. Queries verified MongoDB scheme records for active programs matching criteria (PM-KISAN, AP Rythu Bharosa, NTR Bharosa Pension, Ayushman Bharat).
  3. Formulates a grounded response explaining why each scheme matches, what documents are required, provides direct official links, and includes mandatory legal verification disclaimers.

---

## 10. REST API Endpoints Reference

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register a new citizen account
- `POST /api/auth/login` — Citizen or Admin login (returns JWT token)
- `GET /api/auth/profile` — Get profile of authenticated user *(Protected)*
- `PUT /api/auth/profile` — Update profile & credentials *(Protected)*

### Schemes (`/api/schemes`)
- `GET /api/schemes` — Filtered catalog (search, state, category, gov level, pagination)
- `GET /api/schemes/featured` — Featured programs for homepage
- `GET /api/schemes/:id` — Full details of a scheme & view count increment

### Eligibility Engine (`/api/eligibility`)
- `POST /api/eligibility/check` — Dynamic 7-step questionnaire evaluation
- `GET /api/eligibility/history` — Citizen's past eligibility queries *(Protected)*

### Saved Schemes (`/api/saved-schemes`)
- `GET /api/saved-schemes` — List user's bookmarked schemes *(Protected)*
- `POST /api/saved-schemes` — Save a scheme to bookmarks *(Protected)*
- `DELETE /api/saved-schemes/:id` — Remove scheme from bookmarks *(Protected)*

### Admin Portal (`/api/admin`) *(Admin Protected)*
- `GET /api/admin/analytics` — Scheme distribution, query metrics, active totals
- `POST /api/admin/schemes` — Create new scheme with structured rules
- `PUT /api/admin/schemes/:id` — Edit scheme or update verification stamp
- `DELETE /api/admin/schemes/:id` — Deactivate or delete scheme
- `GET /api/admin/users` — List registered citizens
- `PUT /api/admin/users/:id/toggle-status` — Toggle citizen account status

### AI Assistant & Metadata
- `POST /api/chat` — Grounded AI Scheme Assistant chat
- `GET /api/meta/states` — 36 Indian States & UTs with districts
- `GET /api/meta/categories` — Scheme categories with live counts
- `GET /api/notifications` — Portal announcements & deadline notices

---

## 11. Data Security & Privacy Principles

- **No Aadhaar Storage:** The application strictly follows government digital privacy standards by never asking for or storing Aadhaar numbers, PAN cards, or biometric data.
- **Bcrypt Password Encryption:** Passwords are salted and hashed with 10 rounds using `bcryptjs`.
- **JWT Authorization:** Secured stateless tokens with expiration for all protected endpoints.
- **Role-Based Access Control (RBAC):** Admin endpoints are protected by `adminOnly` middleware.
- **Rate Limiting:** Protection against brute-force and DDoS on `/api/auth` and `/api/chat`.
- **Transparency:** All links redirect to official `.gov.in` and state government portals.
