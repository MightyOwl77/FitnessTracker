import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Utensils, Flame, CheckCircle, XCircle, Weight, Calculator, Scale, Clock, ActivitySquare, History } from "lucide-react";
import { useUserProfile, useUserGoal, useDailyLog, useBodyStats } from "@/hooks/use-user-data";
import { calculateExerciseCalories, calculateTotalCaloriesOut, calculateDailyDeficit } from "@/lib/fitness-calculations";
import { formatDate, getPreviousDay, getNextDay, isSameDate } from "@/lib/date-utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Form schema for daily log with body measurements
const formSchema = z.object({
  // Body measurements
  weight: z.coerce.number().min(30, "Weight must be at least 30kg").max(300, "Weight must be at most 300kg"),
  bodyFat: z.coerce.number().min(3, "Body fat must be at least 3%").max(60, "Body fat must be at most 60%").optional(),
  muscleMass: z.coerce.number().min(10, "Muscle mass must be at least 10%").max(100, "Muscle mass must be at most 100%").optional(),
  
  // Nutrition fields
  caloriesIn: z.coerce.number().int().min(0, "Cannot be negative"),
  proteinIn: z.coerce.number().int().min(0, "Cannot be negative"),
  fatIn: z.coerce.number().int().min(0, "Cannot be negative"),
  carbsIn: z.coerce.number().int().min(0, "Cannot be negative"),
  waterIntake: z.coerce.number().min(0, "Cannot be negative").optional(),
  fiberIntake: z.coerce.number().int().min(0, "Cannot be negative").optional(),
  
  // Activity fields
  weightTrainingMinutes: z.coerce.number().int().min(0, "Cannot be negative").optional(),
  cardioMinutes: z.coerce.number().int().min(0, "Cannot be negative").optional(),
  stepCount: z.coerce.number().int().min(0, "Cannot be negative").optional(),
});

