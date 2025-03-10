import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUserData } from '@/hooks/use-user-data';
import { OnboardingProgressTracker } from '@/components/onboarding/progress-tracker';

export default function OnboardingTest() {
  const { userData, updateUserData, markStepComplete } = useUserData();
  const [lastAction, setLastAction] = useState('');
  
  // Simple function to complete a step
  const completeStep = (stepId: string) => {
    markStepComplete(stepId);
    setLastAction(`Completed step: ${stepId}`);
  };
  
  // Simple function to update user data
  const updateSomeUserData = () => {
    updateUserData({
      weight: Math.floor(65 + Math.random() * 20),
      height: Math.floor(165 + Math.random() * 20),
      gender: Math.random() > 0.5 ? 'male' : 'female',
      age: Math.floor(20 + Math.random() * 40)
    });
    setLastAction('Updated user data');
  };
  
  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Onboarding Context Test Page</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left column - Actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Test Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Complete Onboarding Steps</h3>
                <div className="grid grid-cols-2 gap-2">
                  <Button size="sm" onClick={() => completeStep('profile')}>Complete Profile</Button>
                  <Button size="sm" onClick={() => completeStep('goals')}>Complete Goals</Button>
                  <Button size="sm" onClick={() => completeStep('diet_preferences')}>Complete Diet</Button>
                  <Button size="sm" onClick={() => completeStep('workout_preferences')}>Complete Workout</Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Update User Data</h3>
                <Button onClick={updateSomeUserData}>Update Random Data</Button>
              </div>
              
              {lastAction && (
                <div className="bg-muted p-2 rounded text-sm">
                  <strong>Last action:</strong> {lastAction}
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Current User Data</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded text-xs overflow-auto max-h-80">
                {JSON.stringify(userData, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </div>
        
        {/* Right column - Components */}
        <div className="space-y-6">
          <OnboardingProgressTracker />
          
          <Card>
            <CardHeader>
              <CardTitle>User Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Gender:</span>
                  <span className="font-medium">{userData.gender || 'Not set'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Age:</span>
                  <span className="font-medium">{userData.age || 'Not set'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Height:</span>
                  <span className="font-medium">{userData.height ? `${userData.height} cm` : 'Not set'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Weight:</span>
                  <span className="font-medium">{userData.weight ? `${userData.weight} kg` : 'Not set'}</span>
                </div>
                {userData.bmr && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">BMR:</span>
                    <span className="font-medium">{userData.bmr} kcal</span>
                  </div>
                )}
                {userData.tdee && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">TDEE:</span>
                    <span className="font-medium">{userData.tdee} kcal</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}