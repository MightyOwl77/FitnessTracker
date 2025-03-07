import React from 'react';
import { cn } from '@/lib/utils';

// Import all illustrations
import welcomeIllustration from '@/assets/illustrations/welcome-illustration.svg';
import progressIllustration from '@/assets/illustrations/progress-illustration.svg';
import bodyCompositionIllustration from '@/assets/illustrations/body-composition.svg';
import workoutPlanIllustration from '@/assets/illustrations/workout-plan.svg';

// Map of all available illustrations
const illustrations = {
  welcome: welcomeIllustration,
  progress: progressIllustration,
  bodyComposition: bodyCompositionIllustration,
  workoutPlan: workoutPlanIllustration,
};

export type IllustrationName = keyof typeof illustrations;

interface IllustrationProps {
  name: IllustrationName;
  className?: string;
  altText?: string;
  width?: number | string;
  height?: number | string;
}

/**
 * Illustration Component
 * 
 * Displays SVG illustrations with consistent styling throughout the app.
 * 
 * @param name - The name of the illustration to display
 * @param className - Additional CSS classes
 * @param altText - Alternative text for accessibility
 * @param width - Optional width override
 * @param height - Optional height override
 */
export function Illustration({ 
  name, 
  className, 
  altText,
  width,
  height
}: IllustrationProps) {
  const illustrationSrc = illustrations[name];
  
  if (!illustrationSrc) {
    console.warn(`Illustration "${name}" not found.`);
    return null;
  }
  
  return (
    <img 
      src={illustrationSrc}
      alt={altText || `${name} illustration`}
      className={cn("max-w-full object-contain", className)}
      width={width}
      height={height}
    />
  );
}