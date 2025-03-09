
import React, { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { calculateBMR, calculateTDEE } from "@/lib/fitness-calculations";

const goalsSchema = z.object({
  targetWeight: z.coerce.number().min(30, "Weight must be at least 30 kg").max(300, "Weight must be at most 300 kg"),
  deficitRate: z.coerce.number().min(0.25, "Minimum deficit is 0.25%").max(1, "Maximum deficit is 1%")
});

type GoalsData = z.infer<typeof goalsSchema>;

export default function GoalsStep({
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
  const goalsFormDefaults = {
    targetWeight: 70,
    deficitRate: 0.5,
  };

  const form = useForm<GoalsData>({
    resolver: zodResolver(goalsSchema),
    defaultValues: goalData || goalsFormDefaults,
    mode: "onBlur"
  });

  const [currentWeight, setCurrentWeight] = useState(profileData?.weight || 76.5);
  const [projectionData, setProjectionData] = useState<any[]>([]);

  useEffect(() => {
    if (profileData?.weight) {
      setCurrentWeight(profileData.weight);
    }
  }, [profileData]);

  // Calculate projection data
  useEffect(() => {
    const targetWeight = form.watch("targetWeight") || currentWeight * 0.9;
    const deficitRate = form.watch("deficitRate") || 0.5;
    const projectedWeeklyLossRate = (deficitRate / 100) * currentWeight;
    const totalLoss = Math.max(0, currentWeight - targetWeight);
    const estWeeks = totalLoss > 0 ? Math.ceil(totalLoss / projectedWeeklyLossRate) : 12;
    
    const data = [];
    for (let i = 0; i <= estWeeks; i++) {
      data.push({
        week: i,
        weight: i === estWeeks ? targetWeight.toFixed(1) : Math.max(targetWeight, currentWeight - projectedWeeklyLossRate * i).toFixed(1)
      });
    }
    setProjectionData(data);
  }, [form.watch("targetWeight"), form.watch("deficitRate"), currentWeight]);

  const handleSubmit = async (data: GoalsData) => {
    try {
      const bmr = calculateBMR(currentWeight, profileData.height, profileData.age, profileData.gender);
      const tdee = calculateTDEE(bmr, profileData.activityLevel);
      
      const totalWeightLoss = Math.max(0, currentWeight - data.targetWeight);
      const weeklyLossRate = (data.deficitRate / 100) * currentWeight;
      const timeFrame = totalWeightLoss > 0 ? Math.ceil(totalWeightLoss / weeklyLossRate) : 12;
      
      const weightLiftingSessions = 3;
      const cardioSessions = 2;
      const stepsPerDay = 10000;
      
      const weeklyActivityCalories =
        weightLiftingSessions * 250 +
        cardioSessions * 300 +
        stepsPerDay / 10000 * 400 * 7;
      
      const dailyActivityCalories = Math.round(weeklyActivityCalories / 7);
      const dailyCalorieTarget = tdee;
      
      const proteinGrams = Math.round(1.8 * currentWeight);
      const proteinCalories = proteinGrams * 4;
      const remainingCalories = dailyCalorieTarget - proteinCalories;
      const fatCalories = Math.round(dailyCalorieTarget * 0.25);
      const carbCalories = remainingCalories - fatCalories;
      const fatGrams = Math.round(fatCalories / 9);
      const carbGrams = Math.round(carbCalories / 4);
      
      await saveGoal({
        targetWeight: data.targetWeight,
        deficitRate: data.deficitRate,
        currentWeight,
        timeFrame,
        weightLiftingSessions,
        cardioSessions,
        stepsPerDay,
        maintenanceCalories: tdee,
        dailyCalorieTarget,
        proteinGrams,
        fatGrams,
        carbGrams,
        weeklyActivityCalories,
        dailyActivityCalories
      });
      
      onNext();
    } catch (error) {
      console.error("Error saving goals:", error);
    }
  };

  // Calculate metrics for display
  const targetWeight = form.watch("targetWeight") || goalsFormDefaults.targetWeight;
  const deficitRate = form.watch("deficitRate") || goalsFormDefaults.deficitRate;
  const totalWeightLoss = Math.max(0, currentWeight - targetWeight);
  const goalWeeklyLossRate = (deficitRate / 100) * currentWeight;
  const estimatedWeeks = totalWeightLoss > 0 ? Math.ceil(totalWeightLoss / goalWeeklyLossRate) : 0;
  
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + (estimatedWeeks * 7));
  const formattedTargetDate = targetDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="py-6">
      <h2 className="text-2xl font-bold mb-2">What Are Your Goals?</h2>
      <p className="text-muted-foreground mb-6">Set realistic targets for your transformation journey.</p>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-secondary/30 p-4 rounded-lg">
              <h3 className="text-sm font-medium mb-2">Current Weight</h3>
              <p className="text-2xl font-bold">{currentWeight} kg</p>
            </div>
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
                      placeholder="Your target weight"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>Enter your desired weight for a lean, muscular physique.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="deficitRate"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Deficit Intensity (% of body weight per week)</FormLabel>
                  <div className="flex flex-col space-y-4">
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground">Gentle (0.25%)</span>
                      <span className="text-xs text-muted-foreground">Standard (0.5%)</span>
                      <span className="text-xs text-muted-foreground">Aggressive (1%)</span>
                    </div>
                    <FormControl>
                      <Slider
                        min={0.25}
                        max={1}
                        step={0.05}
                        value={[field.value]}
                        onValueChange={(vals) => field.onChange(vals[0])}
                      />
                    </FormControl>
                    <div className="text-center font-medium">
                      {field.value.toFixed(2)}% per week ({(field.value * currentWeight / 100).toFixed(2)} kg/week)
                    </div>
                  </div>
                  <FormDescription>Lower values (0.25-0.5%) are better for preserving muscle mass</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          {totalWeightLoss > 0 && (
            <div className="mt-8 bg-secondary/20 p-4 rounded-lg">
              <h3 className="text-lg font-medium mb-2">Your Transformation Plan</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total Weight Loss</p>
                  <p className="text-lg font-semibold">{totalWeightLoss.toFixed(1)} kg</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Weekly Loss Rate</p>
                  <p className="text-lg font-semibold">{goalWeeklyLossRate.toFixed(2)} kg/week</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Estimated Time Frame</p>
                  <p className="text-lg font-semibold">{estimatedWeeks} weeks</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Target Date</p>
                  <p className="text-lg font-semibold">{formattedTargetDate}</p>
                </div>
              </div>
              
              <div className="mt-6">
                <h4 className="text-md font-medium mb-2">Weight Loss Projection</h4>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={projectionData}
                      margin={{ top: 5, right: 5, left: 5, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="week" label={{ value: 'Weeks', position: 'bottom', offset: -5 }} />
                      <YAxis
                        domain={[
                          Math.floor(Math.min(currentWeight, targetWeight) * 0.95),
                          Math.ceil(currentWeight * 1.02)
                        ]}
                        label={{ value: 'Weight (kg)', angle: -90, position: 'insideLeft' }}
                      />
                      <Tooltip formatter={(value) => [`${value} kg`, 'Weight']} labelFormatter={(value) => `Week ${value}`} />
                      <Line
                        type="monotone"
                        dataKey="weight"
                        stroke="#10b981"
                        strokeWidth={2}
                        dot={{ r: 2 }}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex justify-between mt-8">
            <Button type="button" variant="outline" onClick={onPrev}>
              <ChevronLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <Button type="submit">
              Next <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
