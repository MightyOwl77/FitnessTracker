import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Flame, Scale, Dumbbell, Calendar, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { brandColors } from '@/lib/brand';

interface ProgressSummaryProps {
  currentWeight: number;
  targetWeight: number;
  startWeight: number;
  streak: number;
  daysLogged: number;
}

export function ProgressSummary({ 
  currentWeight, 
  targetWeight, 
  startWeight,
  streak,
  daysLogged
}: ProgressSummaryProps) {
  // Calculate total weight to lose and progress so far
  const totalToLose = startWeight - targetWeight;
  const lostSoFar = startWeight - currentWeight;
  
  // Calculate percentage progress
  const percentageComplete = totalToLose > 0 ? Math.min(100, Math.max(0, (lostSoFar / totalToLose) * 100)) : 0;
  
  // Format the percentages for display
  const percentageCompleteDisplay = Math.round(percentageComplete);
  
  return (
    <div className="space-y-4">
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="bg-gradient-to-r from-primary to-primary-dark p-4">
            <div className="flex justify-between items-center text-primary-foreground">
              <div>
                <h3 className="font-semibold text-lg">Your Progress</h3>
                <p className="text-primary-foreground/80 text-sm">
                  {lostSoFar > 0 
                    ? `You've lost ${lostSoFar.toFixed(1)} kg so far!` 
                    : 'Start tracking to see your progress'}
                </p>
              </div>
              <div className="h-14 w-14 bg-white rounded-full flex items-center justify-center">
                <span className="text-primary font-bold">{percentageCompleteDisplay}%</span>
              </div>
            </div>
            
            <div className="mt-3">
              <div className="h-2 bg-white/30 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white rounded-full" 
                  style={{ width: `${percentageComplete}%` }}
                ></div>
              </div>
              
              <div className="flex justify-between text-xs text-primary-foreground/90 mt-1">
                <span>{startWeight} kg</span>
                <span>{targetWeight} kg</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                <Flame className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Current</div>
                <div className="font-semibold">{currentWeight} kg</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <Scale className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Target</div>
                <div className="font-semibold">{targetWeight} kg</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <Calendar className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Streak</div>
                <div className="font-semibold">{streak} days</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                <Trophy className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Days Logged</div>
                <div className="font-semibold">{daysLogged} total</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Motivational message based on progress */}
      <div className="bg-muted p-4 rounded-lg">
        <p className="text-sm">
          {percentageComplete === 0 && (
            "Every transformation journey begins with a single step. Start logging your daily food and exercise!"
          )}
          {percentageComplete > 0 && percentageComplete < 25 && (
            "Great start! Remember that consistency beats perfection. Keep tracking daily."
          )}
          {percentageComplete >= 25 && percentageComplete < 50 && (
            "You're gaining momentum! A quarter of the way to your goal. Remember why you started."
          )}
          {percentageComplete >= 50 && percentageComplete < 75 && (
            "You're over halfway there! Your dedication is paying off. Adjust and optimize as needed."
          )}
          {percentageComplete >= 75 && percentageComplete < 100 && (
            "The finish line is in sight! You've proven your discipline and determination."
          )}
          {percentageComplete >= 100 && (
            "Congratulations on reaching your goal! Time to maintain or set new targets."
          )}
        </p>
      </div>
    </div>
  );
}