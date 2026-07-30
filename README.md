<div align="center">
  <img src="https://via.placeholder.com/150x150.png?text=reNove+Logo" alt="reNove Logo" width="150" />
  <h1>reNove</h1>
  <p><em>An AI-Native, Personalized Addiction Recovery Platform</em></p>
  
  [![React](https://img.shields.io/badge/React-19-blue.svg)](https://reactjs.org/)
  [![Node.js](https://img.shields.io/badge/Node.js-Express-green.svg)](https://nodejs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
  [![Clean Architecture](https://img.shields.io/badge/Architecture-Clean-orange.svg)]()
</div>

<hr />

## 🚀 Overview

**reNove** is a full-stack, enterprise-grade healthcare platform designed to modernize the addiction recovery journey. By intersecting advanced Artificial Intelligence with certified human therapy, reNove solves a critical flaw in traditional recovery programs: the "one-size-fits-all" approach. 

Built with **TypeScript, React 19, and Node.js** utilizing strict **Clean Architecture**, this platform features real-time WebRTC telehealth, sophisticated generative AI prompt engineering via LangChain, and seamless financial operations through Stripe.

---

## 🧠 Core Innovation: AI-Driven Journey Generation

Unlike conventional platforms that provide static, linear curricula for all patients, reNove leverages generative AI to construct dynamic, highly personalized recovery pipelines. 

Upon onboarding, a proprietary algorithm ingests the user's specific addiction profile, clinical severity metrics, and personal hobbies. This data is fed into a **Retrieval-Augmented Generation (RAG)** system powered by **Google Generative AI**, **LangChain**, and **Qdrant (Vector DB)** to instantaneously architect a tailored sequence of "Recovery Levels." 

Every generated level encompasses:
- **Contextual Objectives:** Daily actionable tasks aligned with the user’s exact psychological state.
- **Interest-Based Integration:** Cognitive behavioral techniques woven into topics the user genuinely cares about, drastically increasing long-term engagement and retention.
- **Adaptive Milestones:** Real-time recalibration of the user's progression based on journal sentiment and milestone completions.

---

## ✨ Platform Features by Role

### 👤 Patient Portal
- **Algorithmic Therapist Matching:** Browse a curated directory of verified practitioners with intelligent slot-locking logic to prevent double-booking.
- **WebRTC Telehealth:** Native, secure, low-latency 1-on-1 video consultations integrated directly into the browser.
- **24/7 AI Companion:** A conversational agent utilizing context-aware vector search to provide immediate, tailored coping strategies during moments of distress.
- **Comprehensive Progression Dashboard:** Beautiful, interactive metrics (via Chart.js) visualizing journal consistency, goal attainment, and leveling progress.
- **Frictionless Payments:** Integrated Stripe vaulting for automated wallet top-ups and immediate session reservations.

### 🩺 Therapist Console
- **Clinical Dashboard:** Access to patient progression data, AI-generated level insights, and journal entries prior to appointments, enabling highly informed clinical sessions.
- **Real-Time Schedule Syncing:** Granular control over availability windows and automated session state management (Scheduled → Active → Completed).
- **Integrated Financials:** A dedicated provider wallet to monitor gross earnings, granular session revenue, and automated bank payouts.
- **Secure Asynchronous Chat:** Socket.io-powered real-time messaging for continuous patient support and accountability.

### 🛡️ Administrative Command Center
- **Verification & Moderation Engine:** Centralized oversight for validating therapist credentials (KYC/KYB) and handling platform dispute tickets.
- **Financial Telemetry:** Paginated, data-rich tables tracking platform-wide transactions, provider commissions, and revenue analytics.
- **User Management Pipeline:** Granular RBAC (Role-Based Access Control) to suspend, verify, or escalate user and therapist accounts.

---

## 🏗️ Architecture & Engineering Standards

reNove is engineered for scalability, maintainability, and strict separation of concerns, heavily prioritizing developer experience and system robustability.

### Backend Systems (Node.js / Express / MongoDB)
- **Strict Clean Architecture:** The codebase is rigorously divided into Domain, Application, Infrastructure, and Presentation layers, ensuring zero coupling between core business logic and external frameworks.
- **Dependency Injection:** Utilizes **InversifyJS** to manage service instantiation, drastically increasing modularity and unit-testability.
- **Event-Driven Real-Time Engine:** **Socket.io** coupled with **Redis Pub/Sub** powers instant notifications, chat, and availability state changes across distributed clients.
- **Scheduled Workers:** **Node-Cron** manages automated session status updates and transactional email reminders without blocking the main thread.

### Frontend Systems (React 19 / Vite)
- **Feature-Sliced Design:** The repository is structured by domain boundaries (`src/features/...`), grouping related components, hooks, and localized state together.
- **Optimized State & Caching:** Heavy lifting is managed by **Zustand** for global client state and abstracted custom hooks for asynchronous server interactions.
- **Fluid UI/UX:** Built with **Tailwind CSS** and **Framer Motion**, delivering a highly polished, responsive, and micro-animated experience that feels native.
- **Type Safety:** 100% TypeScript coverage with **Zod** schema validation enforcing strict runtime data contracts between the client and server.

---

## 🚦 Local Development

### Prerequisites
- Node.js (v18+)
- MongoDB (Local/Atlas) & Redis
- Qdrant Vector Database
- API Keys: Stripe, AWS S3, Google Gemini, Google OAuth

### Installation

1. **Clone the Repositories** (Backend & Frontend are maintained independently):
   ```bash
   git clone <backend-repo-url> renove-backend
   git clone <frontend-repo-url> renove-frontend
   ```

2. **Initialize Backend** (`localhost:5000`):
   ```bash
   cd renove-backend
   npm install
   cp .env.example .env # Configure environment variables
   npm run dev
   ```

3. **Initialize Frontend** (`localhost:5173`):
   ```bash
   cd renove-frontend
   npm install
   cp .env.example .env # Configure environment variables
   npm run dev
   ```

---

<div align="center">
  <i>Engineering modern solutions for human recovery.</i>
</div>
