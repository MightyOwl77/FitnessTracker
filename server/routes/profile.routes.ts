
/**
 * Profile Routes
 * 
 * Defines API routes for user profile management
 */

import express from "express";
import { getUserProfile, createOrUpdateUserProfile } from "../controllers/profile.controller";

const router = express.Router();

// User profile endpoints
router.get("/profile", getUserProfile);
router.post("/profile", createOrUpdateUserProfile);

export default router;
import { Router } from "express";
import { profileController } from "../controllers/profile.controller";

const router = Router();

// GET /api/profile - Get user profile
router.get("/", profileController.getUserProfile);

// POST /api/profile - Create or update user profile
router.post("/", profileController.createOrUpdateProfile);

export default router;
