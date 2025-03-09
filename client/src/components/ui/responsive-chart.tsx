
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface ResponsiveChartProps {
  children: React.ReactNode;
  aspectRatio?: number; // Width to height ratio (default 16:9)
  className?: string;
}

export function ResponsiveChart({
  children,
  aspectRatio = 16/9,
  className = '',
}: ResponsiveChartProps) {
  const isMobile = useIsMobile();
  
  // Calculate padding based on aspect ratio (for padding-bottom trick to maintain aspect ratio)
  const paddingPercentage = `${(1 / aspectRatio) * 100}%`;
  
  return (
    <div 
      className={`relative w-full mobile-chart-container ${className}`}
      style={{ 
        paddingBottom: isMobile ? undefined : paddingPercentage,
        height: isMobile ? '300px' : undefined
      }}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}
