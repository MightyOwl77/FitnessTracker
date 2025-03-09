
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, Activity, Utensils } from "lucide-react";
import { calculateBMR, calculateTDEE } from "@/lib/fitness-calculations";

export default function DeficitPlanStep({
  onNext,
  onPrev,
  profileData,
  goalData,
  saveGoal
}: {
  onNext: () => void;
  onPrev: () => void;
  profileData: any;
  goalData: any;
  saveGoal: (data: any) => Promise<void>;
}) {
  const [currentWeight, setCurrentWeight] = useState(profileData?.weight || 76.5);
  const [adjustedCalorieTarget, setAdjustedCalorieTarget] = useState(goalData?.dailyCalorieTarget || 2000);
  const [baseTDEE, setBaseTDEE] = useState(2500);
  const [sliderInitialized, setSliderInitialized] = useState(false);

  // Calculate TDEE
  useEffect(() => {
    if (profileData) {
      try {
        const baseBMR = calculateBMR(
          currentWeight, 
          profileData.height || 175, 
          profileData.age || 30, 
          profileData.gender || "male"
        );
        const calculatedTDEE = Math.round(calculateTDEE(baseBMR, profileData.activityLevel || "moderately"));
        setBaseTDEE(calculatedTDEE);
        
        // Only set calorie target if it hasn't been initialized yet
        if (!sliderInitialized && (!goalData?.dailyCalorieTarget || goalData.dailyCalorieTarget === 2000)) {
          setAdjustedCalorieTarget(calculatedTDEE);
        }
      } catch (error) {
        console.error("Error calculating TDEE:", error);
      }
    }
  }, [profileData, currentWeight]);

  const deficitCalories = baseTDEE - adjustedCalorieTarget;
  const deficitPercentage = Math.round((deficitCalories / (baseTDEE || 1)) * 100);

  const handleSaveAndContinue = async () => {
    try {
      // Calculate daily activity calories
      const weightLiftingSessions = goalData?.weightLiftingSessions || 3;
      const cardioSessions = goalData?.cardioSessions || 2;
      const stepsPerDay = goalData?.stepsPerDay || 10000;
      
      const weeklyActivityCalories =
        weightLiftingSessions * 250 +
        cardioSessions * 300 +
        (stepsPerDay / 10000) * 400 * 7;
      
      const dailyActivityCalories = Math.round(weeklyActivityCalories / 7);
      
      // Calculate macros based on calorie target
      const proteinGrams = goalData?.proteinGrams || Math.round(1.8 * currentWeight);
      const proteinCalories = proteinGrams * 4;
      
      const fatGrams = goalData?.fatGrams || Math.round(currentWeight * 0.9);
      const fatCalories = fatGrams * 9;
      
      const carbCalories = adjustedCalorieTarget - proteinCalories - fatCalories;
      const carbGrams = Math.max(0, Math.round(carbCalories / 4));
      
      // Calculate actual deficit and projected loss
      const actualDailyDeficit = baseTDEE - adjustedCalorieTarget + dailyActivityCalories;
      const weeklyDeficit = actualDailyDeficit * 7;
      const projectedWeeklyLoss = weeklyDeficit / 7700;
      
      await saveGoal({
        ...goalData,
        dailyCalorieTarget: adjustedCalorieTarget,
        proteinGrams,
        fatGrams,
        carbGrams,
        dailyDeficit: actualDailyDeficit,
        deficitRate: (projectedWeeklyLoss * 100) / currentWeight
      });
      
      onNext();
    } catch (error) {
      console.error("Error saving deficit plan:", error);
    }
  };

  return (
    <div className="py-6">
      <h2 className="text-2xl font-bold mb-2">Create Your Deficit Plan</h2>
      <p className="text-muted-foreground mb-6">Balance activity and nutrition to reach your goals.</p>
      
      <div className="bg-secondary/30 p-6 rounded-lg mb-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Utensils className="w-5 h-5 mr-2 text-primary" />
          Calorie Intake Selection
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Adjust your daily calorie intake below. Starting from your maintenance level, you can reduce
          calories to create a deficit for fat loss. We recommend a moderate deficit of 300-700 calories for
          sustainable results.
        </p>
        
        <div className="bg-background p-4 rounded-lg mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-primary/5 p-3 rounded-lg">
              <div className="text-sm text-muted-foreground">Maintenance Calories</div>
              <div className="text-2xl font-bold">{baseTDEE.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">Your calculated TDEE</div>
            </div>
            <div className="bg-primary/5 p-3 rounded-lg">
              <div className="text-sm text-muted-foreground">Daily Calorie Target</div>
              <div className="text-2xl font-bold">{adjustedCalorieTarget.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">
                {deficitCalories > 0
                  ? `${deficitCalories} calories below maintenance (${deficitPercentage}%)`
                  : "At maintenance"}
              </div>
            </div>
          </div>
          
          <div className="mb-8">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium">Adjust Daily Calories</span>
              <span className="font-medium text-green-600">
                {deficitCalories > 0 ? `-${deficitCalories} calories` : "No deficit"}
              </span>
            </div>
            
            <div className="relative mt-8 w-full">
              <div
                className="absolute -top-6 px-2 py-1 bg-green-600 text-white text-xs rounded transform -translate-x-1/2 font-medium shadow-md"
                style={{
                  left: `${(((adjustedCalorieTarget) - Math.round(baseTDEE * 0.75)) / (baseTDEE - Math.round(baseTDEE * 0.75))) * 100}%`
                }}
              >
                {adjustedCalorieTarget.toLocaleString()} cal
              </div>
              
              <Slider
                min={Math.round(baseTDEE * 0.75)}
                max={baseTDEE}
                step={100}
                value={[adjustedCalorieTarget]}
                onValueChange={(value) => {
                  setAdjustedCalorieTarget(value[0]);
                  if (!sliderInitialized) setSliderInitialized(true);
                }}
                className="w-full py-4"
                aria-label="Calorie target slider"
              />
            </div>
            
            <div className="flex justify-between text-xs mt-1">
              <span className="text-muted-foreground">{Math.round(baseTDEE * 0.75).toLocaleString()} cal (max deficit)</span>
              <span className="text-muted-foreground">{baseTDEE.toLocaleString()} cal (maintenance)</span>
            </div>
          </div>
          
          <div className="bg-primary/5 p-3 rounded-lg">
            <div className="text-sm font-medium text-green-700">Daily Calorie Information</div>
            <div className="text-lg font-bold text-green-800">
              {deficitCalories > 0 ? `${deficitCalories} calories deficit` : 'No calorie deficit'}
            </div>
            <div className="text-xs text-muted-foreground">
              {deficitCalories > 0 
                ? `Weekly fat loss potential: ${(deficitCalories * 7 / 7700).toFixed(2)} kg` 
                : 'Maintenance calories for body recomposition'}
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-secondary/30 p-6 rounded-lg mb-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Activity className="w-5 h-5 mr-2 text-primary" />
          Daily Summary
        </h3>
        
        <div className="overflow-hidden rounded-lg bg-background">
          <div className="grid grid-cols-2 divide-x divide-border border-b">
            <div className="p-4">
              <h4 className="text-sm font-medium mb-3">Calories In</h4>
              <div className="text-3xl font-bold">{adjustedCalorieTarget}</div>
              <div className="text-xs text-muted-foreground mt-1">calories from food</div>
            </div>
            <div className="p-4">
              <h4 className="text-sm font-medium mb-3">Calories Out</h4>
              <div className="text-3xl font-bold">{baseTDEE}</div>
              <div className="text-xs text-muted-foreground mt-1">calories your body burns</div>
            </div>
          </div>
          
          <div className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-sm font-medium">Estimated Weekly Loss</h4>
                <div className="text-muted-foreground text-xs">Based on 7700 calories = 1kg of fat</div>
              </div>
              <div className="text-lg font-bold text-primary">
                {deficitCalories > 0 ? `${(deficitCalories * 7 / 7700).toFixed(2)} kg` : "0.00 kg (Maintenance)"}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between mt-8">
        <Button type="button" variant="outline" onClick={onPrev}>
          <ChevronLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Button onClick={handleSaveAndContinue}>
          Next <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
