# Sarkari Scheme Finder 🏛️
## Presentation Deck (PPT Slides & Speaker Notes)
### A Government Scheme Eligibility & Recommendation Portal for Indian Citizens

---

## Slide 1: Title Slide
- **Title:** Sarkari Scheme Finder
- **Subtitle:** An Intelligent Government Scheme Eligibility & Recommendation Portal for Indian Citizens
- **Category:** Full-Stack MERN Application (MongoDB, Express.js, React.js, Node.js)
- **Presented By:** [Student Name / Team Name]
- **Academic Year:** 2026
- **Speaker Notes:**
  > "Good morning respected professors and evaluators. Today, we present 'Sarkari Scheme Finder', a citizen-centric digital portal designed to bridge the awareness and access gap between Indian citizens and government welfare schemes. Using a modern MERN stack architecture and dynamic eligibility evaluation algorithms, our platform simplifies how 1.4 billion citizens discover and apply for welfare benefits."

---

## Slide 2: Problem Statement & Motivation
- **The Challenge in India:**
  - Over 1,000+ Central, State, and UT welfare programs exist across agriculture, education, pensions, and healthcare.
  - Citizens often miss out on entitled benefits due to complex gazettes, scattered portals, and opaque eligibility criteria.
  - Lack of centralized platforms that automatically match citizen demographic and economic profiles.
- **Our Solution:**
  - A unified, transparent, multi-lingual portal that evaluates eligibility dynamically.
  - 7-step guided questionnaire with zero collection of sensitive identity documents like Aadhaar.
  - Match percentage scoring with verified criteria checklists and direct links to official government portals.
- **Speaker Notes:**
  > "Millions of eligible citizens miss benefits simply because they do not know a scheme exists or whether they qualify. Traditional government portals are often fragmented across different ministries. Our portal provides a single window that dynamically cross-references citizen profiles against verified rules without storing sensitive identity documents."

---

## Slide 3: Key Objectives & Features
1. **Dynamic Eligibility Engine:** Computes matching percentages (e.g., 95% Match) and condition checklists.
2. **Central & State Coverage:** Supports all 28 States and 8 Union Territories with state-specific programs (e.g., Andhra Pradesh Thalliki Vandanam, NTR Bharosa, Rythu Bharosa).
3. **Multilingual Inclusivity:** Instant UI translation across 8 Indian languages (English, Telugu, Hindi, Tamil, Kannada, Malayalam, Marathi, Bengali).
4. **Grounded AI Scheme Assistant:** Conversational chatbot strictly grounded in verified database schemes.
5. **Dynamic Admin Panel:** Portal administrators can add or update schemes and eligibility rules without code modifications.
6. **Scheme Comparison Matrix:** Side-by-side comparative table for up to 4 schemes simultaneously.
- **Speaker Notes:**
  > "The core philosophy is transparency and accessibility. The portal supports all Indian states and Union Territories, translates into 8 languages, and features a grounded AI assistant that answers citizen queries strictly using verified government data."

---

## Slide 4: System Architecture
- **Three-Tier MERN Stack Architecture:**
  1. **Presentation Layer (Frontend):** React 18, Vite, React Router, Tailwind CSS, Lucide Icons, Axios.
  2. **Application Layer (Backend):** Node.js, Express.js, JWT Authentication, bcryptjs, Eligibility Rules Engine, Grounded AI Service.
  3. **Data Layer (Database):** MongoDB with Mongoose ODM, indexed for fast state, category, and text search.
- **System Architecture Diagram:**
  ```text
  [ Citizen Browser / Mobile ]
               │
               ▼ HTTP / JSON (Port 5173 / 5000)
    [ Express.js REST API Server ]
      ├── JWT & Role-Based Middleware
      ├── 7-Step Eligibility Matching Engine
      ├── Grounded AI Scheme Assistant
      └── Admin CRUD & Verification Controller
               │
               ▼ Mongoose ODM (Port 27017)
      [ MongoDB Database ]
      ├── schemes (Structured Rules)
      ├── users (Hashed Passwords)
      ├── states (36 States & UTs)
      ├── categories & notifications
  ```
