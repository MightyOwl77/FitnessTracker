/**
 * Routes Index
 * 
 * Centralizes route registration for the application
 */

import { Express } from "express";
import { createServer, Server } from "http";
import profileRoutes from "./profile.routes";
import goalRoutes from "./goal.routes";
import logRoutes from "./log.routes";
import statRoutes from "./stat.routes";
import authRoutes from "./auth.routes";
import { tempUserData } from "@shared/schema";
import { AuthRequest } from "../types";
import { Router } from "express";
import { register, login, verifyToken } from "../controllers/auth.controller";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";


/**
 * API Routes Module
 * 
 * This module defines all API routes for the Body Transform application.
 * Routes are organized by resource type (profile, goals, logs, stats)
 * and implement RESTful principles.
 * 
 * Authentication is implemented using JWT tokens.
 */

// Import the custom Request interface from index.ts
export interface AuthRequest extends Express.Request {
  user?: {
    id: number;
    username: string;
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes - prefix all routes with /api
  const apiRouter = Router();

  // Public routes (no authentication required)
  apiRouter.post("/register", register);
  apiRouter.post("/login", login);

  // Protected routes (require authentication)
  // Apply JWT verification middleware to all protected routes
  apiRouter.use("/profile", verifyToken, profileRoutes);
  apiRouter.use("/goals", verifyToken, goalRoutes);
  apiRouter.use("/logs", verifyToken, logRoutes);
  apiRouter.use("/stats", verifyToken, statRoutes);


  // Mount API router at /api path
  app.use("/api", apiRouter);

  // For development & testing only - remove in production
  if (process.env.NODE_ENV !== 'production') {
    // Set up middleware to simulate authentication (DEVELOPMENT ONLY)
    app.use((req: AuthRequest, res, next) => {
      // Check if the route already has a user attached (from JWT)
      if (!req.user) {
        // This is for backward compatibility during development
        console.warn("Using simulated authentication - DEVELOPMENT ONLY");
        req.user = { id: 1, username: "user" };
      }
      next();
    });
  }

  // Reset endpoint for development - clears all user data
  app.post("/api/reset", async (req: AuthRequest, res) => {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      // Reset all storage data
      if (storage instanceof MemStorage) {
        storage.resetStorage();
        console.log("Storage data reset successfully");
      }
      res.json({ message: "Data reset successfully" });
    } catch (error) {
      console.error("Error resetting data:", error);
      res.status(500).json({ message: "Failed to reset data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

import { storage, MemStorage } from "../storage";