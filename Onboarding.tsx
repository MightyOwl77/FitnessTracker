import React, { useState, useEffect, useRef, useMemo } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Progress } from "@/components/ui/progress";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import {
  Activity,
  User,
  Target,
  Calendar,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  Utensils
} from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useUserProfile, useUserGoal } from "@/hooks/use-user-data";
import { calculateBMR, calculateTDEE } from "@/lib/fitness-calculations";
import { useToast } from "@/hooks/use-toast";

// Define steps and schemas
const steps = [
  {
    id: "welcome",
    title: "Welcome to Your Fitness Transformation",
    description: "We'll create a personalized plan to help you reach your goals."
  },
  {
    id: "profile",
    title: "Tell Us About Yourself",
    description: "This helps us calculate your energy needs accurately."
  },
  {
    id: "goals",
    title: "What Are Your Goals?",
    description: "Set realistic targets for your transformation journey."
  },
  {
    id: "deficit-plan",
    title: "Create Your Deficit Plan",
    description: "Balance activity and nutrition to reach your goals."
  },
  {
    id: "preferences",
    title: "Your Preferences",
    description: "Customize your experience to suit your lifestyle."
  },
  {
    id: "complete",
    title: "You're All Set!",
    description: "Your personalized plan is ready to go."
  }
];

const profileSchema = z.object({
  age: z.coerce.number().int().min(18, "Must be at least 18 years old").max(120, "Must be at most 120 years old"),
  gender: z.enum(["male", "female"], { required_error: "Please select a gender" }),
  height: z.coerce.number().min(100, "Height must be at least 100 cm").max(250, "Height must be at most 250 cm"),
  weight: z.coerce.number().min(30, "Weight must be at least 30 kg").max(300, "Weight must be at most 300 kg"),
  bodyFatPercentage: z.coerce.number().min(3, "Body fat must be at least 3%").max(60, "Body fat must be at most 60%").optional(),
  activityLevel: z.enum(["sedentary", "lightly", "moderately", "very"], { required_error: "Please select an activity level" })
});

const goalsSchema = z.object({
  targetWeight: z.coerce.number().min(30, "Weight must be at least 30 kg").max(300, "Weight must be at most 300 kg"),
  // Although deficitRate is still part of the schema for calculations, its UI is not shown.
  deficitRate: z.coerce.number().min(0.25, "Minimum deficit is 0.25%").max(1, "Maximum deficit is 1%")
});

const deficitPlanSchema = z.object({
  weightLiftingSessions: z.coerce.number().min(0, "Cannot be negative").max(7, "Maximum is 7 sessions per week"),
  cardioSessions: z.coerce.number().min(0, "Cannot be negative").max(7, "Maximum is 7 sessions per week"),
  stepsPerDay: z.coerce.number().min(1000, "Minimum is 1,000 steps").max(20000, "Maximum is 20,000 steps"),
  proteinGrams: z.coerce.number().min(30, "Minimum protein is 30g").max(300, "Maximum protein is 300g"),
  fatGrams: z.coerce.number().min(20, "Minimum fat is 20g").max(150, "Maximum fat is 150g")
});

const preferencesSchema = z.object({
  fitnessLevel: z.enum(["beginner", "intermediate", "advanced"]),
  dietaryPreference: z.enum(["standard", "vegan", "vegetarian", "keto", "paleo", "mediterranean"]),
  trainingAccess: z.enum(["gym", "home", "both"]),
  healthConsiderations: z.string().optional()
});

// Default values
const profileFormDefaults = { age: 30, gender: "male", height: 175, weight: 76.5, bodyFatPercentage: undefined, activityLevel: "moderately" };
const goalsFormDefaults = { targetWeight: 70, deficitRate: 0.5 };
const deficitPlanFormDefaults = { weightLiftingSessions: 3, cardioSessions: 2, stepsPerDay: 10000, proteinGrams: 176, fatGrams: 72 };
const preferencesFormDefaults = { fitnessLevel: "intermediate", dietaryPreference: "standard", trainingAccess: "both", healthConsiderations: "" };

//
// Subcomponents for each step
//

