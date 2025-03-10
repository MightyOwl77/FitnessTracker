
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useLocation } from 'wouter';
import { logAuthEvent, checkAuthState } from '@/lib/debug-utils';

interface AuthContextType {
  isAuthenticated: boolean;
  hasCompletedOnboarding: boolean;
  login: (token: string, userId: string, username: string) => void;
  loginAsGuest: () => void;
  logout: () => void;
  completeOnboarding: () => void;
  resetAuth: () => void;
}

const defaultContext: AuthContextType = {
  isAuthenticated: false,
  hasCompletedOnboarding: false,
  login: () => {},
  loginAsGuest: () => {},
  logout: () => {},
  completeOnboarding: () => {},
  resetAuth: () => {},
};

const AuthContext = createContext<AuthContextType>(defaultContext);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [, setLocation] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize from localStorage on first load
  useEffect(() => {
    const storedIsAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    const storedHasCompletedOnboarding = localStorage.getItem('hasCompletedOnboarding') === 'true';

    setIsAuthenticated(storedIsAuthenticated);
    setHasCompletedOnboarding(storedHasCompletedOnboarding);
    setIsInitialized(true);

    console.log('Auth context initialized:', { 
      storedIsAuthenticated, 
      storedHasCompletedOnboarding 
    });
  }, []);

  // Handle redirects when auth state changes
  useEffect(() => {
    if (!isInitialized) return;

    const currentPath = window.location.pathname;
    const isOnLoginPage = currentPath === "/" || currentPath === "/login";
    const isOnOnboardingPage = currentPath === "/onboarding";

    console.log('Auth state changed - Current state:', {
      path: currentPath,
      isAuthenticated,
      hasCompletedOnboarding,
      isOnLoginPage,
      isOnOnboardingPage
    });

    // Logic for redirects based on auth state
    if (isAuthenticated) {
      if (!hasCompletedOnboarding && !isOnOnboardingPage) {
        console.log('AuthContext: Redirecting to onboarding...');
        setLocation('/onboarding');
      } else if (hasCompletedOnboarding && (isOnLoginPage || isOnOnboardingPage)) {
        console.log('AuthContext: Redirecting to dashboard...');
        setLocation('/dashboard');
      } else {
        console.log('AuthContext: No redirect needed - user is in the correct place');
      }
    } else if (!isOnLoginPage) {
      console.log('AuthContext: Redirecting to login...');
      setLocation('/login');
    } else {
      console.log('AuthContext: User is on login page and not authenticated - correct state');
    }
  }, [isAuthenticated, hasCompletedOnboarding, isInitialized, setLocation]);

  // Update localStorage when state changes
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('isAuthenticated', isAuthenticated.toString());
    }
  }, [isAuthenticated, isInitialized]);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('hasCompletedOnboarding', hasCompletedOnboarding.toString());
    }
  }, [hasCompletedOnboarding, isInitialized]);

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
    
    // Redirect will be handled by the useEffect
  }, []);

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
