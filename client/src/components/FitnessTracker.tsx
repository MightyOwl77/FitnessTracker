
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Activity {
  type: string;
  duration: string;
  calories: string;
  date: Date;
}

export function FitnessTracker() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [type, setType] = useState('');
  const [duration, setDuration] = useState('');
  const [calories, setCalories] = useState('');

  useEffect(() => {
    // Load activities from localStorage on component mount
    const savedActivities = localStorage.getItem('fitness-activities');
    if (savedActivities) {
      try {
        const parsed = JSON.parse(savedActivities, (key, value) => {
          if (key === 'date') return new Date(value);
          return value;
        });
        setActivities(parsed);
      } catch (e) {
        console.error('Error parsing activities from localStorage', e);
      }
    }
  }, []);

  const addActivity = () => {
    if (!type || !duration || !calories) return;
    
    const newActivity = { 
      type, 
      duration, 
      calories, 
      date: new Date() 
    };
    
    const updatedActivities = [...activities, newActivity];
    setActivities(updatedActivities);
    
    // Save to localStorage
    localStorage.setItem('fitness-activities', JSON.stringify(updatedActivities));
    
    // Clear form
    setType('');
    setDuration('');
    setCalories('');
  };

  const deleteActivity = (index: number) => {
    const updatedActivities = activities.filter((_, i) => i !== index);
    setActivities(updatedActivities);
    localStorage.setItem('fitness-activities', JSON.stringify(updatedActivities));
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Fitness Tracker</CardTitle>
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
            <p className="text-muted-foreground text-center py-4">No activities recorded yet</p>
          ) : (
            <ul className="divide-y divide-border">
              {activities.map((activity, index) => (
                <li key={index} className="py-3 flex justify-between items-center">
                  <div>
                    <span className="font-medium">{activity.type}</span>
                    <p className="text-sm text-muted-foreground">
                      {activity.duration} min • {activity.calories} cal
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {new Date(activity.date).toLocaleDateString()}
                    </span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => deleteActivity(index)}
                      className="h-8 w-8 p-0"
                    >
                      ✕
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
