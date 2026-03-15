import * as admin from "firebase-admin";
import { onRequest } from "firebase-functions/v2/https";
import { createAuditLog } from "../services/auditService";
import { createNotification } from "../services/notificationService";
import { resolveUser } from "../utils/resolveUser";

const db = admin.firestore();

/**
 * POST /forwardFile
 * Body: { fileId, toOfficerId, toOfficerName, department, remarks }
 */
export const forwardFile = onRequest(
  { cors: true, region: "asia-south1" },
  async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }

    const identity = await resolveUser(req);
    if (!identity) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { fileId, toOfficerId, toOfficerName, department, remarks } =
      req.body;

    if (!fileId || !toOfficerId) {
      res.status(400).json({
        error: "Missing required fields: fileId, toOfficerId",
      });
      return;
    }

    try {
      const fileRef = db.collection("files").doc(fileId);
      const fileDoc = await fileRef.get();

      if (!fileDoc.exists) {
        res.status(404).json({ error: `File ${fileId} not found.` });
        return;
      }

      const fileData = fileDoc.data()!;
      const previousHolder = fileData.currentHolder || identity.uid;
      const now = new Date().toISOString();

      // 1. Update file document
      await fileRef.update({
        currentHolder: toOfficerId,
        status: "PENDING_REVIEW",
        workflowStage: `${toOfficerName || toOfficerId} Review`,
        department: department || fileData.department,
        forwardedAt: now,
        forwardedBy: identity.uid,
      });

      // 2. Create movement record
      const movementRef = db.collection("file_movements").doc();
      await movementRef.set({
        fileId,
        fromUser: previousHolder,
        toUser: toOfficerId,
        action: "FORWARDED",
        notes:
          remarks ||
          `File forwarded to ${toOfficerName || toOfficerId} (${department || "N/A"})`,
        timestamp: now,
      });

      // 3. Create audit log
      await createAuditLog(fileId, "FORWARDED", identity.uid);

      // 4. Notify target officer
      await createNotification({
        userId: toOfficerId,
        type: "FILE_FORWARDED",
        fileId,
        message: `File ${fileId} has been forwarded to you by ${identity.uid}`,
      });

      res.status(200).json({
        success: true,
        fileId,
        forwardedTo: toOfficerId,
        message: `File ${fileId} forwarded to ${toOfficerName || toOfficerId} successfully.`,
      });
    } catch (error) {
      console.error("Error forwarding file:", error);
      res.status(500).json({ error: "Internal server error." });
    }
  }
);

/**
 * GET /getOfficerRoster
 *
 * Returns officers grouped by department.
 * Officer IDs match the AuthContext user IDs for proper routing.
 */
export const getOfficerRoster = onRequest(
  { cors: true, region: "asia-south1" },
  async (req, res) => {
    if (req.method !== "GET") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }

    const roster = [
      {
        department: "REVENUE",
        departmentName: "Revenue Department",
        officers: [
          {
            id: "meet110",
            name: "Meet Barot",
            designation: "Revenue Officer",
          },
        ],
      },
      {
        department: "LAND_RECORDS",
        departmentName: "Land Records (E-Dhara)",
        officers: [
          {
            id: "manav121",
            name: "Manav Patel",
            designation: "Land Records Officer",
          },
        ],
      },
      {
        department: "MAMLATDAR",
        departmentName: "Mamlatdar Office",
        officers: [
          {
            id: "MAMLATDAR-OFFICER-1",
            name: "Shri A.J. Parmar",
            designation: "Mamlatdar",
          },
        ],
      },
      {
        department: "TDO",
        departmentName: "Taluka Development Officer",
        officers: [
          {
            id: "TDO-OFFICER-1",
            name: "Shri H.D. Chauhan",
            designation: "Taluka Development Officer",
          },
        ],
      },
    ];

    res.status(200).json({ roster });
  }
);
