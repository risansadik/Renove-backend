<div align="center">
  <img src="https://via.placeholder.com/150x150.png?text=reNove+Logo" alt="reNove Logo" width="150" />
  <h1>reNove - AI-Powered Addiction Recovery Platform</h1>
  <p><em>Empowering recovery through AI companionship, certified therapy, and robust progress tracking.</em></p>
  
  [![React](https://img.shields.io/badge/React-19-blue.svg)](https://reactjs.org/)
  [![Node.js](https://img.shields.io/badge/Node.js-Express-green.svg)](https://nodejs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
</div>

<hr />

## 🌟 Overview

**reNove** is a comprehensive, full-stack application built to support individuals on their addiction recovery journey. By seamlessly blending cutting-edge Artificial Intelligence with professional human care, reNove offers a holistic, secure, and intuitive platform for patients, therapists, and administrators. 

From interactive AI companions and WebRTC-based video therapy sessions to detailed progress tracking and automated wallets, the application is engineered with modern tech stacks, ensuring scale, security, and exceptional user experience.

---

## 🎯 Key Features by Role

### 👤 User (Patient) Experience
- **AI-Powered Recovery Companion:** 24/7 conversational support built with **Google Generative AI**, **LangChain**, and **Qdrant** (Vector Database for RAG). It offers contextual, personalized guidance and coping strategies.
- **Therapist Discovery & Booking:** Browse a curated directory of verified therapists, view transparent ratings/reviews, and book sessions via an intelligent slot-locking mechanism.
- **WebRTC Video Sessions:** Secure, high-quality, real-time 1-on-1 video consultations right in the browser.
- **Interactive Progress & Journey Tracking:** Monitor daily progress, complete journals, track goals, and advance through "Levels" in your recovery journey, visualized beautifully with Chart.js.
- **Real-Time Chat & Notifications:** Real-time messaging with therapists and instant socket.io notifications for booking approvals, reminders, and alerts.
- **Wallet & Secure Payments:** Integrated Stripe payment gateway for seamless session payments and wallet top-ups.
- **Issue Reporting:** Integrated ticketing system to report platform or user issues.

### 🩺 Therapist Experience
- **Dynamic Availability Management:** Granular control over working hours and scheduling, with real-time syncing.
- **Session & Patient Management:** Review patient progress, notes, and journals *before* the session. Conduct seamless video calls and automatically update session states.
- **Financial Dashboard:** A dedicated wallet to track total earnings, session-by-session revenue, and manage automated Stripe payouts.
- **Direct Patient Messaging:** Secure real-time chat for follow-ups and support between scheduled sessions.
- **Profile Customization:** Build a compelling public profile with specializations, experience, and verified credentials.

### 🛡️ Administrator Experience
- **Centralized Command Center:** A bird’s eye view of platform metrics—user growth, active sessions, and revenue statistics.
- **Verification Pipeline:** Review, approve, or reject new therapist applications based on uploaded credentials and background checks.
- **Moderation & Reports Engine:** Handle user/therapist disputes, review flagged content, and maintain platform integrity through the Reports dashboard.
- **Financial Oversight:** Monitor platform-wide transactions, therapist payouts, and platform commissions with paginated data tables.

---

## 🛠️ Technology Stack & Architecture

### Frontend (Client-Side)
- **Core Framework:** React 19 (via Vite)
- **Language:** TypeScript
- **State Management:** Zustand (Global State) & React Query
- **Styling:** Tailwind CSS + Framer Motion (for fluid micro-animations and transitions)
- **Routing:** React Router v7
- **Forms & Validation:** React Hook Form + Zod
- **Real-Time:** Socket.io-Client, WebRTC (Simple-Peer/Native)
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

The frontend is similarly structured by **Features** (`src/features/...`), grouping components, hooks, and pages by their domain (e.g., `auth`, `booking`, `dashboard`), promoting maximum reusability and isolated testing.

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
