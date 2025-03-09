
import { useEffect, useState, lazy, Suspense } from 'react';
import { Switch, Route, useLocation } from 'wouter';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { Toaster } from './components/ui/toaster';
import Header from './components/shared/header';
import { MobileNav } from './components/ui/mobile-nav';
import { useIsMobile } from './hooks/use-mobile';
import { Loader } from './components/ui/loader';
import { ErrorBoundary } from './components/ui/error-boundary';

// Lazy-loaded pages
const LoginPage = lazy(() => import('./pages/login'));
const UserData = lazy(() => import('./pages/user-data'));
const SetGoals = lazy(() => import('./pages/set-goals'));
const DailyLog = lazy(() => import('./pages/daily-log'));
const BodyStats = lazy(() => import('./pages/body-stats'));
const ViewPlan = lazy(() => import('./pages/view-plan'));
const NotFound = lazy(() => import('./pages/not-found'));
const Progress = lazy(() => import('./pages/progress'));
const Dashboard = lazy(() => import('./pages/dashboard'));
const Onboarding = lazy(() => import('./pages/onboarding'));

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
    // Ensure we only check for onboarding status once during component mount
    // Setting a non-existent key's value to null to get null not undefined
    const onboardingCompleted = localStorage.getItem("hasCompletedOnboarding") || null;
    
    // Default behavior: if not explicitly set, assume onboarding is completed
    // to prevent unnecessary redirects
    if (onboardingCompleted === "true" || onboardingCompleted === null) {
      setHasCompletedOnboarding(true);
      
      // Set the flag in localStorage to ensure consistency
      if (onboardingCompleted === null) {
        localStorage.setItem("hasCompletedOnboarding", "true");
      }
    } else {
      setHasCompletedOnboarding(false);
    }
  }, []);
  
  // Redirect logic after login, handles navigation and prevents loops
  useEffect(() => {
    // Only handle redirects if authentication state is known and onboarding status is loaded
    if (isAuthenticated !== null && hasCompletedOnboarding !== null) {
      // Case 1: Not authenticated, redirect to login (except already on login pages)
      if (!isAuthenticated && location !== "/" && location !== "/login") {
        window.location.href = "/login";
        return;
      }
      
      // Case 2: Authenticated but needs onboarding
      if (isAuthenticated && hasCompletedOnboarding === false && location !== "/onboarding") {
        window.location.href = "/onboarding";
        return;
      }
      
      // Case 3: Authenticated with completed onboarding but on login/onboarding pages
      if (isAuthenticated && hasCompletedOnboarding === true && 
         (location === "/" || location === "/login" || location === "/onboarding")) {
        window.location.href = "/dashboard";
        return;
      }
    }
  }, [isAuthenticated, location, hasCompletedOnboarding]);

  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <div className="min-h-screen bg-background font-sans antialiased">
        <Switch>
          {/* Public routes */}
          <Route path="/" component={() => (
            <Suspense fallback={<Loader size={32} text="Loading..." />}>
              <LoginPage />
            </Suspense>
          )} />
          <Route path="/login" component={() => (
            <Suspense fallback={<Loader size={32} text="Loading..." />}>
              <LoginPage />
            </Suspense>
          )} />
          
          {/* Onboarding route - standalone without app layout */}
          <Route path="/onboarding" component={() => (
            <Suspense fallback={<Loader size={32} text="Loading..." />}>
              <Onboarding />
            </Suspense>
          )} />
          
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
      </ErrorBoundary>
    </QueryClientProvider>
  );
}

export default App;
