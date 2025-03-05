// Calculate BMR using the Mifflin-St Jeor formula
export function calculateBMR(
  weight: number, // in kg
  height: number, // in cm
  age: number,
  gender: 'male' | 'female'
): number {
  let bmr = 0;
  
  if (gender === 'male') {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }
  
  return Math.round(bmr);
}

// Calculate total daily energy expenditure (TDEE) based on activity level
export function calculateTDEE(bmr: number, activityLevel: string = 'moderately'): number {
  let multiplier = 1.55; // Default moderately active (our standard for most people)
  
  switch (activityLevel) {
    case 'sedentary':
      multiplier = 1.2;
      break;
    case 'lightly':
      multiplier = 1.375;
      break;
    case 'moderately':
      multiplier = 1.55;
      break;
    case 'very':
      multiplier = 1.725;
      break;
    default:
      multiplier = 1.55; // Default to moderately active
  }
  
  return Math.round(bmr * multiplier);
}

// Calculate activity calories per week
export function calculateWeeklyActivityCalories(
  weightLiftingSessions: number,
  cardioSessions: number,
  stepsPerDay: number
): number {
  // Each weight lifting session: 250 kcal
  const weightLiftingCalories = weightLiftingSessions * 250;
  
  // Each cardio session: 300 kcal
  const cardioCalories = cardioSessions * 300;
  
  // Steps: (selected steps ÷ 10,000) × 400 kcal per day × 7 days
  const stepCaloriesPerDay = (stepsPerDay / 10000) * 400;
  const stepCaloriesPerWeek = stepCaloriesPerDay * 7;
  
  return weightLiftingCalories + cardioCalories + stepCaloriesPerWeek;
}

// Calculate calorie deficit needed for weight loss with activity
export function calculateCalorieDeficit(
  currentWeight: number, // in kg
  targetWeight: number, // in kg
  timeFrameWeeks: number,
  maintenanceCalories: number, // BMR adjusted for activity level (per day)
  weightLiftingSessions: number = 0, 
  cardioSessions: number = 0,
  stepsPerDay: number = 10000
): {
  totalWeightLoss: number;
  totalCalorieDeficit: number;
  dailyCalorieDeficit: number;
  isAggressive: boolean;
  weeklyActivityCalories: number;
  dailyFoodCalorieTarget: number;
} {
  const totalWeightLoss = Math.max(0, currentWeight - targetWeight);
  
  // 7700 calories = 1 kg of fat
  const totalCalorieDeficit = totalWeightLoss * 7700;
  
  // Calculate weekly activity calories
  const weeklyActivityCalories = calculateWeeklyActivityCalories(
    weightLiftingSessions,
    cardioSessions,
    stepsPerDay
  );
  
  // Daily activity calories
  const dailyActivityCalories = weeklyActivityCalories / 7;
  
  // Calculate required daily deficit from food and activity combined
  const requiredTotalDailyDeficit = totalCalorieDeficit / (timeFrameWeeks * 7);
  
  // Cap the daily deficit at 1000 calories for health reasons
  const cappedDailyDeficit = Math.min(requiredTotalDailyDeficit, 1000);
  
  // Daily food calorie target = Maintenance - (Total Deficit - Activity Calories)
  // This ensures that activity calories contribute to the deficit
  const dailyFoodCalorieTarget = Math.round(maintenanceCalories - Math.max(0, cappedDailyDeficit - dailyActivityCalories));
  
  // Total daily deficit (food + activity)
  const dailyCalorieDeficit = Math.round(cappedDailyDeficit);
  
  // If daily deficit exceeds 1000 calories or if the original calculated deficit was >1000, it's considered aggressive
  const isAggressive = requiredTotalDailyDeficit > 1000;
  
  return {
    totalWeightLoss,
    totalCalorieDeficit,
    dailyCalorieDeficit,
    isAggressive,
    weeklyActivityCalories,
    dailyFoodCalorieTarget
  };
}

// Calculate macros based on weight and calorie target
export function calculateMacros(
  weight: number, // in kg
  dailyCalorieTarget: number
): {
  proteinGrams: number;
  fatGrams: number;
  carbGrams: number;
  proteinCalories: number;
  fatCalories: number;
  carbCalories: number;
  proteinPercentage: number;
  fatPercentage: number;
  carbPercentage: number;
} {
  // Standard macro split: 40% carbs, 30% protein, 30% fat
  // This provides a balanced approach for weight loss with adequate protein
  
  // Calculate calorie allocation for each macro
  const proteinPercentage = 30;
  const fatPercentage = 30;
  const carbPercentage = 40;
  
  const proteinCalories = Math.round(dailyCalorieTarget * (proteinPercentage / 100));
  const fatCalories = Math.round(dailyCalorieTarget * (fatPercentage / 100));
  const carbCalories = Math.round(dailyCalorieTarget * (carbPercentage / 100));
  
  // Convert calories to grams
  // Protein: 4 calories per gram
  // Fat: 9 calories per gram
  // Carbohydrates: 4 calories per gram
  const proteinGrams = Math.round(proteinCalories / 4);
  const fatGrams = Math.round(fatCalories / 9);
  const carbGrams = Math.round(carbCalories / 4);
  
  return {
    proteinGrams,
    fatGrams,
    carbGrams,
    proteinCalories,
    fatCalories,
    carbCalories,
    proteinPercentage,
    fatPercentage,
    carbPercentage
  };
}

// Calculate calories burned through exercise
export function calculateExerciseCalories(
  weightTrainingMinutes: number,
  cardioMinutes: number,
  stepCount: number
): number {
  // Estimated calorie burn:
  // Weight training: 5 cal/min
  // Cardio: 10 cal/min
  // Steps: 0.04 cal/step
  
  const weightTrainingCalories = weightTrainingMinutes * 5;
  const cardioCalories = cardioMinutes * 10;
  const stepCalories = stepCount * 0.04;
  
  return Math.round(weightTrainingCalories + cardioCalories + stepCalories);
}

// Calculate total calories out
export function calculateTotalCaloriesOut(
  bmr: number,
  exerciseCalories: number
): number {
  return bmr + exerciseCalories;
}

// Calculate calorie deficit for a day
export function calculateDailyDeficit(
  caloriesOut: number,
  caloriesIn: number
): number {
  return caloriesOut - caloriesIn;
}
