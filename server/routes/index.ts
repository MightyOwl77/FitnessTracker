
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

/**
 * Registers all application routes
 */
export async function registerRoutes(app: Express): Promise<Server> {
  // Set up middleware to simulate authentication
  app.use((req: AuthRequest, res, next) => {
    // Attach a default user ID for development
    req.user = tempUserData.parse({});
    next();
  });

  // Register route modules
  app.use("/api", authRoutes);
  app.use("/api", profileRoutes);
  app.use("/api", goalRoutes);
  app.use("/api", logRoutes);
  app.use("/api", statRoutes);

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
