
import React, { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent } from "@/components/ui/card";

interface ProgressData {
  date: string;
  weight: number;
  bodyFat?: number;
  muscleMass?: number;
}

export default function Progress() {
  const [chartData, setChartData] = useState<ProgressData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Replace with actual API call to fetch user progress data
    const fetchData = async () => {
      setLoading(true);
      
      // Mock data for demonstration
      const mockData = [
        { date: "Jan 1", weight: 85, bodyFat: 22, muscleMass: 35 },
        { date: "Jan 8", weight: 84, bodyFat: 21.5, muscleMass: 35.2 },
        { date: "Jan 15", weight: 83.2, bodyFat: 21, muscleMass: 35.3 },
        { date: "Jan 22", weight: 82.5, bodyFat: 20.5, muscleMass: 35.5 },
        { date: "Jan 29", weight: 81.8, bodyFat: 20, muscleMass: 35.6 },
      ];
      
      setChartData(mockData);
      setLoading(false);
    };
    
    fetchData();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Your Progress</h1>
      <p className="text-gray-600 mb-6">Track your fitness transformation journey over time</p>
      
      <Card className="mb-6">
        <CardContent className="p-5">
          <h2 className="text-lg font-medium mb-4">Progress Chart</h2>
          {loading ? (
            <p>Loading your progress data...</p>
          ) : chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="weight" stroke="#8884d8" name="Weight (kg)" />
                <Line type="monotone" dataKey="bodyFat" stroke="#82ca9d" name="Body Fat (%)" />
                <Line type="monotone" dataKey="muscleMass" stroke="#ffc658" name="Muscle Mass (kg)" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500">No data available yet. Keep logging your stats to see your progress.</p>
          )}
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium mb-2">Weight Change</h3>
            <p className="text-2xl font-bold text-primary-600">-3.2 kg</p>
            <p className="text-sm text-gray-500">Since you started</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium mb-2">Body Fat</h3>
            <p className="text-2xl font-bold text-primary-600">-2.0%</p>
            <p className="text-sm text-gray-500">Since you started</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium mb-2">Muscle Mass</h3>
            <p className="text-2xl font-bold text-primary-600">+0.6 kg</p>
            <p className="text-sm text-gray-500">Since you started</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
