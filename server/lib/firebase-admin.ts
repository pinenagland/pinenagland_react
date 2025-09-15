import admin from "firebase-admin";

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  // For development, we'll use the Firebase emulator or service account key
  if (process.env.NODE_ENV === "development") {
    // In development, we can initialize without credentials for testing
    admin.initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID || "demo-project",
    });
  } else {
    // In production, initialize with service account
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (serviceAccount) {
      admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(serviceAccount)),
        projectId: process.env.FIREBASE_PROJECT_ID,
      });
    } else {
      // Fallback: use default credentials (when deployed on Firebase/GCP)
      admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID,
      });
    }
  }
}

export const adminAuth = admin.auth();
export default admin;