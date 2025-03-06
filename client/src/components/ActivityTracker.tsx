
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { FitnessTracker } from "../lib/data";

interface Activity {
  type: string;
  duration: number;
  calories: number;
  date: Date;
}

export function ActivityTracker() {
  const [tracker] = useState<FitnessTracker>(() => new FitnessTracker());
  const [activities, setActivities] = useState<Activity[]>([]);
  const [type, setType] = useState('');
  const [duration, setDuration] = useState('');
  const [calories, setCalories] = useState('');

  useEffect(() => {
    // Load activities from the tracker on component mount
    setActivities(tracker.getActivities());
  }, [tracker]);

  const addActivity = () => {
    if (!type || !duration || !calories) return;
    
    tracker.addActivity(type, duration, calories);
    setActivities(tracker.getActivities());
    
    // Clear form
    setType('');
    setDuration('');
    setCalories('');
  };

  const calculateTotalCalories = () => {
    return activities.reduce((total, activity) => {
      return total + (activity.calories || 0);
    }, 0);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Activity Tracker</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 mb-4">
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="type">Activity Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger id="type">
                <SelectValue placeholder="Select activity type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Running">Running</SelectItem>
                <SelectItem value="Walking">Walking</SelectItem>
                <SelectItem value="Cycling">Cycling</SelectItem>
                <SelectItem value="Swimming">Swimming</SelectItem>
                <SelectItem value="Weight Training">Weight Training</SelectItem>
                <SelectItem value="HIIT">HIIT</SelectItem>
                <SelectItem value="Yoga">Yoga</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="duration">Duration (minutes)</Label>
            <Input
              id="duration"
              type="number"
              min="1"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="Duration in minutes"
            />
          </div>
          
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="calories">Calories Burned</Label>
            <Input
              id="calories"
              type="number"
              min="0"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              placeholder="Estimated calories"
            />
          </div>
          
          <Button onClick={addActivity} className="w-full">
            Add Activity
          </Button>
        </div>
        
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-2">Recent Activities</h3>
          
          {activities.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No activities recorded yet</p>
          ) : (
            <>
              <ul className="divide-y divide-gray-200">
                {activities.map((activity, index) => (
                  <li key={index} className="py-3">
                    <div className="flex justify-between">
                      <div>
                        <span className="font-medium">{activity.type}</span>
                        <p className="text-sm text-gray-500">
                          {activity.duration} min • {activity.calories} cal
                        </p>
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(activity.date).toLocaleDateString()}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              
              <div className="mt-4 pt-3 border-t border-gray-200">
                <div className="flex justify-between">
                  <span className="font-medium">Total Calories Burned:</span>
                  <span className="font-bold">{calculateTotalCalories()} cal</span>
                </div>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
