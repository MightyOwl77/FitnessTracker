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
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { 
  Activity, 
  User, 
  Weight, 
  Target, 
  Calendar, 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight 
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
      // Update profile form
      profileForm.reset({
        age: profileData.age || profileFormDefaults.age,
        gender: profileData.gender || profileFormDefaults.gender,
        height: profileData.height || profileFormDefaults.height,
        weight: profileData.weight || profileFormDefaults.weight,
        bodyFatPercentage: profileData.bodyFatPercentage,
        activityLevel: profileData.activityLevel || profileFormDefaults.activityLevel,
      });
      
      // Update current weight state
      if (profileData.weight) {
        setCurrentWeight(profileData.weight);
      }
      
      // Update preferences form
      preferencesForm.reset({
        fitnessLevel: profileData.fitnessLevel || preferencesFormDefaults.fitnessLevel,
        dietaryPreference: profileData.dietaryPreference || preferencesFormDefaults.dietaryPreference,
        trainingAccess: profileData.trainingAccess || preferencesFormDefaults.trainingAccess,
        healthConsiderations: profileData.healthConsiderations || preferencesFormDefaults.healthConsiderations,
      });
    }
  }, [profileData]); // Re-run when profileData changes
  
  // Update goal form separately
  useEffect(() => {
    if (goalData) {
      goalsForm.reset({
        targetWeight: goalData.targetWeight || goalsFormDefaults.targetWeight,
        deficitRate: goalData.deficitRate || goalsFormDefaults.deficitRate,
      });
    }
  }, [goalData]); // Re-run when goalData changes
  
  // Create a ref to track previous weight to avoid unnecessary updates
  const prevWeightRef = useRef(currentWeight);
  
  // Watch changes in the weight field with memoized handler to prevent re-renders
  useEffect(() => {
    const subscription = profileForm.watch((value) => {
      if (value.weight && 
          value.weight !== prevWeightRef.current && 
          Math.abs(value.weight - prevWeightRef.current) > 0.01) {
        prevWeightRef.current = value.weight;
        setCurrentWeight(value.weight);
        console.log('Weight updated to:', value.weight);
      }
    });
    
    return () => subscription.unsubscribe();
  }, []);
  
  // The effect for watching weight changes is now properly isolated with an empty dependency array
  
  // Check if user has completed onboarding before
  useEffect(() => {
    const hasCompletedOnboarding = localStorage.getItem("hasCompletedOnboarding");
    if (hasCompletedOnboarding === "true") {
      setCompleted(true);
    }
  }, []);
  
  // Handle navigation between steps
  const nextStep = () => {
    const stepForms = [null, profileForm, goalsForm, preferencesForm, null];
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
      
      // Calculate daily calorie target
      const dailyCalorieTarget = Math.round(tdee - Math.max(0, dailyDeficit - dailyActivityCalories));
      
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
        const weeklyLossRate = (deficitRate / 100) * currentWeight; // kg per week based on % of body weight
        const estimatedWeeks = totalWeightLoss > 0 ? Math.ceil(totalWeightLoss / weeklyLossRate) : 0;
        
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
                        <p className="text-lg font-semibold">{weeklyLossRate.toFixed(2)} kg/week</p>
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
                      <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={Array.from({ length: estimatedWeeks + 1 }, (_, i) => ({
                              week: i,
                              weight: Math.max(targetWeight, currentWeight - weeklyLossRate * i).toFixed(1)
                            }))}
                            margin={{ top: 5, right: 5, left: 5, bottom: 20 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                            <XAxis 
                              dataKey="week" 
                              label={{ value: 'Weeks', position: 'bottom', offset: -5 }} 
                            />
                            <YAxis 
                              domain={[Math.floor(Math.min(currentWeight, targetWeight) * 0.95), Math.ceil(currentWeight * 1.02)]}
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
        
      case 3: // Preferences step
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
        
      case 4: // Complete step
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