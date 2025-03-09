import { UseFormReturn } from "react-hook-form";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface GoalsFormProps {
  form: UseFormReturn<any>;
  onNext: (data: any) => void;
  onPrev: () => void;
  currentWeight: number;
  isSaving?: boolean;
  stepTitle: string;
  stepDescription: string;
  calculateWeightLossProjection?: () => any;
}

export function GoalsForm({
  form,
  onNext,
  onPrev,
  currentWeight,
  isSaving = false,
  stepTitle,
  stepDescription,
  calculateWeightLossProjection
}: GoalsFormProps) {
  // Calculate target date and other metrics based on current form values
  const targetWeight = form.watch("targetWeight");
  const deficitRate = form.watch("deficitRate");
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
      <h2 className="text-2xl font-bold mb-2">{stepTitle}</h2>
      <p className="text-muted-foreground mb-6">{stepDescription}</p>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onNext)} className="space-y-6">
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
                  <FormDescription>What weight do you want to achieve?</FormDescription>
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
              
              {calculateWeightLossProjection && (
                <div className="mt-6">
                  <h4 className="text-md font-medium mb-2">Weight Loss Projection</h4>
                  {(() => {
                    const projection = calculateWeightLossProjection();
                    return (
                      <div className="text-xs text-muted-foreground mb-2">
                        <span>Current: {currentWeight}kg, </span>
                        <span>Target: {projection.targetWeight}kg, </span>
                        <span>Weekly Loss: {projection.weeklyLossRate.toFixed(2)}kg, </span>
                        <span>Weeks: {projection.estWeeks}</span>
                      </div>
                    );
                  })()}
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={calculateWeightLossProjection().projectionData}
                        margin={{ top: 5, right: 5, left: 5, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                        <XAxis dataKey="week" label={{ value: 'Weeks', position: 'bottom', offset: -5 }} />
                        <YAxis
                          domain={[
                            Math.floor(Math.min(currentWeight, calculateWeightLossProjection().targetWeight) * 0.95),
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
              )}
            </div>
          )}
          <div className="flex justify-between mt-8">
            <Button type="button" variant="outline" onClick={onPrev}>
              <ChevronLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : "Next"} <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}