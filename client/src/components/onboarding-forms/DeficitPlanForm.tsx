import { UseFormReturn } from "react-hook-form";
import { ChevronLeft, ChevronRight, Utensils, Dumbbell } from "lucide-react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

interface DeficitPlanFormProps {
  form: UseFormReturn<any>;
  onNext: (data: any) => void;
  onPrev: () => void;
  currentWeight: number;
  adjustedCalorieTarget: number;
  setAdjustedCalorieTarget: (value: number) => void;
  baseTDEE: number;
  sliderInitialized: boolean;
  setSliderInitialized: (value: boolean) => void;
  deficitCalories: number;
  deficitPercentage: number;
  stepTitle: string;
  stepDescription: string;
}

export function DeficitPlanForm({
  form,
  onNext,
  onPrev,
  currentWeight,
  adjustedCalorieTarget,
  setAdjustedCalorieTarget,
  baseTDEE,
  sliderInitialized,
  setSliderInitialized,
  deficitCalories,
  deficitPercentage,
  stepTitle,
  stepDescription
}: DeficitPlanFormProps) {
  // Calculate activity calories
  const weightLiftingSessions = form.watch("weightLiftingSessions") || 3;
  const cardioSessions = form.watch("cardioSessions") || 2;
  const stepsPerDay = form.watch("stepsPerDay") || 10000;
  
  const weightLiftingCalories = weightLiftingSessions * 250;
  const cardioCalories = cardioSessions * 300;
  const stepsCalories = Math.round((stepsPerDay / 10000) * 400 * 7);
  const weeklyActivityCalories = weightLiftingCalories + cardioCalories + stepsCalories;
  const dailyActivityCalories = Math.round(weeklyActivityCalories / 7);
  const totalTDEE = baseTDEE + dailyActivityCalories;

  return (
    <div className="py-6">
      <h2 className="text-2xl font-bold mb-2">{stepTitle}</h2>
      <p className="text-muted-foreground mb-6">{stepDescription}</p>
      
      {/* Activity Tracking Section */}
      <div className="bg-secondary/30 p-6 rounded-lg mb-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Dumbbell className="w-5 h-5 mr-2 text-primary" />
          Activity Tracking
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Your activity plan helps create your calorie deficit through exercise and movement.
          Each activity type burns calories to support your weight loss goals.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="weightLiftingSessions"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Strength Training Sessions/Week</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    max="7"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormDescription>
                  Each session burns ~250 calories (Total: {field.value * 250} cal/week)
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
                <FormLabel>Cardio Sessions/Week</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    max="7"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormDescription>
                  Each session burns ~300 calories (Total: {field.value * 300} cal/week)
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
                <FormLabel>Daily Step Goal</FormLabel>
                <FormControl>
                  <Slider
                    min={2000}
                    max={15000}
                    step={1000}
                    value={[field.value]}
                    onValueChange={(value) => field.onChange(value[0])}
                    className="py-4"
                  />
                </FormControl>
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>2,000</span>
                  <span>Steps: {field.value.toLocaleString()}</span>
                  <span>15,000</span>
                </div>
                <FormDescription>
                  10,000 steps burns ~400 calories per day (Total: {Math.round(field.value / 10000 * 400 * 7)} cal/week)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="md:col-span-2 mt-2 bg-primary/5 p-3 rounded-lg">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Total Weekly Activity Calories:</span>
              <span className="text-sm font-bold">{weeklyActivityCalories.toLocaleString()} calories</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Daily Average:</span>
              <span className="text-sm font-medium">{dailyActivityCalories.toLocaleString()} calories/day</span>
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-sm font-medium">Base Maintenance:</span>
              <span className="text-sm font-medium">{baseTDEE.toLocaleString()} calories/day</span>
            </div>
            <div className="flex justify-between mt-2 text-green-600">
              <span className="text-sm font-medium">Updated TDEE with Activity:</span>
              <span className="text-sm font-bold">{totalTDEE.toLocaleString()} calories/day</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Calorie Intake Selection */}
      <div className="bg-secondary/30 p-6 rounded-lg mb-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Utensils className="w-5 h-5 mr-2 text-primary" />
          Calorie Intake Selection
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Adjust your daily calorie intake below. Starting from your maintenance level,
          you can reduce calories to create a deficit for fat loss. We recommend a moderate
          deficit of 300-700 calories for sustainable results.
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
                  : "At maintenance level"}
              </div>
            </div>
          </div>
          <div className="mb-8">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium">Adjust Daily Calories</span>
              <span className="font-medium text-primary">{deficitCalories > 0 ? `-${deficitCalories} calories` : "No deficit"}</span>
            </div>
            <div className="relative mt-6 w-full" data-adjusted-calorie-target="true" data-value={adjustedCalorieTarget}>
              <Slider
                min={Math.max(1200, baseTDEE - 1000)}
                max={baseTDEE}
                step={100}
                value={[adjustedCalorieTarget]}
                onValueChange={(value) => {
                  setAdjustedCalorieTarget(value[0]);
                  if (!sliderInitialized) setSliderInitialized(true);
                }}
                className="w-full py-6"
              />
              <div
                className="absolute -top-8 px-2 py-1 bg-primary text-white text-xs rounded transform -translate-x-1/2 font-medium shadow-md"
                style={{
                  left: (() => {
                    try {
                      const minValue = Math.max(1200, (baseTDEE || 2000) - 1000);
                      const maxValue = baseTDEE || 2000;
                      const range = maxValue - minValue;
                      if (range <= 0 || !adjustedCalorieTarget) return "50%";
                      const position = (adjustedCalorieTarget - minValue) / range;
                      const percentage = Math.max(0, Math.min(100, position * 100));
                      return `${percentage}%`;
                    } catch (error) {
                      console.error("Error calculating tooltip position:", error);
                      return "50%";
                    }
                  })()
                }}
              >
                {adjustedCalorieTarget} cal
              </div>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>{Math.max(1200, baseTDEE - 1000)} cal (max deficit)</span>
              <span>{baseTDEE} cal (maintenance)</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Macronutrient Distribution Section */}
      <div className="bg-secondary/30 p-6 rounded-lg mb-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Utensils className="w-5 h-5 mr-2 text-primary" />
          Macronutrient Distribution
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Our scientific approach prioritizes adequate protein to preserve lean mass
          during fat loss, with balanced fat and carbohydrate intake.
        </p>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <FormField
              control={form.control}
              name="proteinGrams"
              render={({ field }) => {
                const proteinCalories = field.value * 4;
                const proteinPercent = Math.round((proteinCalories / adjustedCalorieTarget) * 100);
                
                return (
                  <FormItem>
                    <div className="flex justify-between mb-1">
                      <FormLabel>Daily Protein Intake</FormLabel>
                      <span className="text-sm font-medium">{field.value}g ({proteinPercent}%)</span>
                    </div>
                    <FormControl>
                      <div className="relative mt-4 mb-2">
                        <Slider
                          min={Math.round(currentWeight * 1.8)}
                          max={Math.round(currentWeight * 2.2)}
                          step={5}
                          value={[field.value]}
                          onValueChange={(value) => field.onChange(value[0])}
                          className="py-6"
                        />
                        <div
                          className="absolute -top-6 px-2 py-1 bg-primary text-white text-xs rounded transform -translate-x-1/2 font-medium"
                          style={{
                            left: (() => {
                              try {
                                const weight = currentWeight || 70;
                                const minValue = Math.round(weight * 1.8);
                                const maxValue = Math.round(weight * 2.2);
                                const range = maxValue - minValue;
                                if (range <= 0 || !field.value) return "50%";
                                const position = (field.value - minValue) / range;
                                const percentage = Math.max(0, Math.min(100, position * 100));
                                return `${percentage}%`;
                              } catch (error) {
                                console.error("Error calculating protein tooltip position:", error);
                                return "50%";
                              }
                            })()
                          }}
                        >
                          {field.value}g
                        </div>
                      </div>
                    </FormControl>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>1.8g/kg: {Math.round(currentWeight * 1.8)}g</span>
                      <span>2.0g/kg: {Math.round(currentWeight * 2.0)}g</span>
                      <span>2.2g/kg: {Math.round(currentWeight * 2.2)}g</span>
                    </div>
                    <FormDescription>
                      Protein helps preserve muscle during weight loss. {field.value}g provides {field.value * 4} calories.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )
              }}
            />
            <FormField
              control={form.control}
              name="fatGrams"
              render={({ field }) => {
                const fatCalories = field.value * 9;
                const fatPercent = Math.round((fatCalories / adjustedCalorieTarget) * 100);
                
                return (
                  <FormItem>
                    <div className="flex justify-between mb-1">
                      <FormLabel>Daily Fat Intake</FormLabel>
                      <span className="text-sm font-medium">{field.value}g ({fatPercent}%)</span>
                    </div>
                    <FormControl>
                      <div className="relative mt-4 mb-2">
                        <Slider
                          min={Math.round(currentWeight * 0.6)}
                          max={Math.round(currentWeight * 1.2)}
                          step={5}
                          value={[field.value]}
                          onValueChange={(value) => field.onChange(value[0])}
                          className="py-6"
                        />
                        <div
                          className="absolute -top-6 px-2 py-1 bg-primary text-white text-xs rounded transform -translate-x-1/2 font-medium"
                          style={{
                            left: (() => {
                              try {
                                const weight = currentWeight || 70;
                                const minValue = Math.round(weight * 0.6);
                                const maxValue = Math.round(weight * 1.2);
                                const range = maxValue - minValue;
                                if (range <= 0 || !field.value) return "50%";
                                const position = (field.value - minValue) / range;
                                const percentage = Math.max(0, Math.min(100, position * 100));
                                return `${percentage}%`;
                              } catch (error) {
                                console.error("Error calculating fat tooltip position:", error);
                                return "50%";
                              }
                            })()
                          }}
                        >
                          {field.value}g
                        </div>
                      </div>
                    </FormControl>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>0.6g/kg: {Math.round(currentWeight * 0.6)}g</span>
                      <span>0.9g/kg: {Math.round(currentWeight * 0.9)}g</span>
                      <span>1.2g/kg: {Math.round(currentWeight * 1.2)}g</span>
                    </div>
                    <FormDescription>
                      Fat is essential for hormone production and nutrient absorption. {field.value}g provides {field.value * 9} calories.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )
              }}
            />
            
            {/* Carbohydrates (calculated) */}
            <div className="mt-6">
              {(() => {
                const proteinGrams = form.watch("proteinGrams") || 176;
                const fatGrams = form.watch("fatGrams") || 72;
                const proteinCalories = proteinGrams * 4;
                const fatCalories = fatGrams * 9;
                const carbCalories = adjustedCalorieTarget - proteinCalories - fatCalories;
                const carbGrams = Math.max(0, Math.round(carbCalories / 4));
                const carbPercent = Math.round((carbCalories / adjustedCalorieTarget) * 100);
                
                return (
                  <>
                    <div className="mb-1">
                      <span className="font-medium">Carbohydrates (remaining calories)</span>
                      <span className="float-right text-sm">{carbGrams}g ({carbPercent}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                      <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${carbPercent}%` }}></div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Carbs fuel your workouts and daily activities. {carbGrams}g provides {carbCalories} calories.
                    </p>
                  </>
                );
              })()}
            </div>
          </div>
          
          {/* Right side could have a chart here if wanted */}
          <div className="flex flex-col justify-center items-center">
            <div className="text-center mb-4">
              <h4 className="text-sm font-medium mb-1">Daily Calorie Distribution</h4>
              <p className="text-xs text-muted-foreground">Based on your selected macronutrients</p>
            </div>
            {/* A placeholder for the pie chart or other visualization */}
            <div className="w-48 h-48 rounded-full border-8 border-primary/20 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold">{adjustedCalorieTarget}</div>
                <div className="text-xs">daily calories</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between mt-8">
        <Button type="button" variant="outline" onClick={onPrev}>
          <ChevronLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Button onClick={() => form.handleSubmit(onNext)()} type="button">
          Next <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}