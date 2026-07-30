# reNove - AI-Powered Addiction Recovery Platform

reNove is a comprehensive, full-stack application designed to support individuals on their addiction recovery journey. The platform connects users with licensed therapists, offers AI-powered assistance, and tracks recovery progress through an intuitive, real-time interface.

## 🚀 Features

### For Users (Patients)
- **AI-Powered Recovery Assistant:** 24/7 conversational support built with Google Generative AI, LangChain, and Qdrant vector database.
- **Therapist Matching & Booking:** Browse a verified directory of therapists, view verified ratings, and schedule sessions.
- **Real-Time Video Sessions:** Secure, high-quality 1-on-1 video consultations using WebRTC.
- **Progress Tracking:** Interactive dashboards and charts to monitor daily progress, milestones, and journaling.
- **Real-Time Notifications:** Instant updates on session approvals, upcoming calls, and secure messages (Socket.io).
- **Secure Payments:** Seamless payment processing via Stripe integration.

### For Therapists
- **Profile & Availability Management:** Control working hours and manage incoming booking requests.
- **Session Management:** Secure video calls with patients, embedded notes, and automated session states.
- **Wallet & Payouts:** Track earnings, view payment history, and manage Stripe payouts.
- **Patient Progress Insights:** Review patient-shared progress and journals to prepare for sessions.

### For Administrators
- **Comprehensive Dashboard:** Manage user accounts, verify therapist credentials, and oversee platform activity.
- **Content & Reports Management:** Review reported content, handle disputes, and maintain platform safety.

## 🛠 Tech Stack

### Frontend (User & Therapist Portals)
- **Framework:** React 19 + Vite
- **Styling:** Tailwind CSS + Framer Motion (Animations)
- **State Management:** Zustand
- **Forms & Validation:** React Hook Form + Zod
- **Real-Time Communication:** Socket.io-Client, WebRTC
- **Data Visualization:** Chart.js

### Backend (API & Signaling)
- **Core:** Node.js, Express, TypeScript
- **Architecture:** Clean Architecture + MVC (InversifyJS for Dependency Injection)
- **Database:** MongoDB (Mongoose)
- **Caching & Pub/Sub:** Redis
- **Real-Time Communication:** Socket.io
- **AI Engine:** Google Generative AI, LangChain, Qdrant (Vector DB)
- **File Storage:** AWS S3 (via Multer)
- **Payments:** Stripe API
- **Background Jobs:** Node-Cron

## 📂 Project Structure

```
reNove/
├── backend/               # Node.js Express Backend
│   ├── src/
│   │   ├── application/   # Use cases and domain logic
│   │   ├── domain/        # Entities and interfaces
│   │   ├── infrastructure/# Database, external services, Inversify setup
│   │   ├── presentation/  # Controllers and API routes
│   │   └── server.ts      # App entry point
│   └── package.json
├── frontend/              # React Vite Frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── hooks/         # Custom React hooks containing business logic
│   │   ├── pages/         # Page components mapped to routes
│   │   ├── types/         # TypeScript type definitions
│   │   └── utils/         # Helper functions
│   └── package.json
└── README.md
```

## 🏁 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas)
- Redis Server
- Qdrant Vector DB (Docker/Cloud)
- Accounts/API Keys for: Stripe, AWS S3, Google Generative AI

### Installation

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd Renove
   ```

2. **Setup Backend:**
   ```bash
   cd backend
   npm install
   cp .env.example .env # Fill in your environment variables
   npm run dev
   ```

3. **Setup Frontend:**
   ```bash
   cd ../frontend
   npm install
   cp .env.example .env # Fill in your environment variables
   npm run dev
   ```

## 🏗 Architecture Notes
- The backend strictly follows **Clean Architecture** patterns, ensuring a decoupling of the domain logic from external frameworks (Express/Mongoose). **InversifyJS** is utilized for robust constructor-based Dependency Injection across Controllers, Use Cases, and Repositories.
- The frontend adheres to a feature-driven structure, prioritizing separation of concerns by lifting side effects and state management into custom `hooks/`.

## 📜 License
This project is licensed under the MIT License.
