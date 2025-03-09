import React from 'react';
import { lazy, Suspense } from 'react';
import Loader from '@/components/ui/loader';

// This file serves as a re-export of the actual Onboarding component from pages
// to resolve import confusion and maintain backward compatibility

// Lazy load the actual Onboarding component
const OnboardingPage = lazy(() => import('@/pages/onboarding'));

export default function Onboarding() {
  return (
    <Suspense fallback={<Loader fullScreen message="Loading onboarding..." />}>
      <OnboardingPage />
    </Suspense>
  );
}