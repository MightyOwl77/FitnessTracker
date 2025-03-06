import React, { useState, useEffect } from 'react';
import { useIsIOS, useDeviceInfo } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

/**
 * iOS-optimized Pull-to-Refresh component
 * Creates a native-feeling pull to refresh experience on iOS
 */
export function IOSPullToRefresh({ 
  onRefresh, 
  children 
}: { 
  onRefresh: () => Promise<void>, 
  children: React.ReactNode 
}) {
  const isIOS = useIsIOS();
  const [refreshing, setRefreshing] = useState(false);
  const [pullPosition, setPullPosition] = useState(0);
  const pullThreshold = 80; // pixels to pull before refresh triggers

  if (!isIOS) {
    return <>{children}</>;
  }

  // Only render the iOS version if we're on iOS
  return (
    <div className="ios-pull-container relative overflow-hidden">
      {pullPosition > 0 && (
        <div 
          className="absolute top-0 left-0 right-0 flex justify-center items-center"
          style={{ height: `${pullPosition}px` }}
        >
          <div 
            className={cn(
              "ios-spinner",
              refreshing && "opacity-100",
              !refreshing && "opacity-40"
            )}
            style={{ 
              transform: `scale(${Math.min(pullPosition / pullThreshold, 1)})`
            }}
          />
        </div>
      )}
      
      <div
        className={cn(
          "transition-transform",
          refreshing && "duration-300"
        )}
        style={{ transform: `translateY(${refreshing ? 60 : pullPosition}px)` }}
        onTouchStart={(e) => {
          if (refreshing) return;
          const startY = e.touches[0].clientY;
          
          const handleTouchMove = (e: TouchEvent) => {
            const currentY = e.touches[0].clientY;
            const diff = currentY - startY;
            
            // Only allow pulling down when at the top of the container
            const scrollTop = (e.target as HTMLElement).scrollTop || 0;
            if (scrollTop <= 0 && diff > 0) {
              // Apply resistance to pulling
              setPullPosition(diff * 0.5);
              e.preventDefault();
            }
          };
          
          const handleTouchEnd = async () => {
            if (pullPosition > pullThreshold) {
              setRefreshing(true);
              try {
                await onRefresh();
              } finally {
                setRefreshing(false);
                setPullPosition(0);
              }
            } else {
              setPullPosition(0);
            }
            
            document.removeEventListener('touchmove', handleTouchMove);
            document.removeEventListener('touchend', handleTouchEnd);
          };
          
          document.addEventListener('touchmove', handleTouchMove, { passive: false });
          document.addEventListener('touchend', handleTouchEnd);
        }}
      >
        {children}
      </div>
    </div>
  );
}

/**
 * iOS-optimized Action Button
 * Creates a floating action button that follows iOS design principles
 */
export function IOSActionButton({
  onClick,
  icon,
  label,
  variant = 'primary'
}: {
  onClick: () => void,
  icon: React.ReactNode,
  label?: string,
  variant?: 'primary' | 'secondary' | 'destructive'
}) {
  const isIOS = useIsIOS();
  const { hasNotch } = useDeviceInfo();
  
  if (!isIOS) {
    // Render a standard button on non-iOS devices
    return (
      <Button
        onClick={onClick}
        variant={variant === 'primary' ? 'default' : variant === 'destructive' ? 'destructive' : 'secondary'}
        className="fixed bottom-4 right-4 rounded-full"
      >
        {icon}
        {label && <span className="ml-2">{label}</span>}
      </Button>
    );
  }
  
  return (
    <button
      onClick={onClick}
      className={cn(
        "fixed rounded-full shadow-lg w-14 h-14 flex items-center justify-center",
        "right-4 transition-all active:scale-95 active:shadow-md z-50 ios-no-callout ios-no-zoom",
        hasNotch ? "bottom-[calc(1.5rem+env(safe-area-inset-bottom))]" : "bottom-6",
        variant === 'primary' ? "bg-primary text-white" : 
        variant === 'destructive' ? "bg-destructive text-destructive-foreground" :
        "bg-secondary text-secondary-foreground"
      )}
      aria-label={label || "Action button"}
    >
      <div className="text-[24px]">
        {icon}
      </div>
      
      {label && (
        <span className="absolute -top-8 right-0 bg-background text-foreground text-sm 
                        px-3 py-1 rounded-full shadow-sm whitespace-nowrap opacity-0 
                        transition-opacity group-hover:opacity-100">
          {label}
        </span>
      )}
    </button>
  );
}

