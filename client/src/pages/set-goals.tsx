import React, { useState, useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useUserGoal, useUserProfile } from "@/hooks/use-user-data";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, ArrowRight, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { calculateCalorieDeficit, calculateMacros, calculateWeeklyActivityCalories, calculateBMR, projectNonLinearWeightLoss, calculateWeeksToGoal } from "@/lib/fitness-calculations";
import { FatLossGuidance } from "@/components/shared/fat-loss-guidance";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Label, PieChart, Pie, Cell } from 'recharts';
import { getLastNDayLabels } from "@/lib/date-utils";
import { Badge } from "@/components/ui/badge";

export function SetGoals() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const { profileData, isLoading: isProfileLoading, saveProfile } = useUserProfile();
  const { goalData, saveGoal, isSaving, isLoading: isGoalLoading } = useUserGoal();
  
  // Form state - Personal details
  const [age, setAge] = useState<number>(() => {
    const value = profileData?.age ?? 30;
    return isNaN(value) ? 30 : Number(value);
  });
  
  const [gender, setGender] = useState<"male" | "female">(() => {
    const value = profileData?.gender ?? "male";
    return value === "female" ? "female" : "male";
  });
  
  const [height, setHeight] = useState<number>(() => {
    const value = profileData?.height ?? 175;
    return isNaN(value) ? 175 : Number(value);
  });

  const [currentWeight, setCurrentWeight] = useState<number>(() => {
    const value = goalData?.currentWeight ?? profileData?.weight ?? 80;
    return isNaN(value) ? 80 : Number(value);
  });
  
  const [targetWeight, setTargetWeight] = useState<number>(() => {
    const value = goalData?.targetWeight ?? 70;
    return isNaN(value) ? 70 : Number(value);
  });
  
  const [currentBodyFat, setCurrentBodyFat] = useState<number | undefined>(() => {
    const value = goalData?.currentBodyFat ?? profileData?.bodyFatPercentage;
    return isNaN(Number(value)) ? undefined : Number(value);
  });
  
  const [targetBodyFat, setTargetBodyFat] = useState<number | undefined>(() => {
    const value = goalData?.targetBodyFat ?? 15;
    return isNaN(value) ? 15 : Number(value);
  });
  
  const [timeFrame, setTimeFrame] = useState<number>(() => {
    const value = goalData?.timeFrame ?? 12;
    return isNaN(value) ? 12 : Number(value);
  });
  
  // Weekly loss rate (deficit selection)
  const [weeklyDeficitPercent, setWeeklyDeficitPercent] = useState<number>(0.75); // Default between 0.5 and 1
  
  // Daily calorie target state (for slider)
  const [selectedCalorieTarget, setSelectedCalorieTarget] = useState<number | null>(null);
  
  // Protein intake per kg of bodyweight (scientific recommendation: 1.6-2.2g/kg)
  const [proteinGramsPerKg, setProteinGramsPerKg] = useState<number>(1.8);
  
  // Initialize macroDistribution state with defaults
  const [macroDistribution, setMacroDistribution] = useState({
    protein: 35, // Higher protein for muscle preservation
    fat: 25,     // Moderate fat for hormonal health
    carbs: 40    // Remaining calories from carbs for training performance
  });
  
  const [weightLiftingSessions, setWeightLiftingSessions] = useState<number>(() => {
    const value = goalData?.weightLiftingSessions ?? 3;
    return isNaN(value) ? 3 : Number(value);
  });
  
  const [cardioSessions, setCardioSessions] = useState<number>(() => {
    const value = goalData?.cardioSessions ?? 2;
    return isNaN(value) ? 2 : Number(value);
  });
  
  const [stepsPerDay, setStepsPerDay] = useState<number>(() => {
    const value = goalData?.stepsPerDay ?? 10000;
    return isNaN(value) ? 10000 : Number(value);
  });
  


  // Create a default profile for guest users if no profile exists
  useEffect(() => {
    // Only check when loading is complete
    if (!isProfileLoading) {
      if (!profileData) {
        console.log("No profile data found, creating default profile for guest");
        // For guest users, we'll just create a default profile automatically
        saveProfile({
          age: 30,
          gender: "male",
          height: 175,
          weight: currentWeight, // Use current weight from form
          activityLevel: "moderately",
          fitnessLevel: "intermediate", 
          dietaryPreference: "standard",
          trainingAccess: "both",
          healthConsiderations: "",
          bmr: 1800 // Default BMR, will be recalculated
        });
        
        toast({
          title: "Welcome!",
          description: "We've created a default profile for you. You can edit it later in your settings.",
          variant: "default",
        });
      } else {
        console.log("Profile data found:", profileData);
      }
      
      // Calculate time frame based on deficit and weight goals
      if (currentWeight > targetWeight) {
        // Use the new calculation function for consistency
        const weeksRequired = calculateWeeksToGoal(
          currentWeight,
          targetWeight,
          weeklyDeficitPercent
        );
        // Cap at 52 weeks for realistic planning
        setTimeFrame(Math.min(weeksRequired, 52));
      }
    }
  }, [isProfileLoading, profileData, toast, currentWeight, targetWeight, weeklyDeficitPercent, saveProfile]);



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate input values
    if (isNaN(currentWeight) || isNaN(targetWeight) || isNaN(timeFrame)) {
      toast({
        title: "Invalid Input",
        description: "Please enter valid numeric values for weight and time frame",
        variant: "destructive",
      });
      return;
    }
    
    // First, save or update the profile with the new personal data
    try {
      await saveProfile({
        age,
        gender,
        height,
        weight: currentWeight,
        bodyFatPercentage: currentBodyFat,
        activityLevel: "moderately", // Default
        fitnessLevel: "intermediate", // Default
        dietaryPreference: "standard", // Default
        trainingAccess: "both", // Default
        healthConsiderations: "",
        bmr: calculateBMR(currentWeight, height, age, gender) // Recalculate BMR
      });
      
      // Calculate deficit based on the selected weekly deficit percentage
      const weeklyLossRate = currentWeight * weeklyDeficitPercent / 100; // kg per week
      const weeklyDeficit = weeklyLossRate * 7500; // ~7500 calories per kg of fat
      const dailyDeficit = Math.round(weeklyDeficit / 7);
      
      // Calculate activity calories
      const weeklyActivityCalories = (weightLiftingSessions * 250) + (cardioSessions * 300) + ((stepsPerDay / 10000) * 400 * 7);
      const dailyActivityCalories = Math.round(weeklyActivityCalories / 7);
      
      // Calculate base BMR
      const bmr = calculateBMR(currentWeight, height, age, gender);
      
      // Calculate TDEE (Base) - sedentary
      const tdeeSedentary = Math.round(bmr * 1.2); // 1.2 is sedentary multiplier
      
      // Total daily energy output = TDEE (base) + activity calories
      const totalEnergyOutput = tdeeSedentary + dailyActivityCalories;
      
      // Store this as maintenance calories
      const maintenanceCalories = totalEnergyOutput;
      
      // Calculate daily calorie target based on user-selected value or calculated deficit
      // If user has selected a value with the slider, use that; otherwise calculate it
      const dailyCalorieTarget = selectedCalorieTarget !== null 
        ? selectedCalorieTarget 
        : Math.round(totalEnergyOutput - dailyDeficit);
      
      // Calculate daily deficit based on maintenance and target calories
      const actualDailyDeficit = maintenanceCalories - dailyCalorieTarget;
      
      // Calculate macros using the user's custom distribution
      const proteinGrams = Math.round((dailyCalorieTarget * macroDistribution.protein / 100) / 4);
      const fatGrams = Math.round((dailyCalorieTarget * macroDistribution.fat / 100) / 9);
      const carbGrams = Math.round((dailyCalorieTarget * macroDistribution.carbs / 100) / 4);
      
      // Save to backend
      await saveGoal({
        currentWeight,
        targetWeight,
        currentBodyFat,
        targetBodyFat,
        timeFrame,
        maintenanceCalories,
        deficitRate: weeklyDeficitPercent / 100, // Use the user-selected deficit rate
        dailyCalorieTarget,
        dailyDeficit: actualDailyDeficit, // Use the actual deficit based on selected calories
        proteinGrams,
        fatGrams,
        carbGrams,
        workoutSplit: "full_body",
        weightLiftingSessions,
        cardioSessions,
        stepsPerDay,
        weeklyActivityCalories,
        dailyActivityCalories,
        refeedDays: 0,
        dietBreakWeeks: 0,
        focusAreas: []
      });
      
      toast({
        title: "Success!",
        description: "Your transformation plan has been created.",
        variant: "default",
      });
      
      // Navigate to view plan
      setLocation("/view-plan");
    } catch (error) {
      console.error('Error saving data:', error);
      toast({
        title: "Error",
        description: "There was an error creating your plan. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Calculate guidance metrics based on current form values
  const guidanceMetrics = useMemo(() => {
    if (!profileData) return null;
    
    // Calculate BMR
    const bmr = calculateBMR(
      currentWeight, 
      (profileData.height || 170), 
      (profileData.age || 30), 
      profileData.gender
    );
    
    // Calculate TDEE (Base) - sedentary
    const tdeeSedentary = Math.round(bmr * 1.2); // 1.2 is sedentary multiplier
    
    // Calculate activity calories
    const weeklyActivityCalories = (weightLiftingSessions * 250) + (cardioSessions * 300) + ((stepsPerDay / 10000) * 400 * 7);
    const dailyActivityCalories = Math.round(weeklyActivityCalories / 7);
    
    // Total daily energy output = TDEE (base) + activity calories
    const totalEnergyOutput = tdeeSedentary + dailyActivityCalories;
    
    // This is the true maintenance calories
    const maintenanceCalories = totalEnergyOutput;
    
    // Calculate deficit and rate of loss based on the article principles
    const deficitResult = calculateCalorieDeficit(
      currentWeight, 
      targetWeight, 
      timeFrame, 
      maintenanceCalories,
      currentBodyFat,
      targetBodyFat,
      'maintenance', // Using maintenance mode as default - eat at maintenance, use activity for deficit
      weightLiftingSessions,
      cardioSessions,
      stepsPerDay,
      0, // refeed days
      0, // diet break weeks
      weeklyDeficitPercent / 100 // Convert percentage to decimal for deficitRate
    );
    
    // Calculate recommended protein intake
    const macros = calculateMacros(
      currentWeight,
      deficitResult.dailyFoodCalorieTarget,
      currentBodyFat,
      'intermediate'
    );
    
    // Calculate the percentage deficit manually
    const percentageDeficit = (deficitResult.dailyCalorieDeficit / maintenanceCalories) * 100;
    
    return {
      weeklyLossRate: deficitResult.weeklyFatLossRate,
      percentageDeficit,
      maintenanceCalories,
      dailyDeficit: deficitResult.dailyCalorieDeficit,
      proteinGrams: macros.proteinGrams,
      deficitResult,
      macros
    };
  }, [
    profileData, 
    currentWeight, 
    targetWeight, 
    currentBodyFat, 
    targetBodyFat, 
    timeFrame, 
    weightLiftingSessions, 
    cardioSessions, 
    stepsPerDay
  ]);
  
  // Calculate protein percentage from g/kg value
  const calculateProteinPercentage = (gramsPerKg: number, calories: number) => {
    // Convert g/kg to total grams
    const totalGrams = Math.round(currentWeight * gramsPerKg);
    // Convert grams to calories (1g protein = 4 calories)
    const proteinCalories = totalGrams * 4;
    // Calculate percentage of total calories
    return Math.round((proteinCalories / calories) * 100);
  };

  // Calculate g/kg from protein percentage
  const calculateGramsPerKg = (proteinPercentage: number, calories: number) => {
    // Calculate protein calories
    const proteinCalories = (proteinPercentage / 100) * calories;
    // Convert to grams (1g protein = 4 calories)
    const totalGrams = proteinCalories / 4;
    // Calculate g/kg
    return totalGrams / currentWeight;
  };

  // Update macroDistribution and calorieTarget when metrics load
  useEffect(() => {
    if (guidanceMetrics) {
      // Set the default calorie target based on guidance metrics
      const dailyCalories = guidanceMetrics.deficitResult.dailyFoodCalorieTarget || 2000;
      
      // Initialize the calorie target slider if not set yet
      if (selectedCalorieTarget === null) {
        setSelectedCalorieTarget(dailyCalories);
      }
      
      // Calculate protein percentage based on g/kg
      const proteinPct = calculateProteinPercentage(proteinGramsPerKg, dailyCalories);
      
      // Remaining for carbs
      const carbsPct = Math.max(0, 100 - proteinPct - 25);
      
      setMacroDistribution({
        protein: proteinPct,
        fat: 25,
        carbs: carbsPct
      });
    }
  }, [guidanceMetrics, currentWeight, selectedCalorieTarget, proteinGramsPerKg]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Set Your Goals</h1>
      <p className="text-gray-600 mb-6">Define what you want to achieve in your fitness journey</p>

      <Tabs defaultValue="form" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="form">Input Your Goals</TabsTrigger>
          <TabsTrigger value="guidance">Fat Loss Guidance</TabsTrigger>
        </TabsList>
        
        <TabsContent value="form">
          <Card>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                  <div className="bg-white p-4 rounded-md border border-gray-200 mb-6">
                    <div className="flex items-center space-x-2 text-lg font-semibold mb-2 text-green-700">
                      <div className="bg-green-100 rounded-full h-8 w-8 flex items-center justify-center">1</div>
                      <h2>Phase 1: Calculate Your Maintenance Calories</h2>
                    </div>
                    <p className="text-gray-600 mb-4">First, we'll calculate your daily maintenance calories - the amount you should consume each day for optimal results. Our approach focuses on eating at maintenance and creating a deficit through activity.</p>
                  </div>
                
                  {/* Personal Data Section */}
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <h2 className="text-lg font-semibold mb-4">Personal Data</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                        <Input
                          type="number"
                          min="18"
                          max="100"
                          value={age}
                          onChange={(e) => setAge(parseInt(e.target.value))}
                          className="w-full"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                        <Select value={gender} onValueChange={(value) => setGender(value as "male" | "female")}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Height (cm)</label>
                        <Input
                          type="number"
                          min="100"
                          max="250"
                          value={height}
                          onChange={(e) => setHeight(parseInt(e.target.value))}
                          className="w-full"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Current Weight (kg)</label>
                        <Input
                          type="number"
                          step="0.1"
                          value={currentWeight}
                          onChange={(e) => {
                            const newCurrentWeight = parseFloat(e.target.value);
                            setCurrentWeight(newCurrentWeight);
                            
                            // Recalculate timeframe when current weight changes
                            if (newCurrentWeight > targetWeight) {
                              // Use the new calculation function for consistency
                              const weeksRequired = calculateWeeksToGoal(
                                newCurrentWeight,
                                targetWeight,
                                weeklyDeficitPercent
                              );
                              // Cap at 52 weeks for realistic planning
                              setTimeFrame(Math.min(weeksRequired, 52));
                            }
                          }}
                          placeholder="Your current weight"
                          className="w-full"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Current Body Fat % (optional)
                        </label>
                        <Input
                          type="number"
                          step="0.1"
                          value={currentBodyFat || ''}
                          onChange={(e) => setCurrentBodyFat(e.target.value ? parseFloat(e.target.value) : undefined)}
                          placeholder="Your current body fat %"
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-4 rounded-md border border-gray-200 mb-6 mt-6">
                    <div className="flex items-center space-x-2 text-lg font-semibold mb-2 text-blue-700">
                      <div className="bg-blue-100 rounded-full h-8 w-8 flex items-center justify-center">1A</div>
                      <h2>Activity & Exercise Planning</h2>
                    </div>
                    <p className="text-gray-600 mb-4">Enter your planned physical activities to accurately calculate your maintenance calories. <strong>Our recommended approach: eat at maintenance calories and create your deficit through exercise</strong> - this helps preserve muscle and optimize metabolism.</p>
                    <div className="text-xs text-gray-500 mt-2 bg-yellow-50 p-2 rounded border border-yellow-200">
                      <span className="font-medium">Note:</span> The calorie burn estimates shown here are standardized values used for planning:
                      <ul className="list-disc pl-5 mt-1">
                        <li>Strength training: 250 kcal per 60-min session</li>
                        <li>Cardio: 300 kcal per 30-min session (600 kcal/hour)</li>
                        <li>Steps: 400 kcal per 10,000 steps</li>
                      </ul>
                      Daily logging will use more precise calculations based on actual activity.
                    </div>
                  </div>
                  
                  {/* Weight Goals Section */}
                  <div className="border rounded-lg p-4">
                    <h2 className="text-lg font-semibold mb-4">Weight Goals</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Target Weight (kg)</label>
                        <Input
                          type="number"
                          step="0.1"
                          value={targetWeight}
                          onChange={(e) => {
                            const newTargetWeight = parseFloat(e.target.value);
                            setTargetWeight(newTargetWeight);
                            
                            // Recalculate timeframe when target weight changes
                            if (currentWeight > newTargetWeight) {
                              // Use the new calculation function for consistency
                              const weeksRequired = calculateWeeksToGoal(
                                currentWeight,
                                newTargetWeight,
                                weeklyDeficitPercent
                              );
                              // Cap at 52 weeks for realistic planning
                              setTimeFrame(Math.min(weeksRequired, 52));
                            }
                          }}
                          placeholder="Your goal weight"
                          className="w-full"
                          required
                        />
                      </div>
                      

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Target Body Fat % (optional)
                        </label>
                        <Input
                          type="number"
                          step="0.1"
                          value={targetBodyFat || ''}
                          onChange={(e) => setTargetBodyFat(e.target.value ? parseFloat(e.target.value) : undefined)}
                          placeholder="Your goal body fat %"
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Activity Level Section */}
                  <div className="border rounded-lg p-4 bg-green-50">
                    <h2 className="text-lg font-semibold mb-4">
                      Activity Level
                      <Badge variant="outline" className="ml-2 bg-green-100">Maintenance Calories</Badge>
                    </h2>
                    
                    {/* Maintenance Calories Summary */}
                    {profileData && guidanceMetrics && (
                      <div className="mb-6 bg-white p-3 rounded-md border border-green-100">
                        <h3 className="font-semibold text-green-700 mb-2">Daily Maintenance Calories</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pb-2">
                          <div className="flex flex-col">
                            <span className="text-sm text-gray-500">TDEE (Base)</span>
                            <span className="text-gray-700 font-semibold">
                              {Math.round(calculateBMR(currentWeight, profileData.height || 170, profileData.age || 30, profileData.gender) * 1.2)} kcal
                            </span>
                            <span className="text-xs text-gray-400">Your sedentary calorie burn</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm text-gray-500">Activity Calories</span>
                            <span className="text-green-500 font-semibold">
                              {Math.round(((weightLiftingSessions * 250) + (cardioSessions * 300) + ((stepsPerDay / 10000) * 400 * 7)) / 7)} kcal
                            </span>
                            <span className="text-xs text-gray-400">From exercise & steps</span>
                          </div>
                          <div className="flex flex-col p-2 border border-green-100 rounded-md bg-green-50">
                            <span className="text-sm text-gray-700">Maintenance Calories</span>
                            <span className="text-xl text-green-600 font-semibold">
                              {guidanceMetrics.maintenanceCalories} kcal/day
                            </span>
                            <span className="text-xs text-gray-500">Recommended: Eat exactly this amount each day for optimal results</span>
                          </div>
                        </div>

                        {/* Daily Calorie Target Control */}
                        <div className="mt-6 p-4 border border-blue-100 rounded-lg bg-white">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-semibold text-blue-700">Daily Calorie Target</h4>
                            <div className="flex items-center">
                              <span className="text-xl font-bold text-blue-600">
                                {selectedCalorieTarget !== null ? selectedCalorieTarget : guidanceMetrics.deficitResult.dailyFoodCalorieTarget} kcal
                              </span>
                              {selectedCalorieTarget !== null && selectedCalorieTarget < guidanceMetrics.maintenanceCalories && (
                                <Badge variant="outline" className="ml-2 bg-amber-100 text-amber-700 border-amber-200">
                                  {Math.round((1 - selectedCalorieTarget / guidanceMetrics.maintenanceCalories) * 100)}% deficit
                                </Badge>
                              )}
                            </div>
                          </div>

                          {/* Simple numeric input instead of slider for more reliable control */}
                          <div className="mb-4">
                            <div className="flex items-center">
                              <Input 
                                type="number"
                                min={Math.round(guidanceMetrics.maintenanceCalories * 0.75)} 
                                max={guidanceMetrics.maintenanceCalories}
                                step={50}
                                value={selectedCalorieTarget !== null ? selectedCalorieTarget : guidanceMetrics.deficitResult.dailyFoodCalorieTarget}
                                onChange={(e) => {
                                  const newCalorieTarget = Number(e.target.value);
                                  console.log("Calorie target changed to:", newCalorieTarget);
                                  
                                  if (newCalorieTarget >= Math.round(guidanceMetrics.maintenanceCalories * 0.75) && 
                                      newCalorieTarget <= guidanceMetrics.maintenanceCalories) {
                                    
                                    // Set the state
                                    setSelectedCalorieTarget(newCalorieTarget);
                                    
                                    // Update macros distribution based on new calorie target
                                    const proteinPct = calculateProteinPercentage(proteinGramsPerKg, newCalorieTarget);
                                    const carbsPct = Math.max(0, 100 - proteinPct - 25);
                                    
                                    setMacroDistribution({
                                      protein: proteinPct,
                                      fat: 25,
                                      carbs: carbsPct
                                    });
                                  }
                                }}
                                className="w-32 mr-4"
                              />
                              <span className="text-gray-500">kcal per day</span>
                            </div>
                          </div>

                          <div className="flex justify-between text-xs text-gray-500 mb-3">
                            <span>Suggested Range: {Math.round(guidanceMetrics.maintenanceCalories * 0.75)} kcal (25% deficit) to {guidanceMetrics.maintenanceCalories} kcal (maintenance)</span>
                          </div>
                          
                          {/* Visual representation of deficit percentage */}
                          {selectedCalorieTarget !== null && (
                            <div className="mb-4 p-3 bg-blue-50 rounded-md">
                              <div className="flex justify-between mb-1">
                                <span className="text-sm font-medium">Deficit Percentage:</span>
                                <span className="text-sm font-bold text-blue-700">
                                  {Math.round((1 - selectedCalorieTarget / guidanceMetrics.maintenanceCalories) * 100)}%
                                </span>
                              </div>
                              <div className="flex justify-between mb-1">
                                <span className="text-sm font-medium">Daily Calorie Deficit:</span>
                                <span className="text-sm font-bold text-blue-700">
                                  {Math.round(guidanceMetrics.maintenanceCalories - selectedCalorieTarget)} kcal
                                </span>
                              </div>
                              <div className="flex justify-between mb-1">
                                <span className="text-sm font-medium">Weekly Calorie Deficit:</span>
                                <span className="text-sm font-bold text-blue-700">
                                  {Math.round((guidanceMetrics.maintenanceCalories - selectedCalorieTarget) * 7)} kcal
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                                <div 
                                  className="bg-blue-600 h-2.5 rounded-full" 
                                  style={{ width: `${(selectedCalorieTarget / guidanceMetrics.maintenanceCalories) * 100}%` }}
                                ></div>
                              </div>
                            </div>
                          )}

                          <div className="text-sm text-gray-600 mt-2">
                            <Info className="h-4 w-4 inline-block mr-1 text-blue-500" />
                            Adjust your daily calorie target based on your preferences. The recommended approach is to eat at maintenance 
                            and create your deficit through activity, but you can also reduce calories directly if needed.
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Weight Training (days/week)
                        </label>
                        <Input
                          type="number"
                          min="0"
                          max="7"
                          value={weightLiftingSessions}
                          onChange={(e) => setWeightLiftingSessions(parseInt(e.target.value))}
                          className="w-full"
                        />
                        <div className="mt-1 text-xs text-gray-600">
                          <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                          Recommended: 3-4 sessions for muscle preservation
                        </div>
                        <div className="mt-1 text-xs text-gray-500">
                          <span className="inline-block w-2 h-2 bg-orange-500 rounded-full mr-1"></span>
                          ~250 kcal/session (60 mins)
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Cardio Sessions (days/week)
                        </label>
                        <Input
                          type="number"
                          min="0"
                          max="7"
                          value={cardioSessions}
                          onChange={(e) => setCardioSessions(parseInt(e.target.value))}
                          className="w-full"
                        />
                        <div className="mt-1 text-xs text-gray-600">
                          <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                          Optional: 2-3 light to moderate intensity sessions
                        </div>
                        <div className="mt-1 text-xs text-gray-500">
                          <span className="inline-block w-2 h-2 bg-orange-500 rounded-full mr-1"></span>
                          ~300 kcal/session (30 mins) or ~600 kcal/hour
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Daily Steps Target
                        </label>
                        <Input
                          type="number"
                          min="1000"
                          max="30000"
                          step="1000"
                          value={stepsPerDay}
                          onChange={(e) => setStepsPerDay(parseInt(e.target.value))}
                          className="w-full"
                        />
                        <div className="mt-1 text-xs text-gray-600">
                          <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                          Recommended: 7,000-10,000 steps for general health
                        </div>
                        <div className="mt-1 text-xs text-gray-500">
                          <span className="inline-block w-2 h-2 bg-orange-500 rounded-full mr-1"></span>
                          ~400 kcal/10,000 steps
                        </div>
                      </div>
                    </div>
                  </div>
                  

                  
                  {/* Fat Loss Rate Section */}
                  <div className="border rounded-lg p-4 bg-green-50">
                    <h2 className="text-lg font-semibold mb-4">Fat Loss Rate</h2>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Weekly deficit (0.5% - 1.0% of body weight)
                      </label>
                      <div className="flex flex-col space-y-1">
                        <Slider
                          defaultValue={[0.75]}
                          max={1}
                          min={0.5}
                          step={0.05}
                          value={[weeklyDeficitPercent]}
                          onValueChange={(vals) => {
                            setWeeklyDeficitPercent(vals[0]);
                            
                            // Calculate the time needed to reach target weight at this deficit rate
                            if (currentWeight > targetWeight) {
                              // Use the calculateWeeksToGoal function for consistency
                              const weeksRequired = calculateWeeksToGoal(
                                currentWeight,
                                targetWeight,
                                vals[0]
                              );
                              // Cap at 52 weeks for realistic planning
                              setTimeFrame(Math.min(weeksRequired, 52));
                            }
                          }}
                          className="max-w-md"
                        />
                        <div className="flex justify-between max-w-md">
                          <span className="text-xs text-gray-500">0.5% (slower)</span>
                          <span className="text-xs text-gray-500 font-medium">
                            {weeklyDeficitPercent.toFixed(2)}% ({(currentWeight * weeklyDeficitPercent / 100).toFixed(2)}kg/week)
                          </span>
                          <span className="text-xs text-gray-500">1.0% (faster)</span>
                        </div>
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        <Info className="inline h-3 w-3 mr-1" /> 
                        A deficit of 0.5-1% of your body weight per week is optimal for sustainable fat loss while preserving muscle.
                      </p>
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Estimated Time Frame
                      </label>
                      <div className="flex items-center justify-between max-w-md">
                        <div className="flex items-center">
                          <div className="text-2xl font-bold text-green-600 mr-2">{timeFrame}</div>
                          <span className="text-gray-700">weeks</span>
                        </div>
                        
                        <div className="text-sm text-gray-600">
                          ({Math.floor(timeFrame/4)} months, {timeFrame % 4} weeks)
                        </div>
                      </div>
                      
                      <p className="mt-1 text-xs text-gray-500">
                        <Info className="inline h-3 w-3 mr-1" />
                        This is the estimated time to reach your goal weight based on your selected deficit.
                        The actual timeline may vary as metabolism adapts.
                      </p>
                    </div>
                    
                    {/* Weight Loss Projection Graph */}
                    <div className="mt-6 border rounded p-4 bg-white">
                      <h3 className="text-md font-medium mb-4">Projected Weight Loss</h3>
                      
                      {/* We calculate the projected weight loss based on weekly deficit percentage */}
                      {(() => {
                        // Generate weight loss projection data - weight loss in kg per week
                        const weeklyLossRate = currentWeight * weeklyDeficitPercent / 100;
                        const weightLossData = [];
                        
                        // Use non-linear projection for more realistic results
                        const projectedWeights = projectNonLinearWeightLoss(
                          currentWeight,
                          targetWeight,
                          timeFrame,
                          weeklyLossRate
                        );
                        
                        // Create data for the chart
                        for (let week = 0; week <= timeFrame; week++) {
                          weightLossData.push({
                            week: `Week ${week}`,
                            weight: projectedWeights[week],
                          });
                        }
                        
                        return (
                          <div className="w-full h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart
                                data={weightLossData}
                                margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
                              >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis 
                                  dataKey="week" 
                                  tick={{ fontSize: 12 }}
                                  interval={Math.ceil(timeFrame / 5)}
                                />
                                <YAxis 
                                  domain={[
                                    Math.min(targetWeight - 2, projectedWeights[timeFrame] - 2),
                                    currentWeight + 2
                                  ]}
                                  tick={{ fontSize: 12 }}
                                  label={{ 
                                    value: 'Weight (kg)', 
                                    angle: -90, 
                                    position: 'insideLeft', 
                                    style: { textAnchor: 'middle' } 
                                  }}
                                />
                                <Tooltip formatter={(value) => typeof value === 'number' ? [`${value.toFixed(1)} kg`, 'Weight'] : [`${value}`, 'Weight']}/>
                                <Legend />
                                <Line 
                                  type="monotone" 
                                  dataKey="weight" 
                                  stroke="#10b981" 
                                  strokeWidth={2}
                                  activeDot={{ r: 8 }}
                                  name="Projected Weight"
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        );
                      })()}
                      
                      <p className="text-xs text-gray-500 mt-2">
                        This projection shows your estimated weight loss over time. Weight loss typically 
                        slows as you get closer to your goal, which is reflected in this graph.
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-white p-4 rounded-md border border-gray-200 mb-6 mt-6">
                    <div className="flex items-center space-x-2 text-lg font-semibold mb-2 text-blue-700">
                      <div className="bg-blue-100 rounded-full h-8 w-8 flex items-center justify-center">2</div>
                      <h2>Phase 2: Plan Your Activity to Create Your Deficit</h2>
                    </div>
                    <p className="text-gray-600 mb-4">We recommend eating at your maintenance calories and creating your calorie deficit through physical activity for optimal results.</p>
                  </div>
                  
                  {/* Calorie In vs Out Section */}
                  {profileData && guidanceMetrics && (
                    <div className="border rounded-lg p-4 bg-blue-50 mb-6">
                      <h2 className="text-lg font-semibold mb-4">Energy Balance</h2>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white p-4 rounded-md shadow-sm border border-gray-200">
                          <h3 className="text-sm font-medium text-gray-700 mb-3">Calories In vs Calories Out</h3>
                          
                          <div className="flex justify-between items-center mb-3">
                            <div className="flex flex-col">
                              <span className="text-sm text-gray-500">Maintenance Calories</span>
                              <span className="text-xl font-bold text-gray-800">{guidanceMetrics.maintenanceCalories} kcal</span>
                              <span className="text-xs text-gray-500">Your recommended daily calorie target</span>
                            </div>
                            
                            <ArrowRight className="text-gray-400 h-5 w-5 mx-2" />
                            
                            <div className="flex flex-col">
                              <span className="text-sm text-gray-500">Maintenance Calories</span>
                              <span className="text-xl font-bold text-green-600">{guidanceMetrics.maintenanceCalories} kcal</span>
                              <span className="text-xs text-gray-500">Eat at maintenance level</span>
                            </div>
                            
                            <span className="text-3xl font-bold text-gray-300">=</span>
                            
                            <div className="flex flex-col">
                              <span className="text-sm text-gray-500">Activity Deficit</span>
                              <span className="text-xl font-bold text-red-500">-{Math.round(guidanceMetrics.maintenanceCalories - guidanceMetrics.deficitResult.dailyFoodCalorieTarget)} kcal</span>
                              <span className="text-xs text-gray-500">Create through activity</span>
                            </div>
                          </div>
                          
                          <div className="w-full bg-gray-200 h-6 rounded-full overflow-hidden relative">
                            {/* Food intake bar */}
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-green-500 h-full rounded-full flex items-center"
                              style={{ width: `${(guidanceMetrics.deficitResult.dailyFoodCalorieTarget / guidanceMetrics.maintenanceCalories) * 100}%` }}
                            >
                              <span className="text-xs text-white mx-auto">Food Intake</span>
                            </div>
                            
                            {/* Deficit zone marking */}
                            <div 
                              className="absolute top-0 right-0 bg-red-200 bg-opacity-50 h-full border-l-2 border-red-500 border-dashed flex items-center"
                              style={{ 
                                width: `${(Math.round(guidanceMetrics.maintenanceCalories - guidanceMetrics.deficitResult.dailyFoodCalorieTarget) / guidanceMetrics.maintenanceCalories) * 100}%`
                              }}
                            >
                              <span className="text-xs text-red-700 mx-auto">Deficit</span>
                            </div>
                          </div>
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>0</span>
                            <span>{guidanceMetrics.deficitResult.dailyFoodCalorieTarget} kcal (Food Intake)</span>
                            <span>{guidanceMetrics.maintenanceCalories} kcal (Maintenance Calories)</span>
                          </div>
                        </div>
                        
                        <div className="bg-white p-4 rounded-md shadow-sm border border-gray-200">
                          <h3 className="text-sm font-medium text-gray-700 mb-3">Your Activity-Based Fat Loss Math</h3>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between border-b pb-1">
                              <span className="text-sm">Daily Maintenance Calories:</span>
                              <span className="font-medium">{guidanceMetrics.maintenanceCalories} kcal</span>
                            </div>
                            {(() => {
                              const actualDailyDeficit = Math.round(guidanceMetrics.maintenanceCalories - guidanceMetrics.deficitResult.dailyFoodCalorieTarget);
                              const weeklyDeficit = actualDailyDeficit * 7;
                              const weeklyFatLoss = (weeklyDeficit / 7700).toFixed(2);
                              return (
                                <>
                                  <div className="flex justify-between border-b pb-1">
                                    <span className="text-sm">Daily Activity Deficit Target:</span>
                                    <span className="font-medium text-red-500">-{actualDailyDeficit} kcal</span>
                                  </div>
                                  <div className="flex justify-between border-b pb-1">
                                    <span className="text-sm">Your Daily Maintenance Target:</span>
                                    <span className="font-medium text-green-600">{guidanceMetrics.maintenanceCalories} kcal</span>
                                  </div>
                                  <div className="flex justify-between border-b pb-1">
                                    <span className="text-sm">Weekly Activity Deficit:</span>
                                    <span className="font-medium text-red-500">-{weeklyDeficit} kcal</span>
                                  </div>
                                  <div className="flex justify-between border-b pb-1">
                                    <span className="text-sm">Weekly Fat Loss:</span>
                                    <span className="font-medium">≈ {weeklyFatLoss} kg</span>
                                  </div>
                                </>
                              );
                            })()}
                            <div className="flex justify-between text-sm">
                              <span className="text-xs text-gray-500 mt-2">
                                <Info className="inline h-3 w-3 mr-1" />
                                It takes approximately 7,700 kcal deficit to lose 1kg of fat
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Macronutrient Distribution Section */}
                  <div className="border rounded-lg p-4 bg-blue-50">
                    <h2 className="text-lg font-semibold mb-4">
                      Macronutrient Distribution
                      <Badge variant="outline" className="ml-2 bg-yellow-100">Customizable</Badge>
                    </h2>
                    
                    <div className="grid grid-cols-1 gap-6">
                      {/* Macro sliders and pie chart */}
                      <div className="flex flex-col md:flex-row md:gap-8">
                        {/* Sliders column */}
                        <div className="flex-1 space-y-6">
                          {/* Protein slider - scientific g/kg approach */}
                          <div>
                            <div className="flex justify-between mb-1">
                              <label className="text-sm font-medium text-gray-700">
                                Protein (g/kg bodyweight)
                              </label>
                              <div className="text-xs text-gray-600">
                                {(() => {
                                  // Calculate dailyCalories
                                  const dailyCalories = guidanceMetrics?.deficitResult.dailyFoodCalorieTarget || 2000;
                                  
                                  // Get protein g/kg from current percentage
                                  const proteinGPerKg = calculateGramsPerKg(macroDistribution.protein, dailyCalories);
                                  
                                  // Get total protein grams
                                  const proteinGrams = Math.round(currentWeight * proteinGPerKg);
                                  
                                  return `${proteinGPerKg.toFixed(1)}g/kg · ${proteinGrams}g (${macroDistribution.protein}%)`;
                                })()}
                              </div>
                            </div>
                            <Slider
                              min={1.8}
                              max={2.2}
                              step={0.1}
                              value={[proteinGramsPerKg]}
                              onValueChange={(values) => {
                                const newProteinGPerKg = values[0];
                                const dailyCalories = guidanceMetrics?.deficitResult.dailyFoodCalorieTarget || 2000;
                                
                                // Update the proteinGramsPerKg state
                                setProteinGramsPerKg(newProteinGPerKg);
                                
                                // Convert g/kg to percentage
                                const newProteinPct = calculateProteinPercentage(newProteinGPerKg, dailyCalories);
                                
                                // Adjust carbs to maintain 100% total with fat fixed at 25%
                                setMacroDistribution({
                                  protein: newProteinPct,
                                  fat: macroDistribution.fat,
                                  carbs: Math.max(0, 100 - newProteinPct - macroDistribution.fat)
                                });
                              }}
                            />
                            <div className="flex justify-between mt-1">
                              <span className="text-xs text-gray-500">1.8 g/kg</span>
                              <span className="text-xs text-gray-600 font-medium">Scientific range</span>
                              <span className="text-xs text-gray-500">2.2 g/kg</span>
                            </div>
                            <p className="mt-1 text-xs text-gray-500">
                              <Info className="inline h-3 w-3 mr-1" /> 
                              Scientific recommendation: 1.8-2.2g/kg for optimal muscle preservation.
                            </p>
                          </div>

                          {/* Fat slider */}
                          <div>
                            <div className="flex justify-between mb-1">
                              <label className="text-sm font-medium text-gray-700">
                                Fat (% of calories)
                              </label>
                              <div className="text-xs text-gray-600">
                                {(() => {
                                  // Calculate dailyCalories
                                  const dailyCalories = guidanceMetrics?.deficitResult.dailyFoodCalorieTarget || 2000;
                                  
                                  // Calculate fat grams
                                  const fatGrams = Math.round((dailyCalories * macroDistribution.fat / 100) / 9);
                                  
                                  return `${macroDistribution.fat}% · ${fatGrams}g`;
                                })()}
                              </div>
                            </div>
                            <Slider
                              min={20}
                              max={35}
                              step={1}
                              value={[macroDistribution.fat]}
                              onValueChange={(values) => {
                                const newFat = values[0];
                                
                                // Adjust carbs to maintain 100% total with protein fixed
                                setMacroDistribution({
                                  protein: macroDistribution.protein,
                                  fat: newFat,
                                  carbs: Math.max(0, 100 - macroDistribution.protein - newFat)
                                });
                              }}
                            />
                            <div className="flex justify-between mt-1">
                              <span className="text-xs text-gray-500">20% (min)</span>
                              <span className="text-xs text-gray-600 font-medium">25% (recommended)</span>
                              <span className="text-xs text-gray-500">35% (max)</span>
                            </div>
                            <p className="mt-1 text-xs text-gray-500">
                              <Info className="inline h-3 w-3 mr-1" /> 
                              Minimum 20% fat is essential for hormonal health. 25% is optimal for most.
                            </p>
                          </div>

                          {/* Carbs slider - calculated as remaining percentage */}
                          <div>
                            <div className="flex justify-between mb-1">
                              <label className="text-sm font-medium text-gray-700">
                                Carbs (% of calories)
                              </label>
                              <div className="text-xs text-gray-600">
                                {(() => {
                                  // Calculate dailyCalories
                                  const dailyCalories = guidanceMetrics?.deficitResult.dailyFoodCalorieTarget || 2000;
                                  
                                  // Calculate carb grams
                                  const carbGrams = Math.round((dailyCalories * macroDistribution.carbs / 100) / 4);
                                  
                                  return `${macroDistribution.carbs}% · ${carbGrams}g`;
                                })()}
                              </div>
                            </div>
                            <div className="h-8 bg-gray-100 rounded-full relative overflow-hidden">
                              <div 
                                className="h-full bg-blue-500 rounded-full flex items-center justify-center text-xs text-white font-medium"
                                style={{ width: `${macroDistribution.carbs}%` }}
                              >
                                {macroDistribution.carbs}%
                              </div>
                            </div>
                            <p className="mt-1 text-xs text-gray-500">
                              <Info className="inline h-3 w-3 mr-1" /> 
                              Carbs are automatically calculated from remaining calories after protein and fat are set.
                            </p>
                          </div>
                        </div>
                        
                        {/* Pie chart column */}
                        <div className="mt-6 md:mt-0 md:w-64 flex flex-col items-center justify-start">
                          <PieChart width={150} height={150}>
                            <Pie
                              data={[
                                { name: 'Protein', value: macroDistribution.protein },
                                { name: 'Fat', value: macroDistribution.fat },
                                { name: 'Carbs', value: macroDistribution.carbs }
                              ]}
                              cx="50%"
                              cy="50%"
                              innerRadius={30}
                              outerRadius={60}
                              paddingAngle={2}
                              dataKey="value"
                            >
                              <Cell fill="#22c55e" /> {/* Protein - green */}
                              <Cell fill="#f59e0b" /> {/* Fat - yellow */}
                              <Cell fill="#3b82f6" /> {/* Carbs - blue */}
                            </Pie>
                            <text x={75} y={75} textAnchor="middle" dominantBaseline="middle" className="text-xs font-medium">
                              {guidanceMetrics?.deficitResult.dailyFoodCalorieTarget || 2000} kcal
                            </text>
                          </PieChart>
                          
                          <div className="mt-4 text-sm text-center text-gray-700">
                            Your daily calorie target with
                            <div className="font-bold text-lg text-green-600">
                              {guidanceMetrics?.deficitResult.dailyFoodCalorieTarget || 2000} calories
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  

                </div>

                <div className="mt-8">
                  <Button type="submit" className="bg-green-600 hover:bg-green-700">
                    Build My Transformation Plan <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="guidance">
          {profileData && guidanceMetrics ? (
            <FatLossGuidance
              currentWeight={currentWeight}
              targetWeight={targetWeight}
              weeklyLossRate={guidanceMetrics.weeklyLossRate}
              percentageDeficit={guidanceMetrics.percentageDeficit}
              maintenanceCalories={guidanceMetrics.maintenanceCalories}
              dailyDeficit={guidanceMetrics.dailyDeficit}
              proteinGrams={guidanceMetrics.proteinGrams}
              liftingSessionsPerWeek={weightLiftingSessions}
            />
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <p>Complete your profile information to see personalized fat loss guidance.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}