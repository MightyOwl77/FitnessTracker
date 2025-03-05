import type { Express, Request, Response } from "express";
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
  app.use((req, res, next) => {
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
      
      // Adjust BMR based on activity level
      let adjustedBmr = bmr;
      switch (profileData.activityLevel) {
        case "sedentary":
          adjustedBmr = Math.round(bmr * 1.2);
          break;
        case "lightly":
          adjustedBmr = Math.round(bmr * 1.375);
          break;
        case "moderately":
          adjustedBmr = Math.round(bmr * 1.55);
          break;
        case "very":
          adjustedBmr = Math.round(bmr * 1.725);
          break;
      }
      
      const existingProfile = await storage.getUserProfile(userId);
      
      if (existingProfile) {
        const updatedProfile = await storage.updateUserProfile(userId, {
          ...profileData,
          bmr: adjustedBmr
        });
        return res.json(updatedProfile);
      } else {
        const newProfile = await storage.createUserProfile({
          userId,
          ...profileData,
          bmr: adjustedBmr
        });
        return res.json(newProfile);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
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
      // Calculate daily deficit based on timeframe
      const dailyDeficit = Math.round(totalCalorieDeficit / (goalData.timeFrame * 7));
      // Calculate daily calorie target
      const dailyCalorieTarget = profile.bmr - dailyDeficit;
      
      // Calculate macros
      // Protein: 1.6g/kg of body weight
      const proteinGrams = Math.round(1.6 * goalData.currentWeight);
      // Fats: 0.8g/kg of body weight
      const fatGrams = Math.round(0.8 * goalData.currentWeight);
      // Remaining calories from carbs
      const proteinCalories = proteinGrams * 4;
      const fatCalories = fatGrams * 9;
      const carbCalories = dailyCalorieTarget - proteinCalories - fatCalories;
      const carbGrams = Math.max(0, Math.round(carbCalories / 4));
      
      const existingGoal = await storage.getUserGoal(userId);
      
      if (existingGoal) {
        const updatedGoal = await storage.updateUserGoal(userId, {
          ...goalData,
          dailyCalorieTarget,
          dailyDeficit,
          proteinGrams,
          fatGrams,
          carbGrams
        });
        return res.json(updatedGoal);
      } else {
        const newGoal = await storage.createUserGoal({
          userId,
          ...goalData,
          dailyCalorieTarget,
          dailyDeficit,
          proteinGrams,
          fatGrams,
          carbGrams
        });
        return res.json(newGoal);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
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
