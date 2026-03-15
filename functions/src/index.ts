import * as admin from "firebase-admin";
import { onSchedule } from "firebase-functions/v2/scheduler";

// Initialize Firebase Admin SDK
admin.initializeApp();

// ─── API Endpoints ───────────────────────────────────────────
export { createFile } from "./api/createFile";
export { scanFile } from "./api/scanFile";
export { getFileTimeline } from "./api/timeline";
export { dashboardStats } from "./api/stats";
export { getOfficerFiles } from "./api/officerFiles";
export { searchFiles } from "./api/searchFiles";
export { getOfficerDashboard } from "./api/officerDashboard";
export { forwardFile, getOfficerRoster } from "./api/forwardFile";

// ─── Scheduled Functions ─────────────────────────────────────

/**
 * SLA Checker — runs every 5 minutes.
 * Only queries near-expiry files (deadline <= now + 10 min) for scalability.
 */
import { checkSlaBreaches } from "./services/slaService";

export const slaChecker = onSchedule(
  {
    schedule: "every 5 minutes",
    region: "asia-south1",
    timeoutSeconds: 120,
  },
  async () => {
    const result = await checkSlaBreaches();
    console.log(
      `SLA Check complete: ${result.breached} breached, ${result.warned} warned`
    );
  }
);

/**
 * Blockchain Anchor — runs every hour.
 * Batches unanchored audit logs, computes Merkle root,
 * and stores hash on Polygon testnet.
 */
import { anchorAuditLogs } from "./services/blockchainService";

export const blockchainAnchor = onSchedule(
  {
    schedule: "every 60 minutes",
    region: "asia-south1",
    timeoutSeconds: 300,
  },
  async () => {
    const result = await anchorAuditLogs(100);
    if (result.anchored) {
      console.log(
        `Blockchain anchor complete: batch ${result.batchId}, tx ${result.txHash}, ${result.logsProcessed} logs`
      );
    } else {
      console.log("Blockchain anchor skipped: no unanchored logs or config missing.");
    }
  }
);
