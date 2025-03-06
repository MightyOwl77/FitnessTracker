import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ArrowDown, Trophy, Pill, Dumbbell, Scale, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';
import { brandColors } from '@/lib/brand';

interface FatLossGuidanceProps {
  currentWeight: number;
  targetWeight: number;
  weeklyLossRate: number;
  percentageDeficit: number;
  maintenanceCalories: number;
  dailyDeficit: number;
  proteinGrams: number;
  liftingSessionsPerWeek: number;
}

export function FatLossGuidance({
  currentWeight,
  targetWeight,
  weeklyLossRate,
  percentageDeficit,
  maintenanceCalories,
  dailyDeficit,
  proteinGrams,
  liftingSessionsPerWeek
}: FatLossGuidanceProps) {
  // Calculate total weight to lose
  const totalToLose = currentWeight - targetWeight;
  const lostSoFar = 0; // This would come from progress data
  const percentageComplete = (lostSoFar / totalToLose) * 100;
  
  // Calculate estimated time remaining based on weekly loss rate
  const weeksRemaining = totalToLose / weeklyLossRate;
  const months = Math.floor(weeksRemaining / 4);
  const weeks = Math.round(weeksRemaining % 4);
  
  // Determine if the deficit is within healthy parameters
  const deficitTooHigh = percentageDeficit > 30;
  const deficitTooLow = percentageDeficit < 10;
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Fat Loss Plan
          </CardTitle>
          <CardDescription>
            Designed to maximize fat loss while preserving muscle
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm text-muted-foreground">Current</div>
                <div className="text-2xl font-semibold">{currentWeight} kg</div>
              </div>
              <ArrowDown className="h-5 w-5 text-muted-foreground mx-2" />
              <div>
                <div className="text-sm text-muted-foreground">Target</div>
                <div className="text-2xl font-semibold">{targetWeight} kg</div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Progress</span>
                <span>{Math.round(percentageComplete)}%</span>
              </div>
              <Progress value={percentageComplete} className="h-2" />
            </div>
            
            <div className="grid grid-cols-2 gap-3 mt-6">
              <div className="bg-muted p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <Flame className="h-4 w-4 text-orange-500" />
                  <span className="text-sm font-medium">Daily Deficit</span>
                </div>
                <div className="mt-1 text-xl font-bold">{dailyDeficit} kcal</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {percentageDeficit}% of maintenance
                </div>
              </div>
              
              <div className="bg-muted p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <Scale className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">Weekly Rate</span>
                </div>
                <div className="mt-1 text-xl font-bold">{weeklyLossRate} kg</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {(dailyDeficit * 7 / 7700).toFixed(2)} kg/week from deficit
                </div>
              </div>
              
              <div className="bg-muted p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <Pill className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Daily Protein</span>
                </div>
                <div className="mt-1 text-xl font-bold">{proteinGrams}g</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {Math.round(proteinGrams / currentWeight * 2.2)} g/lb of bodyweight
                </div>
              </div>
              
              <div className="bg-muted p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <Dumbbell className="h-4 w-4 text-purple-500" />
                  <span className="text-sm font-medium">Strength Training</span>
                </div>
                <div className="mt-1 text-xl font-bold">{liftingSessionsPerWeek}x</div>
                <div className="text-xs text-muted-foreground mt-1">
                  sessions per week
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <div className="text-sm font-medium mb-2">Estimated Completion</div>
              <div className="text-xl">
                {months > 0 && `${months} month${months !== 1 ? 's' : ''} `}
                {weeks > 0 && `${weeks} week${weeks !== 1 ? 's' : ''}`}
              </div>
              
              {deficitTooHigh && (
                <Badge variant="destructive" className="mt-2">
                  Deficit too high - risk of muscle loss
                </Badge>
              )}
              
              {deficitTooLow && (
                <Badge variant="secondary" className="mt-2">
                  Deficit low - progress will be slower
                </Badge>
              )}
              
              {!deficitTooHigh && !deficitTooLow && (
                <Badge variant="outline" className="mt-2 bg-primary/10 text-primary border-primary/20">
                  Optimal deficit for muscle retention
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold">Calorie Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span>Maintenance</span>
                <span className="font-medium">{maintenanceCalories} kcal</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span>Daily Target</span>
                <span className="font-medium">{maintenanceCalories - dailyDeficit} kcal</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span>Protein (4 kcal/g)</span>
                <span className="font-medium">{proteinGrams * 4} kcal</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span>Fat (9 kcal/g)</span>
                <span className="font-medium">
                  {Math.round((maintenanceCalories - dailyDeficit) * 0.25)} kcal
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span>Carbs (4 kcal/g)</span>
                <span className="font-medium">
                  {Math.round((maintenanceCalories - dailyDeficit) - (proteinGrams * 4) - ((maintenanceCalories - dailyDeficit) * 0.25))} kcal
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold">Recommended Approach</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <div className="rounded-full h-5 w-5 bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                  1
                </div>
                <span>Hit daily protein target (min {proteinGrams}g)</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="rounded-full h-5 w-5 bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                  2
                </div>
                <span>Strength train {liftingSessionsPerWeek}x weekly to maintain muscle</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="rounded-full h-5 w-5 bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                  3
                </div>
                <span>Stay within {maintenanceCalories - dailyDeficit} calories daily</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="rounded-full h-5 w-5 bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                  4
                </div>
                <span>Consider a diet break every 6-12 weeks</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}