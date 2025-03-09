import React from 'react';
import { Suspense } from 'react';
import Loader from '@/components/ui/loader';
import { useLocation } from "wouter";

// This bridge component resolves conflicts between different versions of the Onboarding component
export default function Onboarding() {
  const [_, setLocation] = useLocation();

  // Since we can't directly import from the root directory due to the file structure,
  // we'll use the pages version for now and clean up the structure later
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
        <div className="container mx-auto px-4 py-8 max-w-3xl">
          <h1 className="text-3xl font-bold text-green-800 mb-6">
            Welcome to Your Fitness Transformation
          </h1>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <p className="text-gray-700 mb-4">
              Loading your personalized fitness journey...
            </p>
            <div className="flex justify-center my-8">
              <Loader size="large" message="Loading your personalized onboarding..." />
            </div>
          </div>
        </div>
      </div>
    }>
      {/* We'll redirect to the pages version for now */}
      {React.useEffect(() => {
        setLocation("/onboarding");
      }, [])}
      <div></div>
    </Suspense>
  );
}