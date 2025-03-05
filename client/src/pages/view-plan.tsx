import { useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { InfoIcon, Edit, Play, Dumbbell, Check, Footprints } from "lucide-react";
import { useUserProfile, useUserGoal } from "@/hooks/use-user-data";
import { formatGoalDate } from "@/lib/date-utils";
import { Button } from "@/components/ui/button";

export default function ViewPlan() {
  const [location, setLocation] = useLocation();
  const { profileData, isLoading: isProfileLoading } = useUserProfile();
  const { goalData, isLoading: isGoalLoading } = useUserGoal();
  
  // Redirect to user data if profile doesn't exist
  useEffect(() => {
    if (!isProfileLoading && !profileData) {
      setLocation("/user-data");
    } else if (!isGoalLoading && !goalData) {
      setLocation("/set-goals");
    }
  }, [isProfileLoading, profileData, isGoalLoading, goalData, setLocation]);
  
  if (isProfileLoading || isGoalLoading || !profileData || !goalData) {
    return <div className="p-8 text-center">Loading your plan...</div>;
  }
  
  // Calculate values for display
  const weeklyLoss = (goalData.currentWeight - goalData.targetWeight) / goalData.timeFrame;
  const goalDateText = formatGoalDate(goalData.timeFrame);
  
  // Calculate macro percentages (should be close to 40-30-30)
  const proteinCalories = goalData.proteinGrams * 4;
  const fatCalories = goalData.fatGrams * 9;
  const carbCalories = goalData.carbGrams * 4;
  const totalCalories = proteinCalories + fatCalories + carbCalories;
  
  // Expected percentages are 30% protein, 30% fat, 40% carbs
  const proteinPercentage = 30;
  const fatPercentage = 30;
  const carbPercentage = 40;
  
  // Calculate weekly activity calories
  const weeklyActivityCalories = goalData.weeklyActivityCalories || ((goalData.weightLiftingSessions || 3) * 250 + 
                                (goalData.cardioSessions || 2) * 300 + 
                                (goalData.stepsPerDay || 10000) / 10000 * 400 * 7);
  
  const handleEditPlan = () => {
    setLocation("/set-goals");
  };
  
  const handleStartTracking = () => {
    setLocation("/daily-log");
  };

  return (
    <div>
      <Card className="mb-6">
        <CardContent className="p-6">
          <h2 className="font-heading font-semibold text-xl mb-1 text-neutral-800">Your Personalized Plan</h2>
          <p className="text-neutral-500 mb-4 text-sm">Based on your data and goals, here's what we recommend</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-neutral-100 rounded-lg p-4 text-center">
              <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <InfoIcon className="text-white text-xl" />
              </div>
              <h3 className="text-sm font-medium text-neutral-700 mb-1">Daily Calories</h3>
              <p className="text-xl font-bold text-primary-600">{goalData.dailyCalorieTarget.toLocaleString()}</p>
              <p className="text-xs text-neutral-500">calories/day</p>
            </div>
            
            <div className="bg-neutral-100 rounded-lg p-4 text-center">
              <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <InfoIcon className="text-white text-xl" />
              </div>
              <h3 className="text-sm font-medium text-neutral-700 mb-1">Weekly Loss</h3>
              <p className="text-xl font-bold text-primary-600">{weeklyLoss.toFixed(2)}</p>
              <p className="text-xs text-neutral-500">kg/week</p>
            </div>
            
            <div className="bg-neutral-100 rounded-lg p-4 text-center">
              <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <InfoIcon className="text-white text-xl" />
              </div>
              <h3 className="text-sm font-medium text-neutral-700 mb-1">Goal Date</h3>
              <p className="text-xl font-bold text-primary-600">{goalDateText}</p>
              <p className="text-xs text-neutral-500">{goalData.timeFrame} weeks from now</p>
            </div>
          </div>
          
          <div className="border-t border-neutral-200 pt-6 mb-6">
            <h3 className="font-medium text-lg mb-4 text-neutral-800">Recommended Macronutrients</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full min-w-full divide-y divide-neutral-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Nutrient</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">Grams</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">Calories</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">% of Diet</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-neutral-200">
                  <tr>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                        <span className="font-medium text-neutral-800">Protein</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right font-medium text-neutral-800">
                      {goalData.proteinGrams}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-neutral-600">
                      {proteinCalories}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-neutral-600">
                      {proteinPercentage}%
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                        <span className="font-medium text-neutral-800">Fats</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right font-medium text-neutral-800">
                      {goalData.fatGrams}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-neutral-600">
                      {fatCalories}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-neutral-600">
                      {fatPercentage}%
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                        <span className="font-medium text-neutral-800">Carbs</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right font-medium text-neutral-800">
                      {goalData.carbGrams}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-neutral-600">
                      {carbCalories}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-neutral-600">
                      {carbPercentage}%
                    </td>
                  </tr>
                </tbody>
                <tfoot className="bg-neutral-50">
                  <tr>
                    <td className="px-4 py-3 whitespace-nowrap font-medium text-neutral-800">Total</td>
                    <td className="px-4 py-3 whitespace-nowrap text-right font-medium text-neutral-800">
                      {goalData.proteinGrams + goalData.fatGrams + goalData.carbGrams}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right font-medium text-neutral-800">
                      {goalData.dailyCalorieTarget.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right font-medium text-neutral-800">
                      100%
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-neutral-100 rounded-lg p-4">
              <h3 className="font-medium text-neutral-800 mb-3 flex items-center">
                <Dumbbell className="text-primary-500 mr-2 h-5 w-5" />
                Training Plan
              </h3>
              <div className="space-y-2 mb-3">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center mr-2 flex-shrink-0">
                    <Check className="h-4 w-4" />
                  </div>
                  <p className="text-neutral-700">4 days/week weight training</p>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center mr-2 flex-shrink-0">
                    <Check className="h-4 w-4" />
                  </div>
                  <p className="text-neutral-700">Focus on compound movements</p>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center mr-2 flex-shrink-0">
                    <Check className="h-4 w-4" />
                  </div>
                  <p className="text-neutral-700">Progressive overload for muscle retention</p>
                </div>
              </div>
              <p className="text-xs text-neutral-500">Weight training helps preserve muscle mass during a caloric deficit.</p>
            </div>
            
            <div className="bg-neutral-100 rounded-lg p-4">
              <h3 className="font-medium text-neutral-800 mb-3 flex items-center">
                <Footprints className="text-primary-500 mr-2 h-5 w-5" />
                Daily Activity Goals
              </h3>
              <div className="space-y-2 mb-3">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center mr-2 flex-shrink-0">
                    <Check className="h-4 w-4" />
                  </div>
                  <p className="text-neutral-700">8,000 daily steps minimum</p>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center mr-2 flex-shrink-0">
                    <Check className="h-4 w-4" />
                  </div>
                  <p className="text-neutral-700">2-3 cardio sessions weekly (optional)</p>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center mr-2 flex-shrink-0">
                    <Check className="h-4 w-4" />
                  </div>
                  <p className="text-neutral-700">Stay active throughout the day</p>
                </div>
              </div>
              <p className="text-xs text-neutral-500">Non-exercise activity thermogenesis (NEAT) is key for fat loss.</p>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
            <Button 
              variant="outline"
              className="flex-1"
              onClick={handleEditPlan}
            >
              <Edit className="mr-2 h-4 w-4" /> Edit Plan
            </Button>
            <Button 
              className="flex-1"
              onClick={handleStartTracking}
            >
              <Play className="mr-2 h-4 w-4" /> Start Tracking
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <div className="bg-neutral-100 rounded-lg p-5 text-sm border border-neutral-200">
        <h3 className="font-medium text-neutral-700 mb-2 flex items-center">
          <InfoIcon className="h-4 w-4 mr-1 text-primary-500" /> Why These Macros?
        </h3>
        <p className="text-neutral-600">
          High protein (1.6g/kg) helps preserve muscle mass during weight loss. Moderate fat (0.8g/kg) maintains hormone health. 
          Remaining calories come from carbs to fuel workouts and daily activities.
        </p>
      </div>
    </div>
  );
}
