import * as admin from "firebase-admin";
import { onRequest } from "firebase-functions/v2/https";
import { generateFileNumber } from "../services/fileNumberService";
import { createAuditLog } from "../services/auditService";
import { createSlaEntry } from "../services/slaService";
import { createNotification } from "../services/notificationService";
import { generateAndStoreQR } from "../utils/qr";
import { resolveUser } from "../utils/resolveUser";

const db = admin.firestore();

export const createFile = onRequest(
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

    // Verify role
    const role = identity.role;
    if (!role || !["clerk", "officer", "admin"].includes(role)) {
      res.status(403).json({ error: "Insufficient permissions." });
      return;
    }

    const {
      title,
      department,
      category,
      citizenName,
      assignedTo,
      slaDays = 7,
      priority = "MEDIUM",
      officeId,
    } = req.body;

    if (!title || !department || !category || !citizenName || !assignedTo) {
      res.status(400).json({
        error:
          "Missing required fields: title, department, category, citizenName, assignedTo",
      });
      return;
    }

    try {
      // Step 1: Generate human-readable file number
      const fileId = await generateFileNumber();

      // Step 2: Create file document
      const fileRef = db.collection("files").doc(fileId);
      const now = new Date().toISOString();
      const fileData = {
        title,
        department,
        category,
        citizenName,
        citizenNameUpper: citizenName.toUpperCase(),
        createdBy: identity.uid,
        currentHolder: assignedTo,
        status: "PENDING_REVIEW",
        priority,
        slaDays,
        officeId: officeId || null,
        qrSerial: null, // Will be set after QR generation
        lastAuditHash: "GENESIS",
        createdAt: now,
        isDelayed: false,
        escalationLevel: 0,
        workflowStage: "Clerk Verification",
      };
      await fileRef.set(fileData);

      // Step 3: Generate QR code → store in Firebase Storage
      const qrUrl = await generateAndStoreQR(fileId);
      await fileRef.update({ qrSerial: fileId, qrUrl });

      // Step 4: Create initial movement record
      const movementRef = db.collection("file_movements").doc();
      await movementRef.set({
        fileId,
        fromUser: identity.uid,
        toUser: assignedTo,
        action: "CREATED",
        notes: `File created: ${title}`,
        timestamp: now,
      });

      // Step 5: Create tamper-evident audit log
      await createAuditLog(fileId, "CREATED", identity.uid);

      // Step 6: Start SLA timer
      await createSlaEntry(fileId, assignedTo, slaDays);

      // Step 7: Notify assigned officer
      await createNotification({
        userId: assignedTo,
        type: "FILE_ASSIGNED",
        fileId,
        message: `New file assigned to you: ${fileId} - ${title}`,
      });

      res.status(201).json({
        success: true,
        fileId,
        qrUrl,
        message: `File ${fileId} created successfully.`,
      });
    } catch (error) {
      console.error("Error creating file:", error);
      res.status(500).json({ error: "Internal server error." });
    }
  }
);
