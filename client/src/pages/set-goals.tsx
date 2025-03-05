import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { InfoIcon, AlertTriangle, Lightbulb, Dumbbell, Heart, Footprints } from "lucide-react";
import { useUserProfile, useUserGoal } from "@/hooks/use-user-data";
import { calculateCalorieDeficit, calculateMacros, calculateWeeklyActivityCalories } from "@/lib/fitness-calculations";
import { formatGoalDate } from "@/lib/date-utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Form schema for goal setting with activity
const formSchema = z.object({
  currentWeight: z.coerce.number().min(30, "Weight must be at least 30 kg").max(300, "Weight must be at most 300 kg"),
  targetWeight: z.coerce.number().min(30, "Weight must be at least 30 kg").max(300, "Weight must be at most 300 kg"),
  timeFrame: z.coerce.number().int().min(4, "Minimum timeframe is 4 weeks").max(52, "Maximum timeframe is 52 weeks"),
  weightLiftingSessions: z.coerce.number().int().min(0, "Minimum is 0 sessions").max(5, "Maximum is 5 sessions"),
  cardioSessions: z.coerce.number().int().min(0, "Minimum is 0 sessions").max(7, "Maximum is 7 sessions"),
  stepsPerDay: z.coerce.number().int().min(1000, "Minimum is 1,000 steps").max(25000, "Maximum is 25,000 steps"),
}).refine(data => data.targetWeight < data.currentWeight, {
  message: "Target weight must be less than current weight",
  path: ["targetWeight"],
});

