import * as admin from "firebase-admin";
import { onRequest } from "firebase-functions/v2/https";

const db = admin.firestore();

/**
 * GET /searchFiles?q=<searchTerm>
 *
 * Searches the `files` collection by:
 * - Exact fileId match (e.g. PRM-2026-000001)
 * - citizenName prefix match (case-insensitive)
 * - category match
 *
 * Returns up to 20 matching file records.
 */
export const searchFiles = onRequest(
  { cors: true, region: "asia-south1" },
  async (req, res) => {
    if (req.method !== "GET") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }

    const query = (req.query.q as string || "").trim();

    if (!query) {
      res.status(400).json({ error: "Missing search query parameter 'q'" });
      return;
    }

    try {
      const results: any[] = [];
      const seenIds = new Set<string>();

      // 1. Exact fileId match
      const exactMatch = await db.collection("files").doc(query).get();
      if (exactMatch.exists) {
        const data = exactMatch.data()!;
        results.push({
          id: exactMatch.id,
          ...data,
          createdAt: normalizeDate(data.createdAt),
        });
        seenIds.add(exactMatch.id);
      }

      // 2. Search by citizenName (prefix, case-insensitive via uppercase)
      const upperQuery = query.toUpperCase();
      const nameSnapshot = await db
        .collection("files")
        .orderBy("citizenNameUpper")
        .startAt(upperQuery)
        .endAt(upperQuery + "\uf8ff")
        .limit(20)
        .get();

      for (const doc of nameSnapshot.docs) {
        if (!seenIds.has(doc.id)) {
          const data = doc.data();
          results.push({
            id: doc.id,
            ...data,
            createdAt: normalizeDate(data.createdAt),
          });
          seenIds.add(doc.id);
        }
      }

      // 3. Fallback: scan recent files for partial match in citizenName or category
      if (results.length === 0) {
        const fallbackSnapshot = await db
          .collection("files")
          .orderBy("createdAt", "desc")
          .limit(100)
          .get();

        const lowerQuery = query.toLowerCase();
        for (const doc of fallbackSnapshot.docs) {
          if (seenIds.has(doc.id)) continue;
          const data = doc.data();
          const name = (data.citizenName || "").toLowerCase();
          const cat = (data.category || "").toLowerCase();
          const fileId = doc.id.toLowerCase();

          if (
            name.includes(lowerQuery) ||
            cat.includes(lowerQuery) ||
            fileId.includes(lowerQuery)
          ) {
            results.push({
              id: doc.id,
              ...data,
              createdAt: normalizeDate(data.createdAt),
            });
            seenIds.add(doc.id);
            if (results.length >= 20) break;
          }
        }
      }

      // 4. For each result, also fetch the movement timeline
      const enriched = await Promise.all(
        results.slice(0, 20).map(async (file) => {
          const movementsSnap = await db
            .collection("file_movements")
            .where("fileId", "==", file.id)
            .orderBy("timestamp", "desc")
            .limit(10)
            .get();

          const movements = movementsSnap.docs.map((d) => ({
            id: d.id,
            ...d.data(),
          }));

          return { ...file, movements };
        })
      );

      res.status(200).json({ results: enriched });
    } catch (error) {
      console.error("Error searching files:", error);
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
