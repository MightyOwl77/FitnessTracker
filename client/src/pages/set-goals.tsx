import React, { useState, useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useUserGoal, useUserProfile } from "@/hooks/use-user-data";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, ArrowRight, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { calculateCalorieDeficit, calculateMacros, calculateWeeklyActivityCalories, calculateBMR, projectNonLinearWeightLoss } from "@/lib/fitness-calculations";
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
  
  // Macro distribution - default to 30% protein, 30% fat, 40% carbs
  const [macroDistribution, setMacroDistribution] = useState({
    protein: 30,
    fat: 30,
    carbs: 40
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
    }
  }, [isProfileLoading, profileData, setLocation, toast, currentWeight, saveProfile]);

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
                          onChange={(e) => setCurrentWeight(parseFloat(e.target.value))}
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
                          onChange={(e) => setTargetWeight(parseFloat(e.target.value))}
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
                        Time Frame (weeks)
                      </label>
                      <div className="flex items-center space-x-2">
                        <Input
                          type="number"
                          min="1"
                          max="52"
                          value={timeFrame}
                          onChange={(e) => setTimeFrame(parseInt(e.target.value))}
                          placeholder="Number of weeks"
                          className="max-w-xs"
                          required
                        />
                        <span className="text-gray-500">weeks</span>
                      </div>
                    </div>
                    
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
                          onValueChange={(vals) => setWeeklyDeficitPercent(vals[0])}
                          className="max-w-md"
                        />
                        <div className="flex justify-between max-w-md">
                          <span className="text-xs text-gray-500">0.5%</span>
                          <span className="text-xs text-gray-500 font-medium">
                            {weeklyDeficitPercent.toFixed(2)}% ({(currentWeight * weeklyDeficitPercent / 100).toFixed(2)}kg/week)
                          </span>
                          <span className="text-xs text-gray-500">1.0%</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Weight Loss Projection Graph */}
                    <div className="mt-6 border rounded p-4 bg-white">
                      <h3 className="text-md font-medium mb-4">Projected Weight Loss</h3>
                      
                      {/* We calculate the projected weight loss based on weekly deficit percentage */}
                      {(() => {
                        // Generate weight loss projection data
                        const weeklyLossRate = currentWeight * weeklyDeficitPercent / 100;
                        const weightLossData = [];
                        let projectedWeight = currentWeight;
                        
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
                      <Badge variant="outline" className="ml-2 bg-blue-100">Customizable</Badge>
                    </h2>
                    
                    <div className="grid grid-cols-1 gap-6">
                      {/* Protein slider */}
                      <div>
                        <div className="flex justify-between mb-1">
                          <label className="text-sm font-medium text-gray-700">
                            Protein ({macroDistribution.protein}%)
                          </label>
                          <span className="text-xs text-gray-500">
                            {Math.round((guidanceMetrics?.deficitResult.dailyFoodCalorieTarget || 2000) * macroDistribution.protein / 100 / 4)}g
                          </span>
                        </div>
                        <Slider
                          min={20}
                          max={40}
                          step={5}
                          value={[macroDistribution.protein]}
                          onValueChange={(values) => {
                            const newProtein = values[0];
                            // Adjust carbs to maintain 100% total
                            const difference = newProtein - macroDistribution.protein;
                            const newCarbs = macroDistribution.carbs - difference;
                            
                            if (newCarbs >= 20 && newCarbs <= 60) {
                              setMacroDistribution({
                                protein: newProtein,
                                fat: macroDistribution.fat,
                                carbs: newCarbs
                              });
                            }
                          }}
                          className="max-w-md"
                        />
                        <div className="flex justify-between max-w-md mt-1">
                          <span className="text-xs text-gray-500">20%</span>
                          <span className="text-xs text-gray-500">40%</span>
                        </div>
                      </div>
                      
                      {/* Fat slider */}
                      <div>
                        <div className="flex justify-between mb-1">
                          <label className="text-sm font-medium text-gray-700">
                            Fat ({macroDistribution.fat}%)
                          </label>
                          <span className="text-xs text-gray-500">
                            {Math.round((guidanceMetrics?.deficitResult.dailyFoodCalorieTarget || 2000) * macroDistribution.fat / 100 / 9)}g
                          </span>
                        </div>
                        <Slider
                          min={20}
                          max={40}
                          step={5}
                          value={[macroDistribution.fat]}
                          onValueChange={(values) => {
                            const newFat = values[0];
                            // Adjust carbs to maintain 100% total
                            const difference = newFat - macroDistribution.fat;
                            const newCarbs = macroDistribution.carbs - difference;
                            
                            if (newCarbs >= 20 && newCarbs <= 60) {
                              setMacroDistribution({
                                protein: macroDistribution.protein,
                                fat: newFat,
                                carbs: newCarbs
                              });
                            }
                          }}
                          className="max-w-md"
                        />
                        <div className="flex justify-between max-w-md mt-1">
                          <span className="text-xs text-gray-500">20%</span>
                          <span className="text-xs text-gray-500">40%</span>
                        </div>
                      </div>
                      
                      {/* Carbs display (automatically calculated) */}
                      <div>
                        <div className="flex justify-between mb-1">
                          <label className="text-sm font-medium text-gray-700">
                            Carbohydrates ({macroDistribution.carbs}%)
                          </label>
                          <span className="text-xs text-gray-500">
                            {Math.round((guidanceMetrics?.deficitResult.dailyFoodCalorieTarget || 2000) * macroDistribution.carbs / 100 / 4)}g
                          </span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full max-w-md">
                          <div 
                            className="h-2 bg-blue-500 rounded-full" 
                            style={{ width: `${(macroDistribution.carbs/60)*100}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between max-w-md mt-1">
                          <span className="text-xs text-gray-500">20%</span>
                          <span className="text-xs text-gray-500">60%</span>
                        </div>
                      </div>
                      
                      {/* Macro distribution visualization */}
                      <div className="mt-2">
                        <h3 className="text-sm font-medium mb-3">Macro Distribution Visualization</h3>
                        <div className="flex items-center">
                          <div className="w-32 h-32">
                            <PieChart width={140} height={140}>
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
                            </PieChart>
                          </div>
                          <div className="ml-4">
                            <div className="flex items-center mb-2">
                              <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                              <span className="text-sm">Protein: {macroDistribution.protein}%</span>
                            </div>
                            <div className="flex items-center mb-2">
                              <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                              <span className="text-sm">Fat: {macroDistribution.fat}%</span>
                            </div>
                            <div className="flex items-center">
                              <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                              <span className="text-sm">Carbs: {macroDistribution.carbs}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Activity Level Section */}
                  <div className="border rounded-lg p-4">
                    <h2 className="text-lg font-semibold mb-4">Activity Level</h2>
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