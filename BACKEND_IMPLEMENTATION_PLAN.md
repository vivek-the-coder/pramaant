# PRAMAANT — Backend Implementation Plan (Handoff Document)

> **Purpose**: This document captures everything that has been built, what works, what's broken, and what still needs to be done. Written for handoff to another AI agent or developer.

---

## 1. Project Overview

**PRAMAANT** is a government file tracking system with:
- **Frontend**: Already built (Vite + React + TypeScript, Tailwind CSS)
  - Clerk Dashboard + Officer Dashboard
  - Currently uses mock data from `src/data/mockFiles.ts`
- **Backend**: Firebase Cloud Functions (TypeScript) — **partially built, NOT yet deployed**

**Firebase Project**: `pramaant-govtrack` (created, linked in `.firebaserc`)
**Region**: `asia-south1`

---

## 2. What Has Been Built (Files That Exist)

### Firebase Config (Root Directory)

| File | Status | Purpose |
|---|---|---|
| `firebase.json` | ✅ Done | Functions + Firestore + Storage + Emulator config |
| `.firebaserc` | ✅ Done | Links to `pramaant-govtrack` project |
| `firestore.rules` | ✅ Done | Custom Claims based security rules (clerk/officer/admin) |
| `firestore.indexes.json` | ✅ Done | 7 composite indexes for common queries |
| `storage.rules` | ✅ Done | QR codes publicly readable, all writes via Admin SDK |

### Cloud Functions Backend (`functions/src/`)

```
functions/
├── package.json          ✅ Done (firebase-admin@13.7.0, firebase-functions@7.1.1, qrcode, ethers)
├── tsconfig.json         ✅ Done
├── test-core.js          ✅ Done (standalone test script — all 6 tests pass)
├── lib/                  ✅ Done (compiled JS output from tsc)
├── node_modules/         ✅ Done (installed)
└── src/
    ├── index.ts          ✅ Done
    ├── api/
    │   ├── createFile.ts  ✅ Done
    │   ├── scanFile.ts    ✅ Done
    │   ├── timeline.ts    ✅ Done
    │   └── stats.ts       ✅ Done
    ├── services/
    │   ├── auditService.ts        ✅ Done
    │   ├── slaService.ts          ✅ Done
    │   ├── notificationService.ts ✅ Done
    │   ├── fileNumberService.ts   ✅ Done
    │   └── blockchainService.ts   ✅ Done
    └── utils/
        ├── hash.ts        ✅ Done
        ├── merkle.ts      ✅ Done
        └── qr.ts          ✅ Done
```

### Smart Contract

| File | Status | Purpose |
|---|---|---|
| `contracts/FileAudit.sol` | ✅ Written | Minimal Polygon contract for audit hash anchoring |

### Build Status

| Check | Result |
|---|---|
| `functions/` TypeScript build (`npx tsc`) | ✅ Zero errors |
| `functions/` npm build (`npm run build`) | ✅ Clean |
| Firestore security rules validation | ✅ No errors |
| Frontend `npm run build` | ✅ Zero errors |
| Core logic unit tests (hash chain, merkle, SLA, file numbers) | ✅ All 6 pass |

---

## 3. What Has NOT Been Done (Remaining Work)

### 3.1 🔴 CRITICAL: Emulator Testing Not Completed

**Reason**: System has Java 8 installed. Firebase emulators require **JDK 21+**.

**What was attempted**:
- Firebase emulator JARs were downloaded (Firestore: 124MB, Storage: 53MB)
- Emulator config is in `firebase.json` (ports 5001, 8080, 9199, UI 4000)
- Start fails with: `firebase-tools no longer supports Java version ... JDK at version 21 or above`

**What needs to happen**:
1. Install JDK 21+ (e.g., `winget install Oracle.JDK.21` or download from adoptium.net)
2. Run: `firebase emulators:start --only functions,firestore,storage`
3. Test all 4 APIs with curl/Postman (see Section 5 for test commands)

### 3.2 🔴 CRITICAL: End-to-End API Testing Not Done