- **Speaker Notes:**
  > "Here is our architecture. The frontend communicates with our Express backend via RESTful APIs protected by JWT and rate limiters. The backend queries MongoDB where schemes are stored with structured JSON rule objects rather than plain text."

---

## Slide 5: Database Schema & Structured Rules
- **Scheme Schema Architecture:**
  - `schemeName`, `schemeCode`, `category`, `governmentLevel`, `state`, `department`
  - `benefitAmount`, `benefits`, `requiredDocuments`, `applicationProcess`
  - `officialWebsite`, `applicationLink`, `helplineNumber`
  - `lastVerified`, `lastUpdated`, `sourceUrl`
- **Structured Rule Representation:**
  ```json
  {
    "age": { "min": 18, "max": 70 },
    "income": { "max": 250000 },
    "states": ["Andhra Pradesh"],
    "occupations": ["Farmer"],
    "farmerSpecific": {
      "landRequired": true,
      "maxLandAcres": 5.0
    }
  }
  ```
- **Why Structured Rules?**
  - Allows dynamic evaluation using Boolean logic (AND/OR/NOT).
  - Enables administrators to add or update rules via Admin Panel without touching code.
- **Speaker Notes:**
  > "Instead of saving eligibility criteria as unstructured text, we store criteria as structured JSON objects with numerical bounds and categorical arrays. This is what enables our backend engine to execute instant rule comparisons."

---

## Slide 6: 7-Step Eligibility Wizard
- **Step 1 — Basic Information:** Age, Gender, Marital Status, State, District, Rural/Urban.
- **Step 2 — Economic Information:** Annual Family Income (₹), BPL Status, Ration Card type (White, BPL, AAY, APL), Employment.
- **Step 3 — Education:** Student status, Education level (10th, 12th, Graduate), Course, Institution type.
- **Step 4 — Occupation:** Farmer, Daily wage, Self-employed, Business owner, Homemaker, etc.
- **Step 5 — Special Categories:** Senior citizen, Disability benchmark (≥40%), Widow, Orphan, Pregnant woman, Single parent, Veteran, Artisan.
- **Step 6 — Agriculture (Conditional):** Land ownership, Land size in acres, Crop type, Irrigation (only displayed for farmers).
- **Step 7 — Housing & Family:** Own house, Housing condition (Pucca/Kutcha), Family size, Electricity, Toilet.
- **Speaker Notes:**
  > "Instead of overwhelming the citizen with a giant form, we broke it down into 7 logical steps. Notice our conditional logic: Step 6 for agricultural landholding only appears if the user identifies as a farmer or agricultural worker."

---

## Slide 7: Eligibility Engine & Recommendation Logic
- **Weighted Rule Evaluation:**
  - Evaluates location residency (Central vs. State restrictions).
  - Evaluates numerical age bounds and income thresholds.
  - Evaluates affirmative action categories (PwD, Widow, Senior Citizen).
- **Sample Engine Output:**
  ```text
  Scheme: PM-KISAN
  Match Score: 95% Match
  Status: "You may be eligible"
  ✓ Age requirement satisfied (65 years within 18-90 years)
  ✓ State requirement satisfied (Applicable nationwide)
  ✓ Occupation requirement satisfied (Farmer)
  ⚠ Valid Land Revenue Records / Pattadar Passbook required for verification
  ```
- **Ethical & Legal Compliance:**
  - Never promises or guarantees government sanction.
  - Uses the standard advisory phrase **“You may be eligible”**.
- **Speaker Notes:**
  > "Our engine produces transparent output. Rather than a black-box answer, it gives the citizen an exact breakdown of which conditions matched, which need document verification, and direct links to apply on verified portals."

---

## Slide 8: Grounded AI Scheme Assistant
- **Conversational Natural Language Interface:**
  - Accepts queries in plain language (e.g. *"I am a 65-year-old farmer in Andhra Pradesh with income ₹80,000. What schemes should I check?"*).
- **Architecture:**
  - Regex & semantic entity extractor parses age, state, occupation, and income.
  - Queries active MongoDB database for matching schemes.
  - Returns grounded responses with official links, required documents, and mandatory disclaimers.
