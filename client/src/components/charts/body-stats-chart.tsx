import { useMemo } from "react";
import { format } from "date-fns";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { BodyStat } from "@shared/schema";

interface BodyStatsChartProps {
  data: BodyStat[];
}

export function BodyStatsChart({ data }: BodyStatsChartProps) {
  // Process data for the chart
  const chartData = useMemo(() => {
    // Sort data by date (oldest first)
    return [...data]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((stat) => ({
        date: format(new Date(stat.date), "MMM d"),
        weight: stat.weight,
        bodyFat: stat.bodyFat || null,
        muscleMass: stat.muscleMass || null,
      }));
  }, [data]);

  // Check if we have body fat or muscle mass data to display
  const hasBodyFat = data.some((stat) => stat.bodyFat !== null && stat.bodyFat !== undefined);
  const hasMuscleMass = data.some((stat) => stat.muscleMass !== null && stat.muscleMass !== undefined);

  // Calculate the domain for weight (Y-axis) to make small changes more visible
  const weightValues = data.map((stat) => stat.weight);
  const minWeight = Math.min(...weightValues);
  const maxWeight = Math.max(...weightValues);
  // Add some padding to the min/max
  const weightDomain = [
    Math.max(0, minWeight - (maxWeight - minWeight) * 0.2), // Don't go below 0, and add 20% padding
    maxWeight + (maxWeight - minWeight) * 0.2
  ];

  // Similar calculations for body fat and muscle mass if data exists
  let bodyFatDomain = [0, 50]; // Default range
  let muscleMassDomain = [0, 50]; // Default range
  
  if (hasBodyFat) {
    const bodyFatValues = data
      .filter((stat) => stat.bodyFat !== null && stat.bodyFat !== undefined)
      .map((stat) => stat.bodyFat!);
    const minBodyFat = Math.min(...bodyFatValues);
    const maxBodyFat = Math.max(...bodyFatValues);
    bodyFatDomain = [
      Math.max(0, minBodyFat - (maxBodyFat - minBodyFat) * 0.2),
      maxBodyFat + (maxBodyFat - minBodyFat) * 0.2
    ];
  }
  
  if (hasMuscleMass) {
    const muscleMassValues = data
      .filter((stat) => stat.muscleMass !== null && stat.muscleMass !== undefined)
      .map((stat) => stat.muscleMass!);
    const minMuscleMass = Math.min(...muscleMassValues);
    const maxMuscleMass = Math.max(...muscleMassValues);
    muscleMassDomain = [
      Math.max(0, minMuscleMass - (maxMuscleMass - minMuscleMass) * 0.2),
      maxMuscleMass + (maxMuscleMass - minMuscleMass) * 0.2
    ];
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={chartData}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="date" 
          padding={{ left: 10, right: 10 }}
        />
        <YAxis 
          yAxisId="weight" 
          domain={weightDomain} 
          tickFormatter={(value) => `${value}`}
          label={{ value: 'Weight (kg)', angle: -90, position: 'insideLeft' }}
        />
        {hasBodyFat && (
          <YAxis
            yAxisId="bodyFat"
            orientation="right"
            domain={bodyFatDomain}
            tickFormatter={(value) => `${value}%`}
            label={{ value: 'Body Fat (%)', angle: 90, position: 'insideRight' }}
          />
        )}
        {hasMuscleMass && (
          <YAxis
            yAxisId="muscleMass"
            orientation="right"
            domain={muscleMassDomain}
            tickFormatter={(value) => `${value}`}
            label={{ value: 'Muscle (kg)', angle: 90, position: 'insideRight' }}
            hide // Hide this axis to avoid clutter, since we already have two Y axes
          />
        )}
        <Tooltip 
          formatter={(value, name) => {
            if (name === "weight") return [`${value} kg`, "Weight"];
            if (name === "bodyFat") return [`${value}%`, "Body Fat"];
            if (name === "muscleMass") return [`${value} kg`, "Muscle Mass"];
            return [value, name];
          }}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="weight"
          stroke="rgb(16, 185, 129)" // primary-600
          strokeWidth={2}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
          yAxisId="weight"
          connectNulls
          name="Weight"
        />
        {hasBodyFat && (
          <Line
            type="monotone"
            dataKey="bodyFat"
            stroke="rgb(249, 115, 22)" // orange-500
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
            yAxisId="bodyFat"
            connectNulls
            name="Body Fat"
          />
        )}
        {hasMuscleMass && (
          <Line
            type="monotone"
            dataKey="muscleMass"
            stroke="rgb(37, 99, 235)" // blue-600
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
            yAxisId={hasBodyFat ? "muscleMass" : "bodyFat"}
            connectNulls
            name="Muscle Mass"
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
}
