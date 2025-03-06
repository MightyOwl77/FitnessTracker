
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
