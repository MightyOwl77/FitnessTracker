import { useEffect, useState } from 'react';
import { useUserData } from '@/hooks/use-user-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Circle } from 'lucide-react';

// Define the onboarding steps
const ONBOARDING_STEPS = [
  { id: 'profile', label: 'Profile' },
  { id: 'goals', label: 'Goals' },
  { id: 'diet_preferences', label: 'Diet' },
  { id: 'workout_preferences', label: 'Workout' }
];

export function OnboardingProgressTracker() {
  const { userData, hasCompletedStep, hasCompletedOnboarding } = useUserData();
  const [progressPercentage, setProgressPercentage] = useState(0);
  
  // Calculate progress whenever userData changes
  useEffect(() => {
    const completedSteps = ONBOARDING_STEPS.filter(step => 
      hasCompletedStep(step.id)
    ).length;
    
    const newProgressPercentage = (completedSteps / ONBOARDING_STEPS.length) * 100;
    setProgressPercentage(newProgressPercentage);
  }, [userData, hasCompletedStep]);
  
  // If all steps completed, show completion message
  if (hasCompletedOnboarding()) {
    return (
      <Card className="bg-gradient-to-r from-green-50 to-teal-50 border-green-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-green-700 flex items-center">
            <CheckCircle className="h-5 w-5 mr-2" />
            Onboarding Complete
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-green-600">
            You've completed all the onboarding steps. You can now enjoy the full experience!
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Onboarding Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Progress value={progressPercentage} className="h-2" />
          
          <div className="space-y-2">
            {ONBOARDING_STEPS.map(step => {
              const completed = hasCompletedStep(step.id);
              return (
                <div key={step.id} className="flex items-center">
                  {completed ? (
                    <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                  ) : (
                    <Circle className="h-5 w-5 mr-2 text-gray-300" />
                  )}
                  <span className={completed ? 'text-green-700' : 'text-gray-500'}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
          
          <Button 
            size="sm" 
            className="w-full mt-2"
            disabled={hasCompletedOnboarding()}
          >
            {progressPercentage > 0 ? 'Continue Setup' : 'Start Setup'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}