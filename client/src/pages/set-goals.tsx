import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function SetGoals() {
  const [weightGoal, setWeightGoal] = useState("");
  const [bodyFatGoal, setBodyFatGoal] = useState("");
  const [timeframe, setTimeframe] = useState("");
  const [focusArea, setFocusArea] = useState<string[]>([]);

  const handleFocusAreaToggle = (area: string) => {
    if (focusArea.includes(area)) {
      setFocusArea(focusArea.filter(a => a !== area));
    } else {
      setFocusArea([...focusArea, area]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement saving goals to backend
    console.log("Submitting goals:", { weightGoal, bodyFatGoal, timeframe, focusArea });
    // Show success feedback
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Set Your Goals</h1>
      <p className="text-gray-600 mb-6">Define what you want to achieve in your fitness journey</p>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-medium mb-4">What's your target weight?</h2>
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    step="0.1"
                    value={weightGoal}
                    onChange={(e) => setWeightGoal(e.target.value)}
                    placeholder="Target weight in kg"
                    className="max-w-xs"
                    required
                  />
                  <span className="text-gray-500">kg</span>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-medium mb-4">Target body fat percentage (optional)</h2>
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    step="0.1"
                    value={bodyFatGoal}
                    onChange={(e) => setBodyFatGoal(e.target.value)}
                    placeholder="Target body fat %"
                    className="max-w-xs"
                  />
                  <span className="text-gray-500">%</span>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-medium mb-4">How quickly do you want to achieve this?</h2>
                <select
                  value={timeframe}
                  onChange={(e) => setTimeframe(e.target.value)}
                  className="w-full max-w-md p-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="">Select timeframe</option>
                  <option value="gradual">Gradual (0.5kg per week)</option>
                  <option value="moderate">Moderate (1kg per week)</option>
                  <option value="aggressive">Aggressive (1.5kg per week)</option>
                </select>
                {timeframe === 'aggressive' && (
                  <p className="text-amber-600 mt-2 text-sm">Aggressive goals may be harder to maintain. We recommend a moderate approach for sustainable results.</p>
                )}
              </div>

              <div>
                <h2 className="text-lg font-medium mb-4">Focus areas (select all that apply)</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {['Lose fat', 'Build muscle', 'Improve strength', 'Improve endurance', 'Better nutrition', 'Better sleep'].map(area => (
                    <div 
                      key={area}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        focusArea.includes(area) ? 'bg-primary-100 border-primary-500' : 'border-gray-200 hover:bg-gray-50'
                      }`}
                      onClick={() => handleFocusAreaToggle(area)}
                    >
                      {area}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8">
              <Button type="submit">Save Goals</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}