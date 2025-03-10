import { useUserData as useUserDataContext } from '@/contexts/user-data-context';

/**
 * Custom hook that simplifies accessing the UserData context throughout the application
 * This is a convenience wrapper around the useUserData function from the context
 */
export function useUserData() {
  // Use the context directly
  return useUserDataContext();
}

/**
 * Hook for accessing user profile data specifically
 * Provides a focused view of just the profile-related data
 */
export function useUserProfile() {
  const { userData, updateUserData, isDataLoaded } = useUserData();
  
  // Extract just the profile-related properties
  const profileData = {
    gender: userData.gender,
    age: userData.age,
    height: userData.height,
    weight: userData.weight,
    bodyFatPercentage: userData.bodyFatPercentage,
    activityLevel: userData.activityLevel
  };
  
  // Update function that only updates profile properties
  const updateProfile = (newProfileData: Partial<typeof profileData>) => {
    updateUserData(newProfileData);
  };
  
  return {
    profileData,
    updateProfile,
    isLoaded: isDataLoaded
  };
}

/**
 * Hook for accessing user goals data specifically
 * Provides a focused view of just the goals-related data
 */
export function useUserGoals() {
  const { userData, updateUserData, isDataLoaded } = useUserData();
  
  // Extract just the goals-related properties
  const goalsData = {
    targetWeight: userData.targetWeight,
    weeklyLossRate: userData.weeklyLossRate,
    timeFrame: userData.timeFrame,
    fitnessGoal: userData.fitnessGoal,
    dietPreference: userData.dietPreference
  };
  
  // Update function that only updates goals properties
  const updateGoals = (newGoalsData: Partial<typeof goalsData>) => {
    updateUserData(newGoalsData);
  };
  
  return {
    goalsData,
    updateGoals,
    isLoaded: isDataLoaded
  };
}

/**
 * Compatibility alias for useUserGoals for existing code
 * This ensures backward compatibility with components using useUserGoal
 */
export function useUserGoal() {
  // Get the real user data context at the highest level
  const { userData, updateUserData, isDataLoaded } = useUserDataContext();
  
  // Create the goalData expected by existing components
  const goalData = {
    targetWeight: userData.targetWeight,
    weeklyLossRate: userData.weeklyLossRate,
    timeFrame: userData.timeFrame,
    fitnessGoal: userData.fitnessGoal,
    dietPreference: userData.dietPreference,
    dailyCalorieTarget: userData.calorieTarget,
    maintenanceCalories: userData.maintenanceCalories,
    dailyDeficit: userData.dailyDeficit,
    deficitRate: userData.deficitPercentage ? userData.deficitPercentage / 100 : undefined
  };
  
  // Wrap updateUserData to match the expected saveGoal signature
  const saveGoal = async (newGoalData: any) => {
    updateUserData(newGoalData);
    return true;
  };
  
  return {
    goalData,
    saveGoal,
    isLoading: !isDataLoaded,
    isError: false
  };
}

/**
 * Hook for accessing user diet data specifically
 * Provides a focused view of just the diet-related data
 */
export function useUserDiet() {
  const { userData, updateUserData, isDataLoaded } = useUserData();
  
  // Extract just the diet-related properties
  const dietData = {
    calorieTarget: userData.calorieTarget,
    deficitLevel: userData.deficitLevel,
    deficitPercentage: userData.deficitPercentage,
    dailyDeficit: userData.dailyDeficit,
    mealPreference: userData.mealPreference,
    macros: userData.macros
  };
  
  // Update function that only updates diet properties
  const updateDiet = (newDietData: Partial<typeof dietData>) => {
    updateUserData(newDietData);
  };
  
  return {
    dietData,
    updateDiet,
    isLoaded: isDataLoaded
  };
}

/**
 * Hook for accessing user workout data specifically
 * Provides a focused view of just the workout-related data
 */
export function useUserWorkout() {
  const { userData, updateUserData, isDataLoaded } = useUserData();
  
  // Extract just the workout-related properties
  const workoutData = {
    workoutPreference: userData.workoutPreference,
    exerciseExperience: userData.exerciseExperience,
    preferredExercises: userData.preferredExercises
  };
  
  // Update function that only updates workout properties
  const updateWorkout = (newWorkoutData: Partial<typeof workoutData>) => {
    updateUserData(newWorkoutData);
  };
  
  return {
    workoutData,
    updateWorkout,
    isLoaded: isDataLoaded
  };
}

export default useUserData;