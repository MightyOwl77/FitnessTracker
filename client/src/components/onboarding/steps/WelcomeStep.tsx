
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Activity, User, Target, Calendar } from "lucide-react";

export default function WelcomeStep({ onNext }: { onNext: () => void }) {
  return (
    <div className="text-center py-10">
      <div className="mb-8">
        <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <Activity className="w-10 h-10 text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Welcome to Your Fitness Transformation</h2>
        <p className="text-muted-foreground">We'll create a personalized plan to help you reach your goals.</p>
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
