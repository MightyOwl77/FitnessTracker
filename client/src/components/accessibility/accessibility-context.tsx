import { createContext, useContext, useEffect, useState } from 'react';

// Define the types for text size and contrast modes
type TextSize = 'default' | 'large' | 'larger';
type ContrastMode = 'default' | 'high-contrast';

// Define the accessibility context interface
interface AccessibilityContextType {
  textSize: TextSize;
  setTextSize: (size: TextSize) => void;
  contrastMode: ContrastMode;
  setContrastMode: (mode: ContrastMode) => void;
  reduceMotion: boolean;
  setReduceMotion: (reduce: boolean) => void;
}

// Create the context with default values
const defaultContext: AccessibilityContextType = {
  textSize: 'default',
  setTextSize: () => {},
  contrastMode: 'default',
  setReduceMotion: () => {},
  reduceMotion: false,
  setContrastMode: () => {},
};

// Create the context
const AccessibilityContext = createContext<AccessibilityContextType>(defaultContext);

// Hook to use the accessibility context
export function useAccessibility() {
  return useContext(AccessibilityContext);
}

// Props interface for the provider component
interface AccessibilityProviderProps {
  children: React.ReactNode;
}

// Accessibility provider component
export function AccessibilityProvider({ children }: AccessibilityProviderProps) {
  // Initialize state with values from localStorage if available
  const [textSize, setTextSize] = useState<TextSize>(() => {
    const saved = localStorage.getItem('accessibility-text-size');
    return (saved as TextSize) || 'default';
  });
  
  const [contrastMode, setContrastMode] = useState<ContrastMode>(() => {
    const saved = localStorage.getItem('accessibility-contrast-mode');
    return (saved as ContrastMode) || 'default';
  });
  
  const [reduceMotion, setReduceMotion] = useState<boolean>(() => {
    const saved = localStorage.getItem('accessibility-reduce-motion');
    return saved === 'true';
  });

  // Listen for prefers-reduced-motion media query
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    // If user has set OS-level preference for reduced motion,
    // respect that unless explicitly overridden by the user in our app
    if (localStorage.getItem('accessibility-reduce-motion') === null && mediaQuery.matches) {
      setReduceMotion(true);
    }
    
    // Update our state when the OS preference changes
    const handleChange = (e: MediaQueryListEvent) => {
      if (localStorage.getItem('accessibility-reduce-motion') === null) {
        setReduceMotion(e.matches);
      }
    };
    
    // Add event listener
    mediaQuery.addEventListener('change', handleChange);
    
    // Clean up
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  // Update document class when textSize changes
  useEffect(() => {
    // Remove all text size classes first
    document.documentElement.classList.remove('text-size-default', 'text-size-large', 'text-size-larger');
    
    // Add the current text size class
    document.documentElement.classList.add(`text-size-${textSize}`);
    
    // Save to localStorage
    localStorage.setItem('accessibility-text-size', textSize);
  }, [textSize]);
  
  // Update document class when contrastMode changes
  useEffect(() => {
    // Remove all contrast classes first
    document.documentElement.classList.remove('contrast-default', 'contrast-high');
    
    // Add the current contrast class
    document.documentElement.classList.add(`contrast-${contrastMode === 'high-contrast' ? 'high' : 'default'}`);
    
    // Save to localStorage
    localStorage.setItem('accessibility-contrast-mode', contrastMode);
  }, [contrastMode]);
  
  // Update document class when reduceMotion changes
  useEffect(() => {
    if (reduceMotion) {
      document.documentElement.classList.add('reduce-motion');
    } else {
      document.documentElement.classList.remove('reduce-motion');
    }
    
    // Save to localStorage
    localStorage.setItem('accessibility-reduce-motion', reduceMotion.toString());
  }, [reduceMotion]);

  return (
    <AccessibilityContext.Provider 
      value={{ 
        textSize, 
        setTextSize, 
        contrastMode, 
        setContrastMode, 
        reduceMotion, 
        setReduceMotion 
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}