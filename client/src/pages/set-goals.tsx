import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useUserGoal, useUserProfile } from "@/hooks/use-user-data";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function SetGoals() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const { profileData, isLoading: isProfileLoading } = useUserProfile();
  const { goalData, saveGoal, isSaving, isLoading: isGoalLoading } = useUserGoal();
  
  // Form state
  const [currentWeight, setCurrentWeight] = useState<number>(goalData.currentWeight || (profileData?.weight || 80));
  const [targetWeight, setTargetWeight] = useState<number>(goalData.targetWeight || 70);
  const [currentBodyFat, setCurrentBodyFat] = useState<number | undefined>(goalData.currentBodyFat || profileData?.bodyFatPercentage);
  const [targetBodyFat, setTargetBodyFat] = useState<number | undefined>(goalData.targetBodyFat || 15);
  const [timeFrame, setTimeFrame] = useState<number>(goalData.timeFrame || 12);
  const [weightLiftingSessions, setWeightLiftingSessions] = useState<number>(goalData.weightLiftingSessions || 3);
  const [cardioSessions, setCardioSessions] = useState<number>(goalData.cardioSessions || 2);
  const [stepsPerDay, setStepsPerDay] = useState<number>(goalData.stepsPerDay || 10000);
  const [focusArea, setFocusArea] = useState<string[]>(goalData.focusAreas || []);

  // If no profile exists, redirect to user-data
  useEffect(() => {
    if (!isProfileLoading && !profileData) {
      setLocation("/user-data");
      toast({
        title: "Profile Required",
        description: "Please complete your profile before setting goals",
        variant: "default",
      });
    }
  }, [isProfileLoading, profileData, setLocation, toast]);

  const handleFocusAreaToggle = (area: string) => {
    if (focusArea.includes(area)) {
      setFocusArea(focusArea.filter(a => a !== area));
    } else {
      setFocusArea([...focusArea, area]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Calculate some values based on inputs
    const weeklyDeficit = 7500; // 1kg fat = ~7500 calories
    const totalDeficit = (currentWeight - targetWeight) * 7500;
    const dailyDeficit = Math.round(weeklyDeficit / 7);
    const weeklyActivityCalories = (weightLiftingSessions * 250) + (cardioSessions * 300) + ((stepsPerDay / 10000) * 400 * 7);
    const dailyActivityCalories = Math.round(weeklyActivityCalories / 7);
    
    // Estimate maintenance calories (simple calculation)
    const maintenanceCalories = profileData?.gender === 'female' 
      ? Math.round((655 + (9.6 * currentWeight) + (1.8 * (profileData?.height || 170)) - (4.7 * (profileData?.age || 30))) * 1.55)
      : Math.round((66 + (13.7 * currentWeight) + (5 * (profileData?.height || 170)) - (6.8 * (profileData?.age || 30))) * 1.55);
    
    const dailyCalorieTarget = maintenanceCalories - dailyDeficit + dailyActivityCalories;
    
    // Calculate macros (protein: 30%, fat: 30%, carbs: 40%)
    const proteinGrams = Math.round((dailyCalorieTarget * 0.3) / 4);
    const fatGrams = Math.round((dailyCalorieTarget * 0.3) / 9);
    const carbGrams = Math.round((dailyCalorieTarget * 0.4) / 4);
    
    // Save to backend
    saveGoal({
      currentWeight,
      targetWeight,
      currentBodyFat,
      targetBodyFat,
      timeFrame,
      maintenanceCalories,
      deficitType: "moderate",
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
      focusAreas: focusArea
    });
    
    // Navigate to view plan
    setLocation("/view-plan");
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Set Your Goals</h1>
      <p className="text-gray-600 mb-6">Define what you want to achieve in your fitness journey</p>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-medium mb-4">Current Weight</h2>
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    step="0.1"
                    value={currentWeight}
                    onChange={(e) => setCurrentWeight(parseFloat(e.target.value))}
                    placeholder="Your current weight"
                    className="max-w-xs"
                    required
                  />
                  <span className="text-gray-500">kg</span>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-medium mb-4">Target Weight</h2>
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    step="0.1"
                    value={targetWeight}
                    onChange={(e) => setTargetWeight(parseFloat(e.target.value))}
                    placeholder="Your goal weight"
                    className="max-w-xs"
                    required
                  />
                  <span className="text-gray-500">kg</span>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-medium mb-4">Current Body Fat % (optional)</h2>
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    step="0.1"
                    value={currentBodyFat || ''}
                    onChange={(e) => setCurrentBodyFat(e.target.value ? parseFloat(e.target.value) : undefined)}
                    placeholder="Your current body fat %"
                    className="max-w-xs"
                  />
                  <span className="text-gray-500">%</span>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-medium mb-4">Target Body Fat % (optional)</h2>
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    step="0.1"
                    value={targetBodyFat || ''}
                    onChange={(e) => setTargetBodyFat(e.target.value ? parseFloat(e.target.value) : undefined)}
                    placeholder="Your goal body fat %"
                    className="max-w-xs"
                  />
                  <span className="text-gray-500">%</span>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-medium mb-4">Time Frame (weeks)</h2>
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
                <p className="text-sm text-gray-500 mt-1">
                  {Math.abs((currentWeight - targetWeight) / timeFrame).toFixed(2)} kg per week
                </p>
                {Math.abs((currentWeight - targetWeight) / timeFrame) > 1 && (
                  <p className="text-amber-600 mt-2 text-sm">This rate of weight change may be aggressive. We recommend 0.5-1kg per week for sustainable results.</p>
                )}
              </div>
              
              <div>
                <h2 className="text-lg font-medium mb-4">Activity Level</h2>
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

              <div>
                <h2 className="text-lg font-medium mb-4">Focus areas (select all that apply)</h2>
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
              <Button type="submit">Save Goals</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}