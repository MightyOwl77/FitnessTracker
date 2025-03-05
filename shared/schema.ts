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
  activityLevel: text("activity_level").notNull(),
  bmr: integer("bmr").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserProfileSchema = createInsertSchema(userProfiles).omit({
  id: true,
  createdAt: true,
});

export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;
export type UserProfile = typeof userProfiles.$inferSelect;

// User goals
export const userGoals = pgTable("user_goals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  currentWeight: real("current_weight").notNull(),
  targetWeight: real("target_weight").notNull(),
  timeFrame: integer("time_frame").notNull(), // in weeks
  dailyCalorieTarget: integer("daily_calorie_target").notNull(),
  dailyDeficit: integer("daily_deficit").notNull(),
  proteinGrams: integer("protein_grams").notNull(),
  fatGrams: integer("fat_grams").notNull(),
  carbGrams: integer("carb_grams").notNull(),
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
  caloriesIn: integer("calories_in").notNull(),
  proteinIn: integer("protein_in"),
  fatIn: integer("fat_in"),
  carbsIn: integer("carbs_in"),
  waterIntake: real("water_intake"),
  fiberIntake: integer("fiber_intake"),
  bmr: integer("bmr").notNull(),
  weightTrainingMinutes: integer("weight_training_minutes"),
  cardioMinutes: integer("cardio_minutes"),
  stepCount: integer("step_count"),
  caloriesOut: integer("calories_out").notNull(),
  deficit: integer("deficit").notNull(),
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
  weight: real("weight").notNull(),
  bodyFat: real("body_fat"),
  muscleMass: real("muscle_mass"),
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
  height: z.number().min(100).max(250),
  weight: z.number().min(30).max(300),
  activityLevel: z.enum(["sedentary", "lightly", "moderately", "very"]),
  bmr: z.number().int().optional(),
});

export type UserProfileData = z.infer<typeof userProfileSchema>;

// User goals with validation
export const userGoalSchema = z.object({
  currentWeight: z.number().min(30).max(300),
  targetWeight: z.number().min(30).max(300),
  timeFrame: z.number().int().min(4).max(52),
  dailyCalorieTarget: z.number().int().optional(),
  dailyDeficit: z.number().int().optional(),
  proteinGrams: z.number().int().optional(),
  fatGrams: z.number().int().optional(),
  carbGrams: z.number().int().optional(),
});

export type UserGoalData = z.infer<typeof userGoalSchema>;

// Daily log with validation
export const dailyLogSchema = z.object({
  date: z.date(),
  caloriesIn: z.number().int().min(0),
  proteinIn: z.number().int().min(0).optional(),
  fatIn: z.number().int().min(0).optional(),
  carbsIn: z.number().int().min(0).optional(),
  waterIntake: z.number().min(0).optional(),
  fiberIntake: z.number().int().min(0).optional(),
  bmr: z.number().int().min(0),
  weightTrainingMinutes: z.number().int().min(0).optional(),
  cardioMinutes: z.number().int().min(0).optional(),
  stepCount: z.number().int().min(0).optional(),
  caloriesOut: z.number().int().min(0),
  deficit: z.number().int(),
});

export type DailyLogData = z.infer<typeof dailyLogSchema>;

// Body stat with validation
export const bodyStatSchema = z.object({
  date: z.date(),
  weight: z.number().min(30).max(300),
  bodyFat: z.number().min(3).max(60).optional(),
  muscleMass: z.number().min(10).max(100).optional(),
  notes: z.string().optional(),
});

export type BodyStatData = z.infer<typeof bodyStatSchema>;
