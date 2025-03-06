
/**
 * Goals Controller
 * 
 * Handles business logic for user goals
 */

import { Response } from "express";
import { AuthRequest } from "../types";
import { storage } from "../storage";
import { userGoalSchema } from "@shared/schema";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";

/**
 * Get user goals
 */
export async function getUserGoals(req: AuthRequest, res: Response) {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const goal = await storage.getUserGoal(userId);
  if (!goal) {
    return res.status(404).json({ message: "Goal not found" });
  }

  res.json(goal);
}

/**
 * Create or update user goals
 * Calculates calorie deficit and macros based on user profile and goals
 */
export async function createOrUpdateUserGoals(req: AuthRequest, res: Response) {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const goalData = userGoalSchema.parse(req.body);
    
    // Get user profile to calculate calorie deficit
    const profile = await storage.getUserProfile(userId);
    if (!profile) {
      return res.status(400).json({ message: "Profile not found, create a profile first" });
    }
    
    // Calculate total weight loss and calorie deficit
    const totalWeightLoss = goalData.currentWeight - goalData.targetWeight;
    // 7700 calories = 1 kg of fat
    const totalCalorieDeficit = totalWeightLoss * 7700;
    
    // Determine deficit type (moderate or aggressive)
    const deficitType = goalData.deficitType || "moderate";
    
    // Set deficit cap based on deficitType
    let dailyDeficitCap = 500; // moderate default (0.5kg/week)
    if (deficitType === "aggressive") {
      dailyDeficitCap = 1000; // aggressive (1kg/week)
    }
    
    // Calculate daily deficit based on timeframe, considering refeed days and diet breaks
    const effectiveDays = (goalData.timeFrame - (goalData.dietBreakWeeks || 0)) * 7;
    const refeedDaysTotal = (goalData.refeedDays || 0) * (effectiveDays / 7);
    const totalDaysWithDeficit = effectiveDays - refeedDaysTotal;
    
    // Raw daily deficit calculation
    const rawDailyDeficit = Math.round(totalCalorieDeficit / totalDaysWithDeficit);
    
    // Apply the cap for health reasons
    const dailyDeficit = Math.min(rawDailyDeficit, dailyDeficitCap);
    
    // Calculate maintenance calories (always use 1.55 multiplier per requirements)
    const maintenanceCalories = Math.round(profile.bmr * 1.55);
    
    // Calculate weekly activity calories
    const weeklyActivityCalories = 
      (goalData.weightLiftingSessions || 3) * 250 + 
      (goalData.cardioSessions || 2) * 300 +
      (goalData.stepsPerDay || 10000) / 10000 * 400 * 7;
      
    // Calculate daily activity calories
    const dailyActivityCalories = Math.round(weeklyActivityCalories / 7);
    
    // Calculate daily calorie target = Maintenance - (Deficit - Activity Calories)
    const dailyCalorieTarget = Math.round(maintenanceCalories - Math.max(0, dailyDeficit - dailyActivityCalories));
    
    // Calculate macros
    // Determine protein amount based on body fat percentage if available
    let proteinMultiplier = 1.8; // Base on 1.8g/kg for fat loss with muscle retention
    
    // If we have body fat percentage data, we can be more precise
    if (profile.bodyFatPercentage) {
      const leanMass = (goalData.currentWeight * (100 - profile.bodyFatPercentage)) / 100;
      proteinMultiplier = 2.0; // Use higher protein for people with body composition data
    }
    
    // Protein calculation
    const proteinGrams = Math.round(proteinMultiplier * goalData.currentWeight);
    
    // Standard macro split: 40% carbs, 30% protein, 30% fat (adjust based on dietary preference)
    let proteinPercentage = 30;
    let fatPercentage = 30;
    let carbPercentage = 40;
    
    // Adjust for dietary preferences if specified
    if (profile.dietaryPreference) {
      switch (profile.dietaryPreference) {
        case "keto":
          proteinPercentage = 25;
          fatPercentage = 70;
          carbPercentage = 5;
          break;
        case "paleo":
          proteinPercentage = 35;
          fatPercentage = 40;
          carbPercentage = 25;
          break;
        case "vegan":
        case "vegetarian":
          proteinPercentage = 20;
          fatPercentage = 30;
          carbPercentage = 50;
          break;
      }
    }
    
    // Calculate macros based on percentages
    const proteinCalories = Math.round(dailyCalorieTarget * (proteinPercentage / 100));
    const fatCalories = Math.round(dailyCalorieTarget * (fatPercentage / 100));
    const carbCalories = Math.round(dailyCalorieTarget * (carbPercentage / 100));
    
    // Convert to grams
    const calculatedProteinGrams = Math.round(proteinCalories / 4);
    // Use the higher of calculated protein or protein based on weight
    const finalProteinGrams = Math.max(calculatedProteinGrams, proteinGrams);
    const fatGrams = Math.round(fatCalories / 9);
    const carbGrams = Math.round(carbCalories / 4);
    
    const existingGoal = await storage.getUserGoal(userId);
    
    const goalDataToSave = {
      ...goalData,
      maintenanceCalories,
      dailyCalorieTarget,
      dailyDeficit,
      proteinGrams: finalProteinGrams,
      fatGrams,
      carbGrams,
      weeklyActivityCalories,
      dailyActivityCalories
    };
    
    if (existingGoal) {
      const updatedGoal = await storage.updateUserGoal(userId, goalDataToSave);
      return res.json(updatedGoal);
    } else {
      const newGoal = await storage.createUserGoal({
        userId,
        ...goalDataToSave
      });
      return res.json(newGoal);
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const validationError = fromZodError(error);
      return res.status(400).json({ message: validationError.message });
    }
    console.error("Error saving goal data:", error);
    return res.status(400).json({ message: "Invalid goal data" });
  }
}
