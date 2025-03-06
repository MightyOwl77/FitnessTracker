
/**
 * Profile Controller
 * 
 * Handles business logic for user profile operations
 */

import { Response } from "express";
import { AuthRequest } from "../types";
import { storage } from "../storage";
import { userProfileSchema } from "@shared/schema";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";

/**
 * Get user profile
 */
export async function getUserProfile(req: AuthRequest, res: Response) {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const profile = await storage.getUserProfile(userId);
  if (!profile) {
    return res.status(404).json({ message: "Profile not found" });
  }

  res.json(profile);
}

/**
 * Create or update user profile
 * Calculates BMR using the Mifflin-St Jeor formula
 */
export async function createOrUpdateUserProfile(req: AuthRequest, res: Response) {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const profileData = userProfileSchema.parse(req.body);
    
    // Calculate BMR using the Mifflin-St Jeor formula
    let bmr = 0;
    if (profileData.gender === "male") {
      bmr = 10 * profileData.weight + 6.25 * profileData.height - 5 * profileData.age + 5;
    } else {
      bmr = 10 * profileData.weight + 6.25 * profileData.height - 5 * profileData.age - 161;
    }
    
    // Raw BMR (without activity adjustment)
    const baseBmr = Math.round(bmr);

    // Calculate lean mass if body fat percentage is provided
    let leanMass: number | undefined = undefined;
    if (profileData.bodyFatPercentage) {
      leanMass = (profileData.weight * (100 - profileData.bodyFatPercentage)) / 100;
      leanMass = parseFloat(leanMass.toFixed(1));
    }
    
    const existingProfile = await storage.getUserProfile(userId);
    
    if (existingProfile) {
      const updatedProfile = await storage.updateUserProfile(userId, {
        ...profileData,
        bmr: baseBmr,
        leanMass
      });
      return res.json(updatedProfile);
    } else {
      const newProfile = await storage.createUserProfile({
        userId,
        ...profileData,
        bmr: baseBmr,
        leanMass
      });
      return res.json(newProfile);
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const validationError = fromZodError(error);
      return res.status(400).json({ message: validationError.message });
    }
    console.error("Error saving profile data:", error);
    return res.status(400).json({ message: "Invalid profile data" });
  }
}
import { Request, Response } from "express";
import { storage } from "../storage";
import { userProfileSchema } from "@shared/schema";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import { AuthRequest } from "../routes/index";

/**
 * Profile controller with proper validation and error handling
 */
export const profileController = {
  /**
   * Get user profile
   */
  getUserProfile: async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const profile = await storage.getUserProfile(userId);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }

      res.json(profile);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      res.status(500).json({ message: "Server error" });
    }
  },

  /**
   * Create or update user profile
   */
  createOrUpdateProfile: async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const profileData = userProfileSchema.parse(req.body);
      
      // Calculate BMR using the Mifflin-St Jeor formula
      let bmr = 0;
      if (profileData.gender === "male") {
        bmr = 10 * profileData.weight + 6.25 * profileData.height - 5 * profileData.age + 5;
      } else {
        bmr = 10 * profileData.weight + 6.25 * profileData.height - 5 * profileData.age - 161;
      }
      
      // Raw BMR (without activity adjustment)
      const baseBmr = Math.round(bmr);

      // Calculate lean mass if body fat percentage is provided
      let leanMass: number | undefined = undefined;
      if (profileData.bodyFatPercentage) {
        leanMass = (profileData.weight * (100 - profileData.bodyFatPercentage)) / 100;
        leanMass = parseFloat(leanMass.toFixed(1));
      }
      
      const existingProfile = await storage.getUserProfile(userId);
      
      if (existingProfile) {
        const updatedProfile = await storage.updateUserProfile(userId, {
          ...profileData,
          bmr: baseBmr,
          leanMass
        });
        return res.json(updatedProfile);
      } else {
        const newProfile = await storage.createUserProfile({
          userId,
          ...profileData,
          bmr: baseBmr,
          leanMass
        });
        return res.json(newProfile);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Error saving profile data:", error);
      return res.status(400).json({ message: "Invalid profile data" });
    }
  }
};
