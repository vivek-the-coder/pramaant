import * as QRCode from "qrcode";
import * as admin from "firebase-admin";

/**
 * Generate a QR code PNG for a file, upload to Firebase Storage,
 * and return the public download URL.
 */
export async function generateAndStoreQR(fileId: string): Promise<string> {
  // Generate QR code as buffer
  const qrBuffer = await QRCode.toBuffer(fileId, {
    type: "png",
    width: 300,
    margin: 2,
    color: {
      dark: "#1D4E89",
      light: "#FFFFFF",
    },
  });

  // Upload to Firebase Storage
  const bucket = admin.storage().bucket();
  const filePath = `qr-codes/${fileId}.png`;
  const file = bucket.file(filePath);

  await file.save(qrBuffer, {
    metadata: {
      contentType: "image/png",
      metadata: {
        fileId: fileId,
        generatedAt: new Date().toISOString(),
      },
    },
  });

  // Check if we are running in the emulator
  const isEmulator =
    process.env.FUNCTIONS_EMULATOR === "true" ||
    process.env.FUNCTIONS_EMULATOR === "1" ||
    process.env.FIREBASE_EMULATOR_HUB !== undefined;

  let publicUrl;
  
  if (isEmulator) {
    // Emulator URL format for Storage
    const storageHost = process.env.FIREBASE_STORAGE_EMULATOR_HOST || "127.0.0.1:9199";
    const encodedPath = encodeURIComponent(filePath);
    publicUrl = `http://${storageHost}/v0/b/${bucket.name}/o/${encodedPath}?alt=media`;
  } else {
    // Production URL
    await file.makePublic();
    publicUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;
  }

  return publicUrl;
}
