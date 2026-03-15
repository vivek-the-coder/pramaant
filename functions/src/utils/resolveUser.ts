/**
 * Resolves the calling user's identity.
 *
 * Reads X-User-Id / X-User-Role headers sent by the frontend
 * (which reads from localStorage after login).
 *
 * This is used in both emulator and production since the app
 * uses a custom auth system (AuthContext) rather than Firebase Auth.
 */
export async function resolveUser(
  req: { headers: Record<string, string | string[] | undefined> }
): Promise<{ uid: string; role: string } | null> {
  const uid = req.headers["x-user-id"] as string;
  const role = (req.headers["x-user-role"] as string) || "clerk";

  if (!uid) return null;

  return { uid, role };
}
