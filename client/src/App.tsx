
import { useEffect, useState } from 'react';
import { Switch, Route, useLocation } from 'wouter';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { Toaster } from './components/ui/toaster';
import Header from './components/shared/header';
import { MobileNav } from './components/ui/mobile-nav';
import { useIsMobile } from './hooks/use-mobile';
import { AccessibilityProvider } from './components/accessibility/accessibility-context';
import { AccessibilityPanel } from './components/accessibility/accessibility-panel';

// Import pages
import LoginPage from './pages/login';
import UserData from './pages/user-data';
import { SetGoals } from './pages/set-goals';
import { DailyLog } from './pages/daily-log';
import BodyStats from './pages/body-stats';
import ViewPlan from './pages/view-plan';
import NotFound from './pages/not-found';
import { Progress } from './pages/progress';
import { Dashboard } from './pages/dashboard';

function AppLayout({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();
  const [location] = useLocation();
  
  // Don't show navigation on login routes
  const showNavigation = location !== "/" && location !== "/login";

  return (
    <div className="flex flex-col min-h-screen pb-16 md:pb-0">
      {showNavigation && (
        <Header />
      )}
      <main 
        id="main-content" 
        className={`flex-1 container mx-auto px-4 py-6 ${!showNavigation ? 'px-0' : ''}`}
        tabIndex={-1} // Makes the main content focusable for skip link
        aria-labelledby="page-title" // Links to the page's h1
      >
        {children}
      </main>
      {showNavigation && isMobile && <MobileNav />}
    </div>
  );
}

function App() {
  const [location] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Check if user is on login page or authenticated
  const showNavigation = location !== "/" && location !== "/login";
  
  // For demo purposes, we'll consider the user authenticated if they're not on the login page
  useEffect(() => {
    // This simulates authentication check - in a real app, you'd check session/token
    setIsAuthenticated(location !== "/" && location !== "/login");
  }, [location]);

  return (
    <QueryClientProvider client={queryClient}>
      <AccessibilityProvider>
        <div className="min-h-screen bg-background font-sans antialiased">
          <Switch>
            {/* Public routes */}
            <Route path="/" component={LoginPage} />
            <Route path="/login" component={LoginPage} />
            
            {/* App routes with layout */}
            <Route path="/dashboard" component={() => (
              <AppLayout>
                <Dashboard />
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
          
          {/* Accessibility panel - fixed on screen */}
          <AccessibilityPanel />
          
          {/* Skip to content link for keyboard users */}
          <a 
            href="#main-content" 
            className="bg-primary text-primary-foreground px-4 py-2 absolute top-0 left-0 -translate-y-full focus:translate-y-0 z-50"
          >
            Skip to content
          </a>
        </div>
      </AccessibilityProvider>
    </QueryClientProvider>
  );
}

export default App;
