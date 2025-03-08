import type { Express, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage, MemStorage } from "./storage";
import { 
  userProfileSchema, 
  userGoalSchema, 
  dailyLogSchema, 
  bodyStatSchema,
  tempUserData,
  userLoginSchema,
  userRegisterSchema,
  InsertUser 
} from "@shared/schema";

// Define AuthRequest interface to extend Express.Request
import type { Request } from "express";
interface AuthRequest extends Request {
  user?: {
    id: number;
    username: string;
  };
}
import { z } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up middleware to simulate authentication
  app.use((req: AuthRequest, res, next) => {
    // Attach a default user ID for development
    req.user = tempUserData.parse({});
    next();
  });

  // API routes
  // Prefix all routes with /api
  
  // Authentication endpoints
  app.post("/api/register", async (req: AuthRequest, res: Response) => {
    try {
      // Validate user data
      const userData = userRegisterSchema.parse(req.body);
      
      // Check if username is already taken
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      // Create new user (in a real app, we would hash the password)
      const newUser = await storage.createUser({
        username: userData.username,
        password: userData.password, // In a real app, this would be hashed
      });
      
      // Return user without the password
      const { password, ...userWithoutPassword } = newUser;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Error registering user:", error);
      res.status(500).json({ message: "Failed to register user" });
    }
  });
  
  app.post("/api/login", async (req: AuthRequest, res: Response) => {
    try {
      // Validate login data
      const loginData = userLoginSchema.parse(req.body);
      
      // Find user by username
      const user = await storage.getUserByUsername(loginData.username);
      if (!user) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      // Check password (in a real app, we would compare hashed passwords)
      if (user.password !== loginData.password) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      // Create session (in a real app, we would create a proper session with JWT or cookies)
      req.user = { id: user.id, username: user.username };
      
      // Return user without the password
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Error logging in:", error);
      res.status(500).json({ message: "Failed to login" });
    }
  });
  
  // User profile endpoints
  app.get("/api/profile", async (req: AuthRequest, res: Response) => {
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

  app.post("/api/profile", async (req: AuthRequest, res: Response) => {
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
  app.get("/api/goals", async (req: AuthRequest, res: Response) => {
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

  app.post("/api/goals", async (req: AuthRequest, res: Response) => {
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
      
      // Determine deficit rate (0.5 for moderate, 1.0 for aggressive)
      const deficitRateValue = goalData.deficitRate || 0.5;
      
      // Set deficit cap based on deficitRate value
      // 0.5 = moderate (0.5kg/week = 500 cal/day)
      // 1.0 = aggressive (1kg/week = 1000 cal/day)
      const dailyDeficitCap = Math.round(deficitRateValue * 1000);
      
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
  app.get("/api/logs", async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    const logs = await storage.getDailyLogs(userId, limit);
    
    res.json(logs);
  });

  app.get("/api/logs/:date", async (req: AuthRequest, res: Response) => {
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

  app.post("/api/logs", async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      let logData = req.body;
      
      console.log("Received log data:", JSON.stringify(logData));
      
      // Parse date if it's a string
      if (typeof logData.date === 'string') {
        logData.date = new Date(logData.date);
      }
      
      try {
        const validatedLog = dailyLogSchema.parse(logData);
        console.log("Validated log data:", JSON.stringify(validatedLog));
        
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
      } catch (zodError) {
        if (zodError instanceof z.ZodError) {
          console.error("Zod validation error:", JSON.stringify(zodError.errors));
          const validationError = fromZodError(zodError);
          return res.status(400).json({ 
            message: validationError.message,
            details: zodError.errors 
          });
        }
        throw zodError;
      }
    } catch (error) {
      console.error("Error creating daily log:", error);
      return res.status(400).json({ message: "Invalid log data" });
    }
  });

  // Body stats endpoints
  app.get("/api/stats", async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    const stats = await storage.getBodyStats(userId, limit);
    
    res.json(stats);
  });

  app.get("/api/stats/:date", async (req: AuthRequest, res: Response) => {
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

  app.post("/api/stats", async (req: AuthRequest, res: Response) => {
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
  app.post("/api/reset", async (req: AuthRequest, res: Response) => {
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
