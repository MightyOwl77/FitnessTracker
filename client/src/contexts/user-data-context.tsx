import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define the structure of user data 
export interface UserData {
  // Basic user info
  gender: string;
  age: number;
  height: number; // in cm
  weight: number; // in kg
  bodyFatPercentage?: number;
  activityLevel: string;
  
  // Fitness goals
  targetWeight: number;
  weeklyLossRate: number; // in kg
  timeFrame: number; // in weeks
  dietPreference: string;
  fitnessGoal: string; // "weight_loss", "muscle_gain", "maintenance", etc.
  
  // Deficit plan data
  deficitLevel: string; // "light", "moderate", "aggressive"
  deficitPercentage: number;
  dailyDeficit: number;
  maintenanceCalories: number;
  calorieTarget: number;
  
  // Calculated values
  bmr?: number;
  tdee?: number;
  macros?: {
    protein: number; // in grams
    carbs: number; // in grams
    fat: number; // in grams
  };
  
  // Preferences
  notificationPreference: string[];
  mealPreference: string;
  workoutPreference: string;
  trackingFrequency: string;
  
  // Exercise history
  exerciseExperience?: string;
  preferredExercises?: string[];
  
  // Onboarding completion
  completedSteps?: string[];
}

// Define the context type
interface UserDataContextType {
  userData: Partial<UserData>;
  updateUserData: (data: Partial<UserData>) => void;
  clearUserData: () => void;
  isDataLoaded: boolean;
  hasCompletedOnboarding: () => boolean;
  hasCompletedStep: (step: string) => boolean;
  markStepComplete: (step: string) => void;
}

// Create context with default values
const defaultContext: UserDataContextType = {
  userData: {},
  updateUserData: () => {},
  clearUserData: () => {},
  isDataLoaded: false,
  hasCompletedOnboarding: () => false,
  hasCompletedStep: () => false,
  markStepComplete: () => {}
};

// Create the context
const UserDataContext = createContext<UserDataContextType>(defaultContext);

// Create custom hook for easy usage
export function useUserData() {
  return useContext(UserDataContext);
}

// Provider component props
interface UserDataProviderProps {
  children: ReactNode;
}

// Provider component
export function UserDataProvider({ children }: UserDataProviderProps) {
  // State to hold user data
  const [userData, setUserData] = useState<Partial<UserData>>({});
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  
  // Load data from localStorage on initial render
  useEffect(() => {
    const savedData = localStorage.getItem('user_data');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setUserData(parsedData);
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error);
      }
    }
    setIsDataLoaded(true);
  }, []);
  
  // Save to localStorage whenever data changes
  useEffect(() => {
    if (isDataLoaded && Object.keys(userData).length > 0) {
      localStorage.setItem('user_data', JSON.stringify(userData));
    }
  }, [userData, isDataLoaded]);
  
  // Function to update user data
  const updateUserData = (newData: Partial<UserData>) => {
    setUserData(prevData => {
      const updatedData = { ...prevData, ...newData };
      return updatedData;
    });
  };
  
  // Function to clear user data
  const clearUserData = () => {
    setUserData({});
    localStorage.removeItem('user_data');
  };
  
  // Function to check if user has completed all onboarding
  const hasCompletedOnboarding = (): boolean => {
    const requiredSteps = [
      'profile',
      'goals',
      'diet_preferences',
      'workout_preferences'
    ];
    
    // Check if completedSteps exists and contains all required steps
    const completedSteps = userData.completedSteps || [];
    return requiredSteps.every(step => completedSteps.includes(step));
  };
  
  // Function to check if a specific step is completed
  const hasCompletedStep = (step: string): boolean => {
    const completedSteps = userData.completedSteps || [];
    return completedSteps.includes(step);
  };
  
  // Function to mark a step as complete
  const markStepComplete = (step: string) => {
    setUserData(prevData => {
      const completedSteps = [...(prevData.completedSteps || [])];
      if (!completedSteps.includes(step)) {
        completedSteps.push(step);
      }
      return { ...prevData, completedSteps };
    });
  };
  
  // Calculate additional derived values
  useEffect(() => {
    if (userData.gender && userData.age && userData.height && userData.weight && userData.activityLevel) {
      // Calculate BMR using Harris-Benedict equation
      const calculatedBMR = calculateBMR(
        userData.weight,
        userData.height, 
        userData.age, 
        userData.gender
      );
      
      // Calculate TDEE (Total Daily Energy Expenditure)
      const calculatedTDEE = calculateTDEE(calculatedBMR, userData.activityLevel);
      
      // Only update if values changed to prevent infinite loops
      if (calculatedBMR !== userData.bmr || calculatedTDEE !== userData.tdee) {
        updateUserData({
          bmr: calculatedBMR,
          tdee: calculatedTDEE
        });
      }
    }
  }, [userData.gender, userData.age, userData.height, userData.weight, userData.activityLevel]);
  
  // Provide the context value
  const contextValue: UserDataContextType = {
    userData,
    updateUserData,
    clearUserData,
    isDataLoaded,
    hasCompletedOnboarding,
    hasCompletedStep,
    markStepComplete
  };
  
  return (
    <UserDataContext.Provider value={contextValue}>
      {children}
    </UserDataContext.Provider>
  );
}

// Utility functions for calculations
export const calculateBMR = (
  weight: number, 
  height: number, 
  age: number, 
  gender: string
): number => {
  // Harris-Benedict equation
  if (gender === 'male') {
    return Math.round(88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age));
  } else {
    return Math.round(447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age));
  }
};

export const calculateTDEE = (bmr: number, activityLevel: string): number => {
  // Multipliers based on activity level
  const multipliers = {
    sedentary: 1.2, // Little or no exercise
    lightly: 1.375, // Light exercise 1-3 days/week
    moderately: 1.55, // Moderate exercise 3-5 days/week
    very: 1.725, // Hard exercise 6-7 days/week
    extremely: 1.9 // Very hard exercise, physical job or training twice a day
  };
  
  const level = activityLevel as keyof typeof multipliers;
  return Math.round(bmr * multipliers[level] || bmr * 1.2);
};

export const calculateDeficitCalories = (
  tdee: number, 
  deficitPercentage: number
): number => {
  return Math.round((deficitPercentage / 100) * tdee);
};

export const calculateCalorieTarget = (
  tdee: number, 
  dailyDeficit: number
): number => {
  return Math.round(tdee - dailyDeficit);
};

export const calculateWeeklyWeightLoss = (
  dailyDeficit: number
): number => {
  // 7700 calories = roughly 1kg of fat
  return parseFloat(((dailyDeficit * 7) / 7700).toFixed(2));
};

export const calculateTimeToGoal = (
  currentWeight: number,
  targetWeight: number,
  weeklyLossRate: number
): number => {
  const totalWeightLoss = currentWeight - targetWeight;
  if (totalWeightLoss <= 0 || weeklyLossRate <= 0) return 0;
  return Math.ceil(totalWeightLoss / weeklyLossRate);
};

export default UserDataProvider;