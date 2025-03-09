import { useState, useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { calculateBMR } from '@/lib/fitness-calculations';

/**
 * Hook to calculate weight loss projection based on form data
 * @param form Form instance containing weight loss goals data
 * @param currentWeight Current weight of the user
 * @returns Weight loss projection data and functions
 */
export function useWeightLossProjection(form: UseFormReturn<any>, currentWeight: number) {
  const [projectionData, setProjectionData] = useState<Array<{ week: number; weight: number }>>([]);
  const [weeklyLossRate, setWeeklyLossRate] = useState<number>(0);
  const [estimatedWeeks, setEstimatedWeeks] = useState<number>(0);
  const [totalLoss, setTotalLoss] = useState<number>(0);
  const [targetWeight, setTargetWeight] = useState<number>(0);

  // Function to calculate the weight loss projection
  const calculateProjection = () => {
    const formValues = form.getValues();
    const totalWeight = currentWeight;
    const targetWeight = formValues.targetWeight;
    const deficitRate = formValues.deficitRate;
    
    // Calculate weekly loss rate (percentage of current weight)
    const weeklyLossRate = deficitRate * totalWeight;
    
    // Calculate total weight to lose
    const totalLoss = Math.max(0, totalWeight - targetWeight);
    
    // Calculate estimated weeks to reach goal
    const estWeeks = totalLoss > 0 ? Math.ceil(totalLoss / weeklyLossRate) : 0;
    
    // Generate projection data points
    const projectionData = [];
    let currentW = totalWeight;
    
    for (let week = 0; week <= Math.min(estWeeks, 52); week++) {
      projectionData.push({
        week: week,
        weight: Number(currentW.toFixed(1))
      });
      
      // Apply non-linear weight loss (gets slower as you lose weight)
      const lossRateThisWeek = deficitRate * currentW;
      currentW = Math.max(targetWeight, currentW - lossRateThisWeek);
    }
    
    // Add target point if we haven't reached it
    if (currentW > targetWeight && estWeeks <= 52) {
      projectionData.push({
        week: estWeeks,
        weight: targetWeight
      });
    }
    
    setProjectionData(projectionData);
    setWeeklyLossRate(weeklyLossRate);
    setEstimatedWeeks(estWeeks);
    setTotalLoss(totalLoss);
    setTargetWeight(targetWeight);
    
    return {
      projectionData,
      weeklyLossRate,
      estimatedWeeks: estWeeks,
      totalLoss,
      targetWeight
    };
  };

  // Listen to form changes
  useEffect(() => {
    const subscription = form.watch(() => {
      calculateProjection();
    });
    
    // Initial calculation
    calculateProjection();
    
    return () => subscription.unsubscribe();
  }, [currentWeight, form]);

  return {
    projectionData,
    weeklyLossRate,
    estimatedWeeks,
    totalLoss,
    targetWeight,
    calculateProjection
  };
}

/**
 * Hook to calculate calorie target based on user profile data
 * @param profileForm Form containing user profile data
 * @param initialDeficit Initial calorie deficit to apply (default 500)
 * @returns Calorie target data and functions
 */
export function useCalorieTarget(profileForm: UseFormReturn<any>, initialDeficit: number = 500) {
  const [adjustedCalorieTarget, setAdjustedCalorieTarget] = useState<number>(0);
  const [baseTDEE, setBaseTDEE] = useState<number>(0);
  const [deficitCalories, setDeficitCalories] = useState<number>(0);
  const [deficitPercentage, setDeficitPercentage] = useState<number>(0);

  // Calculate base values based on profile data
  const calculateBaseValues = () => {
    const profileData = profileForm.getValues();
    const baseBMR = calculateBMR(
      profileData.weight,
      profileData.height,
      profileData.age,
      profileData.gender as 'male' | 'female'
    );
    
    // Calculate TDEE with a sedentary multiplier (1.2)
    const calculatedBaseTDEE = Math.round(baseBMR * 1.2);
    
    // Calculate initial calorie target with a safety minimum of 1200
    const initialTarget = Math.max(1200, calculatedBaseTDEE - initialDeficit);
    
    // Calculate deficit values
    const calculatedDeficitCalories = calculatedBaseTDEE - initialTarget;
    const calculatedDeficitPercentage = Math.round((calculatedDeficitCalories / calculatedBaseTDEE) * 100);
    
    setBaseTDEE(calculatedBaseTDEE);
    setAdjustedCalorieTarget(initialTarget);
    setDeficitCalories(calculatedDeficitCalories);
    setDeficitPercentage(calculatedDeficitPercentage);
    
    return {
      baseTDEE: calculatedBaseTDEE,
      adjustedCalorieTarget: initialTarget,
      deficitCalories: calculatedDeficitCalories,
      deficitPercentage: calculatedDeficitPercentage
    };
  };

  // Update values when calorie target is changed
  const updateCalorieTarget = (newTarget: number) => {
    setAdjustedCalorieTarget(newTarget);
    const newDeficitCalories = baseTDEE - newTarget;
    const newDeficitPercentage = Math.round((newDeficitCalories / baseTDEE) * 100);
    
    setDeficitCalories(newDeficitCalories);
    setDeficitPercentage(newDeficitPercentage);
    
    return {
      adjustedCalorieTarget: newTarget,
      deficitCalories: newDeficitCalories,
      deficitPercentage: newDeficitPercentage
    };
  };

  // Listen for profile form changes
  useEffect(() => {
    const subscription = profileForm.watch(() => {
      calculateBaseValues();
    });
    
    // Initial calculation
    calculateBaseValues();
    
    return () => subscription.unsubscribe();
  }, [profileForm]);

  return {
    adjustedCalorieTarget,
    setAdjustedCalorieTarget: updateCalorieTarget,
    baseTDEE,
    deficitCalories,
    deficitPercentage,
    calculateBaseValues
  };
}