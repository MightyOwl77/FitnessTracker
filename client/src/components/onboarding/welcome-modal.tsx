
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface OnboardingStep {
  title: string;
  description: string;
  image?: string;
}

const steps: OnboardingStep[] = [
  {
    title: "Welcome to FitTransform",
    description: "We'll help you reach your fitness goals with personalized guidance and tracking."
  },
  {
    title: "Create Your Profile",
    description: "Start by entering your body measurements and preferences so we can personalize your plan."
  },
  {
    title: "Set Your Goals",
    description: "Define your target weight and timeline. We'll help you set realistic expectations."
  },
  {
    title: "Track Your Progress",
    description: "Log your meals, workouts, and daily measurements to see your transformation over time."
  }
];

interface WelcomeModalProps {
  onComplete: () => void;
  onDismiss: () => void;
}

export function WelcomeModal({ onComplete, onDismiss }: WelcomeModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  
  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };
  
  const step = steps[currentStep];
  
  return (
    <div className="fixed inset-0 bg-neutral-900/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex justify-between items-center p-4 border-b">
          <div className="font-bold text-lg text-primary-600">FitTransform</div>
          <button onClick={onDismiss} className="text-neutral-400 hover:text-neutral-500">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-6">
          <h2 className="text-xl font-bold mb-2">{step.title}</h2>
          <p className="text-neutral-600 mb-6">{step.description}</p>
          
          {step.image && (
            <div className="bg-neutral-100 rounded-lg p-4 mb-6 flex justify-center">
              <img src={step.image} alt={step.title} className="max-h-48" />
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <div className="flex space-x-1">
              {steps.map((_, index) => (
                <div 
                  key={index}
                  className={`h-2 w-2 rounded-full ${
                    index === currentStep 
                      ? "bg-primary-600" 
                      : "bg-neutral-200"
                  }`}
                />
              ))}
            </div>
            
            <div className="flex space-x-2">
              {currentStep > 0 && (
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentStep(currentStep - 1)}
                >
                  Back
                </Button>
              )}
              
              <Button onClick={handleNext}>
                {currentStep < steps.length - 1 ? "Next" : "Get Started"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