No API has been tested with actual Firestore calls. The code compiles but has never executed against a real or emulated database.

**Tests that must be run** (in order):

**Test 1 — createFile**:
```bash
curl -X POST http://localhost:5001/pramaant-govtrack/asia-south1/createFile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TEST_TOKEN>" \
  -d '{
    "title": "Land Registry Test",
    "department": "Revenue",
    "category": "Land Revenue",
    "citizenName": "Test User",
    "assignedTo": "OFFICER-001",
    "slaDays": 7
  }'
```

**Verify in Firestore Emulator UI (localhost:4000)**:
- `files/PRM-2026-000001` exists with `lastAuditHash` field
- `counters/files` has `currentNumber: 1`
- `file_movements/` has 1 entry
- `audit_logs/` has 1 entry with `previousHash: "GENESIS"`
- `sla_tracking/PRM-2026-000001` exists with `slaStatus: "active"`
- `notifications/` has 1 entry (FILE_ASSIGNED)
- QR PNG exists in Storage emulator

**Test 2 — scanFile**:
```bash
curl -X POST http://localhost:5001/pramaant-govtrack/asia-south1/scanFile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TEST_TOKEN>" \
  -d '{
    "fileId": "PRM-2026-000001",
    "action": "QR_TRANSFER",
    "notes": "Transferred to officer"
  }'
```

**Verify**:
- `files/PRM-2026-000001.currentHolder` changed
- `file_movements/` has 2 entries now
- `audit_logs/` has 2 entries, log2.previousHash == log1.currentHash
- `sla_tracking/` assignedTo updated
- New notification created

**Test 3 — getFileTimeline**:
```bash
curl http://localhost:5001/pramaant-govtrack/asia-south1/getFileTimeline/PRM-2026-000001 \
  -H "Authorization: Bearer <TEST_TOKEN>"
```

**Test 4 — dashboardStats**:
```bash
curl http://localhost:5001/pramaant-govtrack/asia-south1/dashboardStats \
  -H "Authorization: Bearer <TEST_TOKEN>"
```

### 3.3 🟡 Auth Token Problem for Testing

All APIs require `Authorization: Bearer <token>` and verify it with `admin.auth().verifyIdToken()`. In the emulator this will fail unless:

**Option A** (recommended): Use Firebase Auth emulator
- Add to `firebase.json` emulators section: `"auth": { "port": 9099 }`
- Create test users via the Auth emulator UI
- Get tokens from those test users

**Option B**: Temporarily bypass auth in dev mode
- Add this check at the top of each API:
```typescript
// Skip auth in emulator
if (process.env.FUNCTIONS_EMULATOR === "true") {
  // Use a mock decodedToken
  decodedToken = { uid: "test-user", role: "clerk" } as any;
}
```
- **REMEMBER TO REMOVE THIS BEFORE DEPLOYMENT**

### 3.4 🟡 Firebase Custom Claims Not Set Up

The security rules use `request.auth.token.role` (Custom Claims), but there is no code to actually SET these claims on users.

**What needs to be created**: A Cloud Function or admin script that sets custom claims:

```typescript
// Add to functions/src/api/ or as a standalone admin script
import * as admin from "firebase-admin";

export async function setUserRole(uid: string, role: "clerk" | "officer" | "admin") {
  await admin.auth().setCustomUserClaims(uid, { role });
}
```

This should be:
- Either a callable Cloud Function (protected, admin-only)
- Or a standalone script run locally with `firebase-admin` initialized with a service account

### 3.5 🟡 Deployment Not Done

Nothing has been deployed to Firebase yet. Commands needed (in order):

```bash
# Step 1: Deploy functions
firebase deploy --only functions

# Step 2: Deploy Firestore rules
firebase deploy --only firestore:rules

# Step 3: Deploy indexes
firebase deploy --only firestore:indexes

# Step 4: Deploy storage rules
firebase deploy --only storage
```

### 3.6 🟡 Blockchain Anchoring Not Wired

`blockchainService.ts` is written but requires 3 environment variables that are NOT set:

```
POLYGON_RPC_URL=         # e.g., https://rpc-amoy.polygon.technology
POLYGON_PRIVATE_KEY=     # Wallet private key for signing
CONTRACT_ADDRESS=        # Deployed FileAudit.sol contract address
```

**Remaining work**:
1. Deploy `contracts/FileAudit.sol` to Polygon Amoy testnet (use Remix IDE or Hardhat)
2. Get the deployed contract address
3. Set env vars: `firebase functions:config:set blockchain.rpc_url="..." blockchain.private_key="..." blockchain.contract_address="..."`
4. Update `blockchainService.ts` to read from `functions.config()` instead of `process.env`

**NOTE**: The scheduled function `blockchainAnchor` in `index.ts` runs every 60 minutes and silently skips if config is missing. This is safe — it won't crash.

### 3.7 🟡 Frontend Integration Not Started

The frontend still uses mock data from `src/data/mockFiles.ts`. No Firebase SDK is installed in the frontend.

**What needs to be done**:

1. Install Firebase SDK in the frontend:
```bash
npm install firebase
```

2. Create `src/services/firebase.ts`:
```typescript
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  // Get from Firebase Console → Project Settings → Your apps
  apiKey: "...",
  authDomain: "pramaant-govtrack.firebaseapp.com",
  projectId: "pramaant-govtrack",
  storageBucket: "pramaant-govtrack.firebasestorage.app",
  messagingSenderId: "932619890135",
  appId: "..."
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
```

3. Create `src/services/fileService.ts` — wrapper functions that:
   - Call Cloud Functions APIs (createFile, scanFile, etc.)
   - Set up Firestore realtime listeners for dashboard data
   - Replace `mockFiles` imports one screen at a time

4. **Start with Clerk "Create File" form** → then connect Officer Dashboard

### 3.8 🟢 Nice-to-Have: SLA Engine Wasn't Tested Live

The SLA logic passed unit tests but was never tested with the scheduler. After emulator works:

1. Create a file with very short SLA: `slaDays: 0.0007` (~1 minute)
2. Manually trigger the scheduled function, OR wait for the emulator scheduler
3. Verify: `sla_tracking.slaStatus` → `breached`, `files.isDelayed` → `true`, notification created

---

## 4. Architecture Summary

### Firestore Collections (8)

| Collection | Doc ID | Key Fields |
|---|---|---|
| `users/{userId}` | Firebase Auth UID | name, role, department, officeId |
| `files/{fileId}` | `PRM-2026-XXXXXX` | title, citizenName, currentHolder, status, **lastAuditHash**, qrSerial, slaDays |
| `file_movements/{auto}` | Auto-generated | fileId, fromUser, toUser, action, timestamp |
| `audit_logs/{auto}` | Auto-generated | fileId, action, performedBy, previousHash, currentHash, timestamp |
| `sla_tracking/{fileId}` | Same as file ID | assignedTo, startTime, deadline, slaStatus |
| `notifications/{auto}` | Auto-generated | userId, type, fileId, message, read, createdAt |
| `blockchain_anchors/{auto}` | Auto-generated | batchId, startLogId, endLogId, merkleRoot, txHash, network |
| `counters/files` | Fixed doc | currentNumber (atomic increment) |

### Key Architecture Decisions

1. **File IDs**: Counter-based (`PRM-2026-XXXXXX`) using `counters/files` with Firestore transactions — NOT auto-IDs
2. **Audit Hash Chain**: `lastAuditHash` stored on the file document for O(1) lookup — NOT querying last log
3. **SLA Engine**: Only queries `deadline <= now + 10 minutes` — NOT full collection scan
4. **Blockchain**: Batches audit logs → Merkle root → Polygon testnet — NOT every event on-chain
5. **Auth**: Firebase Custom Claims (`request.auth.token.role`) — NOT client-side role fields
6. **QR Codes**: Generated as PNG → uploaded to Firebase Storage → public URL returned

### API Endpoints (4 HTTP + 2 Scheduled)

