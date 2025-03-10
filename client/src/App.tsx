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
import { AuthProvider, useAuth } from './contexts/auth-context';
// Remove external dependency to avoid module errors


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
  const { isAuthenticated } = useAuth();

  // Check if user is on login page or authenticated
  const showNavigation = location !== "/" && location !== "/login";
  
  // This component no longer handles routing logic - that's now in AuthContext

  // Define clearCache and resetUserData functions locally
  function clearCache() {
    console.log('Clearing all client storage');
    try {
      localStorage.clear();
      sessionStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing cache:', error);
      return false;
    }
  }

  async function resetUserData() {
    try {
      // Call the reset API
      const response = await fetch('/api/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });
      
      return response.ok;
    } catch (error) {
      console.error('Error resetting user data:', error);
      return false;
    }
  }

  // This useEffect runs once on initial mount
  useEffect(() => {
    // Clear non-essential cache data
    console.log('First load: Clearing non-essential browser storage...');
    storageManager.clearItems('temp:');
    storageManager.clearItems('expirable:');

    // Initialize storage manager with cleanup interval
    storageManager.init();
    
    // Check if reset parameter is in URL - used for first-time users or testing
    const urlParams = new URLSearchParams(window.location.search);
    const shouldReset = urlParams.get('reset') === 'true';
    
    if (shouldReset) {
      console.log('First-time user or reset requested - clearing all storage');
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
    }

    // Apply optimizations for low-memory devices
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
        <AuthProvider>
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
        </AuthProvider>
      </ErrorBoundary>
    </QueryClientProvider>
  );
}

export default App;