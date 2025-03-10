// Import statements for React, motion, and components used in the Onboarding screen
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
import { useForm, UseFormReturn } from "react-hook-form";
import { useUserProfile, useUserGoal } from "@/hooks/use-user-data";
import { calculateBMR, calculateTDEE } from "@/lib/fitness-calculations";
import { useToast } from "@/hooks/use-toast";
import { useUserData } from "@/contexts/user-data-context";

// Define onboarding steps and schemas
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
  // Deficit slider removed from UI; default deficit rate of 0.5 remains for calculation.
  deficitRate: z.coerce.number().min(0.25, "Minimum deficit is 0.25%").max(1, "Maximum deficit is 1%").default(0.5)
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

// Default form values
const profileFormDefaults = { age: 30, gender: "male", height: 175, weight: 76.5, bodyFatPercentage: undefined, activityLevel: "moderately" };
const goalsFormDefaults = { targetWeight: 70, deficitRate: 0.5 };
const deficitPlanFormDefaults = { weightLiftingSessions: 3, cardioSessions: 2, stepsPerDay: 10000, proteinGrams: 176, fatGrams: 72 };
const preferencesFormDefaults = { fitnessLevel: "intermediate", dietaryPreference: "standard", trainingAccess: "both", healthConsiderations: "" };

//
// Custom hook to memoize weight loss projection calculations
//
function useWeightLossProjection(form: UseFormReturn<any>, currentWeight: number) {
  return useMemo(() => {
    const targetWeight = form.getValues().targetWeight || currentWeight * 0.9;
    const deficitRate = form.getValues().deficitRate || 0.5;
    const projectedWeeklyLossRate = (deficitRate / 100) * currentWeight;
    const totalLoss = Math.max(0, currentWeight - targetWeight);
    const estWeeks = totalLoss > 0 ? Math.ceil(totalLoss / projectedWeeklyLossRate) : 12;
    const projectionData = [];
    for (let i = 0; i <= estWeeks; i++) {
      projectionData.push({
        week: i,
        weight: i === estWeeks ? targetWeight.toFixed(1) : Math.max(targetWeight, currentWeight - projectedWeeklyLossRate * i).toFixed(1)
      });
    }
    return { targetWeight, deficitRate, weeklyLossRate: projectedWeeklyLossRate, totalLoss, estWeeks, projectionData };
  }, [form, currentWeight]);
}

//
// Subcomponents for Onboarding Steps
//

interface StepProps {
  onNext: (data?: any) => void;
  onPrev: () => void;
}

