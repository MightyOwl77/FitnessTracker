import { useState, useEffect, useRef } from "react";
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
import { Separator } from "@/components/ui/separator";
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
  Cell,
  Legend
} from "recharts";
import {
  Activity,
  User,
  Weight,
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

// Define onboarding steps
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

// Form schemas for each step
const profileSchema = z.object({
  age: z.coerce.number().int().min(18, "Must be at least 18 years old").max(120, "Must be at most 120 years old"),
  gender: z.enum(["male", "female"], {
    required_error: "Please select a gender",
  }),
  height: z.coerce.number().min(100, "Height must be at least 100 cm").max(250, "Height must be at most 250 cm"),
  weight: z.coerce.number().min(30, "Weight must be at least 30 kg").max(300, "Weight must be at most 300 kg"),
  bodyFatPercentage: z.coerce.number().min(3, "Body fat must be at least 3%").max(60, "Body fat must be at most 60%").optional(),
  activityLevel: z.enum(["sedentary", "lightly", "moderately", "very"], {
    required_error: "Please select an activity level",
  }),
});

const goalsSchema = z.object({
  targetWeight: z.coerce.number().min(30, "Weight must be at least 30 kg").max(300, "Weight must be at most 300 kg"),
  deficitRate: z.coerce.number().min(0.25, "Minimum deficit is 0.25%").max(1, "Maximum deficit is 1%"),
});

const deficitPlanSchema = z.object({
  weightLiftingSessions: z.coerce.number().min(0, "Cannot be negative").max(7, "Maximum is 7 sessions per week"),
  cardioSessions: z.coerce.number().min(0, "Cannot be negative").max(7, "Maximum is 7 sessions per week"),
  stepsPerDay: z.coerce.number().min(1000, "Minimum is 1,000 steps").max(20000, "Maximum is 20,000 steps"),
  proteinGrams: z.coerce.number().min(30, "Minimum protein is 30g").max(300, "Maximum protein is 300g"),
  fatGrams: z.coerce.number().min(20, "Minimum fat is 20g").max(150, "Maximum fat is 150g"),
});

const preferencesSchema = z.object({
  fitnessLevel: z.enum(["beginner", "intermediate", "advanced"]),
  dietaryPreference: z.enum(["standard", "vegan", "vegetarian", "keto", "paleo", "mediterranean"]),
  trainingAccess: z.enum(["gym", "home", "both"]),
  healthConsiderations: z.string().optional(),
});

export default function Onboarding() {
  const [location, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState(false);
  const { toast } = useToast();

  // Get user data hooks
  const { profileData, saveProfile, isSaving: isSavingProfile } = useUserProfile();
  const { goalData, saveGoal, isSaving: isSavingGoal } = useUserGoal();

  // Create a state for current weight that's only updated when needed
  const [currentWeight, setCurrentWeight] = useState(76.5);

  // State for the adjustable calorie target
  const [adjustedCalorieTarget, setAdjustedCalorieTarget] = useState(2000);

  // A flag to indicate if the slider has been manually adjusted
  const [sliderInitialized, setSliderInitialized] = useState(false);

  // Define healthy minimum calorie limits based on gender
  const getHealthyMinimumCalories = (gender: string) => {
    return gender === 'male' ? 1500 : 1200;
  };

  // Use a ref to track previous weight to avoid unnecessary updates
  const prevWeightRef = useRef(76.5);

  // Default form values
  const profileFormDefaults = {
    age: 30,
    gender: "male" as const,
    height: 175,
    weight: 76.5,
    bodyFatPercentage: undefined,
    activityLevel: "moderately" as const,
  };

  const goalsFormDefaults = {
    targetWeight: 70,
    deficitRate: 0.5,
  };

  const deficitPlanFormDefaults = {
    weightLiftingSessions: 3,
    cardioSessions: 2,
    stepsPerDay: 10000,
    proteinGrams: 176,
    fatGrams: 72,
  };

  const preferencesFormDefaults = {
    fitnessLevel: "intermediate" as const,
    dietaryPreference: "standard" as const,
    trainingAccess: "both" as const,
    healthConsiderations: "",
  };

  // Form for profile step
  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: profileFormDefaults,
    mode: "onBlur",
  });

  // Form for goals step
  const goalsForm = useForm<z.infer<typeof goalsSchema>>({
    resolver: zodResolver(goalsSchema),
    defaultValues: goalsFormDefaults,
    mode: "onBlur",
  });

  // Form for deficit plan step
  const deficitPlanForm = useForm<z.infer<typeof deficitPlanSchema>>({
    resolver: zodResolver(deficitPlanSchema),
    defaultValues: deficitPlanFormDefaults,
    mode: "onBlur",
  });

  // Form for preferences step
  const preferencesForm = useForm<z.infer<typeof preferencesSchema>>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: preferencesFormDefaults,
    mode: "onBlur",
  });

  // Update forms when API data becomes available
  useEffect(() => {
    if (profileData) {
      console.log("Loading profile data:", profileData);
      const formValues = {
        age: profileData.age || profileFormDefaults.age,
        gender: profileData.gender || profileFormDefaults.gender,
        height: profileData.height || profileFormDefaults.height,
        weight: profileData.weight || profileFormDefaults.weight,
        bodyFatPercentage: profileData.bodyFatPercentage,
        activityLevel: profileData.activityLevel || profileFormDefaults.activityLevel,
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
        healthConsiderations: profileData.healthConsiderations || preferencesFormDefaults.healthConsiderations,
      };
      preferencesForm.reset(prefValues);
    }
  }, [JSON.stringify(profileData)]);

  useEffect(() => {
    if (goalData) {
      const formValues = {
        targetWeight: goalData.targetWeight || goalsFormDefaults.targetWeight,
        deficitRate: goalData.deficitRate || goalsFormDefaults.deficitRate,
      };
      goalsForm.reset(formValues);
      if (goalData.dailyCalorieTarget) {
        setAdjustedCalorieTarget(goalData.dailyCalorieTarget);
      }
    }
  }, [JSON.stringify(goalData)]);

  // Watch changes in the weight field
  useEffect(() => {
    const subscription = profileForm.watch((value, { name }) => {
      if (name === 'weight' && value.weight && Math.abs(value.weight - prevWeightRef.current) > 0.01) {
        prevWeightRef.current = value.weight;
        setCurrentWeight(value.weight);
        console.log('Weight updated to:', value.weight);
      }
    });
    return () => subscription.unsubscribe();
  }, [profileForm]);

  // Memoize weight loss projection calculations
  const [projectionCache, setProjectionCache] = useState({
    currentWeight: 0,
    targetWeight: 0,
    deficitRate: 0,
    projection: null as any
  });

  const calculateWeightLossProjection = () => {
    const targetWeight = goalsForm.getValues().targetWeight || currentWeight * 0.9;
    const deficitRate = goalsForm.getValues().deficitRate || 0.5;
    if (
      projectionCache.projection &&
      Math.abs(projectionCache.currentWeight - currentWeight) < 0.01 &&
      Math.abs(projectionCache.targetWeight - targetWeight) < 0.01 &&
      Math.abs(projectionCache.deficitRate - deficitRate) < 0.01
    ) {
      return projectionCache.projection;
    }
    const projectedWeeklyLossRate = (deficitRate / 100) * currentWeight;
    const totalLoss = Math.max(0, currentWeight - targetWeight);
    const estWeeks = totalLoss > 0 ? Math.ceil(totalLoss / projectedWeeklyLossRate) : 12;
    const projectionData = [];
    for (let i = 0; i <= estWeeks; i++) {
      if (i === estWeeks) {
        projectionData.push({
          week: i,
          weight: targetWeight.toFixed(1)
        });
      } else {
        projectionData.push({
          week: i,
          weight: Math.max(targetWeight, currentWeight - projectedWeeklyLossRate * i).toFixed(1)
        });
      }
    }
    const newProjection = {
      targetWeight,
      deficitRate,
      weeklyLossRate: projectedWeeklyLossRate,
      totalLoss,
      estWeeks,
      projectionData
    };
    setProjectionCache({
      currentWeight,
      targetWeight,
      deficitRate,
      projection: newProjection
    });
    return newProjection;
  };

  useEffect(() => {
    if (currentStep === 2 && currentWeight > 0) {
      const projection = calculateWeightLossProjection();
      console.log(
        "Graph data:", projection.projectionData,
        "Weeks:", projection.estWeeks,
        "Weekly loss:", projection.weeklyLossRate.toFixed(2),
        "Current Weight:", currentWeight
      );
    }
  }, [currentStep, currentWeight]);

  useEffect(() => {
    const hasCompletedOnboarding = localStorage.getItem("hasCompletedOnboarding");
    if (hasCompletedOnboarding === "true") {
      setCompleted(true);
    }
  }, []);

  const nextStep = () => {
    const stepForms = [null, profileForm, goalsForm, deficitPlanForm, preferencesForm, null];
    const currentForm = stepForms[currentStep];
    if (currentForm) {
      currentForm.trigger().then((isValid) => {
        if (isValid) {
          setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
        }
      });
    } else {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleProfileSubmit = async (data: z.infer<typeof profileSchema>) => {
    try {
      const bmr = calculateBMR(data.weight, data.height, data.age, data.gender);
      await saveProfile({
        ...data,
        bmr,
      });
      nextStep();
    } catch (error) {
      toast({
        title: "Error saving profile",
        description: "There was a problem saving your profile data.",
        variant: "destructive",
      });
    }
  };

  const handleGoalsSubmit = async (data: z.infer<typeof goalsSchema>) => {
    try {
      const profile = profileForm.getValues();
      const bmr = calculateBMR(currentWeight, profile.height, profile.age, profile.gender);
      const tdee = calculateTDEE(bmr, profile.activityLevel);
      const totalWeightLoss = Math.max(0, currentWeight - data.targetWeight);
      const totalCalorieDeficit = totalWeightLoss * 7700;
      const weeklyLossRate = (data.deficitRate / 100) * currentWeight;
      const dailyDeficitCap = Math.round(weeklyLossRate * 7700 / 7);
      const timeFrame = totalWeightLoss > 0 ? Math.ceil(totalWeightLoss / weeklyLossRate) : 12;
      const totalDays = timeFrame * 7;
      const rawDailyDeficit = totalWeightLoss > 0 ? Math.round(totalCalorieDeficit / totalDays) : 0;
      const dailyDeficit = Math.min(rawDailyDeficit, dailyDeficitCap);
      const weightLiftingSessions = 3;
      const cardioSessions = 2;
      const stepsPerDay = 10000;
      const weeklyActivityCalories =
        weightLiftingSessions * 250 +
        cardioSessions * 300 +
        stepsPerDay / 10000 * 400 * 7;
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
        currentWeight: currentWeight,
        timeFrame: timeFrame,
        weightLiftingSessions: weightLiftingSessions,
        cardioSessions: cardioSessions,
        stepsPerDay: stepsPerDay,
        maintenanceCalories: tdee,
        dailyCalorieTarget,
        dailyDeficit,
        proteinGrams,
        fatGrams,
        carbGrams,
        weeklyActivityCalories,
        dailyActivityCalories,
      });
      deficitPlanForm.reset({
        weightLiftingSessions: weightLiftingSessions,
        cardioSessions: cardioSessions,
        stepsPerDay: stepsPerDay,
        proteinGrams: proteinGrams,
        fatGrams: fatGrams,
      });
      setAdjustedCalorieTarget(dailyCalorieTarget);
      nextStep();
    } catch (error) {
      toast({
        title: "Error saving goals",
        description: "There was a problem saving your goals data.",
        variant: "destructive",
      });
    }
  };

  const handleDeficitPlanSubmit = async (data: z.infer<typeof deficitPlanSchema>) => {
    try {
      const profile = profileForm.getValues();
      const goals = goalsForm.getValues();
      const bmr = calculateBMR(currentWeight, profile.height, profile.age, profile.gender);
      const tdee = calculateTDEE(bmr, profile.activityLevel);
      const weeklyActivityCalories =
        data.weightLiftingSessions * 250 +
        data.cardioSessions * 300 +
        data.stepsPerDay / 10000 * 400 * 7;
      const dailyActivityCalories = Math.round(weeklyActivityCalories / 7);
      const weeklyLossRate = (goals.deficitRate / 100) * currentWeight;
      const dailyDeficitCap = Math.round(weeklyLossRate * 7700 / 7);
      if (adjustedCalorieTarget === 2000) {
        const newTarget = Math.round(tdee - Math.max(0, dailyDeficitCap - dailyActivityCalories));
        setAdjustedCalorieTarget(newTarget);
      }
      console.log("Using calorie target:", adjustedCalorieTarget);
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
        variant: "destructive",
      });
    }
  };

  const handlePreferencesSubmit = async (data: z.infer<typeof preferencesSchema>) => {
    try {
      await saveProfile({
        ...profileData,
        fitnessLevel: data.fitnessLevel,
        dietaryPreference: data.dietaryPreference,
        trainingAccess: data.trainingAccess,
        healthConsiderations: data.healthConsiderations,
      });
      localStorage.setItem("hasCompletedOnboarding", "true");
      setCompleted(true);
      nextStep();
    } catch (error) {
      toast({
        title: "Error saving preferences",
        description: "There was a problem saving your preferences.",
        variant: "destructive",
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
    } else if (completed && currentStep === 0) {
      finishOnboarding();
    }
  }, [completed, currentStep]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!localStorage.getItem("hasCompletedOnboarding") && currentStep > 0) {
        e.preventDefault();
        return (e.returnValue = "You're in the middle of setting up your fitness plan. Are you sure you want to leave?");
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [currentStep]);

  // Update adjustedCalorieTarget for step 3 only if the slider hasn't been manually adjusted
  useEffect(() => {
    if (currentStep === 3 && !sliderInitialized) {
      const profileFormValues = profileForm.getValues();
      const baseBMR = calculateBMR(currentWeight, profileFormValues.height, profileFormValues.age, profileFormValues.gender);
      const baseTDEE = Math.round(baseBMR * 1.2);
      if (adjustedCalorieTarget !== baseTDEE) {
        setAdjustedCalorieTarget(baseTDEE);
      }
    }
  }, [currentStep, sliderInitialized, adjustedCalorieTarget, currentWeight, profileForm]);

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 200 : -200,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 200 : -200,
      opacity: 0,
    }),
  };

  const [direction, setDirection] = useState(0);

  const handleNext = () => {
    setDirection(1);
    nextStep();
  };

  const handlePrev = () => {
    setDirection(-1);
    prevStep();
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="text-center py-6">
            <div className="mb-6">
              <div className="mx-auto rounded-lg overflow-hidden max-w-sm mb-6">
                <img src="/assets/onboarding-welcome.jpeg" alt="Welcome to Fitness Transformation" className="w-full h-auto" />
              </div>
              <h2 className="text-2xl font-bold mb-2">{steps[currentStep].title}</h2>
              <p className="text-muted-foreground">{steps[currentStep].description}</p>
            </div>
            <div className="space-y-4 max-w-md mx-auto">
              <div className="rounded-lg bg-secondary/50 p-4 flex items-center space-x-4">
                <User className="w-6 h-6 text-primary" />
                <div>
                  <h3 className="font-medium">Personal Profile</h3>
                  <p className="text-sm text-muted-foreground">Your age, gender, weight and height</p>
                </div>
              </div>
              <div className="rounded-lg bg-secondary/50 p-4 flex items-center space-x-4">
                <Target className="w-6 h-6 text-primary" />
                <div>
                  <h3 className="font-medium">Fitness Goals</h3>
                  <p className="text-sm text-muted-foreground">Set your target weight and timeframe</p>
                </div>
              </div>
              <div className="rounded-lg bg-secondary/50 p-4 flex items-center space-x-4">
                <Calendar className="w-6 h-6 text-primary" />
                <div>
                  <h3 className="font-medium">Custom Plan</h3>
                  <p className="text-sm text-muted-foreground">Personalized nutrition and workout plan</p>
                </div>
              </div>
            </div>
            <Button onClick={handleNext} className="mt-8">
              Get Started <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        );
      case 1:
        return (
          <div className="py-6">
            <h2 className="text-2xl font-bold mb-2">{steps[currentStep].title}</h2>
            <p className="text-muted-foreground mb-6">{steps[currentStep].description}</p>
            <Form {...profileForm}>
              <form onSubmit={profileForm.handleSubmit(handleProfileSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={profileForm.control}
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
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={profileForm.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={profileForm.control}
                    name="height"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Height (cm)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Your height in cm"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={profileForm.control}
                    name="weight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Weight (kg)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.1"
                            placeholder="Your current weight"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={profileForm.control}
                    name="bodyFatPercentage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Body Fat % (optional)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.1"
                            placeholder="Your body fat percentage"
                            value={field.value || ''}
                            onChange={(e) => {
                              const val = e.target.value !== '' ? parseFloat(e.target.value) : undefined;
                              field.onChange(val);
                            }}
                          />
                        </FormControl>
                        <FormDescription>Leave blank if you don't know</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={profileForm.control}
                    name="activityLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Base Activity Level</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select activity level" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="sedentary">Sedentary (little or no exercise)</SelectItem>
                            <SelectItem value="lightly">Lightly active (light exercise 1-3 days/week)</SelectItem>
                            <SelectItem value="moderately">Moderately active (moderate exercise 3-5 days/week)</SelectItem>
                            <SelectItem value="very">Very active (hard exercise/physical job)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>This is your day-to-day activity level excluding workouts</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex justify-between mt-8">
                  <Button type="button" variant="outline" onClick={handlePrev}>
                    <ChevronLeft className="mr-2 h-4 w-4" /> Back
                  </Button>
                  <Button type="submit" disabled={isSavingProfile}>
                    {isSavingProfile ? "Saving..." : "Next"} <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        );
      case 2: {
        const profile = profileForm.getValues();
        const targetWeight = goalsForm.getValues().targetWeight;
        const deficitRate = goalsForm.getValues().deficitRate;
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
            <h2 className="text-2xl font-bold mb-2">{steps[currentStep].title}</h2>
            <p className="text-muted-foreground mb-6">{steps[currentStep].description}</p>
            <Form {...goalsForm}>
              <form onSubmit={goalsForm.handleSubmit(handleGoalsSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-secondary/30 p-4 rounded-lg">
                    <h3 className="text-sm font-medium mb-2">Current Weight</h3>
                    <p className="text-2xl font-bold">{currentWeight} kg</p>
                  </div>
                  <FormField
                    control={goalsForm.control}
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
                    control={goalsForm.control}
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
                  </div>
                )}
                <div className="flex justify-between mt-8">
                  <Button type="button" variant="outline" onClick={handlePrev}>
                    <ChevronLeft className="mr-2 h-4 w-4" /> Back
                  </Button>
                  <Button type="submit" disabled={isSavingGoal}>
                    {isSavingGoal ? "Saving..." : "Next"} <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        );
      }
      case 3: {
        const profileFormValues = profileForm.getValues();
        const baseBMR = calculateBMR(currentWeight, profileFormValues.height, profileFormValues.age, profileFormValues.gender);
        const baseTDEE = Math.round(baseBMR * 1.2);
        const weightLiftingCalories = deficitPlanForm.watch("weightLiftingSessions") * 250;
        const cardioSessions = deficitPlanForm.watch("cardioSessions");
        const cardioCalories = cardioSessions * 300;
        const stepsPerDay = deficitPlanForm.watch("stepsPerDay");
        const stepsCalories = Math.round(stepsPerDay / 10000 * 400 * 7);
        const weeklyActivityCalories = weightLiftingCalories + cardioCalories + stepsCalories;
        const dailyActivityCalories = Math.round(weeklyActivityCalories / 7);
        const totalTDEE = baseTDEE + dailyActivityCalories;
        const goalDeficitRate = goalData?.deficitRate || 0.5;
        const plannedWeeklyLossRate = (goalDeficitRate / 100) * currentWeight;
        const weeklyDeficit = Math.round(plannedWeeklyLossRate * 7700);
        const dailyDeficit = Math.round(weeklyDeficit / 7);
        const defaultCalorieTarget = baseTDEE;
        const deficitCalories = baseTDEE - adjustedCalorieTarget;
        const deficitPercentage = Math.round((deficitCalories / baseTDEE) * 100);
        const deficitLevel = deficitCalories > 500 ? "aggressive" : deficitCalories > 200 ? "moderate" : "mild";
        const proteinPerKgDefault = 2.2;
        const proteinPerKgMin = 1.8;
        const fatPerKgDefault = 0.9;
        const defaultProtein = Math.round(currentWeight * proteinPerKgDefault);
        const defaultFat = Math.round(currentWeight * fatPerKgDefault);
        const proteinGrams = deficitPlanForm.watch("proteinGrams") || defaultProtein;
        const fatGrams = deficitPlanForm.watch("fatGrams") || defaultFat;
        const proteinCalories = proteinGrams * 4;
        const fatCalories = fatGrams * 9;
        const carbCalories = adjustedCalorieTarget - proteinCalories - fatCalories;
        const carbGrams = Math.max(0, Math.round(carbCalories / 4));
        const proteinPercent = Math.round((proteinCalories / adjustedCalorieTarget) * 100);
        const fatPercent = Math.round((fatCalories / adjustedCalorieTarget) * 100);
        const carbPercent = Math.round((carbCalories / adjustedCalorieTarget) * 100);
        const projectedWeeklyLoss = Math.max(0, deficitCalories * 7 / 7700);
        const macroData = [
          { name: 'Protein', value: proteinCalories, color: '#10b981' },
          { name: 'Fat', value: fatCalories, color: '#f59e0b' },
          { name: 'Carbs', value: carbCalories, color: '#3b82f6' }
        ];
        return (
          <div className="py-6">
            <h2 className="text-2xl font-bold mb-2">{steps[currentStep].title}</h2>
            <p className="text-muted-foreground mb-6">{steps[currentStep].description}</p>
            <Form {...deficitPlanForm}>
              <form onSubmit={deficitPlanForm.handleSubmit(handleDeficitPlanSubmit)} className="space-y-6">
                {/* Initial Calculation Section */}
                <div className="bg-secondary/30 p-6 rounded-lg mb-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Activity className="w-5 h-5 mr-2 text-primary" />
                    Initial Calculation
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Maintenance calories represent the energy needed to maintain your current weight
                    with minimal activity. We calculate this using the Mifflin-St Jeor formula.
                  </p>
                  <div className="bg-background p-4 rounded-lg">
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">Base Maintenance:</span>
                      <span className="font-bold">{baseTDEE.toLocaleString()} calories/day</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>Basal Metabolic Rate (BMR): {baseBMR.toLocaleString()} calories/day</p>
                      <p>Activity Multiplier: 1.2 (minimal daily activities)</p>
                    </div>
                  </div>
                </div>
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
                      control={deficitPlanForm.control}
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
                      control={deficitPlanForm.control}
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
                      control={deficitPlanForm.control}
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
                                // Default to middle position if something goes wrong
                                if (range <= 0 || !adjustedCalorieTarget) return "50%";
                                // Calculate position as a percentage
                                const position = (adjustedCalorieTarget - minValue) / range;
                                const percentage = Math.max(0, Math.min(100, position * 100));
                                return `${percentage}%`;
                              } catch (error) {
                                console.error("Error calculating tooltip position:", error);
                                return "50%"; // Default to middle position if calculation fails
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
                    <div className="mb-6">
                      <div className="text-sm font-medium mb-2">Deficit Level</div>
                      <div className="w-full h-3 bg-gray-200 rounded-full relative mb-1">
                        <div className="absolute inset-0 flex overflow-hidden rounded-full">
                          <div className="h-full bg-blue-500 rounded-l-full" style={{ width: '30%' }}></div>
                          <div className="h-full bg-green-500" style={{ width: '40%' }}></div>
                          <div className="h-full bg-yellow-500 rounded-r-full" style={{ width: '30%' }}></div>
                        </div>
                        <div
                          className="absolute h-5 w-5 bg-white border-2 border-primary rounded-full shadow-md -top-1 transition-all duration-150"
                          style={{
                            left: (() => {
                              try {
                                const minValue = Math.max(1200, (baseTDEE || 2000) - 1000);
                                const maxValue = baseTDEE || 2000;
                                const range = maxValue - minValue;
                                // Default to middle position if something goes wrong
                                if (range <= 0 || !adjustedCalorieTarget) return "50%";
                                // Calculate position as a percentage
                                const position = (adjustedCalorieTarget - minValue) / range;
                                const percentage = Math.max(0, Math.min(100, position * 100));
                                return `${percentage}%`;
                              } catch (error) {
                                console.error("Error calculating marker position:", error);
                                return "50%"; // Default to middle position if calculation fails
                              }
                            })(),
                            transform: 'translateX(-50%)'
                          }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Mild (0-300 kcal)</span>
                        <span>Moderate (300-700 kcal)</span>
                        <span>Aggressive (700+ kcal)</span>
                      </div>
                    </div>
                    <div className="border-t pt-4">
                      <div className="flex items-center gap-2">
                        {deficitCalories > 0 ? (
                          <>
                            <div className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                              deficitLevel === 'mild'
                                ? 'bg-blue-100 text-blue-700'
                                : deficitLevel === 'moderate'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {deficitLevel === 'mild'
                                ? 'Mild Deficit'
                                : deficitLevel === 'moderate'
                                  ? 'Moderate Deficit'
                                  : 'Aggressive Deficit'}
                            </div>
                            <div className="text-sm">
                              <div className="font-medium">{deficitCalories.toLocaleString()} calories below maintenance</div>
                              <div className="text-muted-foreground text-xs">
                                Estimated {(deficitCalories * 7 / 7700).toFixed(1)}kg fat loss per week
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="px-3 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                              Maintenance
                            </div>
                            <div className="text-sm">
                              <div className="font-medium">No calorie deficit from diet</div>
                              <div className="text-muted-foreground text-xs">
                                Any deficit will come from increased activity
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
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
                        control={deficitPlanForm.control}
                        name="proteinGrams"
                        render={({ field }) => (
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
                                        const weight = currentWeight || 70; // Default weight if undefined
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
                        )}
                      />
                      <FormField
                        control={deficitPlanForm.control}
                        name="fatGrams"
                        render={({ field }) => (
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
                                        const weight = currentWeight || 70; // Default weight if undefined
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
                        )}
                      />
                      <div className="mt-6">
                        <div className="mb-1">
                          <span className="font-medium">Carbohydrates (remaining calories)</span>
                          <span className="float-right text-sm">{carbGrams}g ({carbPercent}%)</span>
                        </div>
                        <Progress value={carbPercent} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-1">
                          Carbs fuel your workouts and daily activities. {carbGrams}g provides {carbCalories} calories.
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col justify-center">
                      <div className="w-48 h-48 mx-auto">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={macroData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              outerRadius={70}
                              fill="#8884d8"
                              dataKey="value"
                              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                              {macroData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value) => [`${value} calories`, 'Calories']} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="grid grid-cols-3 gap-4 mt-4 text-center text-sm">
                        <div>
                          <div className="font-bold">{proteinGrams}g</div>
                          <div className="text-xs">Protein</div>
                        </div>
                        <div>
                          <div className="font-bold">{fatGrams}g</div>
                          <div className="text-xs">Fat</div>
                        </div>
                        <div>
                          <div className="font-bold">{carbGrams}g</div>
                          <div className="text-xs">Carbs</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-secondary/30 p-6 rounded-lg mb-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Activity className="w-5 h-5 mr-2 text-primary" />
                    Daily Summary
                  </h3>
                  <div className="overflow-hidden rounded-lg bg-background">
                    <div className="grid grid-cols-2 divide-x divide-border border-b">
                      <div className="p-4">
                        <h4 className="text-sm font-medium mb-3">Calories In</h4>
                        <div className="text-3xl font-bold">{adjustedCalorieTarget}</div>
                        <div className="text-xs text-muted-foreground mt-1">calories from food</div>
                      </div>
                      <div className="p-4">
                        <h4 className="text-sm font-medium mb-3">Base Maintenance</h4>
                        <div className="text-3xl font-bold">{baseTDEE}</div>
                        <div className="text-xs text-muted-foreground mt-1">calories to maintain weight</div>
                      </div>
                    </div>
                    <div className="p-4 border-b">
                      <div className="flex justify-between mb-1">
                        <h4 className="text-sm font-medium">Net Deficit</h4>
                        <span className="text-sm font-medium">{Math.max(0, deficitCalories)} calories/day</span>
                      </div>
                      <div className="w-full h-4 bg-gray-100 rounded-full relative">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{
                            width: (() => {
                              try {
                                if (deficitCalories <= 0) return "0%";
                                const calculatedWidth = Math.min(100, Math.round((deficitCalories / (baseTDEE || 2000)) * 100));
                                return `${isNaN(calculatedWidth) ? 0 : calculatedWidth}%`;
                              } catch (error) {
                                console.error("Error calculating progress width:", error);
                                return "0%";
                              }
                            })()
                          }}
                        ></div>
                      </div>
                      <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                        <span>0 calories</span>
                        <span>{baseTDEE} calories</span>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="text-sm font-medium">Estimated Weekly Change</h4>
                          <div className="text-muted-foreground text-xs">Based on 7700 calories = 1kg of fat</div>
                        </div>
                        <div className="text-lg font-bold text-primary">
                          {projectedWeeklyLoss > 0 ? `${projectedWeeklyLoss.toFixed(2)} kg` : "0.00 kg (Maintenance)"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between mt-8">
                  <Button type="button" variant="outline" onClick={handlePrev}>
                    <ChevronLeft className="mr-2 h-4 w-4" /> Back
                  </Button>
                  <Button type="submit" disabled={isSavingGoal}>
                    {isSavingGoal ? "Saving..." : "Next"} <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        );
      }
      case 4:
        return (
          <div className="py-6">
            <h2 className="text-2xl font-bold mb-2">{steps[currentStep].title}</h2>
            <p className="text-muted-foreground mb-6">{steps[currentStep].description}</p>
            <Form {...preferencesForm}>
              <form onSubmit={preferencesForm.handleSubmit(handlePreferencesSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={preferencesForm.control}
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
                    control={preferencesForm.control}
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
                    control={preferencesForm.control}
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
                    control={preferencesForm.control}
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
                  <Button type="button" variant="outline" onClick={handlePrev}>
                    <ChevronLeft className="mr-2 h-4 w-4" /> Back
                  </Button>
                  <Button type="submit" disabled={isSavingProfile}>
                    {isSavingProfile ? "Saving..." : "Next"} <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        );
      case 5:
        return (
          <div className="py-10 text-center">
            <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Activity className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-2">{steps[currentStep].title}</h2>
            <p className="text-muted-foreground mb-8">{steps[currentStep].description}</p>
            <div className="bg-secondary/50 rounded-lg p-6 max-w-md mx-auto mb-8">
              <h3 className="font-medium mb-4">Your Personalized Plan Includes:</h3>
              <ul className="space-y-2 text-left list-inside">
                <li className="flex items-start space-x-2">
                  <div className="flex-shrink-0 mt-1 text-green-500">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M8 12L11 15L16 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <span>Daily calorie and macro targets based on your goals</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="flex-shrink-0 mt-1 text-green-500">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M8 12L11 15L16 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <span>Workout recommendations for your fitness level</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="flex-shrink-0 mt-1 text-green-500">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M8 12L11 15L16 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <span>Progress tracking tools to monitor your journey</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="flex-shrink-0 mt-1 text-green-500">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M8 12L11 15L16 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <span>Customized based on your preferences and needs</span>
                </li>
              </ul>
            </div>
            <Button onClick={finishOnboarding} size="lg">
              View My Dashboard <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        );
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
                <span className="text-sm font-medium">Step {currentStep + 1} of {steps.length}</span>
                <span className="text-sm text-muted-foreground">{Math.round((currentStep / (steps.length - 1)) * 100)}% Complete</span>
              </div>
              <Progress value={(currentStep / (steps.length - 1)) * 100} className="h-2" />
            </div>
            <div className="px-6 overflow-hidden">
              <AnimatePresence custom={direction} initial={false}>
                <motion.div
                  key={currentStep}
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    x: { type: "spring", stiffness: 300, damping: 30 },
                    opacity: { duration: 0.2 }
                  }}
                >
                  {renderStepContent()}
                </motion.div>
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}