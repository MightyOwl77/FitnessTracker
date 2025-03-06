import React from 'react';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatDate } from '@/lib/utils';
import { brandColors } from '@/lib/brand';

// Define our own BodyStat interface since importing from shared/schema causes issues
interface BodyStat {
  id: number;
  userId: number;
  date: Date | string;
  weight: number;
  bodyFat: number | null;
  leanMass: number | null;
  muscleMass: number | null;
  waistCircumference: number | null;
  createdAt: Date | string;
  notes: string | null;
}

interface BodyStatsChartProps {
  data: BodyStat[];
}

export function BodyStatsChart({ data }: BodyStatsChartProps) {
  // Sort data by date (ascending)
  const sortedData = [...data].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  // Transform data for Recharts
  const chartData = sortedData.map(stat => ({
    date: formatDate(new Date(stat.date)),
    weight: stat.weight,
    bodyFat: stat.bodyFat,
    leanMass: stat.leanMass,
    waistCircumference: stat.waistCircumference
  }));
  
  // Calculate moving average for weight (7-day)
  const calculateMovingAverage = (data: any[], key: string, window: number) => {
    return data.map((item, index) => {
      if (index < window - 1) return { ...item, [`${key}MA`]: item[key] };
      
      let sum = 0;
      for (let i = 0; i < window; i++) {
        sum += data[index - i][key];
      }
      
      return {
        ...item,
        [`${key}MA`]: Number((sum / window).toFixed(1))
      };
    });
  };
  
  const chartDataWithMA = calculateMovingAverage(chartData, 'weight', 7);
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Body Composition Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="weight">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="weight">Weight</TabsTrigger>
            <TabsTrigger value="bodyFat">Body Fat</TabsTrigger>
            <TabsTrigger value="leanMass">Lean Mass</TabsTrigger>
            <TabsTrigger value="measurements">Measurements</TabsTrigger>
          </TabsList>
          
          <TabsContent value="weight" className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartDataWithMA}
                margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  tickMargin={10}
                />
                <YAxis 
                  domain={['dataMin - 1', 'dataMax + 1']}
                  tick={{ fontSize: 12 }}
                  tickMargin={10}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    border: 'none'
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke={brandColors.primary}
                  strokeWidth={2}
                  dot={{ r: 4, strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                  name="Daily Weight"
                />
                <Line
                  type="monotone"
                  dataKey="weightMA"
                  stroke={brandColors.accent}
                  strokeWidth={2}
                  dot={false}
                  name="7-Day Average"
                />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>
          
          <TabsContent value="bodyFat" className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  tickMargin={10}
                />
                <YAxis 
                  domain={['dataMin - 1', 'dataMax + 1']}
                  tick={{ fontSize: 12 }}
                  tickMargin={10}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    border: 'none'
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="bodyFat"
                  stroke={brandColors.error}
                  strokeWidth={2}
                  dot={{ r: 4, strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                  name="Body Fat %"
                />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>
          
          <TabsContent value="leanMass" className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  tickMargin={10}
                />
                <YAxis 
                  domain={['dataMin - 1', 'dataMax + 1']}
                  tick={{ fontSize: 12 }}
                  tickMargin={10}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    border: 'none'
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="leanMass"
                  stroke={brandColors.success}
                  strokeWidth={2}
                  dot={{ r: 4, strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                  name="Lean Mass (kg)"
                />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>
          
          <TabsContent value="measurements" className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  tickMargin={10}
                />
                <YAxis 
                  domain={['dataMin - 1', 'dataMax + 1']}
                  tick={{ fontSize: 12 }}
                  tickMargin={10}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    border: 'none'
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="waistCircumference"
                  stroke={brandColors.info}
                  strokeWidth={2}
                  dot={{ r: 4, strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                  name="Waist (cm)"
                />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
        
        <div className="mt-4 text-sm text-muted-foreground">
          <p className="text-center">
            {data.length === 0 ? (
              "No data available yet. Start tracking your body stats to see trends."
            ) : (
              `Showing data from ${formatDate(new Date(data[0].date))} to ${formatDate(new Date(data[data.length - 1].date))}`
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}