function WelcomeStep({ onNext }) {
  return (
    <div className="text-center py-10">
      <div className="mb-8">
        <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <Activity className="w-10 h-10 text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-2">{steps[0].title}</h2>
        <p className="text-muted-foreground">{steps[0].description}</p>
      </div>
      <Button onClick={onNext} className="mt-8">
        Get Started <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
}

function ProfileStep({ form, onNext, onPrev }) {
  return (
    <div className="py-6">
      <h2 className="text-2xl font-bold mb-2">{steps[1].title}</h2>
      <p className="text-muted-foreground mb-6">{steps[1].description}</p>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onNext)} className="space-y-6">
          {/* Example Field: Age */}
          <FormField
            control={form.control}
            name="age"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Age</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Your age" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Add similar fields for gender, height, weight, bodyFatPercentage, and activityLevel */}
          <div className="flex justify-between mt-8">
            <Button type="button" variant="outline" onClick={onPrev}>
              <ChevronLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Saving..." : "Next"} <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

function GoalsStep({ form, onNext, onPrev, currentWeight }) {
  // Deficit slider removed; only target weight input is shown.
  const totalWeightLoss = Math.max(0, currentWeight - form.getValues().targetWeight);
  const goalWeeklyLossRate = ((form.getValues().deficitRate || 0.5) / 100) * currentWeight;
  const estimatedWeeks = totalWeightLoss > 0 ? Math.ceil(totalWeightLoss / goalWeeklyLossRate) : 0;
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + (estimatedWeeks * 7));
  const formattedTargetDate = targetDate.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="py-6">
      <h2 className="text-2xl font-bold mb-2">{steps[2].title}</h2>
      <p className="text-muted-foreground mb-6">{steps[2].description}</p>
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
                    <Input type="number" step="0.1" placeholder="Your target weight" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                  </FormControl>
                  <FormDescription>What weight do you want to achieve?</FormDescription>
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
            </div>
          )}
          <div className="flex justify-between mt-8">
            <Button type="button" variant="outline" onClick={onPrev}>
              <ChevronLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Saving..." : "Next"} <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

