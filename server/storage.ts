import { 
  users, type User, type InsertUser,
  userProfiles, type UserProfile, type InsertUserProfile,
  userGoals, type UserGoal, type InsertUserGoal,
  dailyLogs, type DailyLog, type InsertDailyLog,
  bodyStats, type BodyStat, type InsertBodyStat 
} from "@shared/schema";

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

export const storage = new MemStorage();