function WelcomeStep({ onNext, hasProgress, resumeStep, onResume }: { 
  onNext: () => void;
  hasProgress?: boolean;
  resumeStep?: number;
  onResume?: () => void;
}) {
  return (
    <div className="text-center py-10">
      <div className="mb-8">
        <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <Activity className="w-10 h-10 text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-2">{steps[0].title}</h2>
        <p className="text-muted-foreground">{steps[0].description}</p>
      </div>
      
      {hasProgress && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 max-w-md mx-auto">
          <h3 className="text-sm font-medium text-green-800 mb-1">
            You have unfinished progress!
          </h3>
          <p className="text-xs text-green-700 mb-3">
            We saved your progress from last time. You can continue where you left off.
          </p>
          <Button 
            onClick={onResume} 
            variant="outline" 
            className="bg-green-100 hover:bg-green-200 text-green-800 border-green-300"
          >
            Resume from Step {resumeStep} <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
      
      <Button onClick={onNext} className="mt-4">
        {hasProgress ? "Start Over" : "Get Started"} <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
}

function ProfileStep({ form, onNext, onPrev }: { form: UseFormReturn<any>; onNext: (data: any) => void; onPrev: () => void; }) {
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
                  <Input
                    type="number"
                    placeholder="Your age"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    aria-label="Age"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Additional fields (gender, height, weight, etc.) would be added similarly */}
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

function GoalsStep({ form, onNext, onPrev, currentWeight }: { form: UseFormReturn<any>; onNext: (data: any) => void; onPrev: () => void; currentWeight: number; }) {
  // Only the target weight input is shown (deficit slider removed)
  const totalWeightLoss = Math.max(0, currentWeight - form.getValues().targetWeight);
  // Fix weekly loss rate calculation to be more realistic (max 1% of body weight per week)
  // The deficitRate is already in percentage, so we need to scale it properly
  const deficitRateValue = form.getValues().deficitRate || 0.5;
  // Cap the weekly loss rate to a maximum of 1% of body weight for safety and realism
  const goalWeeklyLossRate = Math.min(deficitRateValue, 1.0) * currentWeight / 100;
  const estimatedWeeks = totalWeightLoss > 0 ? Math.ceil(totalWeightLoss / goalWeeklyLossRate) : 0;
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + estimatedWeeks * 7);
  const formattedTargetDate = targetDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });

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
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="Your target weight"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      aria-label="Target Weight"
                    />
                  </FormControl>
                  <FormDescription>
                    Enter your desired weight for a lean, muscular physique.
                  </FormDescription>
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
  setSliderInitialized,
  deficitCalories,
  deficitPercentage
}: {
  form: UseFormReturn<any>;
  onNext: () => void;
  onPrev: () => void;
  currentWeight: number;
  adjustedCalorieTarget: number;
  setAdjustedCalorieTarget: (value: number) => void;
  baseTDEE: number;
  sliderInitialized: boolean;
  setSliderInitialized: (value: boolean) => void;
  deficitCalories: number;
  deficitPercentage: number;
}) {
  // Daily summary now shows the total deficit as Calories Out (baseTDEE) minus Calories In (adjustedCalorieTarget)
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
          Adjust your daily calorie intake below. Starting from your maintenance level, you can reduce
          calories to create a deficit for fat loss. We recommend a moderate deficit of 300-700 calories for
          sustainable results.
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
                  : "At maintenance"}
              </div>
            </div>
          </div>

          <div className="mb-8">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium">Adjust Daily Calories</span>
              <span className="font-medium text-green-600">
                {deficitCalories > 0 ? `-${deficitCalories} calories` : "No deficit"}
              </span>
            </div>

            <div className="relative mt-8 w-full">
              <Slider
                value={[adjustedCalorieTarget]}
                onValueChange={(value) => {
                  setAdjustedCalorieTarget(value[0]);
                  if (!sliderInitialized) setSliderInitialized(true);
                }}
                className="w-full py-4"
                aria-label="Calorie target slider"
              />
            </div>
            <div className="text-xs text-muted-foreground">
              {deficitCalories > 0
                ? `Weekly fat loss potential: ${(deficitCalories * 7 / 7700).toFixed(2)} kg`
                : 'Maintenance calories for body recomposition'}
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-between mt-8">
        <Button type="button" variant="outline" onClick={onPrev}>
          <ChevronLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Form onSubmit={form.handleSubmit(onNext)}>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Saving..." : "Next"} <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </Form>
      </div>
    </div>
  );
}

