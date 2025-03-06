
import React from 'react';
import { 
  CalendarIcon, 
  TrendingUpIcon, 
  CheckCircleIcon, 
  XCircleIcon 
} from 'lucide-react';

interface AdherenceTrackerProps {
  startDate: string;
  dailyLogs: Array<{
    date: string;
    caloriesIn: number;
    deficit: number;
  }>;
  dailyCalorieTarget: number;
  weeklyAdherenceTarget?: number; // Percentage compliance target (default 80%)
}

export function AdherenceTracker({
  startDate,
  dailyLogs,
  dailyCalorieTarget,
  weeklyAdherenceTarget = 80
}: AdherenceTrackerProps) {
  // Calculate adherence statistics
  const stats = React.useMemo(() => {
    if (!dailyLogs || dailyLogs.length === 0) {
      return {
        streak: 0,
        weeklyAdherence: 0,
        totalAdherence: 0,
        daysLogged: 0,
        daysOnTarget: 0
      };
    }
    
    // Sort logs by date
    const sortedLogs = [...dailyLogs].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    // Calculate days with logs on target (within 10% of calorie target)
    const daysOnTarget = sortedLogs.filter(log => {
      const targetRange = dailyCalorieTarget * 0.1; // 10% buffer
      return Math.abs(log.caloriesIn - dailyCalorieTarget) <= targetRange;
    }).length;
    
    // Calculate current streak
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Check for logs in consecutive days
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      
      const dateStr = checkDate.toISOString().split('T')[0];
      const hasLog = sortedLogs.some(log => log.date.split('T')[0] === dateStr);
      
      if (hasLog) {
        streak++;
      } else if (i !== 0) { // Allow missing today, but break streak for other missing days
        break;
      }
    }
    
    // Calculate weekly adherence (last 7 days)
    const lastWeekLogs = sortedLogs.filter(log => {
      const logDate = new Date(log.date);
      const daysDiff = (today.getTime() - logDate.getTime()) / (1000 * 3600 * 24);
      return daysDiff <= 7;
    });
    
    const weeklyAdherence = lastWeekLogs.length >= 3 
      ? Math.round((lastWeekLogs.length / 7) * 100) 
      : 0;
    
    // Calculate total adherence since start date
    const startDateObj = new Date(startDate);
    const totalDays = Math.max(
      1, 
      Math.round((today.getTime() - startDateObj.getTime()) / (1000 * 3600 * 24))
    );
    
    const totalAdherence = Math.round((sortedLogs.length / totalDays) * 100);
    
    return {
      streak,
      weeklyAdherence,
      totalAdherence,
      daysLogged: sortedLogs.length,
      daysOnTarget
    };
  }, [dailyLogs, dailyCalorieTarget, startDate]);
  
  // Determine adherence status
  const adherenceStatus = React.useMemo(() => {
    if (stats.weeklyAdherence >= weeklyAdherenceTarget) {
      return {
        label: "On Track",
        color: "bg-green-100 text-green-800",
        icon: CheckCircleIcon
      };
    } else if (stats.weeklyAdherence >= weeklyAdherenceTarget * 0.7) {
      return {
        label: "Needs Attention",
        color: "bg-yellow-100 text-yellow-800",
        icon: TrendingUpIcon
      };
    } else {
      return {
        label: "Off Track",
        color: "bg-red-100 text-red-800",
        icon: XCircleIcon
      };
    }
  }, [stats.weeklyAdherence, weeklyAdherenceTarget]);
  
  const AdherenceIcon = adherenceStatus.icon;
  
  return (
    <div className="rounded-lg border p-4 mb-6">
      <h2 className="text-xl font-semibold mb-4">Adherence Tracking</h2>
      
      <div className={`mb-4 p-3 rounded ${adherenceStatus.color}`}>
        <div className="flex items-center">
          <AdherenceIcon className="h-5 w-5 mr-2" />
          <span className="font-medium">{adherenceStatus.label}</span>
        </div>
        <p className="text-sm mt-1">
          {stats.weeklyAdherence >= weeklyAdherenceTarget
            ? "Great consistency! Your long-term habits are leading to success."
            : `Try to log at least ${weeklyAdherenceTarget}% of days for optimal results`}
        </p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
        <div className="rounded-lg bg-gray-50 p-3">
          <div className="flex items-center">
            <CalendarIcon className="h-5 w-5 mr-2 text-blue-500" />
            <span className="text-sm font-medium">Current Streak</span>
          </div>
          <p className="text-2xl font-bold mt-1">{stats.streak} days</p>
        </div>
        
        <div className="rounded-lg bg-gray-50 p-3">
          <div className="flex items-center">
            <span className="text-sm font-medium">7-Day Consistency</span>
          </div>
          <p className="text-2xl font-bold mt-1">{stats.weeklyAdherence}%</p>
        </div>
        
        <div className="rounded-lg bg-gray-50 p-3">
          <div className="flex items-center">
            <span className="text-sm font-medium">Total Adherence</span>
          </div>
          <p className="text-2xl font-bold mt-1">{stats.totalAdherence}%</p>
        </div>
      </div>
      
      <div className="text-sm text-gray-600 mt-4">
        <p>• Research shows that consistent tracking (even 80% adherence) leads to better outcomes than perfect adherence that's unsustainable.</p>
        <p>• Missing occasional days is normal. Focus on building the tracking habit.</p>
        <p>• Your body composition changes reflect your consistent habits, not your perfect days.</p>
      </div>
    </div>
  );
}
