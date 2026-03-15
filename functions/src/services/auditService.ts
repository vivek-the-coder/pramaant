import * as admin from "firebase-admin";
import { computeAuditHash } from "../utils/hash";

const db = admin.firestore();

/**
 * Create a tamper-evident audit log entry using SHA-256 hash chaining.
 *
 * Uses the `lastAuditHash` stored on the file document for O(1) lookup
 * instead of querying the last audit log (which is slow at scale).
 *
 * Flow:
 * 1. Read file.lastAuditHash
 * 2. Compute currentHash = SHA256(fileId + action + timestamp + previousHash)
 * 3. Write audit_logs entry with previousHash + currentHash
 * 4. Update file.lastAuditHash = currentHash
 */
export async function createAuditLog(
  fileId: string,
  action: string,
  performedBy: string,
  transaction?: admin.firestore.Transaction
): Promise<string> {
  const now = new Date().toISOString();
  const fileRef = db.collection("files").doc(fileId);

  if (transaction) {
    return _createAuditLogInTransaction(
      transaction,
      fileRef,
      fileId,
      action,
      performedBy,
      now
    );
  }

  // Standalone (non-transactional) version
  return db.runTransaction(async (txn) => {
    return _createAuditLogInTransaction(
      txn,
      fileRef,
      fileId,
      action,
      performedBy,
      now
    );
  });
}

async function _createAuditLogInTransaction(
  transaction: admin.firestore.Transaction,
  fileRef: admin.firestore.DocumentReference,
  fileId: string,
  action: string,
  performedBy: string,
  timestamp: string
): Promise<string> {
  const fileDoc = await transaction.get(fileRef);
  const previousHash = fileDoc.exists
    ? fileDoc.data()?.lastAuditHash || "GENESIS"
    : "GENESIS";

  const currentHash = computeAuditHash(fileId, action, timestamp, previousHash);

  // Create audit log entry
  const auditRef = db.collection("audit_logs").doc();
  transaction.set(auditRef, {
    fileId,
    action,
    performedBy,
    timestamp,
    previousHash,
    currentHash,
  });

  // Update file's lastAuditHash for O(1) next lookup
  transaction.update(fileRef, { lastAuditHash: currentHash });

  return currentHash;
}

/**
 * Verify the integrity of the audit hash chain for a given file.
 * Returns true if chain is intact, false if tampered.
 */
export async function verifyAuditChain(fileId: string): Promise<{
  valid: boolean;
  brokenAt?: string;
}> {
  const logsSnapshot = await db
    .collection("audit_logs")
    .where("fileId", "==", fileId)
    .orderBy("timestamp", "asc")
    .get();

  let expectedPreviousHash = "GENESIS";

  for (const doc of logsSnapshot.docs) {
    const log = doc.data();
    const expectedHash = computeAuditHash(
      log.fileId,
      log.action,
      log.timestamp,
      expectedPreviousHash
    );

    if (log.currentHash !== expectedHash) {
      return { valid: false, brokenAt: doc.id };
    }

    if (log.previousHash !== expectedPreviousHash) {
      return { valid: false, brokenAt: doc.id };
    }

    expectedPreviousHash = log.currentHash;
  }

  return { valid: true };
}
