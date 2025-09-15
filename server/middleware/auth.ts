import { Request, Response, NextFunction } from "express";
import { adminAuth } from "../lib/firebase-admin";

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        uid: string;
        email?: string;
        name?: string;
      };
    }
  }
}

// Middleware to verify Firebase ID token
export async function verifyFirebaseToken(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authorization header with Bearer token required" });
    }

    const idToken = authHeader.split("Bearer ")[1];
    
    if (!idToken) {
      return res.status(401).json({ message: "No token provided" });
    }

    // Verify the Firebase ID token
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    
    // Add user info to request object
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name || decodedToken.email?.split("@")[0],
    };

    next();
  } catch (error) {
    console.error("Token verification failed:", error);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

// Optional middleware - allows both authenticated and unauthenticated requests
export async function optionalAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const idToken = authHeader.split("Bearer ")[1];
      
      if (idToken) {
        try {
          const decodedToken = await adminAuth.verifyIdToken(idToken);
          req.user = {
            uid: decodedToken.uid,
            email: decodedToken.email,
            name: decodedToken.name || decodedToken.email?.split("@")[0],
          };
        } catch (error) {
          // Invalid token, but continue without user
          console.warn("Optional auth token verification failed:", error);
        }
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication in case of errors
    next();
  }
}