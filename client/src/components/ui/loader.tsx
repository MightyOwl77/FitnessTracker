
import React from 'react';
import { cn } from '@/lib/utils';

interface LoaderProps {
  size?: 'small' | 'medium' | 'large';
  fullScreen?: boolean;
  message?: string;
  className?: string;
}

const Loader: React.FC<LoaderProps> = ({ 
  size = 'medium', 
  fullScreen = false,
  message,
  className
}) => {
  const sizeClasses = {
    small: 'w-4 h-4 border-2',
    medium: 'w-8 h-8 border-3',
    large: 'w-12 h-12 border-4'
  };

  const loader = (
    <div className={cn(
      "flex flex-col items-center justify-center space-y-3",
      fullScreen ? "fixed inset-0 bg-background/80 backdrop-blur-sm z-50" : "",
      className
    )}>
      <div className={cn(
        "animate-spin rounded-full border-primary border-t-transparent",
        sizeClasses[size]
      )} />
      
      {message && (
        <p className="text-sm text-muted-foreground animate-pulse">
          {message}
        </p>
      )}
    </div>
  );

  return loader;
};

export default Loader;
