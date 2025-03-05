
import { useEffect, useState } from 'react';
import { Switch, Route } from 'wouter';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { Toaster } from './components/ui/toaster';
import Header from './components/shared/header';

// Import pages
import UserData from './pages/user-data';
import { SetGoals } from './pages/set-goals';
import { DailyLog } from './pages/daily-log';
import BodyStats from './pages/body-stats';
import ViewPlan from './pages/view-plan';
import NotFound from './pages/not-found';

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6">
        {children}
      </main>
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
          <Route path="/profile" component={() => (
            <AppLayout>
              <UserData />
            </AppLayout>
          )} />
          <Route path="/goals" component={() => (
            <AppLayout>
              <SetGoals />
            </AppLayout>
          )} />
          <Route path="/log" component={() => (
            <AppLayout>
              <DailyLog />
            </AppLayout>
          )} />
          <Route path="/stats" component={() => (
            <AppLayout>
              <BodyStats />
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
