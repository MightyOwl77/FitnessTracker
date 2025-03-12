
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useLocation } from 'wouter';
import { logAuthEvent, checkAuthState } from '@/lib/debug-utils';

// Define the type for our AuthContext
interface AuthContextType {
  isAuthenticated: boolean;
  hasCompletedOnboarding: boolean;
  login: (token: string, userId: string, username: string) => void;
  loginAsGuest: () => void;
  logout: () => void;
  completeOnboarding: () => void;
  resetAuth: () => void;
}

// Create default context values
const defaultContext: AuthContextType = {
  isAuthenticated: false,
  hasCompletedOnboarding: false,
  login: () => {},
  loginAsGuest: () => {},
  logout: () => {},
  completeOnboarding: () => {},
  resetAuth: () => {},
};

// Create the context
const AuthContext = createContext<AuthContextType>(defaultContext);

// Hook to use the auth context
export function useAuth() {
  return useContext(AuthContext);
}

// Props interface for the provider component
interface AuthProviderProps {
  children: ReactNode;
}

// AuthProvider component to wrap the app
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [location, setLocation] = useLocation();

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedIsAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    const storedHasCompletedOnboarding = localStorage.getItem('hasCompletedOnboarding') === 'true';
    
    console.log('Auth context initialized:', { storedIsAuthenticated, storedHasCompletedOnboarding });
    
    setIsAuthenticated(storedIsAuthenticated);
    setHasCompletedOnboarding(storedHasCompletedOnboarding);
    setIsInitialized(true);
  }, []);

  // Handle navigation based on auth state
  useEffect(() => {
    if (!isInitialized) return;

    const isOnLoginPage = location === '/' || location === '/login';
    const isOnOnboardingPage = location === '/onboarding';
    const isOnLoadingTestPage = location === '/loading-test';

    console.log('Auth state changed - Current state:', {
      path: location,
      isAuthenticated,
      hasCompletedOnboarding,
      isOnLoginPage,
      isOnOnboardingPage,
      isOnLoadingTestPage
    });

    // Skip navigation logic for loading-test page
    if (isOnLoadingTestPage) {
      console.log('On loading-test page, skipping auth redirects');
      return;
    }

    // Navigation logic
    if (isAuthenticated) {
      if (!hasCompletedOnboarding && !isOnOnboardingPage) {
        console.log('AuthContext: Redirecting to onboarding...');
        setLocation('/onboarding');
      } else if (hasCompletedOnboarding && (isOnLoginPage || isOnOnboardingPage)) {
        console.log('AuthContext: Redirecting to dashboard...');
        setLocation('/dashboard');
      }
    } else if (!isOnLoginPage) {
      console.log('AuthContext: Redirecting to login...');
      setLocation('/login');
    }
  }, [hasCompletedOnboarding, isInitialized, location, setLocation]);

  const login = useCallback((token: string, userId: string, username: string) => {
    logAuthEvent('login', { userId, username });
    
    // Store authentication data
    localStorage.setItem('authToken', token);
    localStorage.setItem('userId', userId);
    localStorage.setItem('username', username);
    localStorage.setItem('isAuthenticated', 'true');
    
    // Update state
    setIsAuthenticated(true);
    
    // Check if user has completed onboarding
    const completedOnboarding = localStorage.getItem('hasCompletedOnboarding') === 'true';
    setHasCompletedOnboarding(completedOnboarding);
    
    // Redirect will be handled by the useEffect
  }, []);

  const loginAsGuest = useCallback(() => {
    logAuthEvent('loginAsGuest');
    
    const guestId = 'guest-' + Date.now();
    const guestToken = 'guest-token-' + Date.now();
    
    // Store guest authentication data
    localStorage.setItem('authToken', guestToken);
    localStorage.setItem('userId', guestId);
    localStorage.setItem('username', 'Guest User');
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('isGuestUser', 'true');
    
    // Update state
    setIsAuthenticated(true);
    setHasCompletedOnboarding(false);
    
    // Manually navigate to loading-test page for testing
    console.log('Guest login successful, navigating to loading-test');
    setLocation('/loading-test');
  }, [setLocation]);

  const logout = useCallback(() => {
    logAuthEvent('logout');
    
    // Remove auth data but keep some settings for better UX on return
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('isGuestUser');
    
    // Update state
    setIsAuthenticated(false);
    
    // Redirect will be handled by the useEffect
  }, []);

  const completeOnboarding = useCallback(() => {
    logAuthEvent('completeOnboarding');
    console.log('Onboarding completed');
    
    localStorage.setItem('hasCompletedOnboarding', 'true');
    setHasCompletedOnboarding(true);
    
    // Redirect will be handled by the useEffect
  }, []);

  const resetAuth = useCallback(() => {
    localStorage.clear();
    sessionStorage.clear();
    setIsAuthenticated(false);
    setHasCompletedOnboarding(false);
    console.log('Auth state reset');
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        hasCompletedOnboarding,
        login,
        loginAsGuest,
        logout,
        completeOnboarding,
        resetAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
