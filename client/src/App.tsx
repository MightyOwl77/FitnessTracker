
import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Dashboard } from './pages/dashboard';
import { UserData } from './pages/user-data';
import { SetGoals } from './pages/set-goals';
import { DailyLog } from './pages/daily-log';
import { Progress } from './pages/progress';
import { Sidebar } from './components/ui/sidebar';
import { MobileNav } from './components/ui/mobile-nav';
import { WelcomeModal } from './components/onboarding/welcome-modal';
import { queryClient } from './lib/queryClient';

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar className="hidden md:block" />
      <div className="flex-1 flex flex-col">
        <main className="flex-1 px-4 md:px-8 py-6 pb-20 md:pb-6">
          {children}
        </main>
        <MobileNav className="md:hidden" />
      </div>
    </div>
  );
}

function App() {
  const [isFirstVisit, setIsFirstVisit] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  
  useEffect(() => {
    // Check if this is the first visit
    const hasVisited = localStorage.getItem('hasVisited');
    if (!hasVisited) {
      setIsFirstVisit(true);
      setShowWelcome(true);
      localStorage.setItem('hasVisited', 'true');
    }
  }, []);
  
  const handleWelcomeComplete = () => {
    setShowWelcome(false);
  };
  
  const handleWelcomeDismiss = () => {
    setShowWelcome(false);
  };
  
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {showWelcome && (
          <WelcomeModal 
            onComplete={handleWelcomeComplete}
            onDismiss={handleWelcomeDismiss}
          />
        )}
        <Routes>
          <Route 
            path="/" 
            element={
              <AppLayout>
                <Dashboard />
              </AppLayout>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <AppLayout>
                <UserData />
              </AppLayout>
            } 
          />
          <Route 
            path="/goals" 
            element={
              <AppLayout>
                <SetGoals />
              </AppLayout>
            } 
          />
          <Route 
            path="/log" 
            element={
              <AppLayout>
                <DailyLog />
              </AppLayout>
            } 
          />
          <Route 
            path="/progress" 
            element={
              <AppLayout>
                <Progress />
              </AppLayout>
            } 
          />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
