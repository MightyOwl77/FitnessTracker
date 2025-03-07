import React from 'react';
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { brandColors } from "@/lib/brand";

interface ProgressBarProps {
  step: number;
  totalSteps: number;
  showStepIndicators?: boolean;
  className?: string;
  stepLabels?: string[];
  animateTransition?: boolean;
}

export default function ProgressBar({ 
  step, 
  totalSteps, 
  showStepIndicators = false, 
  className = "",
  stepLabels = [],
  animateTransition = true 
}: ProgressBarProps) {
  const percentage = Math.round((step / totalSteps) * 100);

  return (
    <div className={cn("mb-8", className)}>
      <div className="flex justify-between text-sm text-muted-foreground mb-2">
        <span className="font-medium">Step {step} of {totalSteps}</span>
        <span>{percentage}%</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary rounded-full transition-all duration-300" 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      
      {/* Step indicators */}
      {showStepIndicators && (
        <div className="flex justify-between w-full px-1 mt-4">
          {Array.from({ length: totalSteps }).map((_, i) => {
            const stepNumber = i + 1;
            const isCompleted = step >= stepNumber;
            const isCurrent = step === stepNumber;
            
            // Get the label for this step
            const label = stepLabels[i] || `Step ${stepNumber}`;
            
            return (
              <div key={i} className="flex flex-col items-center">
                <div 
                  className={cn(
                    "flex items-center justify-center rounded-full w-6 h-6 text-xs font-medium border",
                    isCompleted 
                      ? "bg-primary text-primary-foreground border-primary" 
                      : "bg-background text-muted-foreground border-muted",
                    isCurrent && "ring-2 ring-offset-1 ring-primary",
                    animateTransition && "transition-all duration-300"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    stepNumber
                  )}
                </div>
                
                {/* Step labels */}
                <span 
                  className={cn(
                    "text-xs mt-1", 
                    isCompleted ? "text-primary font-medium" : "text-muted-foreground",
                    isCurrent && "font-medium"
                  )}
                >
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/**
 * Modern progress stepper with visual path indicators
 */
export function StageProgressStepper({ 
  step, 
  totalSteps, 
  className = "",
  stepLabels = [
    "Input Data",
    "Set Goals",
    "View Plan",
    "Daily Log",
    "Track Progress"
  ],
  animateTransition = true 
}: ProgressBarProps) {
  return (
    <div className={cn("w-full py-6", className)}>
      <div className="flex items-center justify-between">
        {Array.from({ length: totalSteps }).map((_, i) => {
          const stepNumber = i + 1;
          const isCompleted = step > stepNumber;
          const isCurrent = step === stepNumber;
          const isPending = step < stepNumber;
          
          // Get the label for this step
          const label = stepLabels[i] || `Stage ${stepNumber}`;
          
          return (
            <React.Fragment key={i}>
              {/* Step node */}
              <div className="flex flex-col items-center relative">
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full",
                    isCompleted && "bg-primary text-primary-foreground",
                    isCurrent && "border-2 border-primary bg-background text-primary",
                    isPending && "border border-muted bg-background text-muted-foreground",
                    animateTransition && "transition-all duration-300"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <span className="text-xs font-medium">{stepNumber}</span>
                  )}
                </div>
                <span
                  className={cn(
                    "absolute mt-10 text-xs text-center max-w-[80px]",
                    isCompleted && "text-foreground font-medium",
                    isCurrent && "text-primary font-medium",
                    isPending && "text-muted-foreground"
                  )}
                >
                  {label}
                </span>
              </div>
              
              {/* Connector line between steps */}
              {i < totalSteps - 1 && (
                <div className="flex-1 h-[2px] mx-2 relative">
                  <div className="absolute inset-0 bg-muted" />
                  {step > stepNumber && (
                    <div 
                      className={cn(
                        "absolute inset-0 bg-primary",
                        animateTransition && "transition-all duration-500"
                      )} 
                    />
                  )}
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
