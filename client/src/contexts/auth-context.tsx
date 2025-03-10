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

  const login = (token: string, userId: string, username: string) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('userId', userId);
    localStorage.setItem('username', username);
    localStorage.setItem('lastLoginTime', new Date().toISOString());
    localStorage.setItem('isGuest', 'false');
    setIsAuthenticated(true);

    console.log('User logged in successfully');
  };

  const loginAsGuest = () => {
    localStorage.setItem('authToken', 'guest-token-' + Date.now());
    localStorage.setItem('userId', 'guest-' + Date.now());
    localStorage.setItem('username', 'Guest User');
    localStorage.setItem('lastLoginTime', new Date().toISOString());
    localStorage.setItem('isGuest', 'true');
    setIsAuthenticated(true);

    console.log('Guest logged in successfully');
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.removeItem('isGuest');
    setIsAuthenticated(false);
    setHasCompletedOnboarding(false);

    console.log('User logged out');
  };

  const completeOnboarding = useCallback(() => {
    console.log('Marking onboarding as completed');
    setHasCompletedOnboarding(true);
    localStorage.setItem('hasCompletedOnboarding', 'true');
    console.log('Onboarding completed - user will be redirected to dashboard');
  }, []);

  const resetAuth = () => {
    localStorage.clear();
    sessionStorage.clear();
    setIsAuthenticated(false);
    setHasCompletedOnboarding(false);
    console.log('Auth state reset');
  };

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