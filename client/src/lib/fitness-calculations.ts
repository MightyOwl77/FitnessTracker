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
export function calculateTDEE(bmr: number, activityLevel: string): number {
  let multiplier = 1.2; // Default sedentary
  
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
      multiplier = 1.2;
  }
  
  return Math.round(bmr * multiplier);
}

// Calculate calorie deficit needed for weight loss
export function calculateCalorieDeficit(
  currentWeight: number, // in kg
  targetWeight: number, // in kg
  timeFrameWeeks: number
): {
  totalWeightLoss: number;
  totalCalorieDeficit: number;
  dailyCalorieDeficit: number;
  isAggressive: boolean;
} {
  const totalWeightLoss = Math.max(0, currentWeight - targetWeight);
  // 7700 calories = 1 kg of fat
  const totalCalorieDeficit = totalWeightLoss * 7700;
  const dailyCalorieDeficit = Math.round(totalCalorieDeficit / (timeFrameWeeks * 7));
  
  // If daily deficit exceeds 1000 calories, it's considered aggressive
  const isAggressive = dailyCalorieDeficit > 1000;
  
  return {
    totalWeightLoss,
    totalCalorieDeficit,
    dailyCalorieDeficit,
    isAggressive
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
  // Protein: 1.6g/kg of body weight
  const proteinGrams = Math.round(1.6 * weight);
  // Fats: 0.8g/kg of body weight
  const fatGrams = Math.round(0.8 * weight);
  
  // Calculate calories from protein and fat
  const proteinCalories = proteinGrams * 4;
  const fatCalories = fatGrams * 9;
  
  // Remaining calories from carbs
  const carbCalories = Math.max(0, dailyCalorieTarget - proteinCalories - fatCalories);
  const carbGrams = Math.round(carbCalories / 4);
  
  // Calculate percentages
  const totalCalories = proteinCalories + fatCalories + carbCalories;
  const proteinPercentage = Math.round((proteinCalories / totalCalories) * 100);
  const fatPercentage = Math.round((fatCalories / totalCalories) * 100);
  const carbPercentage = Math.round((carbCalories / totalCalories) * 100);
  
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
