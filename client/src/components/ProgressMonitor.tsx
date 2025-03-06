
import React, { useMemo } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer 
} from 'recharts';
import { projectNonLinearWeightLoss } from '../lib/fitness-calculations';

interface ProgressMonitorProps {
  bodyStats: Array<{
    date: string;
    weight: number;
    bodyFat?: number;
  }>;
  startWeight: number;
  targetWeight: number;
  timeFrameWeeks: number;
  startDate: string;
}

// Calculate a smoothed trend line from noisy weight data
function calculateWeightTrend(weights: number[]): number[] {
  // Use exponential moving average for trend calculation
  const alpha = 0.1; // Smoothing factor
  const trend: number[] = [];
  
  if (weights.length === 0) return trend;
  
  trend.push(weights[0]);
  
  for (let i = 1; i < weights.length; i++) {
    const newTrend = alpha * weights[i] + (1 - alpha) * trend[i-1];
    trend.push(newTrend);
  }
  
  return trend;
}

export function ProgressMonitor({ 
  bodyStats, 
  startWeight, 
  targetWeight, 
  timeFrameWeeks,
  startDate 
}: ProgressMonitorProps) {
  // Calculate projected weight loss trajectory
  const projectedData = useMemo(() => {
    const { weeklyWeights } = projectNonLinearWeightLoss(
      startWeight,
      targetWeight,
      timeFrameWeeks,
      true // Include water weight loss
    );
    
    // Convert to chart data format
    const startDateObj = new Date(startDate);
    
    return weeklyWeights.map((weight, index) => {
      const weekDate = new Date(startDateObj);
      weekDate.setDate(weekDate.getDate() + index * 7);
      
      return {
        date: weekDate.toISOString().split('T')[0],
        projectedWeight: parseFloat(weight.toFixed(1))
      };
    });
  }, [startWeight, targetWeight, timeFrameWeeks, startDate]);
  
  // Prepare actual weight data
  const actualData = useMemo(() => {
    if (!bodyStats || bodyStats.length === 0) return [];
    
    // Sort by date
    const sortedStats = [...bodyStats].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    // Extract weights for trend calculation
    const weights = sortedStats.map(stat => stat.weight);
    const trendWeights = calculateWeightTrend(weights);
    
    // Combine dates with weights and trends
    return sortedStats.map((stat, index) => ({
      date: stat.date.split('T')[0],
      actualWeight: stat.weight,
      trendWeight: parseFloat(trendWeights[index].toFixed(1))
    }));
  }, [bodyStats]);
  
  // Combine actual and projected data for the chart
  const chartData = useMemo(() => {
    // Create a map of all dates from both datasets
    const dateMap = new Map();
    
    // Add projected data to the map
    projectedData.forEach(item => {
      dateMap.set(item.date, { 
        date: item.date,
        projectedWeight: item.projectedWeight
      });
    });
    
    // Add or update with actual data
    actualData.forEach(item => {
      if (dateMap.has(item.date)) {
        const existing = dateMap.get(item.date);
        dateMap.set(item.date, { 
          ...existing, 
          actualWeight: item.actualWeight,
          trendWeight: item.trendWeight
        });
      } else {
        dateMap.set(item.date, {
          date: item.date,
          actualWeight: item.actualWeight,
          trendWeight: item.trendWeight
        });
      }
    });
    
    // Convert map to array and sort by date
    return Array.from(dateMap.values())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [projectedData, actualData]);
  
  // Calculate if user is on track
  const progressAssessment = useMemo(() => {
    if (actualData.length < 7) {
      return { status: "gathering", message: "Gathering data... Log your weight daily for more accurate tracking." };
    }
    
    // Look at the trend of the last 2 weeks
    const recentTrend = actualData.slice(-14);
    if (recentTrend.length < 7) {
      return { status: "gathering", message: "Gathering data... Log your weight daily for more accurate tracking." };
    }
    
    // Calculate average weekly loss from trend
    const weeklyLoss = (recentTrend[0].trendWeight - recentTrend[recentTrend.length - 1].trendWeight) / 
                       (recentTrend.length / 7);
    
    // Expected weekly loss
    const expectedWeeklyLoss = (startWeight - targetWeight) / timeFrameWeeks;
    
    // Compare actual to expected
    const ratio = weeklyLoss / expectedWeeklyLoss;
    
    if (ratio < 0.5) {
      return { 
        status: "slow", 
        message: "Progress is slower than planned. Consider adjusting your calories or increasing activity."
      };
    } else if (ratio > 1.5) {
      return { 
        status: "fast", 
        message: "Progress is faster than planned. This may be unsustainable - consider increasing calories slightly."
      };
    } else {
      return { 
        status: "on-track", 
        message: "You're on track with your weight loss goals. Keep going!"
      };
    }
    
  }, [actualData, startWeight, targetWeight, timeFrameWeeks]);
  
  if (chartData.length === 0) {
    return <div className="text-center p-6">No data available yet. Start logging your weight!</div>;
  }
  
  return (
    <div className="rounded-lg border p-4 mb-6">
      <h2 className="text-xl font-semibold mb-4">Weight Loss Progress</h2>
      
      <div className="mb-4 p-3 rounded border-l-4 border-l-blue-500 bg-blue-50">
        <p className="text-sm">{progressAssessment.message}</p>
      </div>
      
      <div className="h-64 md:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={['auto', 'auto']} />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="projectedWeight" 
              stroke="#8884d8" 
              strokeDasharray="5 5"
              name="Projected Weight"
              dot={false}
            />
            <Line 
              type="monotone" 
              dataKey="actualWeight" 
              stroke="#82ca9d" 
              name="Daily Weight"
              dot={{ r: 3 }}
            />
            <Line 
              type="monotone" 
              dataKey="trendWeight" 
              stroke="#ff7300" 
              name="Weight Trend"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 text-sm text-gray-600">
        <p>• Daily weight fluctuations are normal due to water, sodium, food timing, etc.</p>
        <p>• The trend line shows your true fat loss progress by smoothing out daily fluctuations.</p>
        <p>• Focus on the trend, not daily weights. Fat loss is not linear!</p>
      </div>
    </div>
  );
}
