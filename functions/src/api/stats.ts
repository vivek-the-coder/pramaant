import * as admin from "firebase-admin";
import { onRequest } from "firebase-functions/v2/https";
import { resolveUser } from "../utils/resolveUser";

const db = admin.firestore();

export const dashboardStats = onRequest(
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
      const userId = identity.uid;

      // ── Files created by this clerk ─────────────────────────
      const myCreatedFilesSnapshot = await db
        .collection("files")
        .where("createdBy", "==", userId)
        .orderBy("createdAt", "desc")
        .limit(50)
        .get();

      const myCreatedFiles = myCreatedFilesSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt
            ? (typeof data.createdAt === "string"
                ? data.createdAt
                : data.createdAt.toDate().toISOString())
            : null,
        };
      });

      // Status breakdown (only my files)
      const statusCounts: Record<string, number> = {};
      for (const file of myCreatedFiles) {
        const status = (file as Record<string, unknown>).status as string;
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      }

      // Department breakdown (only my files)
      const departmentCounts: Record<string, number> = {};
      for (const file of myCreatedFiles) {
        const dept = (file as Record<string, unknown>).department as string;
        departmentCounts[dept] = (departmentCounts[dept] || 0) + 1;
      }

      // How many of my files have been forwarded (dispatched)
      const dispatched = myCreatedFiles.filter(
        (f: any) => !!f.forwardedAt
      ).length;

      // SLA breaches (global)
      const slaBreachSnapshot = await db
        .collection("sla_tracking")
        .where("slaStatus", "==", "breached")
        .count()
        .get();
      const totalBreaches = slaBreachSnapshot.data().count;

      // SLA warnings (global)
      const slaWarningSnapshot = await db
        .collection("sla_tracking")
        .where("slaStatus", "==", "warning")
        .count()
        .get();
      const totalWarnings = slaWarningSnapshot.data().count;

      // Recent movements by this clerk (last 10)
      const recentMovementsSnapshot = await db
        .collection("file_movements")
        .where("fromUser", "==", userId)
        .orderBy("timestamp", "desc")
        .limit(10)
        .get();

      const recentActivity = recentMovementsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Unread notifications
      const unreadSnapshot = await db
        .collection("notifications")
        .where("userId", "==", userId)
        .where("read", "==", false)
        .count()
        .get();
      const unreadNotifications = unreadSnapshot.data().count;

      res.status(200).json({
        totalFiles: myCreatedFiles.length,
        myFilesCount: myCreatedFiles.length,
        pendingReview: statusCounts["PENDING_REVIEW"] || 0,
        escalated: statusCounts["ESCALATED"] || 0,
        approved: dispatched,
        rejected: statusCounts["REJECTED"] || 0,
        queryRaised: statusCounts["QUERY_RAISED"] || 0,
        slaBreaches: totalBreaches,
        slaWarnings: totalWarnings,
        departmentBreakdown: departmentCounts,
        recentActivity,
        recentFiles: myCreatedFiles,
        unreadNotifications,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ error: "Internal server error." });
    }
  }
);
