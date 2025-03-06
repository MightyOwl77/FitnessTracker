import { 
  users, type User, type InsertUser,
  userProfiles, type UserProfile, type InsertUserProfile,
  userGoals, type UserGoal, type InsertUserGoal,
  dailyLogs, type DailyLog, type InsertDailyLog,
  bodyStats, type BodyStat, type InsertBodyStat 
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";
import cache from "./lib/cache";
import logger from "./lib/logger";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // User profile operations
  getUserProfile(userId: number): Promise<UserProfile | undefined>;
  createUserProfile(profile: InsertUserProfile): Promise<UserProfile>;
  updateUserProfile(userId: number, profile: Partial<InsertUserProfile>): Promise<UserProfile | undefined>;
  
  // User goals operations
  getUserGoal(userId: number): Promise<UserGoal | undefined>;
  createUserGoal(goal: InsertUserGoal): Promise<UserGoal>;
  updateUserGoal(userId: number, goal: Partial<InsertUserGoal>): Promise<UserGoal | undefined>;
  
  // Daily logs operations
  getDailyLog(userId: number, date: Date): Promise<DailyLog | undefined>;
  getDailyLogs(userId: number, limit?: number): Promise<DailyLog[]>;
  createDailyLog(log: InsertDailyLog): Promise<DailyLog>;
  updateDailyLog(id: number, log: Partial<InsertDailyLog>): Promise<DailyLog | undefined>;
  
  // Body stats operations
  getBodyStat(userId: number, date: Date): Promise<BodyStat | undefined>;
  getBodyStats(userId: number, limit?: number): Promise<BodyStat[]>;
  createBodyStat(stat: InsertBodyStat): Promise<BodyStat>;
  updateBodyStat(id: number, stat: Partial<InsertBodyStat>): Promise<BodyStat | undefined>;
}

