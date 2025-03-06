import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select } from './ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { toast } from '@/hooks/use-toast';

interface Activity {
  type: string;
  duration: string;
}

export function ActivityTracker() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [activityType, setActivityType] = useState('running');
  const [duration, setDuration] = useState('');

  function addActivity() {
    if (!activityType || !duration) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    const newActivity = { 
      type: activityType, 
      duration 
    };
    
    setActivities([...activities, newActivity]);
    
    // Show success message
    toast({
      title: "Success!",
      description: "Activity added.",
      variant: "default",
    });
    
    // Clear duration field
    setDuration('');
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Activity Tracker</CardTitle>
        <CardDescription>Log your daily activities</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label htmlFor="type" className="block text-sm font-medium mb-1">
                Activity Type
              </label>
              <select 
                id="type" 
                className="w-full px-3 py-2 border rounded-md"
                value={activityType}
                onChange={(e) => setActivityType(e.target.value)}
              >
                <option value="running">Running</option>
                <option value="walking">Walking</option>
                <option value="cycling">Cycling</option>
                <option value="swimming">Swimming</option>
                <option value="weight-training">Weight Training</option>
                <option value="yoga">Yoga</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="duration" className="block text-sm font-medium mb-1">
                Duration (minutes)
              </label>
              <Input 
                id="duration" 
                type="number" 
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="Enter duration"
              />
            </div>
            
            <Button 
              id="add-btn" 
              onClick={addActivity}
              className="w-full"
            >
              Add Activity
            </Button>
          </div>
          
          <div>
            <h3 className="text-sm font-medium mb-2">Recent Activities</h3>
            {activities.length === 0 ? (
              <p className="text-sm text-muted-foreground">No activities logged yet</p>
            ) : (
              <ul id="list" className="space-y-1">
                {activities.map((activity, index) => (
                  <li key={index} className="text-sm">
                    {activity.type} - {activity.duration} min
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}