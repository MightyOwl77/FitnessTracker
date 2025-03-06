/**
 * Profile Routes
 * 
 * Defines API routes for user profile management
 */

import express from "express";
import { getUserProfile, createOrUpdateUserProfile } from "../controllers/profile.controller";
import { cacheMiddleware } from '../lib/cache'; // Added import for caching middleware

const router = express.Router();

// User profile endpoints
// Apply caching to getUserProfile endpoint
router.get("/profile", 
  cacheMiddleware(
    (req) => `profile-route:${req.user?.id}`, // Assuming user ID is available in req.user.id. Adjust as needed.
    300 // Cache for 5 minutes. Adjust as needed.
  ),
  getUserProfile);
router.post("/profile", createOrUpdateUserProfile);

export default router;