/**
 * iOS-optimized Card component
 * Applies iOS-specific styling and interactions to cards
 */
export function IOSCard({
  children,
  className,
  ...props
}: React.ComponentProps<typeof Card>) {
  const isIOS = useIsIOS();
  
  if (!isIOS) {
    return (
      <Card className={className} {...props}>
        {children}
      </Card>
    );
  }
  
  return (
    <Card 
      className={cn(
        "ios-card rounded-xl shadow-sm overflow-hidden",
        className
      )} 
      {...props}
    >
      {children}
    </Card>
  );
}

/**
 * iOS-style Segmented Control
 * Mimics the native iOS segmented control component
 */
export function IOSSegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className
}: {
  options: {value: T, label: string}[],
  value: T,
  onChange: (value: T) => void,
  className?: string
}) {
  const isIOS = useIsIOS();
  
  if (!isIOS) {
    // Non-iOS version - use buttons
    return (
      <div className={cn("flex space-x-1 rounded-md bg-muted p-1", className)}>
        {options.map((option) => (
          <Button
            key={option.value}
            variant={value === option.value ? "default" : "ghost"}
            size="sm"
            onClick={() => onChange(option.value)}
            className="flex-1"
          >
            {option.label}
          </Button>
        ))}
      </div>
    );
  }
  
  // iOS version - mimic iOS segmented control
  return (
    <div className={cn(
      "flex rounded-lg bg-[#e4e4e7] p-1 touch-none",
      className
    )}>
      {options.map((option, index) => {
        const isActive = value === option.value;
        return (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={cn(
              "flex flex-1 items-center justify-center rounded-md py-1.5 text-sm font-medium transition-all min-h-[32px]",
              isActive ? "bg-white shadow-sm" : "text-gray-500",
              "ios-no-callout"
            )}
            style={{
              transition: "background-color 0.2s ease, transform 0.1s ease",
              transform: isActive ? "scale(1)" : "scale(0.97)",
            }}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

/**
 * iOS-style Modal Sheet
 * Creates a bottom sheet modal with iOS-style spring animations
 */
export function IOSBottomSheet({
  isOpen,
  onClose,
  children,
  title
}: {
  isOpen: boolean,
  onClose: () => void,
  children: React.ReactNode,
  title?: string
}) {
  const isIOS = useIsIOS();
  const { hasNotch } = useDeviceInfo();
  
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);
  
  if (!isIOS) {
    // Non-iOS version - use a simple modal
    if (!isOpen) return null;
    
    return (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center"
           onClick={onClose}>
        <div className="bg-background rounded-t-xl max-h-[80vh] w-full overflow-auto"
             onClick={e => e.stopPropagation()}>
          {title && (
            <div className="p-4 border-b text-center font-medium">
              {title}
            </div>
          )}
          <div className="p-4">
            {children}
          </div>
        </div>
      </div>
    );
  }
  
  // iOS version with spring physics and drag to dismiss
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 bg-black/25 backdrop-blur-sm flex items-end justify-center"
         onClick={onClose}
         style={{
           animation: "ios-fade-in 0.3s ease-out"
         }}>
      <div 
        className={cn(
          "bg-background rounded-t-xl max-h-[90vh] w-full overflow-auto ios-bounce",
          hasNotch && "safe-padding-bottom"
        )}
        onClick={e => e.stopPropagation()}
        style={{
          animation: "ios-slide-up 0.35s cubic-bezier(0.23, 1, 0.32, 1) forwards"
        }}
      >
        <div className="w-full flex justify-center pt-2 pb-1">
          <div className="w-12 h-1 bg-gray-300 rounded-full opacity-80" />
        </div>
        
        {title && (
          <div className="px-4 py-3 text-center font-medium text-base border-b border-gray-200">
            {title}
          </div>
        )}
        
        <div className="p-4 overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
}