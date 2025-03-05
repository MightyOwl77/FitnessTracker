import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { InfoIcon, AlertTriangle, Lightbulb } from "lucide-react";
import { useUserProfile, useUserGoal } from "@/hooks/use-user-data";
import { calculateCalorieDeficit, calculateMacros } from "@/lib/fitness-calculations";
import { formatGoalDate } from "@/lib/date-utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Form schema for goal setting
const formSchema = z.object({
  currentWeight: z.coerce.number().min(30, "Weight must be at least 30 kg").max(300, "Weight must be at most 300 kg"),
  targetWeight: z.coerce.number().min(30, "Weight must be at least 30 kg").max(300, "Weight must be at most 300 kg"),
  timeFrame: z.coerce.number().int().min(4, "Minimum timeframe is 4 weeks").max(52, "Maximum timeframe is 52 weeks"),
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
    dailyCalorieTarget: number;
    isAggressive: boolean;
  } | null>(null);
  
  const [showResults, setShowResults] = useState(false);
  
  // Set up form with existing goal data or profile data for defaults
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentWeight: goalData?.currentWeight || profileData?.weight || 75,
      targetWeight: goalData?.targetWeight || 65,
      timeFrame: goalData?.timeFrame || 12,
    },
  });

  // Update form values when profile or goal data is loaded
  useEffect(() => {
    if (profileData && !form.getValues().currentWeight) {
      form.setValue("currentWeight", profileData.weight);
    }
    
    if (goalData) {
      form.reset({
        currentWeight: goalData.currentWeight,
        targetWeight: goalData.targetWeight,
        timeFrame: goalData.timeFrame,
      });
      
      // If goal data exists, show calculation results
      if (profileData) {
        const { totalWeightLoss, totalCalorieDeficit, dailyCalorieDeficit, isAggressive } = calculateCalorieDeficit(
          goalData.currentWeight,
          goalData.targetWeight,
          goalData.timeFrame
        );
        
        setCalculationResults({
          totalWeightLoss,
          weeklyWeightLoss: totalWeightLoss / goalData.timeFrame,
          totalCalorieDeficit,
          dailyCalorieDeficit,
          dailyCalorieTarget: profileData.bmr - dailyCalorieDeficit,
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
    
    // Calculate calorie deficit
    const { totalWeightLoss, totalCalorieDeficit, dailyCalorieDeficit, isAggressive } = calculateCalorieDeficit(
      values.currentWeight,
      values.targetWeight,
      values.timeFrame
    );
    
    // Calculate daily calorie target
    const dailyCalorieTarget = profileData.bmr - dailyCalorieDeficit;
    
    // Calculate macros
    const { proteinGrams, fatGrams, carbGrams } = calculateMacros(
      values.currentWeight,
      dailyCalorieTarget
    );
    
    // Update calculation results for display
    setCalculationResults({
      totalWeightLoss,
      weeklyWeightLoss: totalWeightLoss / values.timeFrame,
      totalCalorieDeficit,
      dailyCalorieDeficit,
      dailyCalorieTarget,
      isAggressive
    });
    
    setShowResults(true);
    
    // Save goal data
    await saveGoal({
      ...values,
      dailyCalorieTarget,
      dailyDeficit: dailyCalorieDeficit,
      proteinGrams,
      fatGrams,
      carbGrams
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
                  <span className="font-bold">{profileData.bmr.toLocaleString()}</span> calories/day
                </p>
              </div>
            </div>
          )}
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
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
                
                <FormField
                  control={form.control}
                  name="timeFrame"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
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
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {showResults && calculationResults && (
                <div id="calculationResult" className="mb-6 space-y-4">
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
                  
                  {calculationResults.isAggressive && (
                    <Alert variant="warning" className="bg-orange-100 border-orange-500">
                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                      <AlertTitle className="text-orange-700">Aggressive Weight Loss Goal</AlertTitle>
                      <AlertDescription className="text-orange-600">
                        Your daily deficit exceeds 1000 calories. Consider extending your timeframe for a more sustainable approach.
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <Alert className="bg-primary-100 border-primary-500">
                    <Lightbulb className="h-4 w-4 text-primary-600" />
                    <AlertTitle className="text-primary-800">Recommended Daily Calories</AlertTitle>
                    <AlertDescription className="text-primary-700">
                      To reach your goal, aim to consume approximately <span className="font-bold">{calculationResults.dailyCalorieTarget.toLocaleString()}</span> calories per day.
                    </AlertDescription>
                  </Alert>
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
