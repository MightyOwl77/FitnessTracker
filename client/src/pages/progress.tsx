import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { LoadingState, ErrorState } from "@/components/ui/loading-state";
import { useUserGoal, useUserProfile } from "@/hooks/use-user-data";
import { fetchBodyStats } from "@/lib/api";
import { format, subDays } from "date-fns";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  ReferenceLine
} from "recharts";
import { ArrowDown, ArrowUp, HelpCircle, Scale, BarChart } from "lucide-react";

interface BodyStatData {
  date: string;
  weight: number;
  bodyFat?: number;
  leanMass?: number;
  muscleMass?: number;
}

export default function Progress() {
  const { profileData, isLoading: isProfileLoading } = useUserProfile();
  const { goalData, isLoading: isGoalLoading } = useUserGoal();
  const [bodyStatsData, setBodyStatsData] = useState<BodyStatData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'1m' | '3m' | 'all'>('1m');

  useEffect(() => {
    async function loadBodyStats() {
      try {
        setIsLoading(true);
        const data = await fetchBodyStats();
        
        // Transform data for charts
        const formattedData = data.map((stat: any) => ({
          date: format(new Date(stat.date), 'MMM dd'),
          weight: stat.weight,
          bodyFat: stat.bodyFat,
          leanMass: stat.leanMass,
          muscleMass: stat.muscleMass,
          rawDate: new Date(stat.date) // For filtering
        }));
        
        // Sort by date ascending
        formattedData.sort((a: any, b: any) => a.rawDate.getTime() - b.rawDate.getTime());
        
        setBodyStatsData(formattedData);
        setError(null);
      } catch (err) {
        console.error("Error fetching body stats:", err);
        setError("Failed to load progress data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }
    
    loadBodyStats();
  }, []);

  if (isLoading || isProfileLoading || isGoalLoading) {
    return <LoadingState message="Loading your progress data..." />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  // Filter data based on selected time range
  const getFilteredData = () => {
    if (timeRange === 'all' || bodyStatsData.length === 0) {
      return bodyStatsData;
    }
    
    const cutoffDate = timeRange === '1m' 
      ? subDays(new Date(), 30) 
      : subDays(new Date(), 90);
      
    return bodyStatsData.filter((item: any) => 
      item.rawDate >= cutoffDate
    );
  };

  const filteredData = getFilteredData();

  // Calculate stats for summaries
  const calculateChanges = () => {
    if (filteredData.length < 2) {
      return {
        weightChange: 0,
        bodyFatChange: 0,
        muscleMassChange: 0
      };
    }

    const first = filteredData[0];
    const last = filteredData[filteredData.length - 1];

    return {
      weightChange: +(last.weight - first.weight).toFixed(1),
      bodyFatChange: last.bodyFat && first.bodyFat 
        ? +(last.bodyFat - first.bodyFat).toFixed(1) 
        : null,
      muscleMassChange: last.muscleMass && first.muscleMass 
        ? +(last.muscleMass - first.muscleMass).toFixed(1) 
        : null
    };
  };

  const changes = calculateChanges();

  // Generate projection data
  const generateProjectionData = () => {
    if (!goalData || !profileData || filteredData.length === 0) {
      return [];
    }

    const startWeight = profileData.weight;
    const targetWeight = goalData.targetWeight;
    const weeklyLossRate = (goalData.deficitRate / 100) * startWeight;
    const totalWeeks = Math.ceil((startWeight - targetWeight) / weeklyLossRate);
    
    // Use real data for past dates, projections for future
    const lastRealDate = filteredData[filteredData.length - 1].rawDate;
    const startDate = new Date(goalData.createdAt || new Date());
    
    const projectionData = [];
    
    // Week 0 is start weight
    projectionData.push({
      week: 0,
      actualWeight: startWeight,
      projectedWeight: startWeight,
      date: format(startDate, 'MMM dd')
    });
    
    // Generate weekly projections
    for (let i = 1; i <= totalWeeks; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + (i * 7));
      const projectedWeight = Math.max(
        targetWeight, 
        startWeight - (weeklyLossRate * i)
      ).toFixed(1);
      
      // Find actual weight for this week if available
      const actualForThisWeek = date <= lastRealDate 
        ? filteredData.find((d: any) => {
            const weekDiff = Math.round((date.getTime() - d.rawDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
            return Math.abs(weekDiff) <= 1; // Within a week
          })
        : null;
        
      projectionData.push({
        week: i,
        projectedWeight,
        actualWeight: actualForThisWeek ? actualForThisWeek.weight : null,
        date: format(date, 'MMM dd')
      });
    }
    
    return projectionData;
  };

  const projectionData = generateProjectionData();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-2">Your Progress</h1>
      <p className="text-muted-foreground mb-6">
        Track your transformation journey over time
      </p>

      {/* Progress Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Scale className="h-5 w-5 text-primary" />
                <h3 className="font-medium">Weight Change</h3>
              </div>
              <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${
                changes.weightChange < 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {changes.weightChange < 0 ? <ArrowDown className="h-3 w-3 mr-1" /> : <ArrowUp className="h-3 w-3 mr-1" />}
                {Math.abs(changes.weightChange)} kg
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              {changes.weightChange < 0 
                ? "Great progress! Keep going to reach your goal weight."
                : "Building strength! Monitor your body composition to ensure quality gains."}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <BarChart className="h-5 w-5 text-primary" />
                <h3 className="font-medium">Body Fat Change</h3>
              </div>
              {changes.bodyFatChange !== null ? (
                <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${
                  changes.bodyFatChange < 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {changes.bodyFatChange < 0 ? <ArrowDown className="h-3 w-3 mr-1" /> : <ArrowUp className="h-3 w-3 mr-1" />}
                  {Math.abs(changes.bodyFatChange)}%
                </div>
              ) : (
                <span className="text-xs text-muted-foreground">Not tracked</span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {changes.bodyFatChange !== null 
                ? (changes.bodyFatChange < 0 
                  ? "You're losing fat while maintaining muscle mass - ideal progress!"
                  : "Consider adjusting your nutrition and training for better fat loss.")
                : "Start tracking body fat percentage for more insights."}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-primary" />
                <h3 className="font-medium">Next Milestone</h3>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              {filteredData.length > 0 && goalData
                ? `${Math.round((filteredData[filteredData.length - 1].weight - goalData.targetWeight) * 10) / 10} kg to reach your goal weight of ${goalData.targetWeight} kg.`
                : "Set a goal weight to see your next milestone."}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Chart Tabs */}
      <Tabs defaultValue="weight" className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="weight">Weight Trend</TabsTrigger>
            <TabsTrigger value="projection">Goal Projection</TabsTrigger>
            {bodyStatsData.some(data => data.bodyFat !== undefined) && (
              <TabsTrigger value="composition">Body Composition</TabsTrigger>
            )}
          </TabsList>
          
          <div className="flex gap-2">
            <Button
              variant={timeRange === '1m' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange('1m')}
            >
              1M
            </Button>
            <Button
              variant={timeRange === '3m' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange('3m')}
            >
              3M
            </Button>
            <Button
              variant={timeRange === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange('all')}
            >
              All
            </Button>
          </div>
        </div>
        
        <Card>
          <CardContent className="p-6">
            <TabsContent value="weight" className="mt-0">
              <h3 className="text-lg font-medium mb-4">Weight Trend</h3>
              {filteredData.length > 0 ? (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={filteredData}>
                      <defs>
                        <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis 
                        dataKey="date" 
                        tickMargin={10}
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis 
                        domain={['dataMin - 1', 'dataMax + 1']}
                        tick={{ fontSize: 12 }}
                        tickMargin={10}
                      />
                      <Tooltip />
                      <Area 
                        type="monotone" 
                        dataKey="weight" 
                        stroke="#10b981" 
                        fillOpacity={1}
                        fill="url(#weightGradient)"
                        strokeWidth={2}
                        activeDot={{ r: 5 }}
                        name="Weight (kg)"
                      />
                      {goalData && (
                        <ReferenceLine 
                          y={goalData.targetWeight} 
                          stroke="#6366f1" 
                          strokeDasharray="3 3"
                          label={{ 
                            value: `Goal: ${goalData.targetWeight}kg`,
                            position: 'insideBottomRight',
                            fill: '#6366f1',
                            fontSize: 12
                          }}
                        />
                      )}
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[300px] bg-muted/30 rounded-lg">
                  <Scale className="h-10 w-10 text-muted-foreground mb-3" />
                  <p className="text-muted-foreground mb-2">No weight data available yet</p>
                  <Button size="sm" asChild>
                    <a href="/body-stats">Log Your Weight</a>
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="projection" className="mt-0">
              <h3 className="text-lg font-medium mb-4">Goal Projection</h3>
              {projectionData.length > 0 ? (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={projectionData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis 
                        dataKey="date" 
                        tickMargin={10}
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis 
                        domain={['dataMin - 1', 'dataMax + 1']}
                        tick={{ fontSize: 12 }}
                        tickMargin={10}
                      />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="projectedWeight" 
                        stroke="#6366f1" 
                        strokeDasharray="3 3"
                        strokeWidth={2}
                        name="Projected Weight (kg)"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="actualWeight" 
                        stroke="#10b981" 
                        strokeWidth={2}
                        activeDot={{ r: 5 }}
                        name="Actual Weight (kg)"
                      />
                      {goalData && (
                        <ReferenceLine 
                          y={goalData.targetWeight} 
                          stroke="#f43f5e" 
                          strokeDasharray="3 3"
                          label={{ 
                            value: `Goal: ${goalData.targetWeight}kg`,
                            position: 'insideBottomRight',
                            fill: '#f43f5e',
                            fontSize: 12
                          }}
                        />
                      )}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[300px] bg-muted/30 rounded-lg">
                  <BarChart className="h-10 w-10 text-muted-foreground mb-3" />
                  <p className="text-muted-foreground mb-2">No projection data available</p>
                  <Button size="sm" asChild>
                    <a href="/set-goals">Set Your Goals</a>
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="composition" className="mt-0">
              <h3 className="text-lg font-medium mb-4">Body Composition</h3>
              {filteredData.some(data => data.bodyFat !== undefined) ? (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={filteredData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis 
                        dataKey="date" 
                        tickMargin={10}
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis 
                        yAxisId="left"
                        orientation="left"
                        tick={{ fontSize: 12 }}
                        tickMargin={10}
                      />
                      <YAxis 
                        yAxisId="right"
                        orientation="right"
                        tick={{ fontSize: 12 }}
                        tickMargin={10}
                      />
                      <Tooltip />
                      <Line 
                        yAxisId="left"
                        type="monotone" 
                        dataKey="bodyFat" 
                        stroke="#f43f5e" 
                        strokeWidth={2}
                        activeDot={{ r: 5 }}
                        name="Body Fat (%)"
                      />
                      <Line 
                        yAxisId="right"
                        type="monotone" 
                        dataKey="leanMass" 
                        stroke="#6366f1" 
                        strokeWidth={2}
                        activeDot={{ r: 5 }}
                        name="Lean Mass (kg)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[300px] bg-muted/30 rounded-lg">
                  <BarChart className="h-10 w-10 text-muted-foreground mb-3" />
                  <p className="text-muted-foreground mb-2">No body composition data available</p>
                  <Button size="sm" asChild>
                    <a href="/body-stats">Log Body Composition</a>
                  </Button>
                </div>
              )}
            </TabsContent>
          </CardContent>
        </Card>
      </Tabs>

      {/* Insights and Recommendations */}
      <Card className="bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 border-none">
        <CardHeader>
          <CardTitle>Progress Insights</CardTitle>
          <CardDescription>Personalized recommendations based on your data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredData.length > 1 ? (
              <>
                {changes.weightChange < 0 && (
                  <p className="text-sm">
                    <span className="font-medium">👍 Great progress!</span> You've lost {Math.abs(changes.weightChange)}kg.
                    Keep up your current nutrition and activity levels for continued results.
                  </p>
                )}
                
                {changes.weightChange === 0 && (
                  <p className="text-sm">
                    <span className="font-medium">🔄 Weight maintenance:</span> Your weight has been stable.
                    {goalData && currentWeight > goalData.targetWeight 
                      ? " Consider adjusting your calorie deficit to resume progress toward your goal."
                      : " This is ideal if you're focused on maintaining or body recomposition."}
                  </p>
                )}
                
                {changes.weightChange > 0 && (
                  <p className="text-sm">
                    <span className="font-medium">📈 Weight increase:</span> You've gained {changes.weightChange}kg.
                    {changes.muscleMassChange !== null && changes.muscleMassChange > 0 
                      ? " Some of this appears to be muscle mass, which is positive."
                      : " Consider reviewing your nutrition plan to ensure alignment with your goals."}
                  </p>
                )}
                
                {goalData && filteredData.length > 0 && (
                  <p className="text-sm">
                    <span className="font-medium">🎯 Goal projection:</span> At your current rate, you'll reach your goal weight of {goalData.targetWeight}kg 
                    in approximately {Math.max(0, Math.ceil((filteredData[filteredData.length - 1].weight - goalData.targetWeight) / 
                    ((goalData.deficitRate / 100) * filteredData[0].weight)))} weeks.
                  </p>
                )}
              </>
            ) : (
              <p className="text-sm">
                <span className="font-medium">📊 Track consistently:</span> Log your weight and body measurements regularly (at least weekly)
                to get personalized insights and track your progress over time.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}