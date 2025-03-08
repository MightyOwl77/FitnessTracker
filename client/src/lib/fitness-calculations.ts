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

/**
 * Calculate Total Daily Energy Expenditure using the simple BMR × activity multiplier approach.
 * This represents maintenance calories - the maximum calories you should consume to maintain weight.
 * 
 * @param bmr Basal Metabolic Rate
 * @param activityLevel Activity level string
 * @returns TDEE (maintenance calories)
 */
export function calculateTDEE(bmr: number, activityLevel: string = 'moderately'): number {
  // Activity multipliers directly from physiological research
  // These multipliers are based on the Harris-Benedict formula
  const activityMultipliers = {
    sedentary: 1.2,      // Little or no exercise (desk job)
    lightly: 1.375,      // Light exercise 1-3 days per week
    moderately: 1.55,    // Moderate exercise 3-5 days per week 
    very: 1.725,         // Heavy exercise 6-7 days per week
    extremely: 1.9       // Very intense daily exercise or physical job
  };
  
  // Get the appropriate multiplier (default to moderately active if not found)
  const multiplier = activityLevel in activityMultipliers 
    ? activityMultipliers[activityLevel as keyof typeof activityMultipliers] 
    : 1.55;
  
  // Calculate TDEE as BMR × activity multiplier
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
  deficitType: 'maintenance' | 'moderate' | 'aggressive' = 'maintenance',
  weightLiftingSessions: number = 0, 
  cardioSessions: number = 0,
  stepsPerDay: number = 10000,
  refeedDays: number = 0,
  dietBreakWeeks: number = 0,
  deficitRate?: number // weekly deficit as percentage in decimal (e.g., 0.0075 for 0.75%)
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
  const cappedDailyDeficit = Math.round(Math.min(requiredTotalDailyDeficit, deficitCap));
  
  // Weekly deficit and fat loss rate
  const weeklyDeficit = cappedDailyDeficit * 7;
  
  // Calculate weekly loss rate directly as a percentage of current weight
  // This ensures our UI shows the same value as what we're using in calculations
  const weeklyPercentage = (currentWeight === 0) ? 0 : Math.min(deficitRate || 0.005, 0.01);
  // If deficitRate is provided, use it directly, otherwise calculate based on calories
  const weeklyFatLossRate = deficitRate ? 
    (currentWeight * weeklyPercentage) : // kg per week based on percentage of body weight
    (weeklyDeficit / 7700); // kg per week based on calorie deficit
  
  // Daily food calorie target = Maintenance - Deficit
  // We calculate this directly for clarity, consistency, and to avoid edge cases
  const dailyFoodCalorieTarget = Math.round(maintenanceCalories - cappedDailyDeficit);
  
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
  
  // Scientific approach: based on total body weight for simplicity and consistency 
  // Research shows 1.8-2.2g/kg of total bodyweight for fat loss phases
  
  // Determine protein needs based on fitness level (g/kg of total body weight)
  let proteinPerKg = 1.8; // default intermediate
  
  switch (fitnessLevel) {
    case 'beginner':
      proteinPerKg = 1.6; // Lower end for beginners
      break;
    case 'intermediate':
      proteinPerKg = 1.8; // Scientific mid-range for fat loss
      break;  
    case 'advanced':
      proteinPerKg = 2.0; // Higher end for advanced trainees
      break;
  }
  
  // Calculate protein based on total weight with cap
  const scientificProtein = Math.round(weight * proteinPerKg);
  
  // Override the percentage-based approach with the scientific recommendation
  proteinGrams = scientificProtein;
  
  // Recalculate protein calories based on the scientific protein amount
  const newProteinCalories = proteinGrams * 4;
  
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

// Project weight loss over time based on weekly percentage deficit
export function projectNonLinearWeightLoss(
  startWeight: number,
  targetWeight: number,
  timeFrameWeeks: number,
  weeklyDeficitRate: number // weight loss in kg per week
): number[] {
  if (timeFrameWeeks <= 0) {
    return [startWeight];
  }
  
  // Ensure target weight is not above starting weight
  const actualTargetWeight = Math.min(startWeight, targetWeight);
  
  // Initialize with starting weight
  const weeklyWeights: number[] = [startWeight];
  
  // Calculate weight loss over time
  let currentWeight = startWeight;
  
  // Apply deficit-based weight loss for each week
  for (let week = 1; week <= timeFrameWeeks; week++) {
    // Calculate this week's weight loss using the deficit rate of CURRENT weight
    // This makes the loss non-linear and more realistic
    
    // For adaptive weight loss, we calculate weight loss as a percentage of current weight
    // For fixed weight loss, weeklyDeficitRate is already the kg per week
    const thisWeekLoss = (currentWeight / startWeight) * weeklyDeficitRate;
    
    // Apply the loss
    currentWeight = currentWeight - thisWeekLoss;
    
    // Don't go below target
    if (currentWeight < actualTargetWeight) {
      currentWeight = actualTargetWeight;
    }
    
    // Add weight to the array, rounded to 1 decimal place
    weeklyWeights.push(parseFloat(currentWeight.toFixed(1)));
  }
  
  return weeklyWeights;
}

// Calculate the number of weeks needed to reach a target weight based on weekly deficit
export function calculateWeeksToGoal(
  currentWeight: number,
  targetWeight: number,
  weeklyDeficitPercent: number // 0.5 to 1.0 (percentage value)
): number {
  // If target is higher than current, return 0
  if (targetWeight >= currentWeight) {
    return 0;
  }
  
  // This calculation accounts for the non-linear nature of weight loss
  // As weight decreases, so does the weekly loss in kg
  
  // Simulation approach - more accurate than simple division
  let simulatedWeight = currentWeight;
  let weeksCount = 0;
  
  // Simulate week by week weight loss until target is reached
  while (simulatedWeight > targetWeight && weeksCount < 104) { // 2 year safety limit
    // Calculate this week's loss based on CURRENT weight
    // Convert from percentage to decimal (e.g., 0.5% becomes 0.005)
    const thisWeekLoss = simulatedWeight * weeklyDeficitPercent / 100;
    simulatedWeight -= thisWeekLoss;
    weeksCount++;
    
    // Break if we're close enough (within 0.1 kg)
    if (simulatedWeight <= targetWeight + 0.1) {
      break;
    }
  }
  
  return weeksCount;
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
