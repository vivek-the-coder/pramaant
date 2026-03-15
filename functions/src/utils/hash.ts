import * as crypto from "crypto";

/**
 * Compute SHA-256 hash of a string.
 */
export function sha256(data: string): string {
  return crypto.createHash("sha256").update(data).digest("hex");
}

/**
 * Compute audit log hash using the tamper-evident formula:
 * hash = SHA256(fileId + action + timestamp + previousHash)
 */
export function computeAuditHash(
  fileId: string,
  action: string,
  timestamp: string,
  previousHash: string
): string {
  return sha256(fileId + action + timestamp + previousHash);
}
