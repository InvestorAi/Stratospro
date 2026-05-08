import admin from "firebase-admin";
import firebaseConfig from "../../../firebase-applet-config.json" assert { type: "json" };

let adminApp: admin.app.App | null = null;

export function getAdminApp() {
  if (!adminApp) {
    // In this environment, we use the default project credentials if possible,
    // or initialize with the provided config.
    adminApp = admin.initializeApp({
      projectId: firebaseConfig.projectId,
    });
  }
  return adminApp;
}

export async function verifyToken(req: any, res: any, next: any) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: Missing Token" });
  }

  const idToken = authHeader.split("Bearer ")[1];
  try {
    const decodedToken = await getAdminApp().auth().verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error("Token Verification Error:", error);
    res.status(403).json({ error: "Unauthorized: Invalid Token" });
  }
}
