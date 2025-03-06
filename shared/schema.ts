import { pgTable, text, serial, integer, boolean, jsonb, timestamp, real, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User data
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// User profile data
export const userProfiles = pgTable("user_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  age: integer("age").notNull(),
  gender: text("gender").notNull(),
  height: real("height").notNull(),
  weight: real("weight").notNull(),
  bodyFatPercentage: real("body_fat_percentage"),
  leanMass: real("lean_mass"),
  fitnessLevel: text("fitness_level"), // beginner, intermediate, advanced
  dietaryPreference: text("dietary_preference"), // vegan, keto, high-protein, etc.
  trainingAccess: text("training_access"), // gym, home
  activityLevel: text("activity_level").notNull(), // sedentary, lightly, moderately, very
  healthConsiderations: text("health_considerations"), // injuries, conditions, etc.
  bmr: integer("bmr").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserProfileSchema = createInsertSchema(userProfiles).omit({
  id: true,
  createdAt: true,
});

export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;
export type UserProfile = typeof userProfiles.$inferSelect;

// User goals with activity data
export const userGoals = pgTable("user_goals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  // Weight Goals
  currentWeight: real("current_weight").notNull(),
  targetWeight: real("target_weight").notNull(),
  currentBodyFat: real("current_body_fat"), // body fat percentage
  targetBodyFat: real("target_body_fat"), // target body fat percentage 
  timeFrame: integer("time_frame").notNull(), // in weeks
  // Nutrition Plan
  maintenanceCalories: integer("maintenance_calories"), // BMR × 1.55
  deficitType: text("deficit_type"), // moderate (0.5kg/week) or aggressive (0.75-1kg/week)
  dailyCalorieTarget: integer("daily_calorie_target").notNull(),
  dailyDeficit: integer("daily_deficit").notNull(),
  proteinGrams: integer("protein_grams").notNull(),
  fatGrams: integer("fat_grams").notNull(),
  carbGrams: integer("carb_grams").notNull(),
  // Activity Plan
  workoutSplit: text("workout_split"), // Upper/Lower, Full Body, Push/Pull/Legs
  weightLiftingSessions: integer("weight_lifting_sessions").default(3),
  cardioSessions: integer("cardio_sessions").default(2),
  stepsPerDay: integer("steps_per_day").default(10000),
  weeklyActivityCalories: integer("weekly_activity_calories"),
  dailyActivityCalories: integer("daily_activity_calories"),
  // Adaptive Strategy
  refeedDays: integer("refeed_days").default(0), // number of higher-carb days per week
  dietBreakWeeks: integer("diet_break_weeks").default(0), // scheduled maintenance periods
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserGoalSchema = createInsertSchema(userGoals).omit({
  id: true,
  createdAt: true,
});

export type InsertUserGoal = z.infer<typeof insertUserGoalSchema>;
export type UserGoal = typeof userGoals.$inferSelect;

// Daily logs
export const dailyLogs = pgTable("daily_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  date: timestamp("date").notNull(),
  // Nutrition
  caloriesIn: integer("calories_in").notNull(),
  proteinIn: integer("protein_in"),
  fatIn: integer("fat_in"),
  carbsIn: integer("carbs_in"),
  waterIntake: real("water_intake"),
  fiberIntake: integer("fiber_intake"),
  mealTiming: text("meal_timing"), // intermittent fasting window, etc.
  isRefeedDay: boolean("is_refeed_day").default(false),
  // Exercise & Activity
  bmr: integer("bmr").notNull(),
  weightTrainingMinutes: integer("weight_training_minutes"),
  cardioMinutes: integer("cardio_minutes"),
  cardioType: text("cardio_type"), // HIIT, LISS
  stepCount: integer("step_count"),
  caloriesOut: integer("calories_out").notNull(),
  deficit: integer("deficit").notNull(),
  // Recovery & Biofeedback
  sleepHours: real("sleep_hours"),
  stressLevel: integer("stress_level"), // 1-10 scale
  energyLevel: integer("energy_level"), // 1-10 scale
  hungerLevel: integer("hunger_level"), // 1-10 scale
  exerciseIntensity: integer("exercise_intensity"), // 1-10 RPE scale
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertDailyLogSchema = createInsertSchema(dailyLogs).omit({
  id: true,
  createdAt: true,
});

export type InsertDailyLog = z.infer<typeof insertDailyLogSchema>;
export type DailyLog = typeof dailyLogs.$inferSelect;

// Body stats
export const bodyStats = pgTable("body_stats", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  date: timestamp("date").notNull(),
  // Body Composition
  weight: real("weight").notNull(),
  bodyFat: real("body_fat"),
  leanMass: real("lean_mass"),
  muscleMass: real("muscle_mass"),
  // Measurements (cm)
  waistCircumference: real("waist_circumference"),
  hipCircumference: real("hip_circumference"),
  chestCircumference: real("chest_circumference"),
  armCircumference: real("arm_circumference"),
  thighCircumference: real("thigh_circumference"),
  // Performance Metrics
  benchPressMax: real("bench_press_max"), // Strength tracking in kg
  squatMax: real("squat_max"), // Strength tracking in kg
  deadliftMax: real("deadlift_max"), // Strength tracking in kg
  // Notes
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertBodyStatSchema = createInsertSchema(bodyStats).omit({
  id: true,
  createdAt: true,
});

export type InsertBodyStat = z.infer<typeof insertBodyStatSchema>;
export type BodyStat = typeof bodyStats.$inferSelect;

// User temporary for authentication bypass
export const tempUserData = z.object({
  id: z.number().default(1),
  username: z.string().default("user"),
});

// User profile with validation
export const userProfileSchema = z.object({
  age: z.number().int().min(18).max(120),
  gender: z.enum(["male", "female"]),
  height: z.number().min(100).max(250), // cm
  weight: z.number().min(30).max(300), // kg
  bodyFatPercentage: z.number().min(3).max(60).optional(),
  leanMass: z.number().min(20).max(150).optional(), // kg
  fitnessLevel: z.enum(["beginner", "intermediate", "advanced"]).optional(),
  dietaryPreference: z.enum(["standard", "vegan", "vegetarian", "keto", "paleo", "mediterranean"]).optional(),
  trainingAccess: z.enum(["gym", "home", "both"]).optional(),
  activityLevel: z.enum(["sedentary", "lightly", "moderately", "very"]),
  healthConsiderations: z.string().optional(),
  bmr: z.number().int().optional(),
});

export type UserProfileData = z.infer<typeof userProfileSchema>;

// User goals with validation including activity data
export const userGoalSchema = z.object({
  // Weight Goals
  currentWeight: z.number().min(30).max(300),
  targetWeight: z.number().min(30).max(300),
  currentBodyFat: z.number().min(3).max(60).optional(),
  targetBodyFat: z.number().min(3).max(60).optional(),
  timeFrame: z.number().int().min(1).max(52),
  // Nutrition Plan
  maintenanceCalories: z.number().int().optional(),
  deficitType: z.enum(["moderate", "aggressive"]).optional(),
  dailyCalorieTarget: z.number().int().optional(),
  dailyDeficit: z.number().int().optional(),
  proteinGrams: z.number().int().optional(),
  fatGrams: z.number().int().optional(),
  carbGrams: z.number().int().optional(),
  // Activity Plan
  workoutSplit: z.enum(["full_body", "upper_lower", "push_pull_legs"]).optional(),
  weightLiftingSessions: z.number().int().min(0).max(7).default(3).optional(),
  cardioSessions: z.number().int().min(0).max(7).default(2).optional(),
  stepsPerDay: z.number().int().min(1000).max(25000).default(10000).optional(),
  weeklyActivityCalories: z.number().int().optional(),
  dailyActivityCalories: z.number().int().optional(),
  // Adaptive Strategy
  refeedDays: z.number().int().min(0).max(7).default(0).optional(),
  dietBreakWeeks: z.number().int().min(0).max(4).default(0).optional(),
  // Focus Areas & Preferences
  focusAreas: z.array(z.string()).optional(),
});

export type UserGoalData = z.infer<typeof userGoalSchema>;

// Daily log with validation
export const dailyLogSchema = z.object({
  date: z.date(),
  // Nutrition
  caloriesIn: z.number().int().min(0),
  proteinIn: z.number().int().min(0).optional(),
  fatIn: z.number().int().min(0).optional(),
  carbsIn: z.number().int().min(0).optional(),
  waterIntake: z.number().min(0).optional(),
  fiberIntake: z.number().int().min(0).optional(),
  mealTiming: z.string().optional(), // e.g., "16:8" for intermittent fasting
  isRefeedDay: z.boolean().optional(),
  // Exercise & Activity
  bmr: z.number().int().min(0),
  weightTrainingMinutes: z.number().int().min(0).optional(),
  cardioMinutes: z.number().int().min(0).optional(),
  cardioType: z.enum(["HIIT", "LISS", "mixed"]).optional(),
  stepCount: z.number().int().min(0).optional(),
  caloriesOut: z.number().int().min(0),
  deficit: z.number().int(),
  // Recovery & Biofeedback
  sleepHours: z.number().min(0).max(24).optional(),
  stressLevel: z.number().int().min(1).max(10).optional(),
  energyLevel: z.number().int().min(1).max(10).optional(),
  hungerLevel: z.number().int().min(1).max(10).optional(),
  exerciseIntensity: z.number().int().min(1).max(10).optional(),
  notes: z.string().optional(),
});

export type DailyLogData = z.infer<typeof dailyLogSchema>;

// Body stat with validation
export const bodyStatSchema = z.object({
  date: z.date(),
  // Body Composition
  weight: z.number().min(30).max(300),
  bodyFat: z.number().min(3).max(60).optional(),
  leanMass: z.number().min(20).max(150).optional(),
  muscleMass: z.number().min(10).max(100).optional(),
  // Measurements (cm)
  waistCircumference: z.number().min(40).max(200).optional(),
  hipCircumference: z.number().min(40).max(200).optional(),
  chestCircumference: z.number().min(40).max(200).optional(),
  armCircumference: z.number().min(20).max(100).optional(),
  thighCircumference: z.number().min(30).max(120).optional(),
  // Performance Metrics
  benchPressMax: z.number().min(0).max(500).optional(),
  squatMax: z.number().min(0).max(500).optional(),
  deadliftMax: z.number().min(0).max(500).optional(),
  // Notes
  notes: z.string().optional(),
});

export type BodyStatData = z.infer<typeof bodyStatSchema>;
