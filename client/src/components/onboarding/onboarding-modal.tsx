import React, { useState } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { StageProgressStepper } from '@/components/shared/progress-bar';
import { ChevronRight, ChevronLeft, Check, X } from 'lucide-react';
import { Illustration, IllustrationName } from '@/components/shared/illustration';

// Define the steps for the onboarding process
const onboardingSteps = [
  {
    title: "Welcome to BodyTransform",
    description: "Your scientific approach to body transformation. Let's get you started with a few simple steps.",
    illustrationName: "welcome" as IllustrationName
  },
  {
    title: "Enter Your Profile Data",
    description: "We'll collect your current stats to calculate your energy needs and create a personalized plan.",
    illustrationName: "bodyComposition" as IllustrationName
  },
  {
    title: "Set Your Transformation Goals",
    description: "Tell us what you want to achieve, and we'll design a safe and effective plan to get you there.",
    illustrationName: "workoutPlan" as IllustrationName
  },
  {
    title: "Track Your Daily Progress",
    description: "Log your food intake, activity, and measurements. We'll adjust your plan as needed.",
    illustrationName: "progress" as IllustrationName
  }
];

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export function OnboardingModal({ isOpen, onClose, onComplete }: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  
  const nextStep = () => {
    if (currentStep < onboardingSteps.length) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete();
    }
  };
  
  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };
  
  const currentStepData = onboardingSteps[currentStep - 1];
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">{currentStepData.title}</DialogTitle>
          <DialogDescription className="text-center">
            {currentStepData.description}
          </DialogDescription>
        </DialogHeader>
        
        {/* Onboarding content */}
        <div className="flex flex-col items-center justify-center py-6">
          {/* SVG Illustration */}
          <div className="w-64 h-64 flex items-center justify-center mb-6">
            <Illustration 
              name={currentStepData.illustrationName}
              width={240}
              height={240}
              className="w-full h-auto"
            />
          </div>
          
          {/* Progress indicator */}
          <StageProgressStepper 
            step={currentStep} 
            totalSteps={onboardingSteps.length}
            stepLabels={onboardingSteps.map(step => step.title.split(' ').slice(-1)[0])}
            className="mt-6"
          />
        </div>
        
        <DialogFooter className="flex flex-row justify-between sm:justify-between">
          {currentStep > 1 ? (
            <Button variant="outline" onClick={prevStep}>
              <ChevronLeft className="mr-1 h-4 w-4" />
              Back
            </Button>
          ) : (
            <Button variant="ghost" onClick={onClose}>
              <X className="mr-1 h-4 w-4" />
              Skip
            </Button>
          )}
          
          <Button onClick={nextStep}>
            {currentStep < onboardingSteps.length ? (
              <span className="flex items-center">
                Next
                <ChevronRight className="ml-1 h-4 w-4" />
              </span>
            ) : (
              <span className="flex items-center">
                Get Started
                <Check className="ml-1 h-4 w-4" />
              </span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default OnboardingModal;