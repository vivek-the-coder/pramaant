import * as admin from "firebase-admin";

const db = admin.firestore();

/**
 * Generate the next human-readable file number using atomic increment.
 * Format: PRM-{YEAR}-{PADDED_NUMBER}
 * Example: PRM-2026-000001
 */
export async function generateFileNumber(): Promise<string> {
  const counterRef = db.collection("counters").doc("files");

  const newNumber = await db.runTransaction(async (transaction) => {
    const counterDoc = await transaction.get(counterRef);

    let currentNumber = 0;
    if (counterDoc.exists) {
      currentNumber = counterDoc.data()?.currentNumber || 0;
    }

    const nextNumber = currentNumber + 1;
    transaction.set(counterRef, { currentNumber: nextNumber }, { merge: true });

    return nextNumber;
  });

  const year = new Date().getFullYear();
  const padded = String(newNumber).padStart(6, "0");

  return `PRM-${year}-${padded}`;
}
