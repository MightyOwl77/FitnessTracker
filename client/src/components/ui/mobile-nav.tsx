import React from 'react';
import { Link, useLocation } from 'wouter';
import { 
  Home, 
  User, 
  Target, 
  Calendar, 
  Activity,
  AppleIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsIOS, useDeviceInfo } from '@/hooks/use-mobile';

interface MobileNavProps {
  className?: string;
}

export function MobileNav({ className = '' }: MobileNavProps) {
  const [location] = useLocation();
  const isIOS = useIsIOS();
  const { hasNotch } = useDeviceInfo();
  
  // Determine if a link is active
  const isActive = (path: string) => location === path;

  // iOS-specific animation and styling effects
  const getIOSActiveStyle = (isActive: boolean) => {
    if (!isIOS) return {};
    
    return {
      WebkitTapHighlightColor: 'transparent',
      touchAction: 'manipulation',
      // Add subtle scale animation for active tabs (iOS style)
      transform: isActive ? 'translateY(-2px) scale(1.05)' : 'translateY(0) scale(1)',
      transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)'
    };
  };

  return (
    <div className={cn(
      'fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 z-50',
      // Enhanced iOS styling with safe area insets and shadow
      isIOS && 'pb-[env(safe-area-inset-bottom)] shadow-[0_-2px_8px_rgba(0,0,0,0.05)] ios-element',
      hasNotch && 'safe-padding-bottom',
      className
    )}>
      <div className="flex justify-around items-center py-2">
        <Link href="/dashboard">
          <div 
            className={cn(
              "flex flex-col items-center p-2 cursor-pointer transition-colors",
              "active:bg-gray-50 touch-action-manipulation",
              isIOS && "min-h-[44px] min-w-[44px] ios-no-callout ios-no-zoom",
              isActive('/dashboard') || isActive('/view-plan')
                ? "text-primary font-medium"
                : "text-neutral-600"
            )}
            style={getIOSActiveStyle(isActive('/dashboard') || isActive('/view-plan'))}
            role="button"
            aria-label="Home tab"
            aria-current={isActive('/dashboard') || isActive('/view-plan') ? "page" : undefined}
          >
            <Home className={cn("h-6 w-6", isIOS && "mb-0.5")} />
            <span className={cn(
              "text-xs mt-1", 
              isIOS && "font-medium text-[10px]"
            )}>
              Home
            </span>
          </div>
        </Link>
        
        {isIOS && (
          <Link href="/ios-demo">
            <div 
              className={cn(
                "flex flex-col items-center p-2 cursor-pointer transition-colors",
                "active:bg-gray-50 touch-action-manipulation",
                "min-h-[44px] min-w-[44px] ios-no-callout ios-no-zoom",
                isActive('/ios-demo')
                  ? "text-primary font-medium"
                  : "text-neutral-600"
              )}
              style={getIOSActiveStyle(isActive('/ios-demo'))}
              role="button"
              aria-label="iOS Demo"
              aria-current={isActive('/ios-demo') ? "page" : undefined}
            >
              <AppleIcon className={cn("h-6 w-6 mb-0.5")} />
              <span className={cn(
                "text-xs mt-1",
                "font-medium text-[10px]"
              )}>
                iOS Demo
              </span>
            </div>
          </Link>
        )}

        <Link href="/user-data">
          <div 
            className={cn(
              "flex flex-col items-center p-2 cursor-pointer transition-colors",
              "active:bg-gray-50 touch-action-manipulation",
              isIOS && "min-h-[44px] min-w-[44px] ios-no-callout ios-no-zoom",
              isActive('/user-data')
                ? "text-primary font-medium"
                : "text-neutral-600"
            )}
            style={getIOSActiveStyle(isActive('/user-data'))}
            role="button"
            aria-label="Profile tab"
            aria-current={isActive('/user-data') ? "page" : undefined}
          >
            <User className={cn("h-6 w-6", isIOS && "mb-0.5")} />
            <span className={cn(
              "text-xs mt-1", 
              isIOS && "font-medium text-[10px]"
            )}>
              Profile
            </span>
          </div>
        </Link>

        <Link href="/set-goals">
          <div 
            className={cn(
              "flex flex-col items-center p-2 cursor-pointer transition-colors",
              "active:bg-gray-50 touch-action-manipulation",
              isIOS && "min-h-[44px] min-w-[44px] ios-no-callout ios-no-zoom",
              isActive('/set-goals')
                ? "text-primary font-medium"
                : "text-neutral-600"
            )}
            style={getIOSActiveStyle(isActive('/set-goals'))}
            role="button"
            aria-label="Goals tab"
            aria-current={isActive('/set-goals') ? "page" : undefined}
          >
            <Target className={cn("h-6 w-6", isIOS && "mb-0.5")} />
            <span className={cn(
              "text-xs mt-1", 
              isIOS && "font-medium text-[10px]"
            )}>
              Goals
            </span>
          </div>
        </Link>

        <Link href="/daily-log">
          <div 
            className={cn(
              "flex flex-col items-center p-2 cursor-pointer transition-colors",
              "active:bg-gray-50 touch-action-manipulation",
              isIOS && "min-h-[44px] min-w-[44px] ios-no-callout ios-no-zoom",
              isActive('/daily-log')
                ? "text-primary font-medium"
                : "text-neutral-600"
            )}
            style={getIOSActiveStyle(isActive('/daily-log'))}
            role="button"
            aria-label="Log tab"
            aria-current={isActive('/daily-log') ? "page" : undefined}
          >
            <Calendar className={cn("h-6 w-6", isIOS && "mb-0.5")} />
            <span className={cn(
              "text-xs mt-1", 
              isIOS && "font-medium text-[10px]"
            )}>
              Log
            </span>
          </div>
        </Link>

        <Link href="/progress">
          <div 
            className={cn(
              "flex flex-col items-center p-2 cursor-pointer transition-colors",
              "active:bg-gray-50 touch-action-manipulation",
              isIOS && "min-h-[44px] min-w-[44px] ios-no-callout ios-no-zoom",
              isActive('/progress') || isActive('/body-stats')
                ? "text-primary font-medium"
                : "text-neutral-600"
            )}
            style={getIOSActiveStyle(isActive('/progress') || isActive('/body-stats'))}
            role="button"
            aria-label="Progress tab"
            aria-current={isActive('/progress') || isActive('/body-stats') ? "page" : undefined}
          >
            <Activity className={cn("h-6 w-6", isIOS && "mb-0.5")} />
            <span className={cn(
              "text-xs mt-1", 
              isIOS && "font-medium text-[10px]"
            )}>
              Progress
            </span>
          </div>
        </Link>
      </div>
    </div>
  );
}