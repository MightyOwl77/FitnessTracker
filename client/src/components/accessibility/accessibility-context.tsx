import React, { createContext, useState, useContext, useEffect } from 'react';

type TextSize = 'default' | 'large' | 'larger';
type ContrastMode = 'default' | 'high-contrast';

interface AccessibilityContextType {
  textSize: TextSize;
  setTextSize: (size: TextSize) => void;
  contrastMode: ContrastMode;
  setContrastMode: (mode: ContrastMode) => void;
  reduceMotion: boolean;
  setReduceMotion: (reduce: boolean) => void;
}

const defaultContext: AccessibilityContextType = {
  textSize: 'default',
  setTextSize: () => {},
  contrastMode: 'default',
  setContrastMode: () => {},
  reduceMotion: false,
  setReduceMotion: () => {},
};

const AccessibilityContext = createContext<AccessibilityContextType>(defaultContext);

export function useAccessibility() {
  return useContext(AccessibilityContext);
}

interface AccessibilityProviderProps {
  children: React.ReactNode;
}

export function AccessibilityProvider({ children }: AccessibilityProviderProps) {
  // Load settings from localStorage or use defaults
  const [textSize, setTextSize] = useState<TextSize>(() => {
    const saved = localStorage.getItem('a11y-textSize');
    return (saved as TextSize) || 'default';
  });
  
  const [contrastMode, setContrastMode] = useState<ContrastMode>(() => {
    const saved = localStorage.getItem('a11y-contrastMode');
    return (saved as ContrastMode) || 'default';
  });
  
  const [reduceMotion, setReduceMotion] = useState<boolean>(() => {
    const saved = localStorage.getItem('a11y-reduceMotion');
    return saved === 'true';
  });

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('a11y-textSize', textSize);
    localStorage.setItem('a11y-contrastMode', contrastMode);
    localStorage.setItem('a11y-reduceMotion', reduceMotion.toString());
    
    // Apply settings to document
    const root = document.documentElement;
    
    // Text size classes
    root.classList.remove('text-size-default', 'text-size-large', 'text-size-larger');
    root.classList.add(`text-size-${textSize}`);
    
    // Contrast mode
    root.classList.toggle('high-contrast', contrastMode === 'high-contrast');
    
    // Reduce motion
    root.classList.toggle('reduce-motion', reduceMotion);
    
  }, [textSize, contrastMode, reduceMotion]);

  // Check for prefers-reduced-motion media query
  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mql.matches) {
      setReduceMotion(true);
    }
    
    const handleChange = (e: MediaQueryListEvent) => {
      setReduceMotion(e.matches);
    };
    
    mql.addEventListener('change', handleChange);
    return () => {
      mql.removeEventListener('change', handleChange);
    };
  }, []);

  const value = {
    textSize,
    setTextSize,
    contrastMode,
    setContrastMode,
    reduceMotion,
    setReduceMotion,
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
}