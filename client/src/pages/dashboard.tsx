
import React from "react";
import { LoadingState, ErrorState } from "@/components/ui/loading-state";
import { useUserGoal, useUserProfile } from "@/hooks/use-user-data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRightIcon, PlusCircleIcon, LineChartIcon, ClipboardIcon, CalendarIcon } from "lucide-react";

export function Dashboard() {
  // Fetch user profile and goals to check if they're set up
  const { profileData, isLoading: isProfileLoading, isError: isProfileError } = useUserProfile();
  const { goalData, isLoading: isGoalLoading, isError: isGoalError } = useUserGoal();
  
  const isLoading = isProfileLoading || isGoalLoading;
  const isError = isProfileError || isGoalError;
  const hasProfile = !!profileData;
  const hasGoals = !!goalData;
  
  if (isLoading) {
    return <LoadingState message="Loading your dashboard..." />;
  }
  
  if (isError) {
    return <ErrorState message="There was an error loading your dashboard. Please try again." />;
  }
  
  // First time user without profile or goals
  if (!hasProfile || !hasGoals) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Welcome to Your Fitness Transformation</h1>
        <p className="text-gray-600 mb-6">Let's get you set up for success on your journey!</p>
        
        <div className="grid grid-cols-1 gap-6">
          {!hasProfile && (
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-xl">Step 1: Create Your Profile</CardTitle>
                <CardDescription>Tell us about yourself so we can personalize your experience</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center mt-2">
                  <Button 
                    asChild 
                    className="gap-2 min-h-[48px]" 
                    aria-label="Create Profile"
                  >
                    <Link href="/user-data">
                      <PlusCircleIcon size={18} aria-hidden="true" />
                      <span>Create Profile</span>
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          
          {hasProfile && !hasGoals && (
            <Card className="bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl">Set Your Transformation Goals</CardTitle>
                <CardDescription>Define your target weight, timeframe, and activity level</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm">
                  Based on scientific principles, we'll create a personalized plan to help you reach your goals.
                </p>
                <div className="flex justify-center mt-2">
                  <Button 
                    asChild 
                    className="gap-2 min-h-[48px]" 
                    aria-label="Set Your Goals"
                  >
                    <Link href="/set-goals">
                      <ArrowRightIcon size={18} aria-hidden="true" />
                      <span>Set Your Goals</span>
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  }
  
  // Regular dashboard for users with profile and goals
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <p className="text-gray-600 mb-6">Welcome to your fitness transformation journey!</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <ClipboardIcon size={20} className="text-primary" />
              Today's Plan
            </CardTitle>
            <CardDescription>Your workout and nutrition plan for today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <section className="rounded-md bg-muted p-3">
                <h3 className="font-medium">Workout</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {(goalData?.weightLiftingSessions || 0) > 0 
                    ? `${goalData?.workoutSplit === 'full_body' ? 'Full Body' : 'Upper/Lower Split'} Training` 
                    : 'Rest Day'}
                </p>
              </section>
              
              <section className="rounded-md bg-muted p-3">
                <h3 className="font-medium">Nutrition</h3>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Calories</p>
                    <p className="font-medium">{goalData?.dailyCalorieTarget || 0}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Protein</p>
                    <p className="font-medium">{goalData?.proteinGrams || 0}g</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Carbs/Fat</p>
                    <p className="font-medium">{goalData?.carbGrams || 0}g/{goalData?.fatGrams || 0}g</p>
                  </div>
                </div>
              </section>
              
              <div className="flex justify-end">
                <Button 
                  asChild 
                  variant="outline" 
                  size="sm"
                >
                  <Link href="/view-plan">View Full Plan</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <LineChartIcon size={20} className="text-primary" />
              Progress Tracker
            </CardTitle>
            <CardDescription>Track your transformation journey</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center space-y-4 py-6">
              <CalendarIcon size={40} className="text-muted-foreground" />
              <p className="text-center text-sm text-muted-foreground">
                Start logging your daily progress to see your stats here
              </p>
              <Button 
                asChild 
                size="sm"
              >
                <Link href="/daily-log">Log Today's Progress</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Additional responsive section for quick actions */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Button 
            asChild 
            variant="outline"
            className="h-auto py-4 flex flex-col items-center justify-center gap-2"
            aria-label="Update body measurements"
          >
            <Link href="/body-stats">
              <span className="text-sm font-normal">Body Stats</span>
            </Link>
          </Button>
          
          <Button 
            asChild 
            variant="outline"
            className="h-auto py-4 flex flex-col items-center justify-center gap-2"
            aria-label="View your progress charts"
          >
            <Link href="/progress">
              <span className="text-sm font-normal">Progress Charts</span>
            </Link>
          </Button>
          
          <Button 
            asChild 
            variant="outline"
            className="h-auto py-4 flex flex-col items-center justify-center gap-2"
            aria-label="Adjust your fitness goals"
          >
            <Link href="/set-goals">
              <span className="text-sm font-normal">Adjust Goals</span>
            </Link>
          </Button>
          
          <Button 
            asChild 
            variant="outline"
            className="h-auto py-4 flex flex-col items-center justify-center gap-2"
            aria-label="Update your profile information"
          >
            <Link href="/user-data">
              <span className="text-sm font-normal">Update Profile</span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
