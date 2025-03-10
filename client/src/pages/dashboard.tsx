import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingState, ErrorState } from "@/components/ui/loading-state";
import { useUserGoal, useUserProfile } from "@/hooks/use-user-data";
import { Link } from "wouter";
import {
  ArrowRightIcon,
  PlusCircleIcon,
  LineChartIcon,
  CalendarIcon,
  ClipboardIcon,
  BarChartIcon,
  Activity,
  TrendingDown,
  Scale,
  Flame,
  Utensils
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { format, addWeeks } from "date-fns";

export default function Dashboard() {
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
                  >
                    <Link href="/user-data">
                      <PlusCircleIcon size={18} />
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
                  >
                    <Link href="/set-goals">
                      <ArrowRightIcon size={18} />
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

  // Calculate transformation progress
  const startWeight = profileData?.weight || 0;
  const currentWeight = profileData?.weight || 0; // This would be updated from body stats
  const targetWeight = goalData?.targetWeight || 0;
  const totalWeightToLose = startWeight - targetWeight;
  const weightLostSoFar = startWeight - currentWeight;
  const progressPercentage = totalWeightToLose > 0 
    ? Math.min(100, Math.round((weightLostSoFar / totalWeightToLose) * 100)) 
    : 0;
  
  // Calculate end date
  const timeFrame = goalData?.timeFrame || 12; // in weeks
  const startDate = new Date(goalData?.createdAt || new Date());
  const endDate = addWeeks(startDate, timeFrame);
  const formattedEndDate = format(endDate, "MMMM d, yyyy");

  // Regular dashboard for users with profile and goals
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-2">Your Transformation Plan</h1>
      <p className="text-muted-foreground mb-6">
        Stay consistent with your plan to achieve your fitness goals
      </p>

      {/* Transformation Progress Card */}
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle>Transformation Progress</CardTitle>
          <CardDescription>
            Your journey from {startWeight}kg to {targetWeight}kg
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground mb-1">Current Weight</span>
              <span className="text-2xl font-bold">{currentWeight} kg</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground mb-1">Target Weight</span>
              <span className="text-2xl font-bold">{targetWeight} kg</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground mb-1">Target Date</span>
              <span className="text-2xl font-bold">{formattedEndDate}</span>
            </div>
          </div>
          
          <div className="mt-4">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-muted-foreground">{progressPercentage}% Complete</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Daily Plan Grid */}
      <h2 className="text-xl font-semibold mb-4">Daily Plan</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Nutrition Plan Card */}
        <Card>
          <CardHeader className="pb-4 flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-xl flex items-center">
                <Utensils className="w-5 h-5 mr-2 text-primary" />
                Nutrition Plan
              </CardTitle>
              <CardDescription>Your optimal calorie and macro targets</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-secondary/20">
                <div className="text-sm text-muted-foreground">Daily Calories</div>
                <div className="text-2xl font-bold">{goalData?.dailyCalorieTarget || 0}</div>
              </div>
              <div className="p-3 rounded-lg bg-secondary/20">
                <div className="text-sm text-muted-foreground">Daily Deficit</div>
                <div className="text-2xl font-bold text-green-600">{goalData?.dailyDeficit || 0}</div>
              </div>
            </div>
            
            <div className="mt-6">
              <h4 className="text-sm font-medium mb-3">Macro Breakdown</h4>
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2 bg-primary/5 rounded-md text-center">
                  <div className="text-xs text-muted-foreground">Protein</div>
                  <div className="font-semibold">{goalData?.proteinGrams || 0}g</div>
                </div>
                <div className="p-2 bg-primary/5 rounded-md text-center">
                  <div className="text-xs text-muted-foreground">Carbs</div>
                  <div className="font-semibold">{goalData?.carbGrams || 0}g</div>
                </div>
                <div className="p-2 bg-primary/5 rounded-md text-center">
                  <div className="text-xs text-muted-foreground">Fats</div>
                  <div className="font-semibold">{goalData?.fatGrams || 0}g</div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <Button asChild variant="outline" size="sm">
                <Link href="/daily-log">Log Today's Intake</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Activity Plan Card */}
        <Card>
          <CardHeader className="pb-4 flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-xl flex items-center">
                <Activity className="w-5 h-5 mr-2 text-primary" />
                Activity Plan
              </CardTitle>
              <CardDescription>Your optimal exercise targets</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-secondary/20">
                <div className="text-sm text-muted-foreground">Weight Training</div>
                <div className="text-2xl font-bold">{goalData?.weightLiftingSessions || 0}/week</div>
              </div>
              <div className="p-3 rounded-lg bg-secondary/20">
                <div className="text-sm text-muted-foreground">Cardio Sessions</div>
                <div className="text-2xl font-bold">{goalData?.cardioSessions || 0}/week</div>
              </div>
            </div>
            
            <div className="mt-6">
              <h4 className="text-sm font-medium mb-3">Additional Targets</h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 bg-primary/5 rounded-md">
                  <div className="text-xs text-muted-foreground">Daily Steps</div>
                  <div className="font-semibold">{goalData?.stepsPerDay?.toLocaleString() || 0}</div>
                </div>
                <div className="p-2 bg-primary/5 rounded-md">
                  <div className="text-xs text-muted-foreground">Weekly Activity Calories</div>
                  <div className="font-semibold">{goalData?.weeklyActivityCalories?.toLocaleString() || 0}</div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <Button asChild variant="outline" size="sm">
                <Link href="/daily-log">Log Today's Activity</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Button 
          asChild 
          variant="outline"
          className="h-auto py-4 flex flex-col items-center justify-center gap-2"
        >
          <Link href="/daily-log">
            <CalendarIcon className="h-6 w-6 text-primary" />
            <span className="text-sm font-normal">Daily Log</span>
          </Link>
        </Button>

        <Button 
          asChild 
          variant="outline"
          className="h-auto py-4 flex flex-col items-center justify-center gap-2"
        >
          <Link href="/body-stats">
            <Scale className="h-6 w-6 text-primary" />
            <span className="text-sm font-normal">Update Weight</span>
          </Link>
        </Button>

        <Button 
          asChild 
          variant="outline"
          className="h-auto py-4 flex flex-col items-center justify-center gap-2"
        >
          <Link href="/progress">
            <LineChartIcon className="h-6 w-6 text-primary" />
            <span className="text-sm font-normal">View Progress</span>
          </Link>
        </Button>

        <Button 
          asChild 
          variant="outline"
          className="h-auto py-4 flex flex-col items-center justify-center gap-2"
        >
          <Link href="/set-goals">
            <BarChartIcon className="h-6 w-6 text-primary" />
            <span className="text-sm font-normal">Adjust Goals</span>
          </Link>
        </Button>
      </div>

      {/* Tip of the Day */}
      <Card className="bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 border-none mb-4">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Tip of the Day</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">
            <strong>Consistency over perfection:</strong> Focus on sticking to your daily calorie 
            target consistently rather than being perfect every day. Sustainable progress comes 
            from consistency over time.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}