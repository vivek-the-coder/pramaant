# PRAMAANT — Government File Tracking System

> A role-based government file tracking and monitoring platform built with React, Firebase Cloud Functions, and Firestore.

## Architecture

| Layer | Tech | Deployment |
|-------|------|------------|
| Frontend | React + Vite + Tailwind CSS 4 | **Vercel** |
| Backend API | Firebase Cloud Functions (Node.js/TS) | **Firebase** |
| Database | Cloud Firestore | **Firebase** |
| Storage | Firebase Storage (QR codes) | **Firebase** |

## Users & Roles

| Name | User ID | Password | Role | Scope |
|------|---------|----------|------|-------|
| Vraj Padaria | `vraj138` | `vrajgov` | Clerk | Sisodara Ward-1 |
| Sachin Singh | `sachin128` | `sachingov` | Clerk | Tarsali Ward-3 |
| Manav Patel | `manav121` | `manavgov` | Officer | Land Records |
| Meet Barot | `meet110` | `meetgov` | Officer | Revenue |

## Local Development

### Prerequisites
- Node.js ≥ 18
- Firebase CLI (`npm i -g firebase-tools`)
- Java Runtime (for Firestore emulator)

### Setup
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd functions && npm install && cd ..

# Copy environment file
cp .env.example .env
```

### Run Locally
```bash
# Terminal 1 — Firebase emulators (backend + database)
npx firebase emulators:start

# Terminal 2 — Vite dev server (frontend)
npm run dev
```

Open [http://localhost:8888](http://localhost:8888)

## Production Build

```bash
npm run build
```

Output → `dist/` folder (deployed by Vercel automatically)

## Deploy

### Frontend → Vercel
1. Push to GitHub
2. Import repo in [vercel.com](https://vercel.com)
3. Set environment variable:
   ```
   VITE_API_BASE = https://asia-south1-pramaant-govtrack.cloudfunctions.net
   ```
4. Framework: **Vite**, Output: `dist`
5. Deploy ✓

### Backend → Firebase
```bash
cd functions && npm run build
firebase deploy --only functions
firebase deploy --only firestore:rules
firebase deploy --only storage
```

## Project Structure
```
pramaant/
├── src/                    # React frontend
│   ├── components/         # Reusable UI components
│   ├── contexts/           # AuthContext (role-based auth)
│   ├── pages/              # Dashboard, Login, Officer pages
│   ├── services/           # API service layer
│   └── types/              # TypeScript interfaces
├── functions/              # Firebase Cloud Functions
│   └── src/
│       ├── api/            # HTTP endpoints
│       ├── services/       # Audit, SLA, notification services
│       └── utils/          # QR generation, auth resolver
├── vercel.json             # Vercel SPA routing config
├── firebase.json           # Firebase emulator config
└── firestore.rules         # Firestore security rules
```

## Key Features
- 🔐 Role-based auth (clerk, officer, admin)
- 📄 File creation with auto-generated PRM-YYYY-XXXXXX numbering
- 📱 QR code binding for physical file tracking
- ➡️ File forwarding between clerks and officers
- 📊 Per-role dashboards with live data
- ⏱️ SLA tracking with breach detection
- 📋 Tamper-evident audit logs
- 🔔 Real-time notifications

## License
Private — Government of India