export default function SetGoals() {
  const [location, setLocation] = useLocation();
  const { profileData, isLoading: isProfileLoading } = useUserProfile();
  const { goalData, isLoading: isGoalLoading, saveGoal, isSaving } = useUserGoal();
  
  const [calculationResults, setCalculationResults] = useState<{
    totalWeightLoss: number;
    weeklyWeightLoss: number;
    totalCalorieDeficit: number;
    dailyCalorieDeficit: number;
    dailyFoodCalorieTarget: number;
    weeklyActivityCalories: number;
    dailyActivityCalories: number;
    isAggressive: boolean;
  } | null>(null);
  
  const [showResults, setShowResults] = useState(false);
  
  // Set up form with existing goal data or profile data for defaults
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentWeight: goalData?.currentWeight || (profileData ? profileData.weight : 75),
      targetWeight: goalData?.targetWeight || 65,
      timeFrame: goalData?.timeFrame || 12,
      weightLiftingSessions: goalData?.weightLiftingSessions || 3,
      cardioSessions: goalData?.cardioSessions || 2,
      stepsPerDay: goalData?.stepsPerDay || 10000,
    },
  });

  // Update form values when profile or goal data is loaded
  useEffect(() => {
    if (profileData && !form.getValues().currentWeight) {
      form.setValue("currentWeight", profileData.weight || 75);
    }
    
    if (goalData) {
      // Reset form with goal data including activity data if available
      form.reset({
        currentWeight: goalData.currentWeight || 75,
        targetWeight: goalData.targetWeight || 65,
        timeFrame: goalData.timeFrame || 12,
        weightLiftingSessions: goalData.weightLiftingSessions || 3,
        cardioSessions: goalData.cardioSessions || 2,
        stepsPerDay: goalData.stepsPerDay || 10000
      });
      
      // If goal data exists, show calculation results
      if (profileData && profileData.bmr) {
        // Use activity level multiplier for maintenance calories (1.55 for moderately active)
        const maintenanceCalories = Math.round(profileData.bmr * 1.55);
        
        const { 
          totalWeightLoss, 
          totalCalorieDeficit, 
          dailyCalorieDeficit, 
          isAggressive,
          weeklyActivityCalories,
          dailyFoodCalorieTarget 
        } = calculateCalorieDeficit(
          goalData.currentWeight || 75,
          goalData.targetWeight || 65,
          goalData.timeFrame || 12,
          maintenanceCalories,
          goalData.weightLiftingSessions || 3,
          goalData.cardioSessions || 2,
          goalData.stepsPerDay || 10000
        );
        
        setCalculationResults({
          totalWeightLoss,
          weeklyWeightLoss: totalWeightLoss / (goalData.timeFrame || 12),
          totalCalorieDeficit,
          dailyCalorieDeficit,
          dailyFoodCalorieTarget,
          weeklyActivityCalories,
          dailyActivityCalories: weeklyActivityCalories / 7,
          isAggressive
        });
        
        setShowResults(true);
      }
    }
  }, [profileData, goalData, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!profileData) {
      return;
    }
    
    // Apply activity multiplier to BMR to get maintenance calories (1.55 for moderately active)
    const maintenanceCalories = Math.round(profileData.bmr * 1.55);
    
    // Calculate calorie deficit with activity
    const { 
      totalWeightLoss, 
      totalCalorieDeficit, 
      dailyCalorieDeficit, 
      isAggressive, 
      weeklyActivityCalories,
      dailyFoodCalorieTarget 
    } = calculateCalorieDeficit(
      values.currentWeight,
      values.targetWeight,
      values.timeFrame,
      maintenanceCalories, // Use maintenance calories (BMR × 1.55) instead of just BMR
      values.weightLiftingSessions,
      values.cardioSessions,
      values.stepsPerDay
    );
    
    // Calculate macros with fixed percentages (40/30/30)
    const { proteinGrams, fatGrams, carbGrams } = calculateMacros(
      values.currentWeight,
      dailyFoodCalorieTarget
    );
    
    // Update calculation results for display
    setCalculationResults({
      totalWeightLoss,
      weeklyWeightLoss: totalWeightLoss / values.timeFrame,
      totalCalorieDeficit,
      dailyCalorieDeficit,
      dailyFoodCalorieTarget,
      weeklyActivityCalories,
      dailyActivityCalories: weeklyActivityCalories / 7,
      isAggressive
    });
    
    setShowResults(true);
    
    // Save goal data
    await saveGoal({
      ...values,
      dailyCalorieTarget: dailyFoodCalorieTarget,
      dailyDeficit: dailyCalorieDeficit,
      proteinGrams,
      fatGrams,
      carbGrams,
      weeklyActivityCalories,
      dailyActivityCalories: Math.round(weeklyActivityCalories / 7)
    });
    
    // Navigate to plan page after a short delay
    setTimeout(() => {
      setLocation("/view-plan");
    }, 1500);
  };

  return (
    <div>
      <Card className="mb-6">
        <CardContent className="p-6">
          <h2 className="font-heading font-semibold text-xl mb-1 text-neutral-800">Weight Loss Goals</h2>
          <p className="text-neutral-500 mb-4 text-sm">Let's set realistic targets for your transformation</p>
          
          {profileData && (
            <div className="bg-primary-100 rounded-lg p-4 mb-6 flex items-center">
              <div className="rounded-full bg-primary-500 h-8 w-8 flex items-center justify-center mr-3 flex-shrink-0">
                <InfoIcon className="text-white h-4 w-4" />
              </div>
              <div>
                <p className="font-medium text-primary-700">Your Maintenance Calories</p>
                <p className="text-primary-600">
                  <span className="font-bold">{Math.round(profileData.bmr * 1.55).toLocaleString()}</span> calories/day
                </p>
                <p className="text-xs text-primary-500">
                  Based on BMR ({profileData.bmr.toLocaleString()} cal) × Activity Multiplier (1.55)
                </p>
              </div>
            </div>
          )}
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-lg mb-4 text-primary-700">Weight Goal</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="currentWeight"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Weight (kg)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.1" 
                              placeholder="75.5" 
                              disabled={isProfileLoading}
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="targetWeight"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Target Weight (kg)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.1" 
                              placeholder="65.0" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                <FormField
                  control={form.control}
                  name="timeFrame"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Time Frame (weeks)</FormLabel>
                      <div className="space-y-2">
                        <Slider
                          min={4}
                          max={52}
                          step={1}
                          value={[field.value]}
                          onValueChange={(value) => field.onChange(value[0])}
                        />
                        <div className="flex justify-between text-xs text-neutral-500 mt-1">
                          <span>4 weeks</span>
                          <span>16 weeks</span>
                          <span>28 weeks</span>
                          <span>40 weeks</span>
                          <span>52 weeks</span>
                        </div>
                      </div>
                      <p className="text-center mt-3 text-sm">
                        <span className="font-medium text-neutral-700">Selected: </span>
                        <span className="text-primary-600 font-medium">{field.value} weeks</span>
                        <span className="text-neutral-500"> (Goal date: {formatGoalDate(field.value)})</span>
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div>
                  <h3 className="font-semibold text-lg mb-4 text-primary-700">Weekly Activity Plan</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="weightLiftingSessions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center">
                            <Dumbbell className="h-4 w-4 mr-2 text-neutral-500" />
                            Weight Training Sessions
                          </FormLabel>
                          <FormControl>
                            <Select
                              value={field.value.toString()}
                              onValueChange={(value) => field.onChange(parseInt(value))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select frequency" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="0">None</SelectItem>
                                <SelectItem value="1">1 session per week</SelectItem>
                                <SelectItem value="2">2 sessions per week</SelectItem>
                                <SelectItem value="3">3 sessions per week</SelectItem>
                                <SelectItem value="4">4 sessions per week</SelectItem>
                                <SelectItem value="5">5+ sessions per week</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormDescription className="text-xs text-neutral-500">
                            Each weight training session burns approx. 250 calories
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="cardioSessions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center">
                            <Heart className="h-4 w-4 mr-2 text-neutral-500" />
                            Cardio Sessions
                          </FormLabel>
                          <FormControl>
                            <Select
                              value={field.value.toString()}
                              onValueChange={(value) => field.onChange(parseInt(value))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select frequency" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="0">None</SelectItem>
                                <SelectItem value="1">1 session per week</SelectItem>
                                <SelectItem value="2">2 sessions per week</SelectItem>
                                <SelectItem value="3">3 sessions per week</SelectItem>
                                <SelectItem value="4">4 sessions per week</SelectItem>
                                <SelectItem value="5">5 sessions per week</SelectItem>
                                <SelectItem value="6">6 sessions per week</SelectItem>
                                <SelectItem value="7">Daily</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormDescription className="text-xs text-neutral-500">
                            Each cardio session burns approx. 300 calories
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="stepsPerDay"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel className="flex items-center">
                            <Footprints className="h-4 w-4 mr-2 text-neutral-500" />
                            Daily Steps Target
                          </FormLabel>
                          <div className="space-y-2">
                            <Slider
                              min={1000}
                              max={25000}
                              step={1000}
                              value={[field.value]}
                              onValueChange={(value) => field.onChange(value[0])}
                            />
                            <div className="flex justify-between text-xs text-neutral-500 mt-1">
                              <span>1K</span>
                              <span>5K</span>
                              <span>10K</span>
                              <span>15K</span>
                              <span>20K</span>
                              <span>25K</span>
                            </div>
                          </div>
                          <p className="text-center mt-2 text-sm font-medium text-primary-600">
                            {field.value.toLocaleString()} steps per day
                          </p>
                          <FormDescription className="text-xs text-neutral-500 text-center">
                            Walking 10,000 steps burns approx. 400 calories per day
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              {showResults && calculationResults && (
                <div id="calculationResult" className="mb-6 space-y-6">
                  <div>
                    <h3 className="font-semibold text-lg mb-4 text-primary-700">Weight Loss Summary</h3>
                    <div className="bg-neutral-100 rounded-lg p-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h3 className="text-sm text-neutral-500">Total Weight Loss</h3>
                          <p className="text-lg font-semibold text-neutral-800">
                            {calculationResults.totalWeightLoss.toFixed(1)} kg
                          </p>
                        </div>
                        <div>
                          <h3 className="text-sm text-neutral-500">Weekly Weight Loss</h3>
                          <p className="text-lg font-semibold text-neutral-800">
                            {calculationResults.weeklyWeightLoss.toFixed(2)} kg/week
                          </p>
                        </div>
                        <div>
                          <h3 className="text-sm text-neutral-500">Total Calorie Deficit</h3>
                          <p className="text-lg font-semibold text-neutral-800">
                            {calculationResults.totalCalorieDeficit.toLocaleString()} cal
                          </p>
                        </div>
                        <div>
                          <h3 className="text-sm text-neutral-500">Daily Calorie Deficit</h3>
                          <p className="text-lg font-semibold text-neutral-800">
                            {calculationResults.dailyCalorieDeficit.toLocaleString()} cal/day
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-lg mb-4 text-primary-700">Activity & Calories</h3>
                    <div className="bg-neutral-100 rounded-lg p-4 mb-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h3 className="text-sm text-neutral-500">Activity Calories</h3>
                          <p className="text-lg font-semibold text-neutral-800">
                            {Math.round(calculationResults.dailyActivityCalories).toLocaleString()} cal/day
                          </p>
                        </div>
                        <div>
                          <h3 className="text-sm text-neutral-500">Weekly Activity Calories</h3>
                          <p className="text-lg font-semibold text-neutral-800">
                            {Math.round(calculationResults.weeklyActivityCalories).toLocaleString()} cal/week
                          </p>
                        </div>
                        <div className="col-span-2">
                          <h3 className="text-sm text-neutral-500 mb-1">Recommended Daily Food Intake</h3>
                          <div className="bg-primary-50 p-3 rounded-md flex items-center justify-between">
                            <p className="text-xl font-bold text-primary-700">
                              {calculationResults.dailyFoodCalorieTarget.toLocaleString()} calories
                            </p>
                            <Lightbulb className="h-6 w-6 text-primary-500" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {calculationResults.isAggressive && (
                    <Alert variant="destructive" className="bg-orange-100 border-orange-500">
                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                      <AlertTitle className="text-orange-700">Aggressive Weight Loss Goal</AlertTitle>
                      <AlertDescription className="text-orange-600">
                        Your daily deficit exceeds 1000 calories. Consider extending your timeframe or increasing your activity for a more sustainable approach.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSaving || isProfileLoading}
              >
                {isSaving ? "Calculating..." : "Calculate Plan & Continue"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <div className="bg-neutral-100 rounded-lg p-5 text-sm border border-neutral-200">
        <h3 className="font-medium text-neutral-700 mb-2 flex items-center">
          <InfoIcon className="h-4 w-4 mr-1 text-primary-500" /> About Calorie Deficits
        </h3>
        <p className="text-neutral-600">
          A sustainable weight loss is typically 0.5-1 kg per week. This requires a daily calorie deficit of 500-1000 calories. 
          Losing weight too quickly can lead to muscle loss and other health issues.
        </p>
      </div>
    </div>
  );
}
