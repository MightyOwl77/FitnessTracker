import { ArrowRight, User, Target, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WelcomeStepProps {
  onNext: () => void;
  stepTitle: string;
  stepDescription: string;
}

export function WelcomeStep({ onNext, stepTitle, stepDescription }: WelcomeStepProps) {
  return (
    <div className="text-center py-6">
      <div className="mb-6">
        <div className="mx-auto rounded-lg overflow-hidden max-w-sm mb-6">
          <img 
            src="/assets/onboarding-welcome.jpeg" 
            alt="Welcome to Fitness Transformation" 
            className="w-full h-auto"
            onError={(e) => {
              // Fallback if image doesn't load
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
        <h2 className="text-2xl font-bold mb-2">{stepTitle}</h2>
        <p className="text-muted-foreground">{stepDescription}</p>
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
      <Button onClick={onNext} className="mt-8">
        Get Started <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
}