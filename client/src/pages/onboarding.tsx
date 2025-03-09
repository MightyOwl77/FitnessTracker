import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { saveProfile, saveGoals } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import ProgressBar from "@/components/shared/progress-bar";
import { useWeightLossProjection, useCalorieTarget } from "@/hooks/use-fitness-calculators";
import { calculateBMR } from "@/lib/fitness-calculations";

// Import refactored components
import { WelcomeStep } from "@/components/onboarding-forms/WelcomeStep";
import { ProfileForm } from "@/components/onboarding-forms/ProfileForm";
import { GoalsForm } from "@/components/onboarding-forms/GoalsForm";
import { DeficitPlanForm } from "@/components/onboarding-forms/DeficitPlanForm";
import { PreferencesForm } from "@/components/onboarding-forms/PreferencesForm";
import { CompleteStep } from "@/components/onboarding-forms/CompleteStep";

const formSchema = z.object({
  // Profile fields
  age: z.number().min(16).max(100),
  gender: z.string().min(1),
  height: z.number().min(120).max(250),
  weight: z.number().min(40).max(250),
  activityLevel: z.string(),
  fitnessLevel: z.string(),
  dietaryPreference: z.string(),
  trainingAccess: z.string(),
  healthConsiderations: z.string().optional(),

  // Goals fields
  targetWeight: z.number().min(40).max(250),
  deficitRate: z.number().min(0.25).max(1),

  // Deficit plan fields
  weightLiftingSessions: z.number().min(0).max(7),
  cardioSessions: z.number().min(0).max(7),
  stepsPerDay: z.number().min(2000).max(20000),
  proteinGrams: z.number().min(50).max(300),
  fatGrams: z.number().min(30).max(150),

  // Preferences fields
  preferredMeals: z.number().min(2).max(6),
  mealTimings: z.array(z.string()),
  mealPreferences: z.array(z.string()),
  notificationPreference: z.string()
});

