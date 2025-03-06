import { useState, useEffect } from 'react';
import { useIsIOS } from './use-mobile';

type OrientationType = 'portrait' | 'landscape' | 'unknown';

// Interface type definition removed for simplicity

interface UseOrientationOptions {
  lockToPortrait?: boolean;
}

/**
 * Hook to detect and manage device orientation specifically for iOS
 * 
 * This hook provides:
 * - Current orientation state
 * - Ability to lock to portrait mode (iOS-specific)
 * - Notification when orientation changes
 * 
 * @param options Configuration options for orientation behavior
 */
export function useIOSOrientation(options: UseOrientationOptions = {}) {
  const isIOS = useIsIOS();
  const [orientation, setOrientation] = useState<OrientationType>('unknown');
  const { lockToPortrait = false } = options;

  useEffect(() => {
    // Function to determine the current orientation
    const updateOrientation = () => {
      if (typeof window === 'undefined' || !window.screen) {
        setOrientation('unknown');
        return;
      }

      // iOS detection is more reliable with window.orientation
      if (isIOS && 'orientation' in window) {
        const angle = (window as any).orientation;
        if (angle === 0 || angle === 180) {
          setOrientation('portrait');
        } else if (angle === 90 || angle === -90) {
          setOrientation('landscape');
        } else {
          setOrientation('unknown');
        }
      } else {
        // Fallback to screen dimensions
        const { width, height } = window.screen;
        setOrientation(width > height ? 'landscape' : 'portrait');
      }
    };

    // Set initial orientation
    updateOrientation();

    // Add event listeners for orientation changes
    const orientationChangeEvent = 'onorientationchange' in window ? 'orientationchange' : 'resize';
    window.addEventListener(orientationChangeEvent, updateOrientation);

    // iOS-specific: attempt to lock to portrait if requested
    if (isIOS && lockToPortrait) {
      try {
        // Use screen orientation API if available with type assertion
        if (screen.orientation && 'lock' in screen.orientation) {
          // Use type assertion to avoid TypeScript errors
          (screen.orientation as any).lock('portrait').catch(() => {
            // Silently fail - not all iOS versions support this
          });
        }
        
        // Add CSS to try to enforce portrait on iOS
        const style = document.createElement('style');
        style.innerHTML = `
          @media screen and (min-width: 320px) and (max-width: 767px) and (orientation: landscape) {
            html { transform: rotate(-90deg); transform-origin: left top; width: 100vh; height: 100vw; overflow-x: hidden; position: absolute; top: 100%; left: 0; }
          }
        `;
        document.head.appendChild(style);
        
        return () => {
          document.head.removeChild(style);
        };
      } catch (err) {
        console.error('Failed to lock orientation:', err);
      }
    }

    return () => {
      window.removeEventListener(orientationChangeEvent, updateOrientation);
    };
  }, [isIOS, lockToPortrait]);

  return {
    orientation,
    isPortrait: orientation === 'portrait',
    isLandscape: orientation === 'landscape',
    isIOS
  };
}

/**
 * Hook to apply safe area insets for iOS devices
 * 
 * This is crucial for iPhone X and newer devices with notches
 */
export function useIOSSafeAreas() {
  const isIOS = useIsIOS();

  useEffect(() => {
    if (!isIOS) return;
    
    try {
      // Add viewport-fit=cover meta tag for iOS safe areas
      const meta = document.createElement('meta');
      meta.setAttribute('name', 'viewport');
      meta.setAttribute('content', 'width=device-width, initial-scale=1, viewport-fit=cover');
      document.head.appendChild(meta);
      
      // Add CSS variables for safe area insets
      const style = document.createElement('style');
      style.innerHTML = `
        :root {
          --safe-area-inset-top: env(safe-area-inset-top);
          --safe-area-inset-right: env(safe-area-inset-right);
          --safe-area-inset-bottom: env(safe-area-inset-bottom);
          --safe-area-inset-left: env(safe-area-inset-left);
        }
        
        .safe-area-padding-top {
          padding-top: env(safe-area-inset-top, 0px);
        }
        
        .safe-area-padding-bottom {
          padding-bottom: env(safe-area-inset-bottom, 0px);
        }
        
        .safe-area-padding-left {
          padding-left: env(safe-area-inset-left, 0px);
        }
        
        .safe-area-padding-right {
          padding-right: env(safe-area-inset-right, 0px);
        }
      `;
      document.head.appendChild(style);
      
      return () => {
        document.head.removeChild(style);
      };
    } catch (err) {
      console.error('Failed to apply safe areas:', err);
    }
  }, [isIOS]);

  return { isIOS };
}