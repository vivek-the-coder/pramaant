import * as admin from "firebase-admin";
import { onRequest } from "firebase-functions/v2/https";
import { resolveUser } from "../utils/resolveUser";

const db = admin.firestore();

/**
 * GET /getOfficerFiles
 *
 * Returns a simple list of files currently assigned to the logged-in officer.
 */
export const getOfficerFiles = onRequest(
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

      const snapshot = await db
        .collection("files")
        .where("currentHolder", "==", officerId)
        .orderBy("isDelayed", "desc")
        .orderBy("createdAt", "desc")
        .get();

      const files = snapshot.docs.map((doc) => {
        const data = doc.data() as admin.firestore.DocumentData;
        return {
          fileId: doc.id,
          citizenName: data.citizenName ?? "",
          department: data.department ?? "",
          status: data.status ?? "",
          createdAt: data.createdAt
            ? (typeof data.createdAt === "string" ? data.createdAt : data.createdAt.toDate().toISOString())
            : null,
          isDelayed: data.isDelayed ?? false,
        };
      });

      res.status(200).json({ files });
    } catch (error) {
      console.error("Error fetching officer files:", error);
      res.status(500).json({ error: "Internal server error." });
    }
  }
);
