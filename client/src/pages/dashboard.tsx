
import React from "react";
import { LoadingState } from "@/components/ui/loading-state";

export default function Dashboard() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <p className="text-gray-600 mb-6">Welcome to your fitness transformation journey!</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-2">Today's Plan</h2>
          <p className="text-sm text-gray-500">Your workout and nutrition plan for today</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-2">Progress Tracker</h2>
          <p className="text-sm text-gray-500">Track your transformation journey</p>
        </div>
      </div>
    </div>
  );
}
