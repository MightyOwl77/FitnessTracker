import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon, AlertTriangleIcon, CheckCircleIcon, ArrowRightIcon } from "lucide-react";
import { Progress } from "@/components/ui/progress";

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
  // Calculate percentage of body weight lost per week
  const weeklyLossPercentage = (weeklyLossRate / currentWeight) * 100;
  
  // Determine if rate is optimal (0.5-1% of body weight per week)
  const isRateOptimal = weeklyLossPercentage >= 0.5 && weeklyLossPercentage <= 1.0;
  
  // Determine if deficit is reasonable (20-35% of maintenance)
  const isDeficitReasonable = percentageDeficit >= 20 && percentageDeficit <= 35;
  
  // Determine if protein is sufficient (minimum 1.8g per kg)
  const minProteinPerKg = 1.8;
  const recommendedProteinPerKg = 2.0;
  const actualProteinPerKg = proteinGrams / currentWeight;
  const isProteinSufficient = actualProteinPerKg >= minProteinPerKg;
  const isProteinOptimal = actualProteinPerKg >= recommendedProteinPerKg;
  
  // Determine if resistance training is sufficient (minimum 2x per week)
  const isTrainingSufficient = liftingSessionsPerWeek >= 2;
  
  // Calculate how long it will take to reach goal at current rate
  const totalWeightToLose = currentWeight - targetWeight;
  const weeksToGoal = totalWeightToLose / weeklyLossRate;
  const monthsToGoal = weeksToGoal / 4.33; // average weeks in a month
  
  return (
    <Card className="w-full shadow-md">
      <CardHeader className="bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-950 dark:to-teal-950">
        <CardTitle className="text-xl">Smart Fat Loss Strategy</CardTitle>
        <CardDescription>
          Based on scientific principles for sustainable fat loss
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <div className="space-y-1">
          <h3 className="text-sm font-medium">Progress Timeline</h3>
          <div className="flex items-center justify-between">
            <span className="text-sm">{currentWeight.toFixed(1)} kg</span>
            <span className="text-sm">{targetWeight.toFixed(1)} kg</span>
          </div>
          <Progress value={(1 - (currentWeight - targetWeight) / (currentWeight - targetWeight)) * 100} />
          
          <div className="pt-2 flex justify-between text-sm text-muted-foreground">
            <span>Current</span>
            <span>
              {weeksToGoal > 52 
                ? `${Math.round(weeksToGoal/52)} years` 
                : weeksToGoal > 8 
                  ? `${Math.round(monthsToGoal)} months` 
                  : `${Math.round(weeksToGoal)} weeks`
              }
            </span>
            <span>Goal</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium pb-2">Rate of Loss</h3>
            <Alert variant={isRateOptimal ? "default" : weeklyLossPercentage < 0.5 ? "default" : "destructive"}>
              <div className="flex items-center gap-2">
                {isRateOptimal ? (
                  <CheckCircleIcon className="h-4 w-4 text-green-500" />
                ) : weeklyLossPercentage < 0.5 ? (
                  <InfoIcon className="h-4 w-4" />
                ) : (
                  <AlertTriangleIcon className="h-4 w-4" />
                )}
                <AlertTitle>
                  {isRateOptimal 
                    ? "Optimal rate" 
                    : weeklyLossPercentage < 0.5 
                      ? "Slow and steady" 
                      : "Rate may be too aggressive"}
                </AlertTitle>
              </div>
              <AlertDescription className="pl-6 text-sm">
                Losing {weeklyLossPercentage.toFixed(1)}% of body weight weekly
                {isRateOptimal 
                  ? " - perfect for preserving muscle mass." 
                  : weeklyLossPercentage < 0.5 
                    ? " - very sustainable but could be faster." 
                    : " - consider slowing down to preserve muscle."}
              </AlertDescription>
            </Alert>
          </div>

          <div>
            <h3 className="text-sm font-medium pb-2">Calorie Deficit</h3>
            <Alert variant={isDeficitReasonable ? "default" : "destructive"}>
              <div className="flex items-center gap-2">
                {isDeficitReasonable ? (
                  <CheckCircleIcon className="h-4 w-4 text-green-500" />
                ) : percentageDeficit < 20 ? (
                  <InfoIcon className="h-4 w-4" />
                ) : (
                  <AlertTriangleIcon className="h-4 w-4" />
                )}
                <AlertTitle>
                  {isDeficitReasonable 
                    ? "Balanced deficit" 
                    : percentageDeficit < 20 
                      ? "Minimal deficit" 
                      : "Large deficit"}
                </AlertTitle>
              </div>
              <AlertDescription className="pl-6 text-sm">
                {dailyDeficit} calories ({percentageDeficit.toFixed(0)}% below maintenance)
                {isDeficitReasonable 
                  ? " - good balance between results and sustainability." 
                  : percentageDeficit < 20 
                    ? " - progress may be slow but very sustainable." 
                    : " - may be difficult to sustain long-term."}
              </AlertDescription>
            </Alert>
          </div>

          <div>
            <h3 className="text-sm font-medium pb-2">Protein Intake</h3>
            <Alert variant={isProteinOptimal ? "default" : isProteinSufficient ? "default" : "destructive"}>
              <div className="flex items-center gap-2">
                {isProteinOptimal ? (
                  <CheckCircleIcon className="h-4 w-4 text-green-500" />
                ) : isProteinSufficient ? (
                  <InfoIcon className="h-4 w-4" />
                ) : (
                  <AlertTriangleIcon className="h-4 w-4" />
                )}
                <AlertTitle>
                  {isProteinOptimal 
                    ? "Optimal protein" 
                    : isProteinSufficient 
                      ? "Adequate protein" 
                      : "Insufficient protein"}
                </AlertTitle>
              </div>
              <AlertDescription className="pl-6 text-sm">
                {proteinGrams}g ({actualProteinPerKg.toFixed(1)}g/kg of bodyweight)
                {isProteinOptimal 
                  ? " - excellent for preserving muscle mass." 
                  : isProteinSufficient 
                    ? " - consider increasing slightly for better results." 
                    : " - increase protein to preserve muscle mass."}
              </AlertDescription>
            </Alert>
          </div>

          <div>
            <h3 className="text-sm font-medium pb-2">Resistance Training</h3>
            <Alert variant={isTrainingSufficient ? "default" : "destructive"}>
              <div className="flex items-center gap-2">
                {isTrainingSufficient ? (
                  <CheckCircleIcon className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertTriangleIcon className="h-4 w-4" />
                )}
                <AlertTitle>
                  {isTrainingSufficient 
                    ? "Sufficient training" 
                    : "More training needed"}
                </AlertTitle>
              </div>
              <AlertDescription className="pl-6 text-sm">
                {liftingSessionsPerWeek} sessions per week
                {isTrainingSufficient 
                  ? liftingSessionsPerWeek >= 3 
                    ? " - excellent for preserving muscle during fat loss." 
                    : " - minimum required for muscle preservation." 
                  : " - add more sessions to prevent muscle loss."}
              </AlertDescription>
            </Alert>
          </div>
        </div>

        <div className="pt-4 space-y-3">
          <h3 className="text-sm font-medium border-b pb-1">Science-based Guidelines</h3>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <ArrowRightIcon className="h-4 w-4 mt-1 text-green-600" />
              <span className="text-sm">Aim for 0.5-1% of bodyweight loss per week (about {(currentWeight * 0.007).toFixed(1)}-{(currentWeight * 0.01).toFixed(1)}kg)</span>
            </li>
            <li className="flex items-start gap-2">
              <ArrowRightIcon className="h-4 w-4 mt-1 text-green-600" />
              <span className="text-sm">Consume 1.8-2.2g of protein per kg of bodyweight (about {Math.round(currentWeight * 1.8)}-{Math.round(currentWeight * 2.2)}g)</span>
            </li>
            <li className="flex items-start gap-2">
              <ArrowRightIcon className="h-4 w-4 mt-1 text-green-600" />
              <span className="text-sm">Maintain a 20-25% calorie deficit (about {Math.round(maintenanceCalories * 0.2)}-{Math.round(maintenanceCalories * 0.25)} calories below maintenance)</span>
            </li>
            <li className="flex items-start gap-2">
              <ArrowRightIcon className="h-4 w-4 mt-1 text-green-600" />
              <span className="text-sm">Prioritize resistance training 3-4 times per week to preserve muscle mass</span>
            </li>
            <li className="flex items-start gap-2">
              <ArrowRightIcon className="h-4 w-4 mt-1 text-green-600" />
              <span className="text-sm">Consider diet breaks every 8-12 weeks to improve adherence and hormonal balance</span>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}