import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ActivityTracker } from "@/components/ActivityTracker";

export function DailyLog() {
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [weight, setWeight] = useState<string>("");
  const [calories, setCalories] = useState<string>("");
  const [workout, setWorkout] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [mood, setMood] = useState<string>("");
  const [sleep, setSleep] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement saving daily log to backend
    console.log("Submitting daily log:", { date, weight, calories, workout, notes, mood, sleep });
    // Show success feedback
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Daily Log</h1>
      <p className="text-gray-600 mb-6">
        Track your daily progress to stay on course with your goals. Aim to eat at your maintenance calories
        (BMR × activity level) and create your calorie deficit through physical activity.
      </p>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div>
                <label htmlFor="date" className="block text-sm font-medium mb-2">
                  Date
                </label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="max-w-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="weight" className="block text-sm font-medium mb-2">
                    Weight (kg)
                  </label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="Your weight today"
                    className="max-w-xs"
                  />
                </div>

                <div>
                  <label htmlFor="calories" className="block text-sm font-medium mb-2">
                    Calories Consumed
                  </label>
                  <div className="space-y-1">
                    <Input
                      id="calories"
                      type="number"
                      value={calories}
                      onChange={(e) => setCalories(e.target.value)}
                      placeholder="Total calories"
                      className="max-w-xs"
                    />
                    <p className="text-xs text-muted-foreground">
                      Aim to eat at your maintenance calories for best results
                    </p>
                  </div>
                </div>

                <div>
                  <label htmlFor="sleep" className="block text-sm font-medium mb-2">
                    Sleep Duration (hours)
                  </label>
                  <Input
                    id="sleep"
                    type="number"
                    step="0.5"
                    value={sleep}
                    onChange={(e) => setSleep(e.target.value)}
                    placeholder="Hours of sleep"
                    className="max-w-xs"
                  />
                </div>

                <div>
                  <label htmlFor="mood" className="block text-sm font-medium mb-2">
                    Mood
                  </label>
                  <select
                    id="mood"
                    value={mood}
                    onChange={(e) => setMood(e.target.value)}
                    className="w-full max-w-xs p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select mood</option>
                    <option value="great">Great</option>
                    <option value="good">Good</option>
                    <option value="neutral">Neutral</option>
                    <option value="poor">Poor</option>
                    <option value="bad">Bad</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="workout" className="block text-sm font-medium mb-2">
                  Workout Completed
                </label>
                <Textarea
                  id="workout"
                  value={workout}
                  onChange={(e) => setWorkout(e.target.value)}
                  placeholder="Describe your workout (exercises, sets, reps)"
                  rows={3}
                />
              </div>

              <div>
                <label htmlFor="notes" className="block text-sm font-medium mb-2">
                  Notes
                </label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="How do you feel today? Any challenges or wins?"
                  rows={3}
                />
              </div>
            </div>

            <div className="mt-8">
              <Button type="submit">Save Daily Log</Button>
            </div>
          </form>
          
          {/* Activity Tracker */}
          <div className="mt-10 pt-6 border-t">
            <h2 className="text-xl font-semibold mb-4">Activity Tracking</h2>
            <ActivityTracker />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}