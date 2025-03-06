
import { useEffect, useState } from 'react';
import { Switch, Route } from 'wouter';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { Toaster } from './components/ui/toaster';
import Header from './components/shared/header';
import { MobileNav } from './components/ui/mobile-nav';
import { useIsMobile } from './hooks/use-mobile';

// Import pages
import UserData from './pages/user-data';
import { SetGoals } from './pages/set-goals';
import { DailyLog } from './pages/daily-log';
import BodyStats from './pages/body-stats';
import ViewPlan from './pages/view-plan';
import NotFound from './pages/not-found';
import { Progress } from './pages/progress';

function AppLayout({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();

  return (
    <div className="flex flex-col min-h-screen pb-16 md:pb-0">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6">
        {children}
      </main>
      {isMobile && <MobileNav />}
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-background font-sans antialiased">
        <Switch>
          <Route path="/" component={() => (
            <AppLayout>
              <ViewPlan />
            </AppLayout>
          )} />
          <Route path="/user-data" component={() => (
            <AppLayout>
              <UserData />
            </AppLayout>
          )} />
          <Route path="/set-goals" component={() => (
            <AppLayout>
              <SetGoals />
            </AppLayout>
          )} />
          <Route path="/view-plan" component={() => (
            <AppLayout>
              <ViewPlan />
            </AppLayout>
          )} />
          <Route path="/daily-log" component={() => (
            <AppLayout>
              <DailyLog />
            </AppLayout>
          )} />
          <Route path="/body-stats" component={() => (
            <AppLayout>
              <BodyStats />
            </AppLayout>
          )} />
          <Route path="/progress" component={() => (
            <AppLayout>
              <Progress />
            </AppLayout>
          )} />
          <Route component={() => (
            <AppLayout>
              <NotFound />
            </AppLayout>
          )} />
        </Switch>
        <Toaster />
      </div>
    </QueryClientProvider>
  );
}

export default App;
