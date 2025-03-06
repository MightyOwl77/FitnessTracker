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

// Calculate lean mass from weight and body fat percentage
export function calculateLeanMass(
  weight: number, // in kg
  bodyFatPercentage: number // as a percentage (e.g., 20 for 20%)
): number {
  const leanMassPercentage = 100 - bodyFatPercentage;
  const leanMass = (weight * leanMassPercentage) / 100;
  return parseFloat(leanMass.toFixed(1));
}

// Calculate fat mass from weight and body fat percentage
export function calculateFatMass(
  weight: number, // in kg
  bodyFatPercentage: number // as a percentage (e.g., 20 for 20%)
): number {
  const fatMass = (weight * bodyFatPercentage) / 100;
  return parseFloat(fatMass.toFixed(1));
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
  currentBodyFat?: number, // optional body fat percentage
  targetBodyFat?: number, // optional target body fat percentage
  deficitType: 'moderate' | 'aggressive' = 'moderate',
  weightLiftingSessions: number = 0, 
  cardioSessions: number = 0,
  stepsPerDay: number = 10000,
  refeedDays: number = 0,
  dietBreakWeeks: number = 0
): {
  totalWeightLoss: number;
  totalCalorieDeficit: number;
  dailyCalorieDeficit: number;
  weeklyDeficit: number;
  weeklyFatLossRate: number;
  isAggressive: boolean;
  weeklyActivityCalories: number;
  dailyFoodCalorieTarget: number;
  refeedDayCalories: number;
  dietBreakCalories: number;
  totalDaysWithDeficit: number;
  projectedLeanMassLoss: number;
  projectedFatLoss: number;
} {
  // Calculate total weight loss
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
  
  // Adjust timeframe for diet breaks
  const effectiveTimeFrameDays = (timeFrameWeeks - dietBreakWeeks) * 7;
  const totalDaysWithDeficit = effectiveTimeFrameDays - (refeedDays * (effectiveTimeFrameDays / 7));
  
  // Calculate required daily deficit from food and activity combined
  const requiredTotalDailyDeficit = totalCalorieDeficit / totalDaysWithDeficit;
  
  // Set deficit cap based on body fat percentage and deficitType
  // Higher body fat = can handle larger deficits safely
  let deficitCap = 500; // moderate default (0.5kg/week)
  
  if (currentBodyFat !== undefined) {
    // Adaptive deficit based on body fat percentage
    if (currentBodyFat > 30) {
      // Higher body fat can sustain larger deficits
      deficitCap = deficitType === 'aggressive' ? 1200 : 800;
    } else if (currentBodyFat > 20) {
      // Moderate body fat
      deficitCap = deficitType === 'aggressive' ? 1000 : 600;
    } else if (currentBodyFat > 15) {
      // Lower body fat requires more conservative approach
      deficitCap = deficitType === 'aggressive' ? 750 : 500;
    } else {
      // Very lean individuals need smaller deficits to preserve muscle
      deficitCap = deficitType === 'aggressive' ? 500 : 350;
    }
  } else if (deficitType === 'aggressive') {
    deficitCap = 1000; // aggressive (1kg/week) if no body fat data
  }
  
  // Cap the daily deficit
  const cappedDailyDeficit = Math.min(requiredTotalDailyDeficit, deficitCap);
  
  // Weekly deficit and fat loss rate
  const weeklyDeficit = cappedDailyDeficit * 7;
  const weeklyFatLossRate = weeklyDeficit / 7700; // kg per week
  
  // Daily food calorie target = Maintenance - (Total Deficit - Activity Calories)
  // This ensures that activity calories contribute to the deficit
  const dailyFoodCalorieTarget = Math.round(maintenanceCalories - Math.max(0, cappedDailyDeficit - dailyActivityCalories));
  
  // Refeed day calories (slightly higher than maintenance, focused on carbs)
  // Refeed days are typically at maintenance or slightly above
  const refeedDayCalories = Math.round(maintenanceCalories * 1.05);
  
  // Diet break calories (at maintenance)
  // During a diet break, eating at maintenance allows metabolic recovery
  const dietBreakCalories = maintenanceCalories;
  
  // Calculate impact of diet breaks on overall progress
  const dietBreakImpact = dietBreakWeeks > 0 
    ? {
        totalDays: dietBreakWeeks * 7,
        metabolicBenefit: "Increased hormone levels and metabolic rate",
        recommendedFrequency: timeFrameWeeks > 12 ? "Every 6-8 weeks of dieting" : "Optional for short diets"
      }
    : null;
  
  // Calculate impact of refeed days on overall progress
  const refeedImpact = refeedDays > 0
    ? {
        totalDays: refeedDays * (timeFrameWeeks - dietBreakWeeks),
        benefitType: "Psychological and hormonal (leptin) recovery",
        recommendedFrequency: "1-2 days per week depending on body fat and deficit size"
      }
    : null;
  
  // Total daily deficit (food + activity)
  const dailyCalorieDeficit = Math.round(cappedDailyDeficit);
  
  // Project fat loss vs. lean mass loss
  let projectedFatLoss = totalWeightLoss;
  let projectedLeanMassLoss = 0;
  
  // If body fat data is provided, we can estimate more precisely
  if (currentBodyFat !== undefined && targetBodyFat !== undefined) {
    const currentFatMass = calculateFatMass(currentWeight, currentBodyFat);
    const targetFatMass = calculateFatMass(targetWeight, targetBodyFat);
    
    projectedFatLoss = currentFatMass - targetFatMass;
    projectedLeanMassLoss = totalWeightLoss - projectedFatLoss;
    
    // Ensure projectedLeanMassLoss is not negative (gaining muscle while losing weight)
    projectedLeanMassLoss = Math.max(0, projectedLeanMassLoss);
  }
  
  // If daily deficit exceeds cap or if the original calculated deficit was >cap, it's considered aggressive
  const isAggressive = requiredTotalDailyDeficit > deficitCap;
  
  return {
    totalWeightLoss,
    totalCalorieDeficit,
    dailyCalorieDeficit,
    weeklyDeficit,
    weeklyFatLossRate,
    isAggressive,
    weeklyActivityCalories,
    dailyFoodCalorieTarget,
    refeedDayCalories,
    dietBreakCalories,
    totalDaysWithDeficit,
    projectedLeanMassLoss,
    projectedFatLoss
  };
}

