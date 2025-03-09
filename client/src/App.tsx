
import { useEffect, useState } from 'react';
import { Switch, Route, useLocation } from 'wouter';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { Toaster } from './components/ui/toaster';
import Header from './components/shared/header';
import { MobileNav } from './components/ui/mobile-nav';
import { useIsMobile } from './hooks/use-mobile';

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
import Onboarding from './pages/onboarding';

// iOS Safari detection
const isIOS = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(userAgent);
};

function AppLayout({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();
  const [location] = useLocation();
  const [isIOSDevice, setIsIOSDevice] = useState(false);
  
  // Don't show navigation on login routes
  const showNavigation = location !== "/" && location !== "/login";

  useEffect(() => {
    // Check if the device is iOS
    setIsIOSDevice(isIOS());
    
    // Add iOS meta tags and apply iOS specific styles
    if (isIOS()) {
      // Add viewport-fit=cover to handle iPhone X+ notch
      const metaViewport = document.querySelector('meta[name="viewport"]');
      if (metaViewport) {
        metaViewport.setAttribute('content', 'width=device-width, initial-scale=1, viewport-fit=cover');
      }
      
      // Add iOS status bar style meta tag
      let statusBarMeta = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
      if (!statusBarMeta) {
        statusBarMeta = document.createElement('meta');
        statusBarMeta.setAttribute('name', 'apple-mobile-web-app-status-bar-style');
        statusBarMeta.setAttribute('content', 'black-translucent');
        document.head.appendChild(statusBarMeta);
      }
      
      // Add web app capable meta tag
      let webAppMeta = document.querySelector('meta[name="apple-mobile-web-app-capable"]');
      if (!webAppMeta) {
        webAppMeta = document.createElement('meta');
        webAppMeta.setAttribute('name', 'apple-mobile-web-app-capable');
        webAppMeta.setAttribute('content', 'yes');
        document.head.appendChild(webAppMeta);
      }
    }
  }, []);

  return (
    <div className={`flex flex-col min-h-screen ${isIOSDevice ? 'safe-padding-top safe-padding-bottom' : ''} pb-16 md:pb-0`}>
      {showNavigation && <Header />}
      <main className={`flex-1 container mx-auto px-4 py-6 ${!showNavigation ? 'px-0' : ''} ${isIOSDevice ? 'momentum-scroll' : ''}`}>
        {children}
      </main>
      {showNavigation && isMobile && (
        <div className={`${isIOSDevice ? 'safe-padding-bottom' : ''}`}>
          <MobileNav />
        </div>
      )}
    </div>
  );
}

function App() {
  const [location] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Check if user is on login page or authenticated
  const showNavigation = location !== "/" && location !== "/login";
  
  // Check user authentication status from localStorage
  useEffect(() => {
    // Get authentication status from localStorage
    const authStatus = localStorage.getItem('isAuthenticated') === 'true';
    const isOnLoginPage = location === "/" || location === "/login";
    
    // If we have auth data in localStorage or user is not on login page
    setIsAuthenticated(authStatus || (location !== "/" && location !== "/login"));
    
    // Redirect to dashboard if authenticated and on login page
    if (authStatus && isOnLoginPage) {
      // Check if onboarding is completed
      const onboardingCompleted = localStorage.getItem('hasCompletedOnboarding') === 'true';
      window.location.href = onboardingCompleted ? '/dashboard' : '/onboarding';
    }
  }, [location]);

  // Check if onboarding has been completed
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean | null>(null);
  
  useEffect(() => {
    // Check localStorage for onboarding completion flag
    // Default to true if the flag doesn't exist to prevent unnecessary redirects
    const onboardingCompleted = localStorage.getItem("hasCompletedOnboarding");
    // Only set to false if explicitly false, otherwise assume completed
    setHasCompletedOnboarding(onboardingCompleted === "false" ? false : true);
  }, []);
  
  // Redirect logic after login
  useEffect(() => {
    // Only redirect if explicitly not completed onboarding
    if (isAuthenticated && hasCompletedOnboarding === false) {
      // Check that we're not already on the onboarding page to prevent redirect loops
      if (location !== "/onboarding") {
        window.location.href = "/onboarding";
      }
    }
  }, [isAuthenticated, location, hasCompletedOnboarding]);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-background font-sans antialiased">
        <Switch>
          {/* Public routes */}
          <Route path="/" component={LoginPage} />
          <Route path="/login" component={LoginPage} />
          
          {/* Onboarding route - standalone without app layout */}
          <Route path="/onboarding" component={Onboarding} />
          
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
      </div>
    </QueryClientProvider>
  );
}

export default App;