| Function | Type | Trigger | File |
|---|---|---|---|
| `createFile` | HTTP POST | REST API | `api/createFile.ts` |
| `scanFile` | HTTP POST | REST API | `api/scanFile.ts` |
| `getFileTimeline` | HTTP GET | REST API | `api/timeline.ts` |
| `dashboardStats` | HTTP GET | REST API | `api/stats.ts` |
| `slaChecker` | Scheduled | Every 5 minutes | `index.ts` → `slaService.ts` |
| `blockchainAnchor` | Scheduled | Every 60 minutes | `index.ts` → `blockchainService.ts` |

### Security Model

```
Firestore Rules (firestore.rules):
- Uses request.auth.token.role (Custom Claims)
- audit_logs: append-only (no update/delete EVER)
- file_movements: append-only
- sla_tracking, counters, blockchain_anchors: Cloud Functions only
- notifications: users can only read their own + mark as read
```

### Write Operations Per API Call

| API | Writes | Details |
|---|---|---|
| `createFile` | 6 | file + counter + movement + audit_log + sla_tracking + notification |
| `scanFile` | 5 | file update + movement + audit_log + sla update + notification |

---

## 5. Known Issues and Gotchas

### Issue 1: Java Version Blocks Emulator
- **Problem**: System has Java 8, Firebase emulators need JDK 21+
- **Fix**: Install JDK 21+ → then `firebase emulators:start`

### Issue 2: Auth Will Fail in Emulator
- **Problem**: APIs verify Bearer tokens with `admin.auth().verifyIdToken()` which needs Auth emulator or a bypass
- **Fix**: Either add Auth emulator config OR add emulator bypass check (see Section 3.3)

### Issue 3: blockchainService.ts Uses process.env
- **Problem**: Firebase Functions v2 uses `process.env` directly, but the env vars need to be set
- **Fix**: Use `.env` file in `functions/` directory or `firebase functions:secrets:set`

### Issue 4: Storage Bucket May Need Manual Creation
- **Problem**: `qr.ts` calls `admin.storage().bucket()` which uses default bucket
- **Fix**: May need to enable Storage in Firebase Console first, OR pass explicit bucket name

### Issue 5: No Firebase Web App Registered Yet
- **Problem**: Frontend needs Firebase config (apiKey, appId etc.) but no web app has been registered
- **Fix**: Go to Firebase Console → Add app → Web → copy config to `src/services/firebase.ts`

---

## 6. Priority Order for Remaining Work

```
1️⃣  Install JDK 21+ and start emulators                    [BLOCKER]
2️⃣  Add Auth emulator OR bypass for testing                  [BLOCKER]
3️⃣  Test createFile API end-to-end                           [CRITICAL]
4️⃣  Test scanFile API end-to-end                             [CRITICAL]
5️⃣  Verify hash chain links (log2.prevHash == log1.currHash) [CRITICAL]
6️⃣  Test timeline and stats APIs                             [HIGH]
7️⃣  Create setUserRole function for Custom Claims            [HIGH]
8️⃣  Deploy to Firebase (functions → rules → indexes)         [HIGH]
9️⃣  Register web app + install Firebase SDK in frontend       [HIGH]
🔟  Create src/services/firebase.ts + fileService.ts          [HIGH]
1️⃣1️⃣ Connect Clerk "Create File" form to backend              [MEDIUM]
1️⃣2️⃣ Connect Officer Dashboard to Firestore listeners          [MEDIUM]
1️⃣3️⃣ Test SLA engine with short deadline                       [MEDIUM]
1️⃣4️⃣ Deploy FileAudit.sol to Polygon Amoy testnet              [LOW]
1️⃣5️⃣ Wire blockchain anchoring with env vars                   [LOW]
```

---

## 7. Quick Reference Commands

```bash
# Build functions
cd functions && npm run build

# Start emulators (needs JDK 21+)
firebase emulators:start --only functions,firestore,storage

# Deploy everything
firebase deploy

# Deploy only functions
firebase deploy --only functions

# Deploy only rules
firebase deploy --only firestore:rules

# View function logs
firebase functions:log

# Run core logic tests
cd functions && node test-core.js
```
