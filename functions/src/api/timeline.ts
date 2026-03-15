import * as admin from "firebase-admin";
import { onRequest } from "firebase-functions/v2/https";

const db = admin.firestore();

/**
 * GET /fileTimeline/{fileId}
 *
 * Returns the complete timeline for a file:
 * - File metadata
 * - All movements (chronological)
 * - All audit logs (chronological)
 * - Current holder info
 * - SLA status
 */
export const getFileTimeline = onRequest(
  { cors: true, region: "asia-south1" },
  async (req, res) => {
    if (req.method !== "GET") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }

    const isEmulator =
      process.env.FUNCTIONS_EMULATOR === "true" ||
      process.env.FUNCTIONS_EMULATOR === "1" ||
      process.env.FIREBASE_EMULATOR_HUB !== undefined;
    let decodedToken: any;

    if (isEmulator) {
      decodedToken = {
        uid: "test-user",
        role: "clerk",
      };
    } else {
      const authHeader = req.headers.authorization || "";
      const token = authHeader.startsWith("Bearer ")
        ? authHeader.slice(7)
        : undefined;

      if (!token) {
        res.status(401).json({ error: "Missing Authorization token" });
        return;
      }

      try {
        decodedToken = await admin.auth().verifyIdToken(token);
      } catch {
        res.status(401).json({ error: "Invalid or expired token." });
        return;
      }
    }

    // Extract fileId from path: /fileTimeline/PRM-2026-000001
    const pathParts = req.path.split("/").filter(Boolean);
    const fileId = pathParts[pathParts.length - 1];

    if (!fileId) {
      res.status(400).json({ error: "Missing fileId in path." });
      return;
    }

    try {
      // Fetch file
      const fileDoc = await db.collection("files").doc(fileId).get();
      if (!fileDoc.exists) {
        res.status(404).json({ error: `File ${fileId} not found.` });
        return;
      }

      // Fetch movements
      const movementsSnapshot = await db
        .collection("file_movements")
        .where("fileId", "==", fileId)
        .orderBy("timestamp", "asc")
        .get();

      const movements = movementsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Fetch audit logs
      const auditSnapshot = await db
        .collection("audit_logs")
        .where("fileId", "==", fileId)
        .orderBy("timestamp", "asc")
        .get();

      const auditLogs = auditSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Fetch SLA status
      const slaDoc = await db
        .collection("sla_tracking")
        .doc(fileId)
        .get();

      const sla = slaDoc.exists ? slaDoc.data() : null;

      res.status(200).json({
        file: { id: fileDoc.id, ...fileDoc.data() },
        movements,
        auditLogs,
        sla,
        totalMovements: movements.length,
        totalAuditEntries: auditLogs.length,
      });
    } catch (error) {
      console.error("Error fetching timeline:", error);
      res.status(500).json({ error: "Internal server error." });
    }
  }
);
