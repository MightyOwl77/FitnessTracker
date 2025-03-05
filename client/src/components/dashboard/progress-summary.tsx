
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowDown, Target, Dumbbell, Flame, Award } from "lucide-react";

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
  // Calculate progress percentage
  const totalToLose = startWeight - targetWeight;
  const lostSoFar = startWeight - currentWeight;
  const progressPercent = Math.min(100, Math.round((lostSoFar / totalToLose) * 100));
  
  const remainingWeight = currentWeight - targetWeight;
  
  return (
    <Card className="overflow-hidden">
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-5 text-white">
        <h2 className="text-xl font-semibold mb-2">Your Progress</h2>
        <div className="flex items-center">
          <Progress value={progressPercent} className="h-3 flex-grow bg-white/20" />
          <span className="ml-3 font-bold">{progressPercent}%</span>
        </div>
      </div>
      <CardContent className="p-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-2">
              <ArrowDown className="h-5 w-5 text-primary-600" />
            </div>
            <div className="text-xs text-neutral-500">Lost</div>
            <div className="font-bold text-lg">{lostSoFar.toFixed(1)} kg</div>
          </div>
          
          <div className="text-center">
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-2">
              <Target className="h-5 w-5 text-primary-600" />
            </div>
            <div className="text-xs text-neutral-500">Remaining</div>
            <div className="font-bold text-lg">{remainingWeight.toFixed(1)} kg</div>
          </div>
          
          <div className="text-center">
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-2">
              <Flame className="h-5 w-5 text-primary-600" />
            </div>
            <div className="text-xs text-neutral-500">Streak</div>
            <div className="font-bold text-lg">{streak} days</div>
          </div>
          
          <div className="text-center">
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-2">
              <Award className="h-5 w-5 text-primary-600" />
            </div>
            <div className="text-xs text-neutral-500">Days Logged</div>
            <div className="font-bold text-lg">{daysLogged}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