export default function DailyLog() {
  const [location, setLocation] = useLocation();
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const { profileData, isLoading: isProfileLoading } = useUserProfile();
  const { goalData, isLoading: isGoalLoading } = useUserGoal();
  const { logData, logsData, isLoading: isLogLoading, saveLog, isSaving } = useDailyLog(currentDate);
  const { statData, isLoading: isStatLoading, saveStat } = useBodyStats(currentDate);
  
  // Hold calculated values
  const [calculatedResults, setCalculatedResults] = useState({
    exerciseCalories: 0,
    totalCaloriesOut: 0,
    deficit: 0,
    macroPercentages: {
      protein: 0,
      fat: 0,
      carbs: 0
    },
    calculatedCaloriesIn: 0
  });
  
  // Redirect to user data if profile doesn't exist
  useEffect(() => {
    if (!isProfileLoading && !profileData) {
      setLocation("/user-data");
    } else if (!isGoalLoading && !goalData) {
      setLocation("/set-goals");
    }
  }, [isProfileLoading, profileData, isGoalLoading, goalData, setLocation]);
  
  // Set up form with existing log data, body stats and defaults
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      // Body measurements from body stats
      weight: statData?.weight || profileData?.weight || 75,
      bodyFat: statData?.bodyFat,
      muscleMass: statData?.muscleMass,
      
      // Nutrition data from log
      caloriesIn: logData?.caloriesIn || 0,
      proteinIn: logData?.proteinIn || 0,
      fatIn: logData?.fatIn || 0,
      carbsIn: logData?.carbsIn || 0,
      waterIntake: logData?.waterIntake || 0,
      fiberIntake: logData?.fiberIntake || 0,
      
      // Activity data from log
      weightTrainingMinutes: logData?.weightTrainingMinutes || 0,
      cardioMinutes: logData?.cardioMinutes || 0,
      stepCount: logData?.stepCount || 0,
    },
  });

  // Update form values when log data and body stats are loaded
  useEffect(() => {
    const formValues = {
      // Body measurements (prefer body stats over profile data)
      weight: statData?.weight || profileData?.weight || 75,
      bodyFat: statData?.bodyFat,
      muscleMass: statData?.muscleMass,
      
      // Nutrition data
      caloriesIn: logData?.caloriesIn || 0,
      proteinIn: logData?.proteinIn || 0,
      fatIn: logData?.fatIn || 0,
      carbsIn: logData?.carbsIn || 0,
      waterIntake: logData?.waterIntake || 0,
      fiberIntake: logData?.fiberIntake || 0,
      
      // Activity data
      weightTrainingMinutes: logData?.weightTrainingMinutes || 0,
      cardioMinutes: logData?.cardioMinutes || 0,
      stepCount: logData?.stepCount || 0,
    };
    
    form.reset(formValues);
  }, [logData, statData, profileData, form]);
  
  // Calculate calories out, deficit, and macros when form values change
  useEffect(() => {
    if (profileData) {
      const watchedValues = form.watch();
      
      // Calculate exercise and calorie values
      const exerciseCalories = calculateExerciseCalories(
        watchedValues.weightTrainingMinutes || 0,
        watchedValues.cardioMinutes || 0,
        watchedValues.stepCount || 0
      );
      
      const totalCaloriesOut = calculateTotalCaloriesOut(
        profileData.bmr,
        exerciseCalories
      );
      
      const deficit = calculateDailyDeficit(
        totalCaloriesOut,
        watchedValues.caloriesIn || 0
      );
      
      // Calculate macro percentages
      const proteinCals = (watchedValues.proteinIn || 0) * 4; // 4 calories per gram of protein
      const fatCals = (watchedValues.fatIn || 0) * 9; // 9 calories per gram of fat
      const carbCals = (watchedValues.carbsIn || 0) * 4; // 4 calories per gram of carbs
      
      const calculatedCaloriesIn = proteinCals + fatCals + carbCals;
      
      // Avoid division by zero
      const totalMacroCals = calculatedCaloriesIn || 1;
      
      const macroPercentages = {
        protein: Math.round((proteinCals / totalMacroCals) * 100),
        fat: Math.round((fatCals / totalMacroCals) * 100),
        carbs: Math.round((carbCals / totalMacroCals) * 100)
      };
      
      setCalculatedResults({
        exerciseCalories,
        totalCaloriesOut,
        deficit,
        macroPercentages,
        calculatedCaloriesIn
      });
    }
  }, [form.watch(), profileData]);
  
  const handlePreviousDay = () => {
    setCurrentDate(getPreviousDay(currentDate));
  };
  
  const handleNextDay = () => {
    const nextDay = getNextDay(currentDate);
    if (!isSameDate(nextDay, new Date()) && nextDay > new Date()) {
      return; // Don't allow future dates
    }
    setCurrentDate(nextDay);
  };
  
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!profileData) {
      return;
    }
    
    const exerciseCalories = calculateExerciseCalories(
      values.weightTrainingMinutes || 0,
      values.cardioMinutes || 0,
      values.stepCount || 0
    );
    
    const totalCaloriesOut = calculateTotalCaloriesOut(
      profileData.bmr,
      exerciseCalories
    );
    
    const deficit = calculateDailyDeficit(
      totalCaloriesOut,
      values.caloriesIn
    );
    
    await saveLog({
      date: currentDate,
      ...values,
      bmr: profileData.bmr,
      caloriesOut: totalCaloriesOut,
      deficit: deficit
    });
  };
  
  if (isProfileLoading || isGoalLoading) {
    return <div className="p-8 text-center">Loading your data...</div>;
  }
  
  if (!profileData || !goalData) {
    return <div className="p-8 text-center">Please complete your profile and goals first.</div>;
  }

  return (
    <div>
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-heading font-semibold text-xl text-neutral-800">Daily Log</h2>
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePreviousDay}
                className="text-neutral-500 hover:text-neutral-700"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <span className="px-2 py-1 bg-primary-100 rounded-md text-primary-700 font-medium">
                {formatDate(currentDate)}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNextDay}
                className="text-neutral-500 hover:text-neutral-700"
                disabled={isSameDate(currentDate, new Date())}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-medium text-lg mb-4 text-neutral-800 flex items-center">
                    <Utensils className="text-primary-500 mr-2 h-5 w-5" />
                    Calories In
                  </h3>
                  
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="caloriesIn"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Total Calories Consumed</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="1500" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-3 gap-2">
                      <FormField
                        control={form.control}
                        name="proteinIn"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Protein (g)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="120" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="fatIn"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fat (g)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="60" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="carbsIn"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Carbs (g)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="100" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <FormField
                        control={form.control}
                        name="waterIntake"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Water (liters)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                step="0.1"
                                placeholder="2.5" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="fiberIntake"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fiber (g)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="25" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium text-lg mb-4 text-neutral-800 flex items-center">
                    <Flame className="text-primary-500 mr-2 h-5 w-5" />
                    Calories Out
                  </h3>
                  
                  <div className="space-y-4">
                    <FormItem>
                      <FormLabel>Basal Metabolic Rate (BMR)</FormLabel>
                      <Input 
                        type="number" 
                        value={profileData?.bmr || 0}
                        disabled
                        className="bg-neutral-50 text-neutral-500"
                      />
                    </FormItem>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <FormField
                        control={form.control}
                        name="weightTrainingMinutes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Weight Training (min)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="60" 
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription className="text-xs">~5 cal/min</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="cardioMinutes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cardio (min)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="30" 
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription className="text-xs">~10 cal/min</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="stepCount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Step Count</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="8000" 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription className="text-xs">~0.04 cal/step</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
              
              <div className="bg-neutral-100 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <h3 className="text-sm text-neutral-500">Calories In</h3>
                    <p className="text-lg font-semibold text-neutral-800">
                      {form.watch("caloriesIn")?.toLocaleString() || "0"}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm text-neutral-500">Calories Out</h3>
                    <p className="text-lg font-semibold text-neutral-800">
                      {calculatedResults.totalCaloriesOut.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm text-neutral-500">Daily Deficit</h3>
                    <p className="text-lg font-semibold text-primary-600">
                      {calculatedResults.deficit.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm text-neutral-500">Target Deficit</h3>
                    <p className="text-lg font-semibold text-neutral-600">
                      {goalData?.dailyDeficit.toLocaleString() || "0"}
                    </p>
                  </div>
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save Daily Log"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <h3 className="font-medium text-lg mb-4 text-neutral-800">Recent Activity</h3>
          
          {isLogLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-neutral-200">
                <thead>
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Date</th>
                    <th className="px-3 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">Calories In</th>
                    <th className="px-3 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">Calories Out</th>
                    <th className="px-3 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">Deficit</th>
                    <th className="px-3 py-3 text-center text-xs font-medium text-neutral-500 uppercase tracking-wider">Goal Met</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-neutral-200">
                  {logsData.slice(0, 5).map((log) => (
                    <tr key={log.id}>
                      <td className="px-3 py-3 whitespace-nowrap text-sm font-medium text-neutral-800">
                        {formatDate(new Date(log.date))}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-sm text-right text-neutral-600">
                        {log.caloriesIn.toLocaleString()}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-sm text-right text-neutral-600">
                        {log.caloriesOut.toLocaleString()}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-sm text-right font-medium text-primary-600">
                        {log.deficit.toLocaleString()}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-sm text-center">
                        {log.deficit >= (goalData?.dailyDeficit || 0) ? (
                          <CheckCircle className="h-5 w-5 text-green-500 inline" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500 inline" />
                        )}
                      </td>
                    </tr>
                  ))}
                  {logsData.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-3 py-6 text-center text-neutral-500">
                        No logs found. Start tracking your daily intake and activity!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
