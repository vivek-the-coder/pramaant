import * as admin from "firebase-admin";

const db = admin.firestore();

export type NotificationType =
  | "SLA_WARNING"
  | "SLA_BREACH"
  | "FILE_ASSIGNED"
  | "FILE_FORWARDED"
  | "FILE_ESCALATED"
  | "AUDIT_ALERT";

interface NotificationData {
  userId: string;
  type: NotificationType;
  fileId: string;
  message: string;
}

/**
 * Create a notification for a user.
 */
export async function createNotification(
  data: NotificationData
): Promise<string> {
  const notifRef = db.collection("notifications").doc();

  await notifRef.set({
    userId: data.userId,
    type: data.type,
    fileId: data.fileId,
    message: data.message,
    createdAt: new Date().toISOString(),
    read: false,
  });

  return notifRef.id;
}

/**
 * Get unread notifications for a user.
 */
export async function getUnreadNotifications(
  userId: string,
  limit = 20
): Promise<admin.firestore.DocumentData[]> {
  const snapshot = await db
    .collection("notifications")
    .where("userId", "==", userId)
    .where("read", "==", false)
    .orderBy("createdAt", "desc")
    .limit(limit)
    .get();

  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

/**
 * Mark a notification as read.
 */
export async function markNotificationRead(
  notificationId: string
): Promise<void> {
  await db.collection("notifications").doc(notificationId).update({
    read: true,
  });
}