function PreferencesStep({ form, onNext, onPrev }: { form: UseFormReturn<any>; onNext: (data: any) => void; onPrev: () => void; }) {
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
                    <Input type="text" placeholder="Any injuries or conditions" {...field} aria-label="Health Considerations" />
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

function CompleteStep({ onFinish }: { onFinish: () => void }) {
  return (
    <div className="py-10 text-center">
      <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
        <Activity className="w-10 h-10 text-primary" />
      </div>
      <h2 className="text-2xl font-bold mb-2">{steps[4].title}</h2>
      <p className="text-muted-foreground mb-8">{steps[4].description}</p>
      <Button onClick={onFinish} size="lg">
        View My Dashboard <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
}

//
// Main Onboarding Component
//
export default function Onboarding() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Use our centralized UserDataContext
  const { userData, updateUserData, isDataLoaded } = useUserData();
  
  // Keep existing hooks for API compatibility
  const { profileData, saveProfile, isSaving: isSavingProfile } = useUserProfile();
  const { goalData, saveGoal, isSaving: isSavingGoal } = useUserGoal();

  // Track onboarding progress in local storage
  const [onboardingProgress, setOnboardingProgress] = useState(() => {
    const savedProgress = localStorage.getItem('onboarding_progress');
    return savedProgress ? JSON.parse(savedProgress) : { lastCompletedStep: -1 };
  });
  
  // Track current step with state and localStorage
  const [currentStep, setCurrentStep] = useState(() => {
    return Math.min(onboardingProgress.lastCompletedStep + 1, steps.length - 1);
  });
  
  // Track completion status
  const [completed, setCompleted] = useState(false);

  // Initialize with values from UserDataContext if available
  const [currentWeight, setCurrentWeight] = useState(userData.weight || 76.5);
  const [adjustedCalorieTarget, setAdjustedCalorieTarget] = useState(userData.calorieTarget || 2000);
  const [sliderInitialized, setSliderInitialized] = useState(false);
  const [baseTDEE, setBaseTDEE] = useState(userData.maintenanceCalories || 2500);

  const prevWeightRef = useRef(userData.weight || 76.5);
  
  // Save progress when step changes
  useEffect(() => {
    const newProgress = { 
      lastCompletedStep: Math.max(currentStep - 1, onboardingProgress.lastCompletedStep),
      timestamp: new Date().toISOString()
    };
    setOnboardingProgress(newProgress);
    localStorage.setItem('onboarding_progress', JSON.stringify(newProgress));
  }, [currentStep]);

  // Initialize form defaults from UserDataContext when available
  const profileFormInitValues = useMemo(() => {
    return {
      age: userData.age || profileFormDefaults.age,
      gender: userData.gender || profileFormDefaults.gender,
      height: userData.height || profileFormDefaults.height,
      weight: userData.weight || profileFormDefaults.weight,
      bodyFatPercentage: userData.bodyFatPercentage || profileFormDefaults.bodyFatPercentage,
      activityLevel: userData.activityLevel || profileFormDefaults.activityLevel
    };
  }, [userData]);
  
  const goalsFormInitValues = useMemo(() => {
    return {
      targetWeight: userData.targetWeight || goalsFormDefaults.targetWeight,
      deficitRate: userData.deficitPercentage ? userData.deficitPercentage / 100 : goalsFormDefaults.deficitRate
    };
  }, [userData]);
  
  const deficitPlanFormInitValues = useMemo(() => {
    // Use default values but could be extended to use data from UserDataContext
    return deficitPlanFormDefaults;
  }, []);
  
  const preferencesFormInitValues = useMemo(() => {
    return {
      fitnessLevel: profileData?.fitnessLevel || preferencesFormDefaults.fitnessLevel,
      dietaryPreference: userData.mealPreference || profileData?.dietaryPreference || preferencesFormDefaults.dietaryPreference,
      trainingAccess: userData.workoutPreference || profileData?.trainingAccess || preferencesFormDefaults.trainingAccess,
      healthConsiderations: profileData?.healthConsiderations || preferencesFormDefaults.healthConsiderations
    };
  }, [userData, profileData]);
  
  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: profileFormInitValues,
    mode: "onBlur"
  });
  
  const goalsForm = useForm({
    resolver: zodResolver(goalsSchema),
    defaultValues: goalsFormInitValues,
    mode: "onBlur"
  });
  
  const deficitPlanForm = useForm({
    resolver: zodResolver(deficitPlanSchema),
    defaultValues: deficitPlanFormInitValues,
    mode: "onBlur"
  });
  
  const preferencesForm = useForm({
    resolver: zodResolver(preferencesSchema),
    defaultValues: preferencesFormInitValues,
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

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  const handleProfileSubmit = async (data) => {
    try {
      const bmr = calculateBMR(data.weight, data.height, data.age, data.gender);
      
      // Save to API
      await saveProfile({ ...data, bmr });
      
      // Also update our centralized UserDataContext
      updateUserData({
        gender: data.gender,
        age: data.age,
        height: data.height,
        weight: data.weight,
        activityLevel: data.activityLevel
      });
      
      nextStep();
    } catch (error) {
      toast({ title: "Error saving profile", description: "There was a problem saving your profile data.", variant: "destructive" });
    }
  };

  const handleGoalsSubmit = async (data) => {
    try {
      const profile = profileForm.getValues();
      const bmr = calculateBMR(currentWeight, profile.height, profile.age, profile.gender);
      const tdee = calculateTDEE(bmr, profile.activityLevel);
      const totalWeightLoss = Math.max(0, currentWeight - data.targetWeight);
      const totalCalorieDeficit = totalWeightLoss * 7700;
      // Fix weekly loss rate calculation to match the GoalsStep component
      const deficitRateValue = data.deficitRate || 0.5;
      // Cap the weekly loss rate to a maximum of 1% of body weight for safety and realism
      const weeklyLossRate = Math.min(deficitRateValue, 1.0) * currentWeight / 100;
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
      
      // Save to API
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
      
      // Also update our centralized UserDataContext
      updateUserData({
        targetWeight: data.targetWeight,
        weeklyLossRate: weeklyLossRate,
        timeFrame: timeFrame,
        maintenanceCalories: tdee,
        calorieTarget: dailyCalorieTarget,
        dailyDeficit: dailyDeficit
      });
      
      deficitPlanForm.reset({ weightLiftingSessions, cardioSessions, stepsPerDay, proteinGrams, fatGrams });
      setAdjustedCalorieTarget(dailyCalorieTarget);
      nextStep();
    } catch (error) {
      toast({ title: "Error saving goals", description: "There was a problem saving your goals data.", variant: "destructive" });
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
        // Fix weekly loss rate calculation to be consistent
        const deficitRateValue = goals.deficitRate || 0.5;
        // Cap the weekly loss rate to a maximum of 1% of body weight for safety and realism
        const weeklyLossRate = Math.min(deficitRateValue, 1.0) * currentWeight / 100;
        const dailyDeficitForRate = Math.round(weeklyLossRate * 7700 / 7);
        const newTarget = Math.round(tdee - Math.max(0, dailyDeficitForRate - dailyActivityCalories));
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
      
      const deficitPercentage = Math.round((actualDailyDeficit / tdee) * 100);
      
      // Save to API
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
        deficitRate: Math.min(1, (projectedWeeklyLoss * 100) / currentWeight)
      });
      
      // Also save preferences from defaults
      await saveProfile({
        ...profileData,
        fitnessLevel: preferencesFormDefaults.fitnessLevel,
        dietaryPreference: preferencesFormDefaults.dietaryPreference,
        trainingAccess: preferencesFormDefaults.trainingAccess,
        healthConsiderations: preferencesFormDefaults.healthConsiderations
      });
      
      // Update our centralized UserDataContext with deficit plan data
      updateUserData({
        deficitLevel: deficitPercentage <= 10 ? "light" : deficitPercentage <= 20 ? "moderate" : "aggressive",
        deficitPercentage: deficitPercentage,
        dailyDeficit: actualDailyDeficit,
        calorieTarget: adjustedCalorieTarget
      });
      
      // Mark as completed (will be fully set in the CompleteStep)
      setCompleted(true);
      nextStep();
    } catch (error) {
      toast({ title: "Error saving deficit plan", description: "There was a problem saving your deficit plan.", variant: "destructive" });
    }
  };

  const handlePreferencesSubmit = async (data) => {
    try {
      // Save to API
      await saveProfile({
        ...profileData,
        fitnessLevel: data.fitnessLevel,
        dietaryPreference: data.dietaryPreference,
        trainingAccess: data.trainingAccess,
        healthConsiderations: data.healthConsiderations
      });
      
      // Update our centralized UserDataContext
      updateUserData({
        notificationPreference: [], // Default empty array
        mealPreference: data.dietaryPreference,
        workoutPreference: data.trainingAccess,
        trackingFrequency: 'daily' // Default value
      });
      
      localStorage.setItem("hasCompletedOnboarding", "true");
      setCompleted(true);
      nextStep();
    } catch (error) {
      toast({ title: "Error saving preferences", description: "There was a problem saving your preferences.", variant: "destructive" });
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

  useEffect(() => {
    try {
      const profile = profileForm.getValues();
      const baseBMR = calculateBMR(currentWeight, profile.height || 175, profile.age || 30, profile.gender || "male");
      const calculatedTDEE = Math.round(calculateTDEE(baseBMR, profile.activityLevel || "moderately"));
      setBaseTDEE(calculatedTDEE);
    } catch (error) {
      console.error("Error calculating TDEE:", error);
      setBaseTDEE(2500);
    }
  }, [currentWeight, JSON.stringify(profileForm.getValues())]);

  const deficitCalories = baseTDEE - adjustedCalorieTarget;
  const deficitPercentage = Math.round((deficitCalories / (baseTDEE || 1)) * 100);

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const animationTransition = prefersReducedMotion
    ? { duration: 0.1 }
    : { x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } };

  const animationVariants = {
    enter: (dir) => ({ x: dir > 0 ? 200 : -200, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir < 0 ? 200 : -200, opacity: 0 })
  };

  // Handle resuming from previous step
  const handleResumeProgress = () => {
    const resumeStep = Math.min(onboardingProgress.lastCompletedStep + 1, steps.length - 1);
    setCurrentStep(resumeStep);
    setAnimDirection(1);
  };

  // Handle starting over
  const handleStartOver = () => {
    // Keep the current step at 0, but reset the progress tracker
    const resetProgress = { lastCompletedStep: -1, timestamp: new Date().toISOString() };
    setOnboardingProgress(resetProgress);
    localStorage.setItem('onboarding_progress', JSON.stringify(resetProgress));
    handleNext();
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        // Show resume option if there's progress
        const hasProgress = onboardingProgress.lastCompletedStep > 0;
        const nextStep = Math.min(onboardingProgress.lastCompletedStep + 1, steps.length - 1);
        return (
          <WelcomeStep 
            onNext={hasProgress ? handleStartOver : handleNext} 
            hasProgress={hasProgress}
            resumeStep={nextStep}
            onResume={handleResumeProgress}
          />
        );
      case 1:
        return <ProfileStep form={profileForm} onNext={handleProfileSubmit} onPrev={handlePrev} />;
      case 2:
        return <GoalsStep form={goalsForm} onNext={handleGoalsSubmit} onPrev={handlePrev} currentWeight={currentWeight} />;
      case 3:
        return (
          <DeficitPlanStep
            form={deficitPlanForm}
            onNext={handleDeficitPlanSubmit}
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