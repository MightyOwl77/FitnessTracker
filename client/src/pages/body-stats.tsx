
import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBodyStats } from "@/hooks/use-user-data";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from "date-fns";

export default function BodyStats() {
  const [date, setDate] = useState<Date>(new Date());
  const [weight, setWeight] = useState<string>("");
  const [bodyFat, setBodyFat] = useState<string>("");
  const [muscleMass, setMuscleMass] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  
  const { statData, statsData, isLoading, saveStat, isSaving } = useBodyStats(date);
  
  // Set form values from stat data when available
  useState(() => {
    if (statData) {
      setWeight(String(statData.weight || ""));
      setBodyFat(String(statData.bodyFat || ""));
      setMuscleMass(String(statData.muscleMass || ""));
      setNotes(statData.notes || "");
    }
  });
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    saveStat({
      date,
      weight: Number(weight),
      bodyFat: bodyFat ? Number(bodyFat) : undefined,
      muscleMass: muscleMass ? Number(muscleMass) : undefined,
      notes: notes || undefined
    });
  };
  
  // Format data for chart
  const chartData = statsData.map(stat => ({
    date: format(new Date(stat.date), 'MM/dd'),
    weight: stat.weight,
    bodyFat: stat.bodyFat,
    muscleMass: stat.muscleMass
  })).reverse();
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Body Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="md:grid md:grid-cols-2 gap-6">
            <div>
              <Calendar
                mode="single"
                selected={date}
                onSelect={(date) => date && setDate(date)}
                className="rounded-md border mb-4"
              />
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="bodyFat">Body Fat (%)</Label>
                  <Input
                    id="bodyFat"
                    type="number"
                    step="0.1"
                    value={bodyFat}
                    onChange={(e) => setBodyFat(e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="muscleMass">Muscle Mass (kg)</Label>
                  <Input
                    id="muscleMass"
                    type="number"
                    step="0.1"
                    value={muscleMass}
                    onChange={(e) => setMuscleMass(e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                </div>
                
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Stats"}
                </Button>
              </form>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Progress Chart</h3>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="weight" stroke="#8884d8" name="Weight (kg)" />
                    {chartData.some(d => d.bodyFat) && (
                      <Line type="monotone" dataKey="bodyFat" stroke="#82ca9d" name="Body Fat (%)" />
                    )}
                    {chartData.some(d => d.muscleMass) && (
                      <Line type="monotone" dataKey="muscleMass" stroke="#ffc658" name="Muscle Mass (kg)" />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-gray-500">No data available yet. Add some stats to see your progress.</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
