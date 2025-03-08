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
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
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
  fatPercent: z.coerce.number().min(10, "Minimum fat is 10%").max(45, "Maximum fat is 45%"),
  // Removed carbPercent as we'll calculate it dynamically
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
  // This helps avoid infinite update loops 
  const [currentWeight, setCurrentWeight] = useState(76.5);
  
  // State for the adjustable calorie target
  const [adjustedCalorieTarget, setAdjustedCalorieTarget] = useState(2000);
  
  // Define healthy minimum calorie limits based on gender
  const getHealthyMinimumCalories = (gender: string) => {
    // These are generally accepted minimum healthy calorie intakes
    return gender === 'male' ? 1500 : 1200;
  };
  
  // Use a ref to track previous weight to avoid unnecessary updates
  const prevWeightRef = useRef(76.5);
  
  // Default forms
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
    proteinGrams: 140, // Will be calculated based on body weight
    fatPercent: 25,
    // Remove carbPercent from the form as we'll calculate it dynamically
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
  
  // Only update the forms with data from API when it's available
  useEffect(() => {
    // Only run this effect when profileData actually has a value
    if (profileData) {
      console.log("Loading profile data:", profileData);
      
      // Create a stable reference to the form values to avoid excessive rerenders
      const formValues = {
        age: profileData.age || profileFormDefaults.age,
        gender: profileData.gender || profileFormDefaults.gender,
        height: profileData.height || profileFormDefaults.height,
        weight: profileData.weight || profileFormDefaults.weight,
        bodyFatPercentage: profileData.bodyFatPercentage,
        activityLevel: profileData.activityLevel || profileFormDefaults.activityLevel,
      };
      
      // Update profile form
      profileForm.reset(formValues);
      
      // Update current weight state only if it has changed significantly
      if (profileData.weight && Math.abs(profileData.weight - prevWeightRef.current) > 0.01) {
        prevWeightRef.current = profileData.weight;
        setCurrentWeight(profileData.weight);
      }
      
      // Update preferences form with a stable reference
      const prefValues = {
        fitnessLevel: profileData.fitnessLevel || preferencesFormDefaults.fitnessLevel,
        dietaryPreference: profileData.dietaryPreference || preferencesFormDefaults.dietaryPreference,
        trainingAccess: profileData.trainingAccess || preferencesFormDefaults.trainingAccess,
        healthConsiderations: profileData.healthConsiderations || preferencesFormDefaults.healthConsiderations,
      };
      
      preferencesForm.reset(prefValues);
    }
  // Use a stable JSON representation to determine if profileData has meaningfully changed
  }, [JSON.stringify(profileData)]);
  
  // Update goal form separately
  useEffect(() => {
    if (goalData) {
      // Create a stable reference to the form values to avoid rerenders
      const formValues = {
        targetWeight: goalData.targetWeight || goalsFormDefaults.targetWeight,
        deficitRate: goalData.deficitRate || goalsFormDefaults.deficitRate,
      };
      
      goalsForm.reset(formValues);
      
      // Initialize adjusted calorie target from saved goal data
      if (goalData.dailyCalorieTarget) {
        setAdjustedCalorieTarget(goalData.dailyCalorieTarget);
      }
    }
  // Use JSON.stringify for stable dependency 
  }, [JSON.stringify(goalData)]);
  
  // Watch changes in the weight field with memoized handler to prevent re-renders
  useEffect(() => {
    // This needs profileForm as a dependency - we need to watch its changes
    const subscription = profileForm.watch((value, { name }) => {
      // Only respond to weight changes to avoid unnecessary updates
      if (name === 'weight' && value.weight && 
          Math.abs(value.weight - prevWeightRef.current) > 0.01) {
        prevWeightRef.current = value.weight;
        setCurrentWeight(value.weight);
        console.log('Weight updated to:', value.weight);
      }
    });
    
    return () => subscription.unsubscribe();
  }, [profileForm]);
  
  // State to hold our memoized calculations to avoid recalculating on every render
  const [projectionCache, setProjectionCache] = useState({
    currentWeight: 0,
    targetWeight: 0,
    deficitRate: 0,
    projection: null as any
  });
  
  // Add a function to safely calculate weight loss projection with memoization
  // This avoids multiple calculations in the JSX and keeps things DRY
  const calculateWeightLossProjection = () => {
    const targetWeight = goalsForm.getValues().targetWeight || currentWeight * 0.9; // Default to 10% loss if no target
    const deficitRate = goalsForm.getValues().deficitRate || 0.5; // Default to 0.5% if not set
    
    // Check if we've already calculated this projection - use cache if values haven't changed
    if (
      projectionCache.projection && 
      Math.abs(projectionCache.currentWeight - currentWeight) < 0.01 &&
      Math.abs(projectionCache.targetWeight - targetWeight) < 0.01 &&
      Math.abs(projectionCache.deficitRate - deficitRate) < 0.01
    ) {
      return projectionCache.projection;
    }
    
    // Calculate new projection
    const projectedWeeklyLossRate = (deficitRate / 100) * currentWeight;
    const totalLoss = Math.max(0, currentWeight - targetWeight);
    const estWeeks = totalLoss > 0 ? Math.ceil(totalLoss / projectedWeeklyLossRate) : 12;
    
    // Generate weight data for each week
    const projectionData = [];
    
    // For each week including the final week
    for (let i = 0; i <= estWeeks; i++) {
      if (i === estWeeks) {
        // The final week should be exactly the target weight
        projectionData.push({
          week: i,
          weight: targetWeight.toFixed(1)
        });
      } else {
        // Regular weekly progression
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
    
    // Update cache
    setProjectionCache({
      currentWeight,
      targetWeight,
      deficitRate,
      projection: newProjection
    });
    
    return newProjection;
  };
  
  // Debug logging for graph data
  useEffect(() => {
    // Only log during step 2 (goals) and when goal fields exist
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
  
  // Check if user has completed onboarding before
  useEffect(() => {
    const hasCompletedOnboarding = localStorage.getItem("hasCompletedOnboarding");
    if (hasCompletedOnboarding === "true") {
      setCompleted(true);
    }
  }, []);
  
  // Handle navigation between steps
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
  
  // Handle form submissions for each step
  const handleProfileSubmit = async (data: z.infer<typeof profileSchema>) => {
    try {
      // Calculate BMR using the Mifflin-St Jeor formula
      const bmr = calculateBMR(data.weight, data.height, data.age, data.gender);
      
      // Save profile data
      await saveProfile({
        ...data,
        bmr,
      });
      
      // Move to next step
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
      // Get profile data for calculations
      const profile = profileForm.getValues();
      
      // Calculate BMR and TDEE using the current weight from state
      const bmr = calculateBMR(currentWeight, profile.height, profile.age, profile.gender);
      const tdee = calculateTDEE(bmr, profile.activityLevel);
      
      // Calculate weight loss and deficit
      const totalWeightLoss = Math.max(0, currentWeight - data.targetWeight);
      const totalCalorieDeficit = totalWeightLoss * 7700; // 7700 calories = 1 kg of fat
      
      // Calculate weekly weight loss rate from deficit rate (% of body weight)
      const weeklyLossRate = (data.deficitRate / 100) * currentWeight; // kg per week as % of body weight
      
      // Set reasonable deficit cap based on weekly loss rate (in calories)
      const dailyDeficitCap = Math.round(weeklyLossRate * 7700 / 7); // Convert weekly deficit to daily
      const timeFrame = totalWeightLoss > 0 ? Math.ceil(totalWeightLoss / weeklyLossRate) : 12;
      
      // Calculate effective days for weight loss
      const totalDays = timeFrame * 7;
      
      // Calculate daily deficit
      const rawDailyDeficit = totalWeightLoss > 0 ? Math.round(totalCalorieDeficit / totalDays) : 0;
      const dailyDeficit = Math.min(rawDailyDeficit, dailyDeficitCap);
      
      // Set recommended activity levels
      const weightLiftingSessions = 3;
      const cardioSessions = 2;
      const stepsPerDay = 10000;
      
      // Calculate activity calories
      const weeklyActivityCalories = 
        weightLiftingSessions * 250 + 
        cardioSessions * 300 +
        stepsPerDay / 10000 * 400 * 7;
      
      const dailyActivityCalories = Math.round(weeklyActivityCalories / 7);
      
      // Calculate daily calorie target - we'll use maintenance calories as the starting point
      // User can adjust this later in the deficit planning step
      const dailyCalorieTarget = tdee; // Maintenance calories
      
      // Calculate macros (protein based on body weight)
      const proteinGrams = Math.round(1.8 * profile.weight);
      const proteinCalories = proteinGrams * 4;
      const remainingCalories = dailyCalorieTarget - proteinCalories;
      
      // 25% of calories from fat, rest from carbs
      const fatCalories = Math.round(dailyCalorieTarget * 0.25);
      const carbCalories = remainingCalories - fatCalories;
      
      const fatGrams = Math.round(fatCalories / 9);
      const carbGrams = Math.round(carbCalories / 4);
      
      // Save goal data
      await saveGoal({
        targetWeight: data.targetWeight,
        deficitRate: data.deficitRate,
        currentWeight: currentWeight, // Use the current weight from state
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
      
      // Initialize deficit plan form with the calculated values
      deficitPlanForm.reset({
        weightLiftingSessions: weightLiftingSessions,
        cardioSessions: cardioSessions,
        stepsPerDay: stepsPerDay,
        proteinGrams: proteinGrams,
        fatPercent: 25, // 25% of calories from fat
      });
      
      // Set the calorie target when moving to deficit planning
      setAdjustedCalorieTarget(dailyCalorieTarget);
      
      // Move to next step
      nextStep();
    } catch (error) {
      toast({
        title: "Error saving goals",
        description: "There was a problem saving your goals data.",
        variant: "destructive",
      });
    }
  };
  
  // Handle deficit plan submission
  const handleDeficitPlanSubmit = async (data: z.infer<typeof deficitPlanSchema>) => {
    try {
      // Get profile and goal data for calculations
      const profile = profileForm.getValues();
      const goals = goalsForm.getValues();
      
      // Calculate BMR and TDEE using the current weight
      const bmr = calculateBMR(currentWeight, profile.height, profile.age, profile.gender);
      const tdee = calculateTDEE(bmr, profile.activityLevel);
      
      // Calculate activity calories based on user's plan
      const weeklyActivityCalories = 
        data.weightLiftingSessions * 250 + 
        data.cardioSessions * 300 +
        data.stepsPerDay / 10000 * 400 * 7;
      
      const dailyActivityCalories = Math.round(weeklyActivityCalories / 7);
      
      // Calculate deficit based on deficit rate from goals
      const weeklyLossRate = (goals.deficitRate / 100) * currentWeight;
      const dailyDeficitCap = Math.round(weeklyLossRate * 7700 / 7);
      
      // Find the calorie target element to get the adjusted value
      // This is a better approach than relying on state which might be lost during re-renders
      const calorieTargetElement = document.querySelector('[data-adjusted-calorie-target="true"]');
      let adjustedCalorieTarget = Math.round(tdee - Math.max(0, dailyDeficitCap - dailyActivityCalories));
      
      // If we have a value from the UI, use that instead
      if (calorieTargetElement && calorieTargetElement.getAttribute('data-value')) {
        const valueFromUI = parseInt(calorieTargetElement.getAttribute('data-value') || '0', 10);
        if (valueFromUI > 0) {
          adjustedCalorieTarget = valueFromUI;
        }
      }
      
      // Calculate macros based on user input and the adjusted calorie target
      const proteinCalories = data.proteinGrams * 4;
      const fatCalories = Math.round(adjustedCalorieTarget * (data.fatPercent / 100));
      const carbCalories = adjustedCalorieTarget - proteinCalories - fatCalories;
      
      const fatGrams = Math.round(fatCalories / 9);
      const carbGrams = Math.round(carbCalories / 4);
      
      // Calculate actual daily deficit 
      const actualDailyDeficit = tdee - adjustedCalorieTarget + dailyActivityCalories;
      const weeklyDeficit = actualDailyDeficit * 7;
      const projectedWeeklyLoss = weeklyDeficit / 7700; // 7700 calories = 1kg
      
      // Update goal data with the user's deficit plan
      await saveGoal({
        ...goalData,
        weightLiftingSessions: data.weightLiftingSessions,
        cardioSessions: data.cardioSessions,
        stepsPerDay: data.stepsPerDay,
        dailyCalorieTarget: adjustedCalorieTarget, // Use the adjusted value
        proteinGrams: data.proteinGrams,
        fatGrams,
        carbGrams,
        weeklyActivityCalories,
        dailyActivityCalories,
        dailyDeficit: actualDailyDeficit, // Save the actual deficit with the correct property name
        // Store the projected weight loss rate in deficitRate field
        deficitRate: projectedWeeklyLoss * 100 / currentWeight // Convert back to % of body weight
      });
      
      // Move to next step
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
      // Update profile with preferences
      await saveProfile({
        ...profileData,
        fitnessLevel: data.fitnessLevel,
        dietaryPreference: data.dietaryPreference,
        trainingAccess: data.trainingAccess,
        healthConsiderations: data.healthConsiderations,
      });
      
      // Mark onboarding as completed
      localStorage.setItem("hasCompletedOnboarding", "true");
      setCompleted(true);
      
      // Move to final step
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
    // Navigate to dashboard
    setLocation("/dashboard");
  };
  
  // Skip onboarding if already completed
  useEffect(() => {
    if (completed && currentStep === 0) {
      finishOnboarding();
    }
  }, [completed, currentStep]);
  
  // Animation variants
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
  
  // Direction for animations
  const [direction, setDirection] = useState(0);
  
  // Handle direction changes for animations
  const handleNext = () => {
    setDirection(1);
    nextStep();
  };
  
  const handlePrev = () => {
    setDirection(-1);
    prevStep();
  };
  
  // Render step content based on current step
  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Welcome step
        return (
          <div className="text-center py-10">
            <div className="mb-8">
              <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Activity className="w-10 h-10 text-primary" />
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
        
      case 1: // Profile step
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
                        <Select 
                          value={field.value} 
                          onValueChange={field.onChange}
                        >
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
                        <FormDescription>
                          Leave blank if you don't know
                        </FormDescription>
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
                        <Select 
                          value={field.value}
                          onValueChange={field.onChange}
                        >
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
                        <FormDescription>
                          This is your day-to-day activity level excluding workouts
                        </FormDescription>
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
        
      case 2: // Goals step
        // Get current user profile and goals
        const profile = profileForm.getValues();
        const targetWeight = goalsForm.getValues().targetWeight;
        const deficitRate = goalsForm.getValues().deficitRate;
        
        // Use the current weight from state for consistency
        
        // Calculate weight loss and estimated time (directly, without using state)
        const totalWeightLoss = Math.max(0, currentWeight - targetWeight);
        // Weekly loss rate is a percentage of current body weight
        const goalWeeklyLossRate = (deficitRate / 100) * currentWeight; // kg per week based on % of body weight
        const estimatedWeeks = totalWeightLoss > 0 ? Math.ceil(totalWeightLoss / goalWeeklyLossRate) : 0;
        
        // Calculate target date
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
                        <FormDescription>
                          What weight do you want to achieve?
                        </FormDescription>
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
                        <FormDescription>
                          Lower values (0.25-0.5%) are better for preserving muscle mass
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
                    
                    {/* Weight Loss Projection Graph */}
                    <div className="mt-6">
                      <h4 className="text-md font-medium mb-2">Weight Loss Projection</h4>
                      {/* Debug information using our calculation helper function */}
                      {(() => {
                        // Use IIFE to create a clean scope for calculations
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
                      
                      {/* Graph using our calculation helper function */}
                      <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={calculateWeightLossProjection().projectionData}
                            margin={{ top: 5, right: 5, left: 5, bottom: 20 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                            <XAxis 
                              dataKey="week" 
                              label={{ value: 'Weeks', position: 'bottom', offset: -5 }} 
                            />
                            <YAxis 
                              domain={[
                                Math.floor(Math.min(currentWeight, calculateWeightLossProjection().targetWeight) * 0.95), 
                                Math.ceil(currentWeight * 1.02)
                              ]}
                              label={{ value: 'Weight (kg)', angle: -90, position: 'insideLeft' }} 
                            />
                            <Tooltip 
                              formatter={(value) => [`${value} kg`, 'Weight']}
                              labelFormatter={(value) => `Week ${value}`}
                            />
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
        
      case 3: // Deficit Plan step
        // Calculate all the activity and nutrition data in real-time
        const weightLiftingCalories = deficitPlanForm.watch("weightLiftingSessions") * 250;
        const cardioCalories = deficitPlanForm.watch("cardioSessions") * 300;
        const stepsCalories = Math.round(deficitPlanForm.watch("stepsPerDay") / 10000 * 400 * 7);
        
        // Calculate total weekly calories burned from activity
        const weeklyActivityCalories = weightLiftingCalories + cardioCalories + stepsCalories;
        const dailyActivityCalories = Math.round(weeklyActivityCalories / 7);
        
        // Get goal and profile data for calculations
        const goalDeficitRate = goalData?.deficitRate || 0.5;
        const plannedWeeklyLossRate = (goalDeficitRate / 100) * currentWeight;
        const weeklyDeficit = Math.round(plannedWeeklyLossRate * 7700); // 7700 calories = 1kg of fat
        const dailyDeficit = Math.round(weeklyDeficit / 7);
        
        // Calculate nutrition targets
        const bmr = goalData?.maintenanceCalories || 2000;
        const proteinCalories = deficitPlanForm.watch("proteinGrams") * 4;
        const dailyCalorieTarget = Math.round(bmr - (dailyDeficit - dailyActivityCalories));
        
        // Calculate how much of deficit is being created by activity vs diet
        const activityPercent = Math.min(100, Math.round((dailyActivityCalories / dailyDeficit) * 100));
        const dietPercent = 100 - activityPercent;
        
        return (
          <div className="py-6">
            <h2 className="text-2xl font-bold mb-2">{steps[currentStep].title}</h2>
            <p className="text-muted-foreground mb-6">{steps[currentStep].description}</p>
            
            {/* Summary card */}
            <div className="bg-primary/10 p-4 rounded-lg mb-6">
              <h3 className="text-base font-medium mb-2">Your Deficit Plan Summary</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-muted-foreground">Weekly Activity Calories:</p>
                  <p className="font-semibold">{weeklyActivityCalories.toLocaleString()} cal</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Weekly Deficit Goal:</p>
                  <p className="font-semibold">{weeklyDeficit.toLocaleString()} cal</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Daily Calorie Target:</p>
                  <p className="font-semibold">{dailyCalorieTarget.toLocaleString()} cal</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Expected Weekly Loss:</p>
                  <p className="font-semibold">{plannedWeeklyLossRate.toFixed(1)} kg</p>
                </div>
              </div>
              
              {/* Deficit source breakdown */}
              <div className="mt-3">
                <div className="flex justify-between mb-1">
                  <span className="text-xs">Deficit Source</span>
                  <span className="text-xs">{dailyDeficit.toLocaleString()} cal/day</span>
                </div>
                <div className="w-full bg-secondary/50 rounded-full h-2.5">
                  <div className="bg-primary h-2.5 rounded-full" style={{ width: `${activityPercent}%` }}></div>
                </div>
                <div className="flex justify-between mt-1 text-xs">
                  <span>Activity: {activityPercent}% ({dailyActivityCalories} cal)</span>
                  <span>Diet: {dietPercent}% ({Math.round(dailyDeficit - dailyActivityCalories)} cal)</span>
                </div>
              </div>
            </div>
            
            <Form {...deficitPlanForm}>
              <form onSubmit={deficitPlanForm.handleSubmit(handleDeficitPlanSubmit)} className="space-y-6">
                <div className="bg-secondary/30 p-6 rounded-lg mb-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Dumbbell className="w-5 h-5 mr-2 text-primary" />
                    Activity Plan
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
                          <FormLabel>Weight Training Sessions/Week</FormLabel>
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
                          <FormLabel>Daily Step Target</FormLabel>
                          <FormControl>
                            <Slider
                              min={2000}
                              max={15000}
                              step={1000}
                              defaultValue={[field.value]}
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
                            10,000 steps burns ~400 calories per day
                            (Total: {Math.round(field.value / 10000 * 400 * 7)} cal/week)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Activity summary */}
                    <div className="md:col-span-2 mt-2 bg-primary/5 p-3 rounded-lg">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Total Weekly Activity Calories:</span>
                        <span className="text-sm font-bold">{weeklyActivityCalories.toLocaleString()} calories</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Daily Average:</span>
                        <span className="text-sm font-medium">{dailyActivityCalories.toLocaleString()} calories/day</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-secondary/30 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Utensils className="w-5 h-5 mr-2 text-primary" />
                    Nutrition Plan
                  </h3>
                  
                  <p className="text-sm text-muted-foreground mb-4">
                    A proper macro split helps maintain muscle while losing fat. 
                    High protein intake is essential for preserving muscle mass during weight loss.
                  </p>
                  
                  <div className="space-y-6">
                    {/* Calculate deficit and TDEE values */}
                    {(() => {
                      // Used fixed values for calculation
                      const bmr = calculateBMR(currentWeight, profileForm.getValues().height, profileForm.getValues().age, profileForm.getValues().gender);
                      const tdee = calculateTDEE(bmr, profileForm.getValues().activityLevel);
                      
                      // Calculate the target deficit based on the weekly loss rate
                      const weeklyLossRate = (goalsForm.getValues().deficitRate / 100) * currentWeight; // kg per week
                      const dailyDeficitCap = Math.round(weeklyLossRate * 7700 / 7); // Convert weekly to daily calories
                      
                      // Calculate activity calories based on the form values
                      const formValues = deficitPlanForm.getValues();
                      const weightLiftingSessions = formValues.weightLiftingSessions || 3;
                      const cardioSessions = formValues.cardioSessions || 2;
                      const stepsPerDay = formValues.stepsPerDay || 10000;
                      
                      // Calculate activity calories
                      const weeklyActivityCalories = 
                        weightLiftingSessions * 250 + 
                        cardioSessions * 300 +
                        stepsPerDay / 10000 * 400 * 7;
                      
                      const dailyActivityCalories = Math.round(weeklyActivityCalories / 7);
                      
                      // We've already initialized adjustedCalorieTarget in an effect
                      // based on the goalData, so we don't need to do it here
                      
                      // Calculate macros based on the adjusted calorie target
                      const proteinGrams = formValues.proteinGrams || 140;
                      const fatPercent = formValues.fatPercent || 25;
                      
                      // Calculate calories
                      const proteinCalories = proteinGrams * 4;
                      const fatCalories = Math.round(adjustedCalorieTarget * fatPercent / 100);
                      const carbCalories = Math.round(adjustedCalorieTarget - proteinCalories - fatCalories);
                      
                      // Calculate approximate grams
                      const fatGrams = Math.round(fatCalories / 9);
                      const carbGrams = Math.round(carbCalories / 4);
                      
                      // Calculate percentages for pie chart
                      const proteinPercent = Math.round(proteinCalories / adjustedCalorieTarget * 100);
                      const carbPercent = Math.round(carbCalories / adjustedCalorieTarget * 100);
                      
                      // Calculate actual daily deficit
                      const actualDailyDeficit = tdee - adjustedCalorieTarget + dailyActivityCalories;
                      const weeklyDeficit = actualDailyDeficit * 7;
                      const projectedWeeklyLoss = weeklyDeficit / 7700; // 7700 calories = 1kg
                      
                      // Create pie chart data for macros
                      const macroData = [
                        { name: 'Protein', value: proteinCalories, color: '#10b981' },
                        { name: 'Fat', value: fatCalories, color: '#f59e0b' },
                        { name: 'Carbs', value: carbCalories, color: '#3b82f6' }
                      ];
                      
                      // Create deficit breakdown data
                      const deficitData = [
                        { name: 'Diet Deficit', value: tdee - adjustedCalorieTarget, color: '#ef4444' },
                        { name: 'Activity Bonus', value: dailyActivityCalories, color: '#3b82f6' }
                      ];
                      
                      return (
                        <>
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
                                  <Slider
                                    min={Math.round(currentWeight * 1.2)}
                                    max={Math.round(currentWeight * 2.5)}
                                    step={5}
                                    defaultValue={[field.value]}
                                    onValueChange={(value) => field.onChange(value[0])}
                                    className="py-4"
                                  />
                                </FormControl>
                                <div className="flex justify-between text-xs text-muted-foreground">
                                  <span>Minimum: {Math.round(currentWeight * 1.2)}g</span>
                                  <span>Recommend: {Math.round(currentWeight * 1.8)}g</span>
                                  <span>Max: {Math.round(currentWeight * 2.5)}g</span>
                                </div>
                                <FormDescription>
                                  {field.value}g provides {field.value * 4} calories from protein
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={deficitPlanForm.control}
                            name="fatPercent"
                            render={({ field }) => (
                              <FormItem>
                                <div className="flex justify-between mb-1">
                                  <FormLabel>Fat (% of calories)</FormLabel>
                                  <span className="text-sm font-medium">{field.value}% ({fatGrams}g)</span>
                                </div>
                                <FormControl>
                                  <Slider
                                    min={15}
                                    max={40}
                                    step={5}
                                    defaultValue={[field.value]}
                                    onValueChange={(value) => field.onChange(value[0])}
                                    className="py-4"
                                  />
                                </FormControl>
                                <div className="flex justify-between text-xs text-muted-foreground">
                                  <span>Low: 15%</span>
                                  <span>Balanced: 25%</span>
                                  <span>High: 40%</span>
                                </div>
                                <FormDescription>
                                  {field.value}% provides {fatCalories} calories ({fatGrams}g) from fat
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          {/* Show carbs calculation as a display-only field */}
                          <div className="space-y-2">
                            <div className="flex justify-between mb-1">
                              <div className="font-medium text-sm">Carbs (remaining calories)</div>
                              <span className="text-sm font-medium">{Math.round(carbPercent)}% ({carbGrams}g)</span>
                            </div>
                            <Progress value={carbPercent} className="h-2" />
                            <div className="text-sm text-muted-foreground mt-2">
                              Carbs are calculated automatically based on your protein and fat selections. 
                              This provides {carbCalories} calories ({carbGrams}g) from carbs.
                            </div>
                          </div>
                          
                          {/* Macro distribution pie chart */}
                          <div className="flex flex-col md:flex-row items-center justify-center mt-6 gap-4">
                            <div className="w-48 h-48">
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
                                  <Tooltip
                                    formatter={(value) => [`${value} calories`, 'Calories']}
                                  />
                                </PieChart>
                              </ResponsiveContainer>
                            </div>
                            
                            <div className="space-y-2">
                              <h4 className="font-medium text-lg">Macro Summary</h4>
                              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                                <div className="flex items-center">
                                  <div className="w-3 h-3 rounded-full bg-[#10b981] mr-2"></div>
                                  <span>Protein: {proteinGrams}g</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">{proteinCalories} cal</span>
                                </div>
                                <div className="flex items-center">
                                  <div className="w-3 h-3 rounded-full bg-[#f59e0b] mr-2"></div>
                                  <span>Fat: {fatGrams}g</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">{fatCalories} cal</span>
                                </div>
                                <div className="flex items-center">
                                  <div className="w-3 h-3 rounded-full bg-[#3b82f6] mr-2"></div>
                                  <span>Carbs: {carbGrams}g</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">{carbCalories} cal</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Simple Energy Balance Display */}
                          <div className="mt-6 bg-secondary/30 p-4 rounded-lg">
                            <h4 className="font-medium mb-3">Nutrition Plan</h4>
                            
                            <div className="flex justify-between mb-1 items-center">
                              <span className="font-medium">Daily Calorie Target:</span>
                              <span className="text-lg font-bold" data-adjusted-calorie-target="true" data-value={adjustedCalorieTarget}>{adjustedCalorieTarget.toLocaleString()} cal</span>
                            </div>
                            
                            <div className="flex justify-between mb-4 text-sm text-muted-foreground">
                              <span>Maintenance level:</span>
                              <span>{tdee.toLocaleString()} cal</span>
                            </div>
                            
                            {/* Calorie adjustment slider - max is maintenance calories (TDEE) */}
                            <Slider
                              min={Math.max(getHealthyMinimumCalories(profileForm.getValues().gender), tdee - dailyDeficitCap - 200)}
                              max={tdee} 
                              step={50}
                              defaultValue={[adjustedCalorieTarget]}
                              onValueChange={(value) => setAdjustedCalorieTarget(value[0])}
                              className="py-4"
                            />
                            
                            <div className="grid grid-cols-3 gap-2 mb-4">
                              <Button 
                                size="sm" 
                                variant={adjustedCalorieTarget === Math.max(getHealthyMinimumCalories(profileForm.getValues().gender), Math.round(tdee * 0.7)) ? "default" : "outline"}
                                onClick={() => setAdjustedCalorieTarget(
                                  Math.max(getHealthyMinimumCalories(profileForm.getValues().gender), Math.round(tdee * 0.7))
                                )}
                                className="text-xs h-8"
                              >
                                Aggressive Loss
                              </Button>
                              <Button 
                                size="sm" 
                                variant={adjustedCalorieTarget === Math.max(getHealthyMinimumCalories(profileForm.getValues().gender), Math.round(tdee * 0.85)) ? "default" : "outline"}
                                onClick={() => setAdjustedCalorieTarget(
                                  Math.max(getHealthyMinimumCalories(profileForm.getValues().gender), Math.round(tdee * 0.85))
                                )}
                                className="text-xs h-8"
                              >
                                Moderate Loss
                              </Button>
                              <Button 
                                size="sm" 
                                variant={adjustedCalorieTarget === tdee ? "default" : "outline"}
                                onClick={() => setAdjustedCalorieTarget(tdee)}
                                className="text-xs h-8"
                                data-default="true"
                              >
                                Maintenance
                              </Button>
                            </div>
                            
                            {/* Results Summary */}
                            <div className="bg-background p-3 rounded-lg mb-3">
                              <div className="flex justify-between items-center mb-2">
                                <span className="font-medium">Expected Results:</span>
                                <span className="font-bold">{projectedWeeklyLoss.toFixed(2)} kg/week</span>
                              </div>
                              
                              <div className="text-sm text-muted-foreground">
                                Daily deficit: {actualDailyDeficit.toLocaleString()} calories
                              </div>
                              
                              {projectedWeeklyLoss > weeklyLossRate * 1.2 && (
                                <div className="text-xs text-amber-500 mt-1">
                                  Warning: This rate of weight loss may be too aggressive for sustainable results.
                                </div>
                              )}
                              {projectedWeeklyLoss < weeklyLossRate * 0.8 && (
                                <div className="text-xs text-amber-500 mt-1">
                                  Note: This calorie target will result in slower progress than your goal rate.
                                </div>
                              )}
                              {actualDailyDeficit < 0 && (
                                <div className="text-xs text-red-500 mt-1">
                                  Warning: You are in a calorie surplus. This will lead to weight gain, not loss.
                                </div>
                              )}
                            </div>
                            
                            <div className="text-xs text-muted-foreground">
                              <p>Healthy minimum: {getHealthyMinimumCalories(profileForm.getValues().gender)} calories/day</p>
                            </div>
                          </div>
                          
                          {/* Macro distribution pie chart - keep this section */}
                          <div className="flex flex-col md:flex-row items-center justify-center mt-6 gap-4">
                            <div className="w-48 h-48">
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
                                  <Tooltip
                                    formatter={(value) => [`${value} calories`, 'Calories']}
                                  />
                                </PieChart>
                              </ResponsiveContainer>
                            </div>
                            
                            <div className="space-y-2">
                              <h4 className="font-medium text-lg">Macro Summary</h4>
                              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                                <div className="flex items-center">
                                  <div className="w-3 h-3 rounded-full bg-[#10b981] mr-2"></div>
                                  <span>Protein: {proteinGrams}g</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">{proteinCalories} cal</span>
                                </div>
                                <div className="flex items-center">
                                  <div className="w-3 h-3 rounded-full bg-[#f59e0b] mr-2"></div>
                                  <span>Fat: {fatGrams}g</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">{fatCalories} cal</span>
                                </div>
                                <div className="flex items-center">
                                  <div className="w-3 h-3 rounded-full bg-[#3b82f6] mr-2"></div>
                                  <span>Carbs: {carbGrams}g</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">{carbCalories} cal</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </>
                      );
                    })()}
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
      
      case 4: // Preferences step
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
                        <Select 
                          value={field.value}
                          onValueChange={field.onChange}
                        >
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
                        <Select 
                          value={field.value}
                          onValueChange={field.onChange}
                        >
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
                        <Select 
                          value={field.value}
                          onValueChange={field.onChange}
                        >
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
                          <Input 
                            type="text" 
                            placeholder="Any injuries or conditions"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Information that may affect your workout plan
                        </FormDescription>
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
        
      case 5: // Complete step
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
            {/* Progress indicator */}
            <div className="bg-muted px-6 py-4">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Step {currentStep + 1} of {steps.length}</span>
                <span className="text-sm text-muted-foreground">{Math.round((currentStep / (steps.length - 1)) * 100)}% Complete</span>
              </div>
              <Progress value={(currentStep / (steps.length - 1)) * 100} className="h-2" />
            </div>
            
            {/* Step content with animations */}
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