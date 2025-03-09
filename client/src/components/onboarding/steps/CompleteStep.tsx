
import React from "react";
import { Button } from "@/components/ui/button";
import { Activity, ArrowRight } from "lucide-react";

export default function CompleteStep({ onFinish }: { onFinish: () => void }) {
  return (
    <div className="py-10 text-center">
      <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
        <Activity className="w-10 h-10 text-primary" />
      </div>
      <h2 className="text-2xl font-bold mb-2">You're All Set!</h2>
      <p className="text-muted-foreground mb-8">Your personalized plan is ready to go.</p>
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
        </ul>
      </div>
      <Button onClick={onFinish} size="lg">
        View My Dashboard <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
}
