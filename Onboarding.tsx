// Import statements for React, motion, and components used in the Onboarding screen
import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";

export default function Onboarding() {
  const [_, setLocation] = useLocation();

  useEffect(() => {
    console.log("Root Onboarding component - redirecting to pages/onboarding");
    setLocation("/onboarding");
  }, [setLocation]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Loading your personalized plan...</h1>
        <p>Please wait while we prepare your fitness journey.</p>
      </div>
    </div>
  );
}