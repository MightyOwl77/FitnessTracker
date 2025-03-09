import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { 
  UserProfileData,
  UserGoalData,
  DailyLogData,
  BodyStatData
} from "../../shared/schema";

export function useUserProfile() {
  const { toast } = useToast();
  
  // Default values for user profile
  const defaultProfile: UserProfileData = {
    age: 30,
    gender: "male",
    height: 175,
    weight: 75,
    activityLevel: "moderately",
    bodyFatPercentage: undefined,
    fitnessLevel: "intermediate",
    dietaryPreference: "standard",
    trainingAccess: "both",
    healthConsiderations: "",
    bmr: undefined
  };
  
  // Fetch user profile
  const profileQuery = useQuery<UserProfileData>({
    queryKey: ["/api/profile"],
    retry: false,
  });
  
  // Create or update user profile
  const profileMutation = useMutation({
    mutationFn: async (data: UserProfileData) => {
      const res = await apiRequest("POST", "/api/profile", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      toast({
        title: "Profile saved",
        description: "Your profile has been updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error saving profile",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    },
  });
  
  return { 
    profileData: profileQuery.data || defaultProfile, 
    isLoading: profileQuery.isLoading,
    isError: profileQuery.isError,
    saveProfile: profileMutation.mutate,
    isSaving: profileMutation.isPending
  };
}

export function useUserGoal() {
  const { toast } = useToast();
  
  // Default values for user goals
  const defaultGoal: UserGoalData = {
    currentWeight: 80,
    targetWeight: 70,
    currentBodyFat: 25,
    targetBodyFat: 15,
    timeFrame: 12,
    deficitRate: 0.5,
    maintenanceCalories: undefined,
    deficitType: "moderate",
    dailyCalorieTarget: undefined,
    dailyDeficit: undefined,
    actualDailyDeficit: undefined,
    weeklyDeficit: undefined,
    proteinGrams: undefined,
    fatGrams: undefined,
    carbGrams: undefined,
    workoutSplit: "full_body",
    weightLiftingSessions: 3,
    cardioSessions: 2,
    stepsPerDay: 10000,
    weeklyActivityCalories: undefined,
    dailyActivityCalories: undefined,
    refeedDays: 0,
    dietBreakWeeks: 0,
    projectedWeeklyLoss: undefined
  };
  
  // Fetch user goal
  const goalQuery = useQuery<UserGoalData>({
    queryKey: ["/api/goals"],
    retry: false
  });
  
  // Create or update user goal
  const goalMutation = useMutation({
    mutationFn: async (data: UserGoalData) => {
      const res = await apiRequest("POST", "/api/goals", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      toast({
        title: "Goal saved",
        description: "Your goals have been updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error saving goal",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    },
  });
  
  return { 
    goalData: goalQuery.data || defaultGoal, 
    isLoading: goalQuery.isLoading,
    isError: goalQuery.isError,
    saveGoal: goalMutation.mutate,
    isSaving: goalMutation.isPending
  };
}

export function useDailyLog(date?: Date) {
  const { toast } = useToast();
  const formattedDate = date ? date.toISOString().split('T')[0] : undefined;
  
  // Default daily log data
  const defaultLog: DailyLogData = {
    date: new Date(),
    caloriesIn: 0,
    proteinIn: 0,
    fatIn: 0,
    carbsIn: 0,
    waterIntake: 0,
    fiberIntake: 0,
    mealTiming: "16:8",
    isRefeedDay: false,
    bmr: 1800,
    weightTrainingMinutes: 0,
    cardioMinutes: 0,
    cardioType: "mixed",
    stepCount: 0,
    caloriesOut: 0,
    deficit: 0,
    sleepHours: 8,
    stressLevel: 5,
    energyLevel: 7,
    hungerLevel: 5,
    exerciseIntensity: 7,
    notes: ""
  };
  
  // Fetch daily log for specific date
  const logQuery = useQuery<DailyLogData>({
    queryKey: formattedDate ? [`/api/logs/${formattedDate}`] : ["/api/logs"],
    retry: false,
    enabled: !!formattedDate
  });
  
  // Fetch all logs
  const logsQuery = useQuery<DailyLogData[]>({
    queryKey: ["/api/logs"],
    retry: false
  });
  
  // Create or update daily log
  const logMutation = useMutation({
    mutationFn: async (data: DailyLogData) => {
      const res = await apiRequest("POST", "/api/logs", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/logs"] });
      if (formattedDate) {
        queryClient.invalidateQueries({ queryKey: [`/api/logs/${formattedDate}`] });
      }
      toast({
        title: "Log saved",
        description: "Your daily log has been saved successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error saving log",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    },
  });
  
  return { 
    logData: logQuery.data || (date ? {...defaultLog, date} : defaultLog), 
    logsData: logsQuery.data || [],
    isLoading: logQuery.isLoading,
    isLogsLoading: logsQuery.isLoading,
    isError: logQuery.isError,
    saveLog: logMutation.mutate,
    isSaving: logMutation.isPending
  };
}

export function useBodyStats(date?: Date) {
  const { toast } = useToast();
  const formattedDate = date ? date.toISOString().split('T')[0] : undefined;
  
  // Default body stats data
  const defaultStat: BodyStatData = {
    date: new Date(),
    weight: 75,
    bodyFat: undefined,
    leanMass: undefined,
    muscleMass: undefined,
    waistCircumference: undefined,
    hipCircumference: undefined,
    chestCircumference: undefined,
    armCircumference: undefined,
    thighCircumference: undefined,
    benchPressMax: undefined,
    squatMax: undefined,
    deadliftMax: undefined,
    notes: ""
  };
  
  // Fetch body stats for specific date
  const statQuery = useQuery<BodyStatData>({
    queryKey: formattedDate ? [`/api/stats/${formattedDate}`] : ["/api/stats"],
    retry: false,
    enabled: !!formattedDate
  });
  
  // Fetch all stats
  const statsQuery = useQuery<BodyStatData[]>({
    queryKey: ["/api/stats"],
    retry: false
  });
  
  // Create or update body stats
  const statMutation = useMutation({
    mutationFn: async (data: BodyStatData) => {
      const res = await apiRequest("POST", "/api/stats", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      if (formattedDate) {
        queryClient.invalidateQueries({ queryKey: [`/api/stats/${formattedDate}`] });
      }
      toast({
        title: "Stats saved",
        description: "Your body stats have been saved successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error saving stats",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    },
  });
  
  return { 
    statData: statQuery.data || (date ? {...defaultStat, date} : defaultStat), 
    statsData: statsQuery.data || [],
    isLoading: statQuery.isLoading,
    isStatsLoading: statsQuery.isLoading,
    isError: statQuery.isError,
    saveStat: statMutation.mutate,
    isSaving: statMutation.isPending
  };
}