- **Safety Mechanism:**
  - Zero hallucination — the AI does NOT invent fake schemes, criteria, or links.
- **Speaker Notes:**
  > "The AI assistant acts as a 24/7 digital counselor. It detects user intent, extracts demographics, queries MongoDB, and returns verified schemes with application links and official disclaimers."

---

## Slide 9: Multilingual Support (8 Indian Languages)
- **Supported Languages:**
  1. English
  2. Telugu (తెలుగు)
  3. Hindi (हिन्दी)
  4. Tamil (தமிழ்)
  5. Kannada (ಕನ್ನಡ)
  6. Malayalam (മലയാളം)
  7. Marathi (मराठी)
  8. Bengali (বাংলা)
- **Coverage:**
  - Navigation menus, buttons, hero banners, 7-step questionnaire labels, disclaimer banners, and filter tools.
  - Instantaneous client-side switching with persistent local storage.
- **Speaker Notes:**
  > "Language should never be a barrier to welfare. We implemented translations across 8 major Indian languages, allowing ordinary citizens across rural and urban India to navigate comfortably in their native script."

---

## Slide 10: Admin Dashboard & Scheme Governance
- **Portal Analytics:**
  - Total schemes, Central vs. State distribution, active programs, total eligibility checks conducted, top queried states.
- **Dynamic Scheme Governance:**
  - Create new schemes with structured rule builder.
  - Edit benefits, documents, and application links.
  - "Verify Today" one-click button updates official verification timestamps.
  - Deactivate outdated schemes without database deletion.
- **Citizen Account Management:**
  - Monitor registered citizens and toggle account status.
- **Speaker Notes:**
  > "The admin dashboard ensures long-term sustainability. When government guidelines or benefit amounts change, administrators can update the rules directly through the UI without requiring code deployments."

---

## Slide 11: Security & Privacy Design
- **Privacy by Design:**
  - Strictly **NO Aadhaar numbers, PAN cards, or biometric data** collected or stored.
- **Cryptographic Security:**
  - Passwords hashed with 10 rounds of salt using `bcryptjs`.
  - Stateless JSON Web Tokens (JWT) for session management.
- **API Protection:**
  - Helmet HTTP security headers.
  - Express rate-limiters on sensitive authentication and chat endpoints.
  - Role-Based Access Control (RBAC) protecting all `/api/admin/*` routes.
- **Speaker Notes:**
  > "Privacy was a core requirement. We deliberately avoid storing sensitive identity data like Aadhaar numbers. Passwords are encrypted with bcrypt, APIs are rate-limited, and admin endpoints are protected by role-based guards."

---

## Slide 12: Live Demonstration Flow
1. **Home Portal:** Live statistics, category cards, 8-language switcher.
2. **Citizen Registration / Login:** Clean form with demo accounts pre-seeded.
3. **7-Step Eligibility Questionnaire:** Complete submission with sample AP Farmer profile.
4. **Results Page:** Review 95% match cards, checklists, and filters.
5. **Scheme Comparison:** Compare 2 to 4 schemes in the side-by-side matrix.
6. **Scheme Details Page:** Inspect verification date badge, benefits, and "Apply on Official Portal" CTA.
7. **AI Scheme Assistant:** Ask a natural-language question and receive grounded links.
8. **Admin Panel:** Login as admin, view live analytics, and inspect rule management.
- **Speaker Notes:**
  > "We will now walk through the live portal demonstration covering citizen discovery, eligibility matching, AI assistant queries, and administrative governance."

---

## Slide 13: Conclusion & Future Scope
- **Conclusion:**
  - Successfully built a production-ready, accessible, responsive MERN application.
  - Empowers Indian citizens to discover government benefits easily and securely.
- **Future Enhancements:**
  - Integration with DigiLocker for optional auto-verification of documents.
  - WhatsApp & SMS notifications for upcoming application deadlines.
  - Voice-based query support for non-literate citizens.
- **Thank You! / Q&A**
- **Speaker Notes:**
  > "Thank you for your time. We are now open for questions and feedback."
