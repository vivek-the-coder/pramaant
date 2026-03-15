import * as admin from "firebase-admin";
import { createNotification } from "./notificationService";

const db = admin.firestore();

/**
 * Create an SLA tracking entry for a new file.
 */
export async function createSlaEntry(
  fileId: string,
  assignedTo: string,
  slaDays: number,
  transaction?: admin.firestore.Transaction
): Promise<void> {
  const now = new Date();
  const deadline = new Date(now.getTime() + slaDays * 24 * 60 * 60 * 1000);

  const slaData = {
    assignedTo,
    startTime: now,
    deadline,
    slaStatus: "active",
    slaDays,
    fileId,
  };

  const slaRef = db.collection("sla_tracking").doc(fileId);

  if (transaction) {
    transaction.set(slaRef, slaData);
  } else {
    await slaRef.set(slaData);
  }
}

/**
 * Update SLA tracking when file holder changes.
 */
export async function updateSlaHolder(
  fileId: string,
  newHolder: string
): Promise<void> {
  const slaRef = db.collection("sla_tracking").doc(fileId);
  await slaRef.update({ assignedTo: newHolder });
}

/**
 * Mark SLA as completed (file approved/rejected).
 */
export async function completeSla(fileId: string): Promise<void> {
  const slaRef = db.collection("sla_tracking").doc(fileId);
  await slaRef.update({ slaStatus: "completed" });
}

/**
 * Check for SLA breaches and warnings.
 * Only queries near-expiry files (deadline <= now + 10 minutes)
 * to avoid scanning the entire collection.
 *
 * Called by Cloud Scheduler every 5 minutes.
 */
export async function checkSlaBreaches(): Promise<{
  breached: number;
  warned: number;
}> {
  const now = new Date();
  const tenMinutesFromNow = new Date(now.getTime() + 10 * 60 * 1000);

  // Query only active SLAs approaching deadline
  const nearExpirySnapshot = await db
    .collection("sla_tracking")
    .where("slaStatus", "==", "active")
    .where("deadline", "<=", tenMinutesFromNow)
    .get();

  let breached = 0;
  let warned = 0;

  const batch = db.batch();

  for (const doc of nearExpirySnapshot.docs) {
    const sla = doc.data();
    const deadlineDate = sla.deadline?.toDate ? sla.deadline.toDate() : new Date(sla.deadline);

    if (now.getTime() >= deadlineDate.getTime()) {
      // SLA BREACHED
      batch.update(doc.ref, { slaStatus: "breached" });
      batch.update(db.collection("files").doc(doc.id), {
        isDelayed: true,
      });

      // Create notification for the assigned officer
      await createNotification({
        userId: sla.assignedTo,
        type: "SLA_BREACH",
        fileId: doc.id,
        message: `SLA breached for file ${doc.id}. Immediate action required.`,
      });

      breached++;
    } else {
      // SLA WARNING (approaching deadline)
      batch.update(doc.ref, { slaStatus: "warning" });

      await createNotification({
        userId: sla.assignedTo,
        type: "SLA_WARNING",
        fileId: doc.id,
        message: `SLA for file ${doc.id} is approaching deadline. Please take action soon.`,
      });

      warned++;
    }
  }

  if (breached > 0 || warned > 0) {
    await batch.commit();
  }

  return { breached, warned };
}
