import * as admin from "firebase-admin";
import { onRequest } from "firebase-functions/v2/https";
import { resolveUser } from "../utils/resolveUser";

const db = admin.firestore();

export const getOfficerDashboard = onRequest(
  { cors: true, region: "asia-south1" },
  async (req, res) => {
    if (req.method !== "GET") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }

    const identity = await resolveUser(req);
    if (!identity) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    try {
      const officerId = identity.uid;

      // ── 1. My Files (assigned to officer) ──────────────────────
      const myFilesSnap = await db
        .collection("files")
        .where("currentHolder", "==", officerId)
        .orderBy("createdAt", "desc")
        .get();

      const myFileIds = myFilesSnap.docs.map((d) => d.id);

      // Fetch movements for my files
      const myMovements: Record<string, any[]> = {};
      if (myFileIds.length > 0) {
        // Firestore 'in' queries support max 30 items
        const batchIds = myFileIds.slice(0, 30);
        const movSnap = await db
          .collection("file_movements")
          .where("fileId", "in", batchIds)
          .orderBy("timestamp", "desc")
          .get();
        for (const doc of movSnap.docs) {
          const d = doc.data();
          const fid = d.fileId as string;
          if (!myMovements[fid]) myMovements[fid] = [];
          myMovements[fid].push({
            id: doc.id,
            action: d.action,
            fromUser: d.fromUser || "",
            toUser: d.toUser || "",
            timestamp: normalizeDate(d.timestamp),
            notes: d.notes || "",
          });
        }
      }

      const myFiles = myFilesSnap.docs.map((doc) => {
        const d = doc.data();
        return {
          id: doc.id,
          fileId: doc.id,
          citizenName: d.citizenName || "",
          subject: d.title || "",
          category: d.category || "",
          department: d.department || "",
          status: d.status || "PENDING_REVIEW",
          createdDate: normalizeDate(d.createdAt),
          currentOfficerId: d.currentHolder || "",
          lastActionBy: d.createdBy || "",
          lastActionDate: normalizeDate(d.createdAt),
          lastActionType: "FORWARDED",
          workflowStage: d.workflowStage || "Officer Review",
          slaDays: d.slaDays || 7,
          isDelayed: d.isDelayed || false,
          escalationLevel: d.escalationLevel || 0,
          qrSerial: d.qrSerial || "",
          priority: d.priority || "MEDIUM",
          movementHistory: (myMovements[doc.id] || []).map((m: any) => ({
            ...m,
            fromOfficerName: m.fromUser,
            toOfficerName: m.toUser,
            fromOfficerId: m.fromUser,
            toOfficerId: m.toUser,
          })),
        };
      });

      // ── 2. Escalated Files ─────────────────────────────────────
      const escalatedSnap = await db
        .collection("files")
        .where("escalationLevel", ">", 0)
        .orderBy("escalationLevel", "desc")
        .limit(50)
        .get();

      const escalatedFiles = escalatedSnap.docs.map((doc) => {
        const d = doc.data();
        return {
          id: doc.id,
          fileId: doc.id,
          citizenName: d.citizenName || "",
          subject: d.title || "",
          category: d.category || "",
          department: d.department || "",
          status: d.status || "ESCALATED",
          createdDate: normalizeDate(d.createdAt),
          currentOfficerId: d.currentHolder || "",
          lastActionBy: d.createdBy || "",
          lastActionDate: normalizeDate(d.createdAt),
          lastActionType: "ESCALATED",
          workflowStage: d.workflowStage || "",
          slaDays: d.slaDays || 7,
          isDelayed: d.isDelayed || false,
          escalationLevel: d.escalationLevel || 0,
          movementHistory: [],
        };
      });

      // ── 3. Decision Files (APPROVED / REJECTED by officer) ─────
      const approvedSnap = await db
        .collection("audit_logs")
        .where("actorId", "==", officerId)
        .where("action", "in", ["APPROVED", "REJECTED"])
        .orderBy("timestamp", "desc")
        .limit(50)
        .get();

      // Get the file details for each decision
      const decisionFileIds = [
        ...new Set(approvedSnap.docs.map((d) => d.data().fileId as string)),
      ];
      const decisionFileMap: Record<string, any> = {};
      for (const fid of decisionFileIds.slice(0, 30)) {
        const fdoc = await db.collection("files").doc(fid).get();
        if (fdoc.exists) {
          decisionFileMap[fid] = fdoc.data();
        }
      }

      const decisionFiles = approvedSnap.docs.map((doc) => {
        const d = doc.data();
        const fileData = decisionFileMap[d.fileId] || {};
        return {
          id: doc.id,
          fileId: d.fileId,
          citizenName: fileData.citizenName || "",
          subject: fileData.title || "",
          category: fileData.category || "",
          department: fileData.department || "",
          status: d.action,
          createdDate: normalizeDate(fileData.createdAt),
          decisionTimestamp: normalizeDate(d.timestamp),
          lastActionBy: "You",
          lastActionDate: normalizeDate(d.timestamp),
          lastActionType: d.action,
          workflowStage: fileData.workflowStage || "",
          slaDays: fileData.slaDays || 7,
          isDelayed: fileData.isDelayed || false,
          escalationLevel: fileData.escalationLevel || 0,
          movementHistory: [],
          notes: d.details || "",
        };
      });

      // ── 4. QR / Transfer Logs ──────────────────────────────────
      const qrLogsSnap = await db
        .collection("file_movements")
        .orderBy("timestamp", "desc")
        .limit(50)
        .get();

      const qrLogs = qrLogsSnap.docs.map((doc) => {
        const d = doc.data();
        const action = (d.action || "RECEIVE") as string;
        let scanType = "RECEIVE";
        if (action === "FORWARDED" || action === "QR_TRANSFER") scanType = "FORWARD";
        else if (action === "VERIFIED") scanType = "VERIFY";

        return {
          id: doc.id,
          fileId: d.fileId || "",
          scanType,
          timestamp: normalizeDate(d.timestamp),
          scannedBy: d.fromUser || officerId,
          status: "SUCCESS",
          details: d.notes || "",
          // For audit trail expansion
          fromUser: d.fromUser || "",
          toUser: d.toUser || "",
          action: d.action || "",
        };
      });

      // ── 5. Stats ───────────────────────────────────────────────
      // Total files handled
      const allMovementsCount = await db
        .collection("file_movements")
        .where("fromUser", "==", officerId)
        .count()
        .get();
      const toMovementsCount = await db
        .collection("file_movements")
        .where("toUser", "==", officerId)
        .count()
        .get();
      const totalHandled =
        allMovementsCount.data().count + toMovementsCount.data().count;

      // SLA compliance
      const slaSnap = await db.collection("sla_tracking").get();
      const totalSla = slaSnap.size;
      const breachedSla = slaSnap.docs.filter(
        (d) => d.data().slaStatus === "breached"
      ).length;
      const slaCompliance =
        totalSla > 0 ? Math.round(((totalSla - breachedSla) / totalSla) * 100) : 100;

      const stats = {
        totalFilesAssigned: myFiles.length,
        totalHandled,
        slaCompliance,
        avgProcessingDays: myFiles.length > 0 ? 
          Math.round(myFiles.reduce((sum, f) => {
            const created = f.createdDate ? new Date(f.createdDate) : new Date();
            const days = (Date.now() - created.getTime()) / (1000 * 60 * 60 * 24);
            return sum + days;
          }, 0) / myFiles.length * 10) / 10
          : 0,
        slaBreaches: breachedSla,
        escalatedCount: escalatedFiles.length,
        approvedCount: decisionFiles.filter((f) => f.status === "APPROVED").length,
        rejectedCount: decisionFiles.filter((f) => f.status === "REJECTED").length,
        totalDecisions: decisionFiles.length,
      };

      res.status(200).json({
        myFiles,
        escalatedFiles,
        decisionFiles,
        qrLogs,
        stats,
      });
    } catch (error) {
      console.error("Error fetching officer dashboard:", error);
      res.status(500).json({ error: "Internal server error." });
    }
  }
);

function normalizeDate(val: any): string | null {
  if (!val) return null;
  if (typeof val === "string") return val;
  if (val.toDate) return val.toDate().toISOString();
  return null;
}
