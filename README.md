<div align="center">
  <img src="https://via.placeholder.com/150x150.png?text=reNove+Logo" alt="reNove Logo" width="150" />
  <h1>reNove - AI-Powered Addiction Recovery Platform</h1>
  <p><em>Empowering recovery through highly personalized AI level generation, certified therapy, and robust progress tracking.</em></p>
  
  [![React](https://img.shields.io/badge/React-19-blue.svg)](https://reactjs.org/)
  [![Node.js](https://img.shields.io/badge/Node.js-Express-green.svg)](https://nodejs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
</div>

<hr />

## 🌟 The Core Differentiator: AI-Generated Personalized Recovery Levels

Compared to conventional addiction recovery platforms, reNove takes a fundamentally different approach to personalization. Most existing solutions provide a fixed recovery curriculum where every user with the same addiction type follows an identical sequence of lessons, tasks, or milestones regardless of their individual circumstances. While users may be able to track progress or consult a therapist, the recovery content itself typically remains static. 

**In contrast, reNove uses AI to generate a personalized recovery journey from the very start.**

The core of reNove is its **AI-powered level generation system**, which creates a customized recovery path for each user instead of assigning a one-size-fits-all plan. During onboarding, the platform collects three critical pieces of information: 
1. The user's addiction type.
2. Addiction severity.
3. Personal interests and hobbies.

Using these inputs, the AI engine generates a structured sequence of recovery "levels" tailored to the individual's exact situation. Each level is dynamically populated with:
- Personalized daily objectives
- Recovery-focused activities and actionable tasks
- Educational guidance and motivational challenges
- Custom topics aligned with the user’s personal interests to make the experience engaging and relatable.

By generating levels that resonate with the individual's unique circumstances and interests, reNove delivers a highly relevant, interactive experience designed to encourage consistent participation and foster long-term habit change.

---

## 🎯 Crystal Clear Feature Breakdown by Role

### 👤 User (Patient) Experience
- **Dynamic Recovery Journey:** An AI-generated sequence of progression levels tailored specifically to your addiction profile, severity, and personal interests.
- **AI-Powered Recovery Companion:** 24/7 conversational support built with **Google Generative AI**, **LangChain**, and **Qdrant** (Vector Database for RAG). It offers contextual, personalized guidance and immediate coping strategies in moments of craving or distress.
- **Interactive Progress Tracking:** Monitor daily progress, complete journals, track specific goals, and advance through your personalized recovery levels, visualized beautifully with Chart.js.
- **Therapist Discovery & Intelligent Booking:** Browse a curated directory of verified therapists, view transparent ratings/reviews, and book sessions via an intelligent slot-locking mechanism that prevents double-booking.
- **WebRTC Video Sessions:** Secure, high-quality, real-time 1-on-1 video consultations right in your browser—no external software needed.
- **Real-Time Chat & Notifications:** Real-time Socket.io messaging with your therapist and instant notifications for booking approvals, reminders, and alerts.
- **Wallet & Secure Payments:** Integrated Stripe payment gateway for seamless session payments and automated wallet top-ups.
- **Issue Reporting System:** An integrated ticketing system to securely report platform or user issues to administrators.

### 🩺 Therapist Experience
- **Dynamic Availability Management:** Granular control over your working hours and schedule, with real-time syncing to the user booking portal.
- **Pre-Session Patient Insights:** Review patient progress, notes, journals, and their current AI-generated recovery level *before* the session begins.
- **Seamless Session Management:** Conduct secure WebRTC video calls and rely on automated session state management (scheduled, active, completed, cancelled).
- **Financial Dashboard:** A dedicated wallet to track total earnings, view session-by-session revenue, and manage automated Stripe payouts directly to your bank account.
- **Direct Patient Messaging:** Secure real-time chat for follow-ups, accountability, and support between scheduled sessions.
- **Professional Profile Customization:** Build a compelling public profile with specializations, experience, and verified credentials to attract the right patients.

### 🛡️ Administrator Experience
- **Centralized Command Center:** A bird’s eye view of all platform metrics—user growth, active sessions, and revenue statistics.
- **Verification Pipeline:** Review, approve, or reject new therapist applications based on their uploaded credentials and background checks.
- **Moderation & Reports Engine:** Handle user/therapist disputes, review flagged content, and maintain platform safety and integrity through a dedicated moderation dashboard.
- **Financial Oversight:** Monitor platform-wide transactions, therapist payouts, and platform commissions with paginated, easily digestible data tables.

---

## 🛠️ Technology Stack & Architecture

### Frontend (Client-Side)
- **Core Framework:** React 19 (via Vite)
- **Language:** TypeScript
- **State Management:** Zustand (Global State) & React Query
- **Styling:** Tailwind CSS + Framer Motion (for fluid micro-animations and transitions)
- **Routing:** React Router v7
- **Forms & Validation:** React Hook Form + Zod
- **Real-Time Engine:** Socket.io-Client, WebRTC (Simple-Peer/Native)
- **Data Visualization:** Chart.js + react-chartjs-2

### Backend (Server-Side)
- **Core Environment:** Node.js + Express
- **Language:** TypeScript
- **Architecture Standard:** **Clean Architecture** (Domain, Application, Infrastructure, Presentation layers)
- **Dependency Injection:** InversifyJS
- **Database:** MongoDB (via Mongoose)
- **Caching & Pub/Sub:** Redis
- **Real-Time Engine:** Socket.io
- **AI & LLM Integration:** Google Generative AI + LangChain + Qdrant (RAG architecture)
- **File Uploads & Storage:** AWS S3 (via Multer)
- **Payment Processing:** Stripe API
- **Background Jobs:** Node-Cron (for session state management and reminders)
- **Authentication:** JWT, Google OAuth, bcryptjs

---

## 🏗️ Clean Architecture Implementation

reNove’s backend is strictly decoupled to ensure maintainability and testability:
1. **Domain Layer:** Contains core business entities (e.g., `User`, `Booking`, `Therapist`) and abstract repository interfaces. Zero external dependencies.
2. **Application Layer:** Houses the Use Cases (business logic) combining entities and repositories.
3. **Infrastructure Layer:** Implements database connections (Mongoose schemas, Redis), external API services (Stripe, AWS, AI), and the Dependency Injection container setup.
4. **Presentation Layer:** Express Controllers handling HTTP requests, mapping DTOs, and managing API responses.

The frontend is similarly structured by **Features** (`src/features/...`), grouping components, hooks, and pages by their domain (e.g., `auth`, `booking`, `level`), promoting maximum reusability and isolated testing.

---

## 🚀 Getting Started (Local Development)

### Prerequisites
- Node.js (v18 or higher)
- MongoDB Server (Local or Atlas)
- Redis Server
- Qdrant Vector Database (Docker/Cloud)
- External API Keys: Stripe, AWS S3, Google Generative AI (Gemini), Google OAuth

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Renove
```

*(Note: The project is split into two separate repositories: `renove-backend` and `renove-frontend`)*

### 2. Setup the Backend
```bash
cd backend
npm install
cp .env.example .env
# Populate .env with MongoDB URI, Redis URL, JWT Secrets, AWS Keys, Stripe Keys, Gemini API Key, etc.
npm run dev
```
The backend server will start at `http://localhost:5000` (or as defined in your `.env`).

### 3. Setup the Frontend
```bash
cd frontend
npm install
cp .env.example .env
# Populate .env with VITE_API_URL, VITE_SOCKET_URL, VITE_GOOGLE_CLIENT_ID, etc.
npm run dev
```
The frontend application will run on `http://localhost:5173`.

---

## 🛡️ Security & Best Practices
- **Role-Based Access Control (RBAC):** Distinct protected routes and JWT scopes for Users, Therapists, and Admins.
- **Data Sanitization:** Strict request validation using Zod on the frontend and custom validation middlewares on the backend.
- **Secure Payments:** No sensitive card data touches the server; all transactions are vaulted through Stripe Elements.
- **Automated Code Formatting:** Enforced standard JS/TS linting and commitlint for conventional commits.

---

<div align="center">
  <i>Built to support, empower, and heal. Welcome to reNove.</i>
</div>
