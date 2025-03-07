
import React from "react";
import { Illustration } from "./illustration";

export const IllustrationTest: React.FC = () => {
  return (
    <div className="flex flex-col items-center space-y-6 p-4">
      <h2 className="text-2xl font-bold">Illustrations Test</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="flex flex-col items-center">
          <h3>Welcome</h3>
          <Illustration name="welcome" />
        </div>
        
        <div className="flex flex-col items-center">
          <h3>Body Composition</h3>
          <Illustration name="bodyComposition" />
        </div>
        
        <div className="flex flex-col items-center">
          <h3>Workout Plan</h3>
          <Illustration name="workoutPlan" />
        </div>
        
        <div className="flex flex-col items-center">
          <h3>Progress</h3>
          <Illustration name="progress" />
        </div>
      </div>
    </div>
  );
};
