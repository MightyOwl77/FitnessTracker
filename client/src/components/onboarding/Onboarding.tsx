
import React, { useEffect } from 'react';
import { Suspense } from 'react';
import Loader from '@/components/ui/loader';
import { useLocation } from "wouter";
import { useAuth } from '@/contexts/auth-context';

// This component serves as a bridge to handle the onboarding process
export default function Onboarding() {
  const [_, setLocation] = useLocation();
  const { hasCompletedOnboarding } = useAuth();

  // Use effect for navigation without returning JSX directly from hooks
  useEffect(() => {
    // If user has already completed onboarding, redirect to dashboard
    if (hasCompletedOnboarding) {
      setLocation("/dashboard");
      return;
    }

    // Redirect to the onboarding page with a short delay to ensure component mounts
    const redirectTimer = setTimeout(() => {
      console.log("Redirecting to onboarding page...");
      setLocation("/onboarding");
    }, 100);
    
    return () => clearTimeout(redirectTimer);
  }, [setLocation, hasCompletedOnboarding]);

  // Since we can't directly import from the root directory due to the file structure,
  // we'll use a loading state that will redirect to the pages version
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
      <div>
        {/* This div renders while the redirect happens */}
        <Loader size="large" message="Preparing your personalized fitness journey..." />
      </div>
    </Suspense>
  );
}