// Database storage implementation
export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // User profile operations
  async getUserProfile(userId: number): Promise<UserProfile | undefined> {
    // Check cache first
    const cacheKey = `profile:${userId}`;
    const cachedProfile = cache.get<UserProfile>(cacheKey);
    
    if (cachedProfile) {
      logger.debug(`Cache hit: ${cacheKey}`);
      return cachedProfile;
    }
    
    logger.debug(`Cache miss: ${cacheKey}`);
    const [profile] = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId));
    
    // Store in cache if found
    if (profile) {
      cache.set(cacheKey, profile, 600); // Cache for 10 minutes
    }
    
    return profile;
  }

  async createUserProfile(profile: InsertUserProfile): Promise<UserProfile> {
    const [userProfile] = await db.insert(userProfiles).values({
      ...profile,
      createdAt: new Date()
    }).returning();
    return userProfile;
  }

  async updateUserProfile(userId: number, profile: Partial<InsertUserProfile>): Promise<UserProfile | undefined> {
    const [existingProfile] = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId));
    if (!existingProfile) return undefined;

    const [updatedProfile] = await db.update(userProfiles)
      .set(profile)
      .where(eq(userProfiles.id, existingProfile.id))
      .returning();
    
    // Invalidate cache
    cache.del(`profile:${userId}`);
    logger.debug(`Cache invalidated: profile:${userId}`);
    
    return updatedProfile;
  }

  // User goals operations
  async getUserGoal(userId: number): Promise<UserGoal | undefined> {
    // Check cache first
    const cacheKey = `goal:${userId}`;
    const cachedGoal = cache.get<UserGoal>(cacheKey);
    
    if (cachedGoal) {
      logger.debug(`Cache hit: ${cacheKey}`);
      return cachedGoal;
    }
    
    logger.debug(`Cache miss: ${cacheKey}`);
    const [goal] = await db.select().from(userGoals).where(eq(userGoals.userId, userId));
    
    // Store in cache if found
    if (goal) {
      cache.set(cacheKey, goal, 600); // Cache for 10 minutes
    }
    
    return goal;
  }

  async createUserGoal(goal: InsertUserGoal): Promise<UserGoal> {
    const [userGoal] = await db.insert(userGoals).values({
      ...goal,
      createdAt: new Date()
    }).returning();
    return userGoal;
  }

  async updateUserGoal(userId: number, goal: Partial<InsertUserGoal>): Promise<UserGoal | undefined> {
    try {
      const [existingGoal] = await db.select().from(userGoals).where(eq(userGoals.userId, userId));
      if (!existingGoal) {
        console.log(`No goal found for user ID: ${userId}`);
        return undefined;
      }

      const [updatedGoal] = await db.update(userGoals)
        .set(goal)
        .where(eq(userGoals.id, existingGoal.id))
        .returning();
      
      return updatedGoal;
    } catch (error) {
      console.error(`Error updating goal for user ID: ${userId}`, error);
      throw error;
    }
  }

  // Daily logs operations
  async getDailyLog(userId: number, date: Date): Promise<DailyLog | undefined> {
    // This is a simplified approach - get all logs for the user and filter in JavaScript
    // While not as efficient as doing it in the database, it's more compatible with 
    // different database systems and avoids type issues
    const dateStr = date.toISOString().split('T')[0];
    
    const logs = await db.select().from(dailyLogs).where(eq(dailyLogs.userId, userId));
    
    // Find the log that matches the date (comparing just the date part YYYY-MM-DD)
    const matchingLog = logs.find(log => {
      const logDateStr = log.date.toISOString().split('T')[0];
      return logDateStr === dateStr;
    });
    
    return matchingLog;
  }

  async getDailyLogs(userId: number, limit?: number): Promise<DailyLog[]> {
    const query = db.select()
      .from(dailyLogs)
      .where(eq(dailyLogs.userId, userId))
      .orderBy(desc(dailyLogs.date));
    
    if (limit) {
      query.limit(limit);
    }
    
    return await query;
  }

  async createDailyLog(log: InsertDailyLog): Promise<DailyLog> {
    const [dailyLog] = await db.insert(dailyLogs).values({
      ...log,
      createdAt: new Date()
    }).returning();
    
    return dailyLog;
  }

  async updateDailyLog(id: number, log: Partial<InsertDailyLog>): Promise<DailyLog | undefined> {
    const [updatedLog] = await db.update(dailyLogs)
      .set(log)
      .where(eq(dailyLogs.id, id))
      .returning();
      
    return updatedLog;
  }

  // Body stats operations
  async getBodyStat(userId: number, date: Date): Promise<BodyStat | undefined> {
    // Using the same approach as getDailyLog for consistency and compatibility
    const dateStr = date.toISOString().split('T')[0];
    
    const stats = await db.select().from(bodyStats).where(eq(bodyStats.userId, userId));
    
    // Find the stat that matches the date (comparing just the date part YYYY-MM-DD)
    const matchingStat = stats.find(stat => {
      const statDateStr = stat.date.toISOString().split('T')[0];
      return statDateStr === dateStr;
    });
    
    return matchingStat;
  }

  async getBodyStats(userId: number, limit?: number): Promise<BodyStat[]> {
    const query = db.select()
      .from(bodyStats)
      .where(eq(bodyStats.userId, userId))
      .orderBy(desc(bodyStats.date));
    
    if (limit) {
      query.limit(limit);
    }
    
    return await query;
  }

  async createBodyStat(stat: InsertBodyStat): Promise<BodyStat> {
    const [bodyStat] = await db.insert(bodyStats).values({
      ...stat,
      createdAt: new Date()
    }).returning();
    
    return bodyStat;
  }

  async updateBodyStat(id: number, stat: Partial<InsertBodyStat>): Promise<BodyStat | undefined> {
    const [updatedStat] = await db.update(bodyStats)
      .set(stat)
      .where(eq(bodyStats.id, id))
      .returning();
      
    return updatedStat;
  }
}

