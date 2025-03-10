import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useLocalStorage } from "@/lib/hooks";

// Define the context interface for all user-related data
interface UserData {
  // Profile data
  gender: string;
  age: number;
  height: number; // in cm
  weight: number; // in kg
  activityLevel: string;
  
  // Goals data
  targetWeight: number;
  weeklyLossRate: number;
  timeFrame: number;
  dietPreference: string;
  
  // Deficit plan data
  deficitLevel: string;
  deficitPercentage: number;
  dailyDeficit: number;
  maintenanceCalories: number;
  calorieTarget: number;
  
  // Preferences
  notificationPreference: string[];
  mealPreference: string;
  workoutPreference: string;
  trackingFrequency: string;
}

interface UserDataContextType {
  userData: Partial<UserData>;
  updateUserData: (data: Partial<UserData>) => void;
  clearUserData: () => void;
  isDataLoaded: boolean;
}

// Create the context with default values
const defaultUserData: Partial<UserData> = {};

const UserDataContext = createContext<UserDataContextType>({
  userData: defaultUserData,
  updateUserData: () => {},
  clearUserData: () => {},
  isDataLoaded: false
});

// Custom hook to use the user data context
export function useUserData() {
  return useContext(UserDataContext);
}

interface UserDataProviderProps {
  children: ReactNode;
}

// Provider component
export function UserDataProvider({ children }: UserDataProviderProps) {
  // Use localStorage hook to persist user data
  const [storedUserData, setStoredUserData] = useLocalStorage<Partial<UserData>>(
    "fitness_user_data",
    defaultUserData
  );
  
  const [userData, setUserData] = useState<Partial<UserData>>(storedUserData || defaultUserData);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  
  // Sync with localStorage when userData changes
  useEffect(() => {
    setStoredUserData(userData);
  }, [userData, setStoredUserData]);
  
  // Load data from localStorage on initial render
  useEffect(() => {
    if (storedUserData && Object.keys(storedUserData).length > 0) {
      setUserData(storedUserData);
    }
    setIsDataLoaded(true);
  }, [storedUserData]);
  
  // Update user data - merges new data with existing data
  const updateUserData = (data: Partial<UserData>) => {
    setUserData(prevData => ({
      ...prevData,
      ...data
    }));
    console.log("User data updated:", data);
  };
  
  // Clear all user data
  const clearUserData = () => {
    setUserData(defaultUserData);
    setStoredUserData(defaultUserData);
    console.log("User data cleared");
  };
  
  // Calculate derived values whenever userData changes
  useEffect(() => {
    // Only run calculations if we have the required base data
    if (userData.weight && userData.activityLevel && userData.gender && userData.height && userData.age) {
      // This is where we would calculate derived values like BMR, TDEE, etc.
      // We can expand this later
      console.log("User data is complete enough for calculations");
    }
  }, [userData]);
  
  return (
    <UserDataContext.Provider 
      value={{ 
        userData, 
        updateUserData, 
        clearUserData,
        isDataLoaded
      }}
    >
      {children}
    </UserDataContext.Provider>
  );
}

// Helper functions that can be used with the context
export const calculateBMR = (
  weight: number, 
  height: number, 
  age: number, 
  gender: string
): number => {
  // Mifflin-St Jeor Equation
  if (gender === "male") {
    return (10 * weight) + (6.25 * height) - (5 * age) + 5;
  } else {
    return (10 * weight) + (6.25 * height) - (5 * age) - 161;
  }
};

export const calculateTDEE = (bmr: number, activityLevel: string): number => {
  const activityMultipliers: Record<string, number> = {
    "sedentary": 1.2,
    "light": 1.375,
    "moderate": 1.55,
    "active": 1.725,
    "very-active": 1.9
  };
  
  const multiplier = activityMultipliers[activityLevel] || 1.2;
  return Math.round(bmr * multiplier);
};

export const calculateDeficitCalories = (
  tdee: number,
  deficitPercentage: number
): number => {
  return Math.round(tdee * (deficitPercentage / 100));
};

export const calculateCalorieTarget = (
  tdee: number,
  deficitCalories: number
): number => {
  return Math.round(tdee - deficitCalories);
};

export const calculateWeeklyWeightLoss = (
  dailyDeficit: number
): number => {
  // 7700 calories = 1kg of fat
  return (dailyDeficit * 7) / 7700;
};

export const calculateTimeToGoal = (
  currentWeight: number,
  targetWeight: number,
  weeklyLossRate: number
): number => {
  if (weeklyLossRate <= 0) return 0;
  const weightToLose = currentWeight - targetWeight;
  if (weightToLose <= 0) return 0;
  return Math.ceil(weightToLose / weeklyLossRate);
};