// Calculate macros based on weight and calorie target
export function calculateMacros(
  weight: number, // in kg
  dailyCalorieTarget: number,
  bodyFatPercentage?: number, // optional body fat percentage for protein calculation
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced' = 'intermediate',
  dietaryPreference: 'standard' | 'keto' | 'vegan' | 'vegetarian' | 'paleo' | 'mediterranean' = 'standard',
  isRefeedDay: boolean = false
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
  // Base protein calculation on lean body mass if body fat is provided
  let proteinPercentage = 30;
  let fatPercentage = 30;
  let carbPercentage = 40;
  
  // Adjust macros based on dietary preference
  switch (dietaryPreference) {
    case 'keto':
      // Very low carb, high fat, moderate protein
      proteinPercentage = 25;
      fatPercentage = 70;
      carbPercentage = 5;
      break;
    case 'paleo':
      // Higher protein, moderate fat, lower carb
      proteinPercentage = 35;
      fatPercentage = 40;
      carbPercentage = 25;
      break;
    case 'vegan':
    case 'vegetarian':
      // More carbs, less protein due to plant-based sources
      proteinPercentage = 20;
      fatPercentage = 30;
      carbPercentage = 50;
      break;
    case 'mediterranean':
      // Balanced with healthy fats
      proteinPercentage = 25;
      fatPercentage = 35;
      carbPercentage = 40;
      break;
    default: // 'standard'
      // Standard balanced approach
      proteinPercentage = 30;
      fatPercentage = 30;
      carbPercentage = 40;
  }
  
  // For refeed days, increase carbs, reduce fat
  if (isRefeedDay) {
    // Keep protein the same, increase carbs at the expense of fat
    const proteinAdjustment = 0; // Keep protein the same
    const fatAdjustment = -15; // Reduce fat
    const carbAdjustment = 15; // Increase carbs
    
    proteinPercentage += proteinAdjustment;
    fatPercentage += fatAdjustment;
    carbPercentage += carbAdjustment;
  }
  
  // Calculate calorie allocation for each macro
  const proteinCalories = Math.round(dailyCalorieTarget * (proteinPercentage / 100));
  const fatCalories = Math.round(dailyCalorieTarget * (fatPercentage / 100));
  const carbCalories = Math.round(dailyCalorieTarget * (carbPercentage / 100));
  
  // Convert calories to grams
  // Protein: 4 calories per gram
  // Fat: 9 calories per gram
  // Carbohydrates: 4 calories per gram
  let proteinGrams = Math.round(proteinCalories / 4);
  const fatGrams = Math.round(fatCalories / 9);
  const carbGrams = Math.round(carbCalories / 4);
  
  // If body fat percentage is provided, we can be more precise with protein
  if (bodyFatPercentage !== undefined) {
    const leanMass = calculateLeanMass(weight, bodyFatPercentage);
    
    // Determine protein needs based on fitness level (g/kg of lean mass)
    let proteinPerKgLeanMass = 1.8; // default intermediate
    
    switch (fitnessLevel) {
      case 'beginner':
        proteinPerKgLeanMass = 1.6;
        break;
      case 'intermediate':
        proteinPerKgLeanMass = 1.8;
        break;  
      case 'advanced':
        proteinPerKgLeanMass = 2.2;
        break;
    }
    
    // Calculate protein based on lean mass
    const leanMassBasedProtein = Math.round(leanMass * proteinPerKgLeanMass);
    
    // Take the higher of the two protein calculations
    proteinGrams = Math.max(proteinGrams, leanMassBasedProtein);
  }
  
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

// Calculate Body Mass Index (BMI)
export function calculateBMI(
  weight: number, // in kg
  height: number // in cm
): number {
  // BMI = weight(kg) / height(m)²
  const heightInMeters = height / 100;
  const bmi = weight / (heightInMeters * heightInMeters);
  return parseFloat(bmi.toFixed(1));
}

// Calculate estimated body fat percentage using Navy method
export function estimateBodyFatPercentage(
  gender: 'male' | 'female',
  waistCircumference: number, // in cm
  neckCircumference: number, // in cm
  hipCircumference?: number, // in cm (for females)
  height: number = 170 // in cm
): number {
  if (gender === 'male') {
    // Body fat % = 495 / (1.0324 - 0.19077 * log10(waist - neck) + 0.15456 * log10(height)) - 450
    const logWaistNeck = Math.log10(waistCircumference - neckCircumference);
    const logHeight = Math.log10(height);
    const bodyFat = 495 / (1.0324 - 0.19077 * logWaistNeck + 0.15456 * logHeight) - 450;
    return parseFloat(bodyFat.toFixed(1));
  } else {
    // Need hip measurement for females
    if (!hipCircumference) {
      return 0; // Can't calculate without hip measurement
    }
    
    // Body fat % = 495 / (1.29579 - 0.35004 * log10(waist + hip - neck) + 0.22100 * log10(height)) - 450
    const logWaistHipNeck = Math.log10(waistCircumference + hipCircumference - neckCircumference);
    const logHeight = Math.log10(height);
    const bodyFat = 495 / (1.29579 - 0.35004 * logWaistHipNeck + 0.22100 * logHeight) - 450;
    return parseFloat(bodyFat.toFixed(1));
  }
}

// Calculate Waist-to-Height Ratio (WHtR)
export function calculateWaistToHeightRatio(
  waistCircumference: number, // in cm
  height: number // in cm
): number {
  return parseFloat((waistCircumference / height).toFixed(2))
}

// Project weight loss over time based on weekly rate with slight metabolic adaptation
export function projectNonLinearWeightLoss(
  startWeight: number,
  targetWeight: number,
  timeFrameWeeks: number,
  weeklyLossRate: number // in kg per week
): number[] {
  if (timeFrameWeeks <= 0) {
    return [startWeight];
  }
  
  // Ensure target weight is not above starting weight
  const actualTargetWeight = Math.min(startWeight, targetWeight);
  
  // Initialize with starting weight
  const weeklyWeights: number[] = [startWeight];
  
  // If timeframe is 1 week or less, just return start and target
  if (timeFrameWeeks <= 1) {
    weeklyWeights.push(actualTargetWeight);
    return weeklyWeights;
  }
  
  // Calculate total weight to lose
  const totalWeightToLose = startWeight - actualTargetWeight;
  
  // If no weight to lose, return flat line
  if (totalWeightToLose <= 0) {
    return Array(timeFrameWeeks + 1).fill(startWeight);
  }
  
  // First week follows selected weekly rate exactly (no water weight component)
  const firstWeekWeight = startWeight - weeklyLossRate;
  weeklyWeights.push(parseFloat(firstWeekWeight.toFixed(1)));
  
  // Determine total weeks to track
  const totalWeeks = Math.min(timeFrameWeeks, Math.ceil(totalWeightToLose / weeklyLossRate) + 1);
  
  // Apply a slight metabolic adaptation for remaining weeks
  // The rate will decrease very slightly over time to reflect real-world outcomes
  for (let week = 2; week <= totalWeeks; week++) {
    // Calculate adaptation factor (1.0 to 0.85 over time)
    // This simulates natural metabolic adaptation - earlier weeks lose at full rate, 
    // later weeks at slightly reduced rate
    const adaptationFactor = 1 - (0.15 * (week / totalWeeks));
    
    // Current week's weight loss with adaptation
    const currentWeekLoss = weeklyLossRate * adaptationFactor;
    
    // Calculate weight for this week
    let currentWeight = weeklyWeights[week - 1] - currentWeekLoss;
    
    // Don't go below target
    currentWeight = Math.max(currentWeight, actualTargetWeight);
    
    weeklyWeights.push(parseFloat(currentWeight.toFixed(1)));
    
    // If we've reached target, stop losing
    if (currentWeight <= actualTargetWeight) {
      break;
    }
  }
  
  // Fill remaining weeks with target weight if necessary
  while (weeklyWeights.length <= timeFrameWeeks) {
    weeklyWeights.push(actualTargetWeight);
  }
  
  return weeklyWeights;
}

// Generate weekly workout schedule
export function generateWorkoutSchedule(
  workoutSplit: 'full_body' | 'upper_lower' | 'push_pull_legs',
  weightLiftingSessions: number,
  cardioSessions: number,
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced' = 'intermediate'
): Array<{day: string, workout: string, cardio: boolean}> {
  const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const schedule: Array<{day: string, workout: string, cardio: boolean}> = [];
  
  // Default: distribute rest days
  let workoutDays: number[] = [];
  let cardioDays: number[] = [];
  
  // Determine workout days based on workout split
  switch (workoutSplit) {
    case 'full_body':
      // Space full body workouts evenly
      if (weightLiftingSessions === 3) {
        workoutDays = [0, 2, 4]; // Monday, Wednesday, Friday
      } else if (weightLiftingSessions === 2) {
        workoutDays = [0, 3]; // Monday, Thursday
      } else if (weightLiftingSessions > 3) {
        workoutDays = Array.from({length: weightLiftingSessions}, (_, i) => i);
      } else {
        workoutDays = [0]; // Monday only for 1 session
      }
      break;
      
    case 'upper_lower':
      // Alternate upper and lower
      if (weightLiftingSessions === 4) {
        workoutDays = [0, 1, 3, 4]; // M,T,Th,F
      } else if (weightLiftingSessions === 2) {
        workoutDays = [0, 3]; // M,Th
      } else {
        // Default for other session counts
        workoutDays = Array.from({length: weightLiftingSessions}, (_, i) => i);
      }
      break;
      
    case 'push_pull_legs':
      // Push/Pull/Legs requires at least 3 sessions, ideally 6
      if (weightLiftingSessions >= 6) {
        workoutDays = [0, 1, 2, 3, 4, 5]; // 6 days on, 1 day off
      } else if (weightLiftingSessions === 3) {
        workoutDays = [0, 2, 4]; // M,W,F
      } else {
        // For 4-5 sessions, distribute throughout week
        workoutDays = Array.from({length: weightLiftingSessions}, (_, i) => i);
      }
      break;
      
    default:
      // Generic distribution
      workoutDays = Array.from({length: weightLiftingSessions}, (_, i) => i);
  }
  
  // Add cardio on non-lifting days or after workouts depending on total sessions
  const totalSessions = weightLiftingSessions + cardioSessions;
  if (totalSessions <= 7) {
    // Try to separate cardio and lifting when possible
    let availableDays = weekdays.map((_, index) => index).filter(day => !workoutDays.includes(day));
    
    // If we can fit cardio on separate days
    if (availableDays.length >= cardioSessions) {
      cardioDays = availableDays.slice(0, cardioSessions);
    } else {
      // Add cardio after some workout days
      const remainingCardio = cardioSessions - availableDays.length;
      cardioDays = [
        ...availableDays,
        ...workoutDays.slice(0, remainingCardio)
      ];
    }
  } else {
    // Some days will have both lifting and cardio
    cardioDays = Array.from({length: cardioSessions}, (_, i) => i);
  }
  
  // Create the schedule
  for (let i = 0; i < 7; i++) {
    const day = weekdays[i];
    let workout = 'Rest';
    
    // Determine workout type based on split
    if (workoutDays.includes(i)) {
      switch (workoutSplit) {
        case 'full_body':
          workout = 'Full Body';
          break;
        case 'upper_lower':
          workout = i % 2 === 0 ? 'Upper Body' : 'Lower Body';
          break;
        case 'push_pull_legs':
          switch (i % 3) {
            case 0: workout = 'Push (Chest/Shoulders/Triceps)'; break;
            case 1: workout = 'Pull (Back/Biceps)'; break;
            case 2: workout = 'Legs'; break;
          }
          break;
      }
    }
    
    schedule.push({
      day,
      workout,
      cardio: cardioDays.includes(i)
    });
  }
  
  return schedule;
}