function DeficitPlanStep({
  form,
  onNext,
  onPrev,
  currentWeight,
  adjustedCalorieTarget,
  setAdjustedCalorieTarget,
  baseTDEE,
  sliderInitialized,
  setSliderInitialized
}) {
  // Calculate deficit calories and percentages
  const deficitCalories = baseTDEE - adjustedCalorieTarget;
  const deficitPercentage = Math.round((deficitCalories / baseTDEE) * 100);
  const deficitLevel = deficitCalories > 500 ? "aggressive" : deficitCalories > 200 ? "moderate" : "mild";

  return (
    <div className="py-6">
      <h2 className="text-2xl font-bold mb-2">{steps[3].title}</h2>
      <p className="text-muted-foreground mb-6">{steps[3].description}</p>
      {/* Calorie Intake Selection Section */}
      <div className="bg-secondary/30 p-6 rounded-lg mb-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Utensils className="w-5 h-5 mr-2 text-primary" />
          Calorie Intake Selection
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Adjust your daily calorie intake below. Starting from your maintenance level,
          you can reduce calories to create a deficit for fat loss.
          The minimum intake is set to 25% below your base maintenance.
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
              <span className="font-medium text-primary">
                {deficitCalories > 0 ? `-${deficitCalories} calories` : "No deficit"}
              </span>
            </div>
            <div className="relative mt-6 w-full">
              <Slider
                min={Math.round(baseTDEE * 0.75)}
                max={baseTDEE}
                step={100}
                value={[adjustedCalorieTarget]}
                onValueChange={(value) => {
                  setAdjustedCalorieTarget(value[0]);
                  if (!sliderInitialized) setSliderInitialized(true);
                }}
                className="w-full py-6"
                aria-label="Calorie target slider"
              />
              <div
                className="absolute -top-8 px-2 py-1 bg-primary text-white text-xs rounded transform -translate-x-1/2 font-medium shadow-md"
                style={{
                  left: `${(((Number(adjustedCalorieTarget) || 0) - Math.round(baseTDEE * 0.75)) / (baseTDEE - Math.round(baseTDEE * 0.75))) * 100}%`
                }}
              >
                {adjustedCalorieTarget} cal
              </div>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>{Math.round(baseTDEE * 0.75)} cal (min intake)</span>
              <span>{baseTDEE} cal (maintenance)</span>
            </div>
          </div>
          {/* Additional deficit visualizations can be added here */}
        </div>
      </div>
      <div className="flex justify-between mt-8">
        <Button type="button" variant="outline" onClick={onPrev}>
          <ChevronLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Button type="submit" onClick={onNext} disabled={form.formState.isSubmitting}>
          Next <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function PreferencesStep({ form, onNext, onPrev }) {
  return (
    <div className="py-6">
      <h2 className="text-2xl font-bold mb-2">{steps[4].title}</h2>
      <p className="text-muted-foreground mb-6">{steps[4].description}</p>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onNext)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="fitnessLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fitness Level</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select fitness level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dietaryPreference"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dietary Preference</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select dietary preference" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="vegan">Vegan</SelectItem>
                      <SelectItem value="vegetarian">Vegetarian</SelectItem>
                      <SelectItem value="keto">Keto</SelectItem>
                      <SelectItem value="paleo">Paleo</SelectItem>
                      <SelectItem value="mediterranean">Mediterranean</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="trainingAccess"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Training Access</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select training access" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="gym">Gym Only</SelectItem>
                      <SelectItem value="home">Home Only</SelectItem>
                      <SelectItem value="both">Both Gym and Home</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="healthConsiderations"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Health Considerations (Optional)</FormLabel>
                  <FormControl>
                    <Input type="text" placeholder="Any injuries or conditions" {...field} />
                  </FormControl>
                  <FormDescription>Information that may affect your workout plan</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="flex justify-between mt-8">
            <Button type="button" variant="outline" onClick={onPrev}>
              <ChevronLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Saving..." : "Next"} <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

function CompleteStep({ onFinish }) {
  return (
    <div className="py-10 text-center">
      <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
        <Activity className="w-10 h-10 text-primary" />
      </div>
      <h2 className="text-2xl font-bold mb-2">{steps[5].title}</h2>
      <p className="text-muted-foreground mb-8">{steps[5].description}</p>
      <Button onClick={onFinish} size="lg">
        View My Dashboard <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
}

//
// MAIN ONBOARDING COMPONENT
//
export default function Onboarding() {
  const [location, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState(false);
  const { toast } = useToast();

  const { profileData, saveProfile, isSaving: isSavingProfile } = useUserProfile();
  const { goalData, saveGoal, isSaving: isSavingGoal } = useUserGoal();

  const [currentWeight, setCurrentWeight] = useState(76.5);
  const [adjustedCalorieTarget, setAdjustedCalorieTarget] = useState(2000);
  const [sliderInitialized, setSliderInitialized] = useState(false);

  const prevWeightRef = useRef(76.5);

  // Initialize forms
  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: profileFormDefaults,
    mode: "onBlur"
  });
  const goalsForm = useForm({
    resolver: zodResolver(goalsSchema),
    defaultValues: goalsFormDefaults,
    mode: "onBlur"
  });
  const deficitPlanForm = useForm({
    resolver: zodResolver(deficitPlanSchema),
    defaultValues: deficitPlanFormDefaults,
    mode: "onBlur"
  });
  const preferencesForm = useForm({
    resolver: zodResolver(preferencesSchema),
    defaultValues: preferencesFormDefaults,
    mode: "onBlur"
  });

  useEffect(() => {
    if (profileData) {
      const formValues = {
        age: profileData.age || profileFormDefaults.age,
        gender: profileData.gender || profileFormDefaults.gender,
        height: profileData.height || profileFormDefaults.height,
        weight: profileData.weight || profileFormDefaults.weight,
        bodyFatPercentage: profileData.bodyFatPercentage,
        activityLevel: profileData.activityLevel || profileFormDefaults.activityLevel
      };
      profileForm.reset(formValues);
      if (profileData.weight && Math.abs(profileData.weight - prevWeightRef.current) > 0.01) {
        prevWeightRef.current = profileData.weight;
        setCurrentWeight(profileData.weight);
      }
      const prefValues = {
        fitnessLevel: profileData.fitnessLevel || preferencesFormDefaults.fitnessLevel,
        dietaryPreference: profileData.dietaryPreference || preferencesFormDefaults.dietaryPreference,
        trainingAccess: profileData.trainingAccess || preferencesFormDefaults.trainingAccess,
        healthConsiderations: profileData.healthConsiderations || preferencesFormDefaults.healthConsiderations
      };
      preferencesForm.reset(prefValues);
    }
  }, [JSON.stringify(profileData)]);

  useEffect(() => {
    if (goalData) {
      const formValues = {
        targetWeight: goalData.targetWeight || goalsFormDefaults.targetWeight,
        deficitRate: goalData.deficitRate || goalsFormDefaults.deficitRate
      };
      goalsForm.reset(formValues);
      if (goalData.dailyCalorieTarget) {
        setAdjustedCalorieTarget(goalData.dailyCalorieTarget);
      }
    }
  }, [JSON.stringify(goalData)]);

  useEffect(() => {
    const subscription = profileForm.watch((value, { name }) => {
      if (name === "weight" && value.weight && Math.abs(value.weight - prevWeightRef.current) > 0.01) {
        prevWeightRef.current = value.weight;
        setCurrentWeight(value.weight);
      }
    });
    return () => subscription.unsubscribe();
  }, [profileForm]);

  // Navigation handlers
  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  const handleProfileSubmit = async (data) => {
    try {
      const bmr = calculateBMR(data.weight, data.height, data.age, data.gender);
      await saveProfile({ ...data, bmr });
      nextStep();
    } catch (error) {
      toast({
        title: "Error saving profile",
        description: "There was a problem saving your profile data.",
        variant: "destructive"
      });
    }
  };

  const handleGoalsSubmit = async (data) => {
    try {
      const profile = profileForm.getValues();
      const bmr = calculateBMR(currentWeight, profile.height, profile.age, profile.gender);
      const tdee = calculateTDEE(bmr, profile.activityLevel);
      const totalWeightLoss = Math.max(0, currentWeight - data.targetWeight);
      const totalCalorieDeficit = totalWeightLoss * 7700;
      const weeklyLossRate = ((data.deficitRate || 0.5) / 100) * currentWeight;
      const dailyDeficitCap = Math.round(weeklyLossRate * 7700 / 7);
      const timeFrame = totalWeightLoss > 0 ? Math.ceil(totalWeightLoss / weeklyLossRate) : 12;
      const totalDays = timeFrame * 7;
      const rawDailyDeficit = totalWeightLoss > 0 ? Math.round(totalCalorieDeficit / totalDays) : 0;
      const dailyDeficit = Math.min(rawDailyDeficit, dailyDeficitCap);
      const weightLiftingSessions = 3, cardioSessions = 2, stepsPerDay = 10000;
      const weeklyActivityCalories =
        weightLiftingSessions * 250 +
        cardioSessions * 300 +
        (stepsPerDay / 10000) * 400 * 7;
      const dailyActivityCalories = Math.round(weeklyActivityCalories / 7);
      const dailyCalorieTarget = tdee;
      const proteinGrams = Math.round(1.8 * profile.weight);
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
        dailyDeficit,
        proteinGrams,
        fatGrams,
        carbGrams,
        weeklyActivityCalories,
        dailyActivityCalories
      });
      deficitPlanForm.reset({ weightLiftingSessions, cardioSessions, stepsPerDay, proteinGrams, fatGrams });
      setAdjustedCalorieTarget(dailyCalorieTarget);
      nextStep();
    } catch (error) {
      toast({
        title: "Error saving goals",
        description: "There was a problem saving your goals data.",
        variant: "destructive"
      });
    }
  };

  const handleDeficitPlanSubmit = async (data) => {
    try {
      const profile = profileForm.getValues();
      const goals = goalsForm.getValues();
      const bmr = calculateBMR(currentWeight, profile.height, profile.age, profile.gender);
      const tdee = calculateTDEE(bmr, profile.activityLevel);
      const weeklyActivityCalories =
        data.weightLiftingSessions * 250 +
        data.cardioSessions * 300 +
        (data.stepsPerDay / 10000) * 400 * 7;
      const dailyActivityCalories = Math.round(weeklyActivityCalories / 7);
      if (adjustedCalorieTarget === 2000) {
        const newTarget = Math.round(tdee - Math.max(0, Math.round(((goals.deficitRate || 0.5) / 100 * currentWeight) * 7700 / 7) - dailyActivityCalories));
        setAdjustedCalorieTarget(newTarget);
      }
      const proteinCalories = data.proteinGrams * 4;
      const fatCalories = data.fatGrams * 9;
      const carbCalories = adjustedCalorieTarget - proteinCalories - fatCalories;
      const fatGrams = data.fatGrams;
      const carbGrams = Math.round(carbCalories / 4);
      const actualDailyDeficit = tdee - adjustedCalorieTarget + dailyActivityCalories;
      const weeklyDeficit = actualDailyDeficit * 7;
      const projectedWeeklyLoss = weeklyDeficit / 7700;
      await saveGoal({
        ...goalData,
        weightLiftingSessions: data.weightLiftingSessions,
        cardioSessions: data.cardioSessions,
        stepsPerDay: data.stepsPerDay,
        dailyCalorieTarget: adjustedCalorieTarget,
        proteinGrams: data.proteinGrams,
        fatGrams,
        carbGrams,
        weeklyActivityCalories,
        dailyActivityCalories,
        dailyDeficit: actualDailyDeficit,
        deficitRate: (projectedWeeklyLoss * 100) / currentWeight
      });
      nextStep();
    } catch (error) {
      toast({
        title: "Error saving deficit plan",
        description: "There was a problem saving your deficit plan.",
        variant: "destructive"
      });
    }
  };

  const handlePreferencesSubmit = async (data) => {
    try {
      await saveProfile({
        ...profileData,
        fitnessLevel: data.fitnessLevel,
        dietaryPreference: data.dietaryPreference,
        trainingAccess: data.trainingAccess,
        healthConsiderations: data.healthConsiderations
      });
      localStorage.setItem("hasCompletedOnboarding", "true");
      setCompleted(true);
      nextStep();
    } catch (error) {
      toast({
        title: "Error saving preferences",
        description: "There was a problem saving your preferences.",
        variant: "destructive"
      });
    }
  };

  const finishOnboarding = () => {
    localStorage.setItem("hasCompletedOnboarding", "true");
    setLocation("/dashboard");
  };

  useEffect(() => {
    const hasCompleted = localStorage.getItem("hasCompletedOnboarding") === "true";
    if (hasCompleted) {
      setLocation("/dashboard");
    }
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (!localStorage.getItem("hasCompletedOnboarding") && currentStep > 0) {
        e.preventDefault();
        e.returnValue = "You're in the middle of setting up your fitness plan. Are you sure you want to leave?";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [currentStep]);

  const [animDirection, setAnimDirection] = useState(0);
  const handleNext = () => {
    setAnimDirection(1);
    nextStep();
  };
  const handlePrev = () => {
    setAnimDirection(-1);
    prevStep();
  };

  // Calculate base maintenance for step 3
  const baseBMR = calculateBMR(
    currentWeight,
    profileForm.getValues().height,
    profileForm.getValues().age,
    profileForm.getValues().gender
  );
  const baseTDEE = Math.round(baseBMR * 1.2);
  const deficitCalories = baseTDEE - adjustedCalorieTarget;
  const deficitPercentage = Math.round((deficitCalories / baseTDEE) * 100);

  // Animation settings (respecting prefers-reduced-motion)
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const animationTransition = prefersReducedMotion
    ? { duration: 0.1 }
    : { x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } };

  const animationVariants = {
    enter: (dir) => ({ x: dir > 0 ? 200 : -200, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir < 0 ? 200 : -200, opacity: 0 })
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <WelcomeStep onNext={handleNext} />;
      case 1:
        return (
          <ProfileStep
            form={profileForm}
            onNext={handleProfileSubmit}
            onPrev={handlePrev}
          />
        );
      case 2:
        return (
          <GoalsStep
            form={goalsForm}
            onNext={handleGoalsSubmit}
            onPrev={handlePrev}
            currentWeight={currentWeight}
          />
        );
      case 3:
        return (
          <DeficitPlanStep
            form={deficitPlanForm}
            onNext={() => handleDeficitPlanSubmit(deficitPlanForm.getValues())}
            onPrev={handlePrev}
            currentWeight={currentWeight}
            adjustedCalorieTarget={adjustedCalorieTarget}
            setAdjustedCalorieTarget={setAdjustedCalorieTarget}
            baseTDEE={baseTDEE}
            sliderInitialized={sliderInitialized}
            setSliderInitialized={setSliderInitialized}
            deficitCalories={deficitCalories}
            deficitPercentage={deficitPercentage}
          />
        );
      case 4:
        return (
          <PreferencesStep
            form={preferencesForm}
            onNext={handlePreferencesSubmit}
            onPrev={handlePrev}
          />
        );
      case 5:
        return <CompleteStep onFinish={finishOnboarding} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center">
      <div className="container max-w-3xl mx-auto px-4 py-6">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-0">
            <div className="bg-muted px-6 py-4">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">
                  Step {currentStep + 1} of {steps.length}
                </span>
                <span className="text-sm text-muted-foreground">
                  {Math.round((currentStep / (steps.length - 1)) * 100)}% Complete
                </span>
              </div>
              <Progress value={(currentStep / (steps.length - 1)) * 100} className="h-2" />
            </div>
            <div className="px-6 overflow-hidden">
              <AnimatePresence custom={animDirection} initial={false}>
                <motion.div
                  key={currentStep}
                  custom={animDirection}
                  variants={animationVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={animationTransition}
                >
                  {renderStep()}
                </motion.div>
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}