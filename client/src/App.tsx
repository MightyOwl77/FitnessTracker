import { useEffect, useState, lazy, Suspense } from 'react';
import { Switch, Route, useLocation } from 'wouter';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { Toaster } from './components/ui/toaster';
import Header from './components/shared/header';
import { MobileNav } from './components/ui/mobile-nav';
import { useIsMobile } from './hooks/use-mobile';
import Loader from './components/ui/loader';
import ErrorBoundary from './components/ui/error-boundary';
import { storageManager } from './lib/storage-utils';
import connectionManager from './lib/connection-manager';
// Need to use JavaScript file for now to avoid TypeScript issues
import { clearCache, resetUserData } from './lib/clear-cache.js';


// Lazy-loaded pages
const LoginPage = lazy(() => import('./pages/login'));
const UserData = lazy(() => import('./pages/user-data'));
const BodyStats = lazy(() => import('./pages/body-stats'));
const ViewPlan = lazy(() => import('./pages/view-plan'));
const NotFound = lazy(() => import('./pages/not-found'));
const SetGoals = lazy(() => import('./pages/set-goals'));
const DailyLog = lazy(() => import('./pages/daily-log'));
const Progress = lazy(() => import('./pages/progress'));
const Dashboard = lazy(() => import('./pages/dashboard'));
// Import the onboarding from pages directory since the components one now redirects
const OnboardingPage = lazy(() => import('./pages/onboarding'));
// The bridge component from components directory (redirects to pages)
const OnboardingBridge = lazy(() => import('./components/onboarding/Onboarding'));

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
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean | null>(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Check if user is on login page or authenticated
  const showNavigation = location !== "/" && location !== "/login";

  // On initial load, set up the authentication state properly
  useEffect(() => {
    // Set initialized flag first
    setIsInitialized(true);
    
    // Check if user is authenticated
    const isAuth = localStorage.getItem('isAuthenticated') === 'true';
    const hasOnboarded = localStorage.getItem('hasCompletedOnboarding') === 'true';
    
    // Update state based on localStorage
    setIsAuthenticated(isAuth);
    setHasCompletedOnboarding(hasOnboarded);
    
    console.log('Auth status on initialization:', isAuth, 'Onboarding completed:', hasOnboarded);
  }, []);

  // Run routing logic once initialization is complete
  useEffect(() => {
    // Skip if not initialized yet
    if (!isInitialized) return;
    
    // Check current location
    const isOnLoginPage = location === "/" || location === "/login"; 
    const isOnOnboardingPage = location === "/onboarding";
    const isOnProtectedPage = !isOnLoginPage && !isOnOnboardingPage;
    
    console.log('Current routing state:', { 
      isAuthenticated, 
      hasCompletedOnboarding, 
      location,
      isOnLoginPage,
      isOnOnboardingPage 
    });
    
    // Routing logic for different scenarios
    if (isAuthenticated) {
      // User is authenticated
      if (!hasCompletedOnboarding) {
        // Authenticated but needs onboarding
        if (!isOnOnboardingPage) {
          console.log('Redirecting to onboarding...');
          window.location.href = "/onboarding";
        }
      } else {
        // Fully authenticated with completed onboarding
        if (isOnLoginPage || isOnOnboardingPage) {
          console.log('Redirecting to dashboard...');
          window.location.href = "/dashboard";
        }
      }
    } else {
      // Not authenticated - only allow access to login page
      if (!isOnLoginPage) {
        console.log('Redirecting to login...');
        window.location.href = "/login";
      }
    }
  }, [isInitialized, isAuthenticated, hasCompletedOnboarding, location]);

  // This useEffect runs once on initial mount
  useEffect(() => {
    // Only clear non-essential cache data instead of all storage
    console.log('First load: Clearing non-essential browser storage...');
    storageManager.clearItems('temp:');
    storageManager.clearItems('expirable:');

    // Initialize storage manager with cleanup interval
    storageManager.init();
    
    // TEMPORARY FIX: Clear all localStorage on initial load to ensure clean state
    // This will force everyone back to login page
    console.log('TEMPORARY FIX: Clearing all localStorage to force clean state');
    localStorage.clear();
    
    // Explicitly set to non-authenticated state
    setIsAuthenticated(false);
    setHasCompletedOnboarding(false);
    
    // Check if reset parameter is in URL - used for first-time users or testing
    const urlParams = new URLSearchParams(window.location.search);
    const shouldReset = urlParams.get('reset') === 'true';
    
    if (shouldReset) {
      console.log('First-time user or reset requested - clearing all storage');
      // Clear all client storage
      clearCache();
      
      // Reset server data asynchronously
      resetUserData().then((success: boolean) => {
        if (success) {
          console.log('Server data reset successfully');
          // Redirect to login without the reset parameter
          window.location.href = '/login';
        } else {
          console.warn('Server reset failed, but client storage was cleared');
        }
      });
    } else {
      // Redirect to login page to ensure proper flow
      if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
        console.log('Redirecting to login from startup...');
        window.location.href = '/login';
      }
    }

    // Check if the device has limited resources and apply optimizations
    // @ts-ignore - deviceMemory is not in all TypeScript navigator types but exists in modern browsers
    if (navigator.deviceMemory && navigator.deviceMemory < 4) {
      // For devices with less than 4GB of RAM
      document.body.classList.add('low-memory-device');
    }

    // Cleanup function
    return () => {
      connectionManager.cleanup();
    };
  }, []);


  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <div className="min-h-screen bg-background font-sans antialiased">
          <Suspense fallback={<Loader fullScreen message="Loading application..." />}> {/* Added Suspense for lazy loading */}
            <Switch>
              {/* Public routes */}
              <Route path="/" component={() => <LoginPage />} />
              <Route path="/login" component={() => <LoginPage />} />

              {/* Onboarding route - standalone without app layout */}
              <Route path="/onboarding" component={() => <OnboardingPage />} />

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
          </Suspense>
          <Toaster />
        </div>
      </ErrorBoundary>
    </QueryClientProvider>
  );
}

export default App;