export default function Onboarding() {
  // UI state
  const [currentStep, setCurrentStep] = useState(0);
  const [currentWeight, setCurrentWeight] = useState(75);
  const [sliderInitialized, setSliderInitialized] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingGoal, setIsSavingGoal] = useState(false);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const containerRef = useRef<HTMLDivElement>(null);

  // Form definitions
  const profileForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema.pick({
      age: true,
      gender: true,
      height: true,
      weight: true,
      activityLevel: true,
      fitnessLevel: true,
      dietaryPreference: true,
      trainingAccess: true,
      healthConsiderations: true
    })),
    defaultValues: {
      age: 30,
      gender: "male",
      height: 175,
      weight: 75,
      activityLevel: "moderately",
      fitnessLevel: "intermediate",
      dietaryPreference: "standard",
      trainingAccess: "both",
      healthConsiderations: ""
    }
  });

  const goalsForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema.pick({
      targetWeight: true,
      deficitRate: true
    })),
    defaultValues: {
      targetWeight: 65,
      deficitRate: 0.5
    }
  });

  const deficitPlanForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema.pick({
      weightLiftingSessions: true,
      cardioSessions: true,
      stepsPerDay: true,
      proteinGrams: true,
      fatGrams: true
    })),
    defaultValues: {
      weightLiftingSessions: 3,
      cardioSessions: 2,
      stepsPerDay: 8000,
      proteinGrams: Math.round(currentWeight * 2.2),
      fatGrams: Math.round(currentWeight * 0.9)
    }
  });

  const preferencesForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema.pick({
      preferredMeals: true,
      mealTimings: true,
      mealPreferences: true,
      notificationPreference: true
    })),
    defaultValues: {
      preferredMeals: 3,
      mealTimings: ["morning", "noon", "evening"],
      mealPreferences: [],
      notificationPreference: "daily"
    }
  });

  // Step definitions
  const steps = [
    { title: "Welcome", description: "Let's get started with your fitness transformation" },
    { title: "Your Profile", description: "Please tell us about yourself" },
    { title: "Set Your Goals", description: "Define what you want to achieve" },
    { title: "Create your deficit plan", description: "Configure how you'll achieve your goals" },
    { title: "Personal Preferences", description: "Customize your experience" },
    { title: "All Set!", description: "Your plan is ready" }
  ];

  // Custom hooks for complex calculations
  // Calculate calorie targets based on profile information
  const { 
    adjustedCalorieTarget, 
    setAdjustedCalorieTarget,
    baseTDEE,
    deficitCalories,
    deficitPercentage
  } = useCalorieTarget(profileForm, 500);

  // Calculate weight loss projections based on goals
  const {
    projectionData,
    weeklyLossRate,
    estimatedWeeks,
    totalLoss,
    calculateProjection
  } = useWeightLossProjection(goalsForm, currentWeight);

  // Initialize forms with current weight
  useEffect(() => {
    const weight = profileForm.getValues().weight;
    if (weight) {
      setCurrentWeight(weight);
      goalsForm.setValue("targetWeight", Math.round(weight * 0.9));
      
      // Reset protein and fat values
      deficitPlanForm.setValue("proteinGrams", Math.round(weight * 2.2));
      deficitPlanForm.setValue("fatGrams", Math.round(weight * 0.9));
    }
  }, []);

  // Update weight-dependent values when weight changes
  useEffect(() => {
    const subscription = profileForm.watch((values) => {
      if (values.weight && values.weight !== currentWeight) {
        const newWeight = Number(values.weight);
        setCurrentWeight(newWeight);
        
        // Update target weight if it hasn't been manually set yet
        const targetWeight = goalsForm.getValues().targetWeight;
        if (!targetWeight || targetWeight === Math.round(currentWeight * 0.9)) {
          goalsForm.setValue("targetWeight", Math.round(newWeight * 0.9));
        }
        
        // Update protein and fat recommendations
        deficitPlanForm.setValue("proteinGrams", Math.round(newWeight * 2.2));
        deficitPlanForm.setValue("fatGrams", Math.round(newWeight * 0.9));
      }
    });
    
    return () => subscription.unsubscribe();
  }, [currentWeight, profileForm, goalsForm, deficitPlanForm]);

  // Scroll to top when step changes
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentStep]);

  // Handle browser navigation/refresh
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (currentStep > 0 && currentStep < steps.length - 1) {
        e.preventDefault();
        const message = "You have unsaved changes. Are you sure you want to leave?";
        e.returnValue = message;
        return message;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [currentStep, steps.length]);

  // Handle Next button
  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  // Handle Previous button
  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  // Handle completion
  const handleComplete = () => {
    navigate("/dashboard");
  };

  // Function that calls the hook's calculation method for external components
  const calculateWeightLossProjection = () => {
    return calculateProjection();
  };

  // Handle step submissions
  const handleProfileSubmit = async (data: any) => {
    setIsSavingProfile(true);
    
    try {
      // Save to API
      const response = await saveProfile(data);
      console.log("Profile saved:", response);
      
      // Go to next step
      handleNext();
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Failed to save profile",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleGoalsSubmit = async (data: any) => {
    setIsSavingGoal(true);
    
    try {
      // Calculate time frame based on target weight and deficit rate
      const totalWeightLoss = Math.max(0, currentWeight - data.targetWeight);
      // Weekly loss rate comes from the hook now
      const estWeeks = estimatedWeeks > 0 ? estimatedWeeks : 4;
      
      // Save to API
      const response = await saveGoals({
        ...data,
        currentWeight,
        timeFrame: estWeeks // Use weeks from the projection hook
      });
      console.log("Goals saved:", response);
      
      // Go to next step
      handleNext();
    } catch (error) {
      console.error("Error saving goals:", error);
      toast({
        title: "Failed to save goals",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsSavingGoal(false);
    }
  };

  const handleDeficitPlanSubmit = (data: any) => {
    console.log("Deficit plan data:", data);
    handleNext();
  };

  const handlePreferencesSubmit = (data: any) => {
    console.log("Preferences data:", data);
    handleNext();
  };

  // Render step content based on current step
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <WelcomeStep 
            onNext={handleNext}
            stepTitle={steps[currentStep].title}
            stepDescription={steps[currentStep].description}
          />
        );
      case 1:
        return (
          <ProfileForm
            form={profileForm}
            onNext={handleProfileSubmit}
            onPrev={handlePrev}
            isSaving={isSavingProfile}
            stepTitle={steps[currentStep].title}
            stepDescription={steps[currentStep].description}
          />
        );
      case 2:
        return (
          <GoalsForm
            form={goalsForm}
            onNext={handleGoalsSubmit}
            onPrev={handlePrev}
            currentWeight={currentWeight}
            isSaving={isSavingGoal}
            stepTitle={steps[currentStep].title}
            stepDescription={steps[currentStep].description}
            calculateWeightLossProjection={calculateWeightLossProjection}
          />
        );
      case 3:
        return (
          <DeficitPlanForm
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
            stepTitle={steps[currentStep].title}
            stepDescription={steps[currentStep].description}
          />
        );
      case 4:
        return (
          <PreferencesForm
            form={preferencesForm}
            onNext={handlePreferencesSubmit}
            onPrev={handlePrev}
            stepTitle={steps[currentStep].title}
            stepDescription={steps[currentStep].description}
          />
        );
      case 5:
        return (
          <CompleteStep 
            onFinish={handleComplete}
            stepTitle={steps[currentStep].title}
            stepDescription={steps[currentStep].description}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto flex max-w-screen-lg flex-1 flex-col p-4">
        <div className="mb-4 mt-4">
          <ProgressBar step={currentStep} totalSteps={steps.length} />
        </div>
        <div 
          ref={containerRef}
          className="relative flex-1 overflow-y-auto"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              <Card className="h-full">
                <CardContent className="pt-6">
                  {renderStepContent()}
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}