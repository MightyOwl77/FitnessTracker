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
  
  const [focusArea, setFocusArea] = useState<string[]>(
    goalData?.focusAreas as string[] ?? []
  );

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

  const handleFocusAreaToggle = (area: string) => {
    if (focusArea.includes(area)) {
      setFocusArea(focusArea.filter(a => a !== area));
    } else {
      setFocusArea([...focusArea, area]);
    }
  };

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
      
      // Calculate maintenance calories
      const maintenanceCalories = calculateBMR(currentWeight, height, age, gender) * 
        (gender === 'female' ? 1.55 : 1.6); // Activity multiplier
      
      // Calculate daily calorie target
      const dailyCalorieTarget = maintenanceCalories - dailyDeficit + dailyActivityCalories;
      
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
        deficitType: "moderate", // Use moderate as the type
        dailyCalorieTarget,
        dailyDeficit,
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
        focusAreas: focusArea as any
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
    
    // Estimate maintenance calories based on BMR
    const maintenanceCalories = profileData.gender === 'female' 
      ? Math.round((655 + (9.6 * currentWeight) + (1.8 * (profileData.height || 170)) - (4.7 * (profileData.age || 30))) * 1.55)
      : Math.round((66 + (13.7 * currentWeight) + (5 * (profileData.height || 170)) - (6.8 * (profileData.age || 30))) * 1.55);
    
    // Calculate deficit and rate of loss based on the article principles
    const deficitResult = calculateCalorieDeficit(
      currentWeight, 
      targetWeight, 
      timeFrame, 
      maintenanceCalories,
      currentBodyFat,
      targetBodyFat,
      'moderate',
      weightLiftingSessions,
      cardioSessions,
      stepsPerDay,
      0, // refeed days
      0  // diet break weeks
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

  // Update macroDistribution when metrics load
  useEffect(() => {
    if (guidanceMetrics) {
      // Scientific protein: 1.8g per kg bodyweight
      const dailyCalories = guidanceMetrics.deficitResult.dailyFoodCalorieTarget || 2000;
      const proteinGramsPerKg = 1.8; // Scientific default
      
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
  }, [guidanceMetrics, currentWeight]);

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
                    </div>
                    
                    {/* TDEE Display Section */}
                    <div className="mt-4 p-3 bg-white rounded-md border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-medium text-gray-700 flex items-center">
                            Total Daily Energy Expenditure (TDEE)
                            <span className="ml-2 inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                              Sedentary
                            </span>
                          </h3>
                          <p className="text-xs text-gray-500 mt-0.5">
                            Calories burned daily with minimal activity (1.2× BMR)
                          </p>
                        </div>
                        <div className="text-2xl font-bold text-blue-600">
                          {Math.round(calculateBMR(currentWeight, height, age, gender) * 1.2)} <span className="text-sm font-normal text-gray-600">kcal/day</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Weight Goals Section */}
                  <div className="border rounded-lg p-4">
                    <h2 className="text-lg font-semibold mb-4">Weight Goals</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  
                  {/* Macronutrient Distribution Section */}
                  <div className="border rounded-lg p-4 bg-blue-50">
                    <h2 className="text-lg font-semibold mb-4">
                      Macronutrient Distribution
                      <Badge variant="outline" className="ml-2 bg-blue-100">Scientific Default</Badge>
                      <Badge variant="outline" className="ml-2 bg-yellow-100">Customizable</Badge>
                    </h2>
                    
                    <div className="grid grid-cols-1 gap-6">
                      {/* Protein (scientific g/kg approach) */}
                      <div>
                        <div className="flex justify-between mb-1">
                          <label className="text-sm font-medium text-gray-700">
                            Protein
                          </label>
                          <div className="flex flex-col items-end">
                            {/* Calculate scientifically recommended protein based on weight */}
                            {(() => {
                              // Scientific recommendation: 1.8g per kg
                              const scientificProtein = Math.round(currentWeight * 1.8);
                              const proteinCalories = scientificProtein * 4;
                              const dailyCalories = guidanceMetrics?.deficitResult.dailyFoodCalorieTarget || 2000;
                              const proteinPercentage = Math.round((proteinCalories / dailyCalories) * 100);
                              
                              return (
                                <>
                                  <span className="text-xs text-gray-500">
                                    {scientificProtein}g ({proteinCalories} kcal)
                                  </span>
                                  <span className="text-xs text-green-600">
                                    ({(scientificProtein / currentWeight).toFixed(1)}g/kg · {proteinPercentage}%)
                                  </span>
                                </>
                              );
                            })()}
                          </div>
                        </div>
                        
                        {/* Visual representation of protein amount */}
                        <div className="h-8 bg-gray-100 rounded-full max-w-md relative overflow-hidden">
                          {(() => {
                            const scientificProtein = Math.round(currentWeight * 1.8);
                            const proteinCalories = scientificProtein * 4;
                            const dailyCalories = guidanceMetrics?.deficitResult.dailyFoodCalorieTarget || 2000;
                            const proteinPercentage = (proteinCalories / dailyCalories) * 100;
                            
                            return (
                              <div 
                                className="h-full bg-green-500 rounded-full flex items-center justify-center text-xs text-white font-medium"
                                style={{ width: `${proteinPercentage}%` }}
                              >
                                {Math.round(proteinPercentage)}%
                              </div>
                            );
                          })()}
                        </div>
                        
                        <div className="mt-2 text-xs text-gray-600 bg-green-50 p-2 rounded">
                          <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                          <strong>Scientific recommendation:</strong> 1.8g protein per kg of bodyweight (total: {Math.round(currentWeight * 1.8)}g)
                        </div>
                      </div>
                      
                      {/* Fat (scientific approach) */}
                      <div>
                        <div className="flex justify-between mb-1">
                          <label className="text-sm font-medium text-gray-700">
                            Fat
                          </label>
                          <div className="flex flex-col items-end">
                            {/* Calculate fat based on scientific recommendation (25%) */}
                            {(() => {
                              // Get daily calories
                              const dailyCalories = guidanceMetrics?.deficitResult.dailyFoodCalorieTarget || 2000;
                              
                              // Scientific recommendation for fat (25% of calories)
                              const fatPercentage = 25;
                              const fatCalories = Math.round(dailyCalories * fatPercentage / 100);
                              const fatGrams = Math.round(fatCalories / 9);
                              
                              return (
                                <>
                                  <span className="text-xs text-gray-500">
                                    {fatGrams}g ({fatCalories} kcal)
                                  </span>
                                  <span className="text-xs text-yellow-600">
                                    ({fatPercentage}% of calories)
                                  </span>
                                </>
                              );
                            })()}
                          </div>
                        </div>
                        
                        {/* Visual representation of fat amount */}
                        <div className="h-8 bg-gray-100 rounded-full max-w-md relative overflow-hidden">
                          <div 
                            className="h-full bg-yellow-500 rounded-full flex items-center justify-center text-xs text-white font-medium"
                            style={{ width: `25%` }}
                          >
                            25%
                          </div>
                        </div>
                        
                        <div className="mt-2 text-xs text-gray-600 bg-yellow-50 p-2 rounded">
                          <span className="inline-block w-2 h-2 bg-yellow-500 rounded-full mr-1"></span>
                          <strong>Scientific recommendation:</strong> Minimum 20-25% fat intake is essential for hormonal health during fat loss
                        </div>
                      </div>
                      
                      {/* Carbs (remaining calories) */}
                      <div>
                        <div className="flex justify-between mb-1">
                          <label className="text-sm font-medium text-gray-700">
                            Carbohydrates
                          </label>
                          <div className="flex flex-col items-end">
                            {/* Calculate carbs by subtracting protein and fat calories from total */}
                            {(() => {
                              // Get daily calories
                              const dailyCalories = guidanceMetrics?.deficitResult.dailyFoodCalorieTarget || 2000;
                              
                              // Get protein calories
                              const scientificProtein = Math.round(currentWeight * 1.8);
                              const proteinCalories = scientificProtein * 4;
                              
                              // Get fat calories (25%)
                              const fatCalories = Math.round(dailyCalories * 0.25);
                              
                              // Calculate remaining calories for carbs
                              const carbCalories = dailyCalories - proteinCalories - fatCalories;
                              const carbGrams = Math.round(carbCalories / 4);
                              const carbPercentage = Math.round((carbCalories / dailyCalories) * 100);
                              
                              return (
                                <>
                                  <span className="text-xs text-gray-500">
                                    {carbGrams}g ({carbCalories} kcal)
                                  </span>
                                  <span className="text-xs text-blue-600">
                                    ({carbPercentage}% of calories)
                                  </span>
                                </>
                              );
                            })()}
                          </div>
                        </div>
                        
                        {/* Visual representation of carb amount */}
                        <div className="h-8 bg-gray-100 rounded-full max-w-md relative overflow-hidden">
                          {(() => {
                            // Get daily calories
                            const dailyCalories = guidanceMetrics?.deficitResult.dailyFoodCalorieTarget || 2000;
                              
                            // Get protein calories
                            const scientificProtein = Math.round(currentWeight * 1.8);
                            const proteinCalories = scientificProtein * 4;
                              
                            // Get fat calories (25%)
                            const fatCalories = Math.round(dailyCalories * 0.25);
                              
                            // Calculate remaining calories for carbs
                            const carbCalories = dailyCalories - proteinCalories - fatCalories;
                            const carbPercentage = (carbCalories / dailyCalories) * 100;
                            
                            return (
                              <div 
                                className="h-full bg-blue-500 rounded-full flex items-center justify-center text-xs text-white font-medium"
                                style={{ width: `${Math.max(0, carbPercentage)}%` }}
                              >
                                {Math.round(Math.max(0, carbPercentage))}%
                              </div>
                            );
                          })()}
                        </div>
                        
                        <div className="mt-2 text-xs text-gray-600 bg-blue-50 p-2 rounded">
                          <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mr-1"></span>
                          <strong>Scientific approach:</strong> After allocating protein (1.8g/kg) and fat (25%), 
                          remaining calories come from carbs to fuel workout performance
                        </div>
                      </div>
                      
                      {/* Custom macro adjustments */}
                      <div className="mt-6 border-t pt-6">
                        <h3 className="text-sm font-medium mb-3 flex items-center">
                          <span>Custom Adjustments</span>
                          <Badge variant="outline" className="ml-2 bg-yellow-100">Optional</Badge>
                        </h3>
                        <div className="grid grid-cols-1 gap-4">
                          {/* Macro sliders */}
                          <div className="grid grid-cols-1 gap-6">
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
                                min={1.6}
                                max={2.2}
                                step={0.1}
                                value={[(() => {
                                  const dailyCalories = guidanceMetrics?.deficitResult.dailyFoodCalorieTarget || 2000;
                                  return calculateGramsPerKg(macroDistribution.protein, dailyCalories);
                                })()]}
                                onValueChange={(values) => {
                                  const newProteinGPerKg = values[0];
                                  const dailyCalories = guidanceMetrics?.deficitResult.dailyFoodCalorieTarget || 2000;
                                  
                                  // Convert g/kg to percentage
                                  const newProteinPct = calculateProteinPercentage(newProteinGPerKg, dailyCalories);
                                  
                                  // Adjust carbs to maintain 100% total with fat fixed at 25%
                                  setMacroDistribution({
                                    protein: newProteinPct,
                                    fat: macroDistribution.fat,
                                    carbs: Math.max(0, 100 - newProteinPct - macroDistribution.fat)
                                  });
                                }}
                                className="max-w-md"
                              />
                              <div className="flex justify-between max-w-md mt-1">
                                <span className="text-xs text-gray-500">1.6 g/kg</span>
                                <span className="text-xs text-gray-600 font-medium">Scientific range</span>
                                <span className="text-xs text-gray-500">2.2 g/kg</span>
                              </div>
                              <p className="mt-1 text-xs text-gray-500">
                                <Info className="inline h-3 w-3 mr-1" /> 
                                Scientific recommendation: 1.6-2.2g/kg for muscle preservation.
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
                                className="max-w-md"
                              />
                              <div className="flex justify-between max-w-md mt-1">
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
                              <div className="h-8 bg-gray-100 rounded-full max-w-md relative overflow-hidden">
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
                        </div>
                      </div>
                      
                      {/* Scientific macro distribution visualization */}
                      <div className="mt-6">
                        <h3 className="text-sm font-medium mb-3">Macro Distribution Summary</h3>
                        <div className="flex flex-col md:flex-row">
                          <div className="w-36 h-36">
                            {(() => {
                              // Get daily calories
                              const dailyCalories = guidanceMetrics?.deficitResult.dailyFoodCalorieTarget || 2000;
                              
                              // Get protein calories
                              const scientificProtein = Math.round(currentWeight * 1.8);
                              const proteinCalories = scientificProtein * 4;
                              const proteinPercentage = Math.round((proteinCalories / dailyCalories) * 100);
                              
                              // Get fat calories (25%)
                              const fatPercentage = 25;
                              
                              // Calculate remaining calories for carbs
                              const carbPercentage = Math.max(0, 100 - proteinPercentage - fatPercentage);
                              
                              return (
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
                                    {dailyCalories} kcal
                                  </text>
                                </PieChart>
                              );
                            })()}
                          </div>
                          <div className="md:ml-6 mt-4 md:mt-0">
                            {(() => {
                              // Get daily calories
                              const dailyCalories = guidanceMetrics?.deficitResult.dailyFoodCalorieTarget || 2000;
                              
                              // Get protein calories
                              const scientificProtein = Math.round(currentWeight * 1.8);
                              const proteinCalories = scientificProtein * 4;
                              const proteinPercentage = Math.round((proteinCalories / dailyCalories) * 100);
                              
                              // Get fat calories (25%)
                              const fatPercentage = 25;
                              const fatCalories = Math.round(dailyCalories * fatPercentage / 100);
                              const fatGrams = Math.round(fatCalories / 9);
                              
                              // Calculate remaining calories for carbs
                              const carbCalories = dailyCalories - proteinCalories - fatCalories;
                              const carbGrams = Math.round(carbCalories / 4);
                              const carbPercentage = Math.max(0, Math.round((carbCalories / dailyCalories) * 100));
                              
                              return (
                                <div className="grid gap-4">
                                  <div className="flex items-center mb-2 border-l-4 border-green-500 pl-3 py-1">
                                    <span className="text-sm font-medium">Protein: <strong>{proteinPercentage}%</strong></span>
                                    <span className="ml-2 text-sm text-gray-500">{scientificProtein}g ({proteinCalories} kcal)</span>
                                  </div>
                                  <div className="flex items-center mb-2 border-l-4 border-yellow-500 pl-3 py-1">
                                    <span className="text-sm font-medium">Fat: <strong>{fatPercentage}%</strong></span>
                                    <span className="ml-2 text-sm text-gray-500">{fatGrams}g ({fatCalories} kcal)</span>
                                  </div>
                                  <div className="flex items-center border-l-4 border-blue-500 pl-3 py-1">
                                    <span className="text-sm font-medium">Carbs: <strong>{carbPercentage}%</strong></span>
                                    <span className="ml-2 text-sm text-gray-500">{carbGrams}g ({carbCalories} kcal)</span>
                                  </div>
                                  <div className="text-xs text-gray-600 mt-2 bg-gray-50 p-2 rounded">
                                    <strong>Daily Total:</strong> {dailyCalories} calories
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Activity Level Section */}
                  <div className="border rounded-lg p-4 bg-green-50">
                    <h2 className="text-lg font-semibold mb-4">
                      Activity Level
                      <Badge variant="outline" className="ml-2 bg-green-100">Science-Based</Badge>
                    </h2>
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
                      </div>
                    </div>
                  </div>
                  
                  {/* Focus Areas Section */}
                  <div className="border rounded-lg p-4">
                    <h2 className="text-lg font-semibold mb-4">Focus Areas</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {['Lose fat', 'Build muscle', 'Improve strength', 'Improve endurance', 'Better nutrition', 'Better sleep'].map(area => (
                        <div 
                          key={area}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                            focusArea.includes(area) ? 'bg-primary-100 border-primary-500' : 'border-gray-200 hover:bg-gray-50'
                          }`}
                          onClick={() => handleFocusAreaToggle(area)}
                        >
                          {area}
                        </div>
                      ))}
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