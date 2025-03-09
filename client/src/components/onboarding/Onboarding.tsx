
import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Activity, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

// Import step components
import WelcomeStep from "./steps/WelcomeStep";
import ProfileStep from "./steps/ProfileStep";
import GoalsStep from "./steps/GoalsStep";
import DeficitPlanStep from "./steps/DeficitPlanStep";
import PreferencesStep from "./steps/PreferencesStep";
import CompleteStep from "./steps/CompleteStep";

// Import hooks and utilities
import { useUserProfile, useUserGoal } from "@/hooks/use-user-data";
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

export default function Onboarding() {
  const [location, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState(false);
  const { toast } = useToast();

  const { profileData, saveProfile } = useUserProfile();
  const { goalData, saveGoal } = useUserGoal();

  // Redirection if onboarding is already completed
  useEffect(() => {
    const hasCompleted = localStorage.getItem("hasCompletedOnboarding") === "true";
    if (hasCompleted) {
      setLocation("/dashboard");
    }
  }, []);

  // Navigation functions
  const [animDirection, setAnimDirection] = useState(0);
  
  const handleNext = () => {
    setAnimDirection(1);
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  };
  
  const handlePrev = () => {
    setAnimDirection(-1);
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const finishOnboarding = () => {
    localStorage.setItem("hasCompletedOnboarding", "true");
    setLocation("/dashboard");
  };

  // Animation settings
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const animationTransition = prefersReducedMotion
    ? { duration: 0.1 }
    : { x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } };

  const animationVariants = {
    enter: (dir) => ({ x: dir > 0 ? 200 : -200, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir < 0 ? 200 : -200, opacity: 0 })
  };

  // Render the current step
  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <WelcomeStep onNext={handleNext} />;
      case 1:
        return <ProfileStep onNext={handleNext} onPrev={handlePrev} profileData={profileData} saveProfile={saveProfile} />;
      case 2:
        return <GoalsStep onNext={handleNext} onPrev={handlePrev} profileData={profileData} goalData={goalData} saveGoal={saveGoal} />;
      case 3:
        return <DeficitPlanStep onNext={handleNext} onPrev={handlePrev} profileData={profileData} goalData={goalData} saveGoal={saveGoal} />;
      case 4:
        return <PreferencesStep onNext={handleNext} onPrev={handlePrev} profileData={profileData} saveProfile={saveProfile} />;
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
