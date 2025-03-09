
import React, { useEffect, useState, useRef, ReactNode } from 'react';
import { useWindowSize } from '@/lib/hooks';
import { isMobileDevice } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface ResponsiveChartProps {
  children: ReactNode;
  aspectRatio?: number;
  className?: string;
  minHeight?: number;
  fallback?: ReactNode;
}

/**
 * Responsive chart wrapper that handles proper sizing and mobile optimization
 */
const ResponsiveChart: React.FC<ResponsiveChartProps> = ({
  children,
  aspectRatio = 16/9,
  className,
  minHeight = 250,
  fallback
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { width: windowWidth } = useWindowSize();
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const isMobile = isMobileDevice();

  useEffect(() => {
    setHasMounted(true);
    
    const calculateDimensions = () => {
      if (!containerRef.current) return;
      
      const containerWidth = containerRef.current.clientWidth;
      let containerHeight = containerWidth / aspectRatio;
      
      // Ensure minimum height
      if (containerHeight < minHeight) {
        containerHeight = minHeight;
      }
      
      setDimensions({
        width: containerWidth,
        height: containerHeight
      });
    };
    
    // Initial calculation
    calculateDimensions();
    
    // Setup resize observer for responsive behavior
    const resizeObserver = new ResizeObserver(() => {
      calculateDimensions();
    });
    
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    
    // Setup intersection observer to only render visible charts (performance)
    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            // Once visible, we can stop observing
            if (containerRef.current) {
              intersectionObserver.unobserve(containerRef.current);
            }
          }
        });
      },
      { threshold: 0.1 } // 10% visibility is enough to trigger
    );
    
    if (containerRef.current) {
      intersectionObserver.observe(containerRef.current);
    }
    
    return () => {
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
    };
  }, [aspectRatio, minHeight, windowWidth]);

  if (!hasMounted) {
    return <div className={cn("animate-pulse bg-muted rounded-md", className)} style={{ height: minHeight }} />;
  }

  return (
    <div 
      ref={containerRef}
      className={cn(
        "relative overflow-hidden mobile-chart-container",
        isMobile ? "touch-action-pan-y" : "",
        className
      )}
      style={{ minHeight }}
    >
      {isVisible ? (
        <div style={{ width: dimensions.width, height: dimensions.height }}>
          {children}
        </div>
      ) : (
        fallback || <div className="flex items-center justify-center h-full">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
};

export default ResponsiveChart;
