import * as admin from "firebase-admin";

/**
 * Resolves the calling user's identity.
 *
 * In **emulator mode** the identity comes from X-User-Id / X-User-Role headers
 * sent by the frontend (which reads from localStorage after login).
 *
 * In **production** it verifies the Firebase ID token from the Authorization header.
 */
export async function resolveUser(
  req: { headers: Record<string, string | string[] | undefined> }
): Promise<{ uid: string; role: string } | null> {
  const isEmulator =
    process.env.FUNCTIONS_EMULATOR === "true" ||
    process.env.FUNCTIONS_EMULATOR === "1" ||
    process.env.FIREBASE_EMULATOR_HUB !== undefined;

  if (isEmulator) {
    const uid = (req.headers["x-user-id"] as string) || "test-user";
    const role = (req.headers["x-user-role"] as string) || "clerk";
    return { uid, role };
  }

  // Production: verify Firebase ID token
  const authHeader = (req.headers.authorization as string) || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : undefined;

  if (!token) return null;

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    return { uid: decoded.uid, role: (decoded as any).role || "clerk" };
  } catch {
    return null;
  }
}
