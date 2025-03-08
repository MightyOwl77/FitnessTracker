import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select } from './ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { toast } from '@/hooks/use-toast';
import { useIsIOS } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface Activity {
  type: string;
  duration: string;
}

export function ActivityTracker() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [activityType, setActivityType] = useState('running');
  const [duration, setDuration] = useState('');
  const isIOS = useIsIOS();

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
    
    // Show success message with iOS-optimized appearance
    toast({
      title: "Success!",
      description: "Activity added.",
      variant: "default",
      className: isIOS ? "ios-toast" : ""
    });
    
    // Clear duration field
    setDuration('');
  }

  return (
    <Card className={cn(
      "w-full max-w-md mx-auto",
      isIOS && "ios-card rounded-xl shadow-sm"
    )}>
      <CardHeader>
        <CardTitle className={isIOS ? "text-xl" : ""}>Activity Tracker</CardTitle>
        <CardDescription>Log your daily activities to create your calorie deficit while eating at maintenance</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label 
                htmlFor="type" 
                className={cn(
                  "block text-sm font-medium mb-1",
                  isIOS && "mb-2"
                )}
              >
                Activity Type
              </label>
              <select 
                id="type" 
                className={cn(
                  "w-full px-3 py-2 border rounded-md",
                  isIOS && "appearance-none ios-element min-h-[44px] text-base px-4 py-3 rounded-lg"
                )}
                value={activityType}
                onChange={(e) => setActivityType(e.target.value)}
                style={isIOS ? { fontSize: '16px' } : undefined}
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
              <label 
                htmlFor="duration" 
                className={cn(
                  "block text-sm font-medium mb-1",
                  isIOS && "mb-2"
                )}
              >
                Duration (minutes)
              </label>
              <Input 
                id="duration" 
                type="number" 
                inputMode="numeric"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="Enter duration"
                // iOS specific attributes for better number input
                pattern={isIOS ? "[0-9]*" : undefined}
                min={isIOS ? "1" : undefined}
              />
            </div>
            
            <Button 
              id="add-btn" 
              onClick={addActivity}
              className={cn(
                "w-full",
                isIOS && "ios-button h-12"
              )}
              // Use iOS-specific variant if available
              variant={isIOS ? "ios" : "default"}
              size={isIOS ? "ios" : "default"}
            >
              Add Activity
            </Button>
            
            <p className={cn(
              "text-xs text-muted-foreground mt-2",
              isIOS && "text-sm"
            )}>
              <strong>Recommended approach:</strong> Create your deficit through activity while eating your full maintenance calories
            </p>
          </div>
          
          <div>
            <h3 className={cn(
              "text-sm font-medium mb-2",
              isIOS && "text-[15px]"
            )}>
              Recent Activities
            </h3>
            {activities.length === 0 ? (
              <p className={cn(
                "text-sm text-muted-foreground",
                isIOS && "text-base"
              )}>
                No activities logged yet
              </p>
            ) : (
              <ul id="list" className={cn(
                "space-y-1",
                isIOS && "rounded-lg overflow-hidden border border-gray-200"
              )}>
                {activities.map((activity, index) => (
                  <li 
                    key={index} 
                    className={cn(
                      "text-sm",
                      isIOS && "ios-list-item py-3 px-4 bg-white border-b last:border-0 text-base"
                    )}
                  >
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