// Memory storage for backwards compatibility
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private userProfiles: Map<number, UserProfile>;
  private userGoals: Map<number, UserGoal>;
  private dailyLogs: Map<number, DailyLog>;
  private bodyStats: Map<number, BodyStat>;
  
  private currentId: { 
    users: number; 
    userProfiles: number; 
    userGoals: number; 
    dailyLogs: number; 
    bodyStats: number; 
  };

  constructor() {
    this.resetStorage();
  }
  
  // Reset all storage data
  resetStorage() {
    this.users = new Map();
    this.userProfiles = new Map();
    this.userGoals = new Map();
    this.dailyLogs = new Map();
    this.bodyStats = new Map();
    
    this.currentId = {
      users: 1,
      userProfiles: 1,
      userGoals: 1,
      dailyLogs: 1,
      bodyStats: 1,
    };

    // Create a default user for development
    this.createUser({ username: "user", password: "password" });
    
    // Create default profile data for development
    this.createUserProfile({
      userId: 1,
      age: 30,
      gender: "male",
      height: 175,
      weight: 80,
      bodyFatPercentage: 20,
      activityLevel: "moderately",
      bmr: 1800,
    });
    
    // Create default goal data for development
    this.createUserGoal({
      userId: 1,
      currentWeight: 80,
      targetWeight: 75,
      timeFrame: 12,
      dailyCalorieTarget: 2000,
      dailyDeficit: 500,
      proteinGrams: 160,
      fatGrams: 60,
      carbGrams: 200,
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId.users++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // User profile operations
  async getUserProfile(userId: number): Promise<UserProfile | undefined> {
    return Array.from(this.userProfiles.values()).find(
      (profile) => profile.userId === userId,
    );
  }

  async createUserProfile(profile: InsertUserProfile): Promise<UserProfile> {
    const id = this.currentId.userProfiles++;
    const createdAt = new Date();
    const userProfile: UserProfile = { ...profile, id, createdAt };
    this.userProfiles.set(id, userProfile);
    return userProfile;
  }

  async updateUserProfile(userId: number, profile: Partial<InsertUserProfile>): Promise<UserProfile | undefined> {
    const existingProfile = await this.getUserProfile(userId);
    if (!existingProfile) return undefined;

    const updatedProfile: UserProfile = { ...existingProfile, ...profile };
    this.userProfiles.set(existingProfile.id, updatedProfile);
    return updatedProfile;
  }

  // User goals operations
  async getUserGoal(userId: number): Promise<UserGoal | undefined> {
    return Array.from(this.userGoals.values()).find(
      (goal) => goal.userId === userId,
    );
  }

  async createUserGoal(goal: InsertUserGoal): Promise<UserGoal> {
    const id = this.currentId.userGoals++;
    const createdAt = new Date();
    const userGoal: UserGoal = { ...goal, id, createdAt };
    this.userGoals.set(id, userGoal);
    return userGoal;
  }

  async updateUserGoal(userId: number, goal: Partial<InsertUserGoal>): Promise<UserGoal | undefined> {
    try {
      const existingGoal = await this.getUserGoal(userId);
      if (!existingGoal) {
        console.log(`No goal found for user ID: ${userId}`);
        return undefined;
      }

      const updatedGoal: UserGoal = { ...existingGoal, ...goal };
      this.userGoals.set(existingGoal.id, updatedGoal);
      return updatedGoal;
    } catch (error) {
      console.error(`Error updating goal for user ID: ${userId}`, error);
      throw error;
    }
  }

  // Daily logs operations
  async getDailyLog(userId: number, date: Date): Promise<DailyLog | undefined> {
    const dateStr = date.toISOString().split('T')[0];
    
    return Array.from(this.dailyLogs.values()).find(
      (log) => log.userId === userId && log.date.toISOString().split('T')[0] === dateStr,
    );
  }

  async getDailyLogs(userId: number, limit?: number): Promise<DailyLog[]> {
    const logs = Array.from(this.dailyLogs.values())
      .filter((log) => log.userId === userId)
      .sort((a, b) => b.date.getTime() - a.date.getTime());
    
    return limit ? logs.slice(0, limit) : logs;
  }

  async createDailyLog(log: InsertDailyLog): Promise<DailyLog> {
    const id = this.currentId.dailyLogs++;
    const createdAt = new Date();
    const dailyLog: DailyLog = { ...log, id, createdAt };
    this.dailyLogs.set(id, dailyLog);
    return dailyLog;
  }

  async updateDailyLog(id: number, log: Partial<InsertDailyLog>): Promise<DailyLog | undefined> {
    const existingLog = this.dailyLogs.get(id);
    if (!existingLog) return undefined;

    const updatedLog: DailyLog = { ...existingLog, ...log };
    this.dailyLogs.set(id, updatedLog);
    return updatedLog;
  }

  // Body stats operations
  async getBodyStat(userId: number, date: Date): Promise<BodyStat | undefined> {
    const dateStr = date.toISOString().split('T')[0];
    
    return Array.from(this.bodyStats.values()).find(
      (stat) => stat.userId === userId && stat.date.toISOString().split('T')[0] === dateStr,
    );
  }

  async getBodyStats(userId: number, limit?: number): Promise<BodyStat[]> {
    const stats = Array.from(this.bodyStats.values())
      .filter((stat) => stat.userId === userId)
      .sort((a, b) => b.date.getTime() - a.date.getTime());
    
    return limit ? stats.slice(0, limit) : stats;
  }

  async createBodyStat(stat: InsertBodyStat): Promise<BodyStat> {
    const id = this.currentId.bodyStats++;
    const createdAt = new Date();
    const bodyStat: BodyStat = { ...stat, id, createdAt };
    this.bodyStats.set(id, bodyStat);
    return bodyStat;
  }

  async updateBodyStat(id: number, stat: Partial<InsertBodyStat>): Promise<BodyStat | undefined> {
    const existingStat = this.bodyStats.get(id);
    if (!existingStat) return undefined;

    const updatedStat: BodyStat = { ...existingStat, ...stat };
    this.bodyStats.set(id, updatedStat);
    return updatedStat;
  }
}

// Use the database storage now
export const storage = new DatabaseStorage();
