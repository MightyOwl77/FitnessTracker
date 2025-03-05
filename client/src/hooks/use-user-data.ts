import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { 
  UserProfileData,
  UserGoalData,
  DailyLogData,
  BodyStatData
} from "@shared/schema";

export function useUserProfile() {
  const { toast } = useToast();
  
  // Fetch user profile
  const profileQuery = useQuery({
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
    profileData: profileQuery.data, 
    isLoading: profileQuery.isLoading,
    isError: profileQuery.isError,
    saveProfile: profileMutation.mutate,
    isSaving: profileMutation.isPending
  };
}

export function useUserGoal() {
  const { toast } = useToast();
  
  // Fetch user goal
  const goalQuery = useQuery({
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
    goalData: goalQuery.data, 
    isLoading: goalQuery.isLoading,
    isError: goalQuery.isError,
    saveGoal: goalMutation.mutate,
    isSaving: goalMutation.isPending
  };
}

export function useDailyLog(date?: Date) {
  const { toast } = useToast();
  const formattedDate = date ? date.toISOString().split('T')[0] : undefined;
  
  // Fetch daily log for specific date
  const logQuery = useQuery({
    queryKey: formattedDate ? [`/api/logs/${formattedDate}`] : ["/api/logs"],
    retry: false,
    enabled: !!formattedDate
  });
  
  // Fetch all logs
  const logsQuery = useQuery({
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
    logData: logQuery.data, 
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
  
  // Fetch body stats for specific date
  const statQuery = useQuery({
    queryKey: formattedDate ? [`/api/stats/${formattedDate}`] : ["/api/stats"],
    retry: false,
    enabled: !!formattedDate
  });
  
  // Fetch all stats
  const statsQuery = useQuery({
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
    statData: statQuery.data, 
    statsData: statsQuery.data || [],
    isLoading: statQuery.isLoading,
    isStatsLoading: statsQuery.isLoading,
    isError: statQuery.isError,
    saveStat: statMutation.mutate,
    isSaving: statMutation.isPending
  };
}
