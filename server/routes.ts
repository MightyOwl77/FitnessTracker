import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  userProfileSchema, 
  userGoalSchema, 
  dailyLogSchema, 
  bodyStatSchema,
  tempUserData 
} from "@shared/schema";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up middleware to simulate authentication
  app.use((req: Request, res, next) => {
    // Attach a default user ID for development
    req.user = tempUserData.parse({});
    next();
  });

  // API routes
  // Prefix all routes with /api
  
  // User profile endpoints
  app.get("/api/profile", async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const profile = await storage.getUserProfile(userId);
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.json(profile);
  });

  app.post("/api/profile", async (req: Request, res: Response) => {
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
  });

  // User goals endpoints
  app.get("/api/goals", async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const goal = await storage.getUserGoal(userId);
    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    res.json(goal);
  });

  app.post("/api/goals", async (req: Request, res: Response) => {
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
  });

  // Daily logs endpoints
  app.get("/api/logs", async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    const logs = await storage.getDailyLogs(userId, limit);
    
    res.json(logs);
  });

  app.get("/api/logs/:date", async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const dateStr = req.params.date;
    const date = new Date(dateStr);
    
    if (isNaN(date.getTime())) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    const log = await storage.getDailyLog(userId, date);
    if (!log) {
      return res.status(404).json({ message: "Log not found for this date" });
    }

    res.json(log);
  });

  app.post("/api/logs", async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      let logData = req.body;
      
      // Parse date if it's a string
      if (typeof logData.date === 'string') {
        logData.date = new Date(logData.date);
      }
      
      const validatedLog = dailyLogSchema.parse(logData);
      
      // Check if log for this date already exists
      const existingLog = await storage.getDailyLog(userId, validatedLog.date);
      
      if (existingLog) {
        const updatedLog = await storage.updateDailyLog(existingLog.id, {
          ...validatedLog,
          userId
        });
        return res.json(updatedLog);
      } else {
        const newLog = await storage.createDailyLog({
          ...validatedLog,
          userId
        });
        return res.json(newLog);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      return res.status(400).json({ message: "Invalid log data" });
    }
  });

  // Body stats endpoints
  app.get("/api/stats", async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    const stats = await storage.getBodyStats(userId, limit);
    
    res.json(stats);
  });

  app.get("/api/stats/:date", async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const dateStr = req.params.date;
    const date = new Date(dateStr);
    
    if (isNaN(date.getTime())) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    const stat = await storage.getBodyStat(userId, date);
    if (!stat) {
      return res.status(404).json({ message: "Stats not found for this date" });
    }

    res.json(stat);
  });

  app.post("/api/stats", async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      let statData = req.body;
      
      // Parse date if it's a string
      if (typeof statData.date === 'string') {
        statData.date = new Date(statData.date);
      }
      
      const validatedStat = bodyStatSchema.parse(statData);
      
      // Check if stats for this date already exists
      const existingStat = await storage.getBodyStat(userId, validatedStat.date);
      
      if (existingStat) {
        const updatedStat = await storage.updateBodyStat(existingStat.id, {
          ...validatedStat,
          userId
        });
        return res.json(updatedStat);
      } else {
        const newStat = await storage.createBodyStat({
          ...validatedStat,
          userId
        });
        return res.json(newStat);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      return res.status(400).json({ message: "Invalid stat data" });
    }
  });

  // Reset endpoint for development - clears all user data
  app.post("/api/reset", async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Reset implementation would be different in a real DB
    // For now, we just return success
    res.json({ message: "Data reset successfully" });
  });

  const httpServer = createServer(app);

  return httpServer;
}
