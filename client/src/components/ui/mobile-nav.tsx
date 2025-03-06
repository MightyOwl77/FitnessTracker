import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { 
  Home, 
  User, 
  Target, 
  Calendar, 
  BarChart2, 
  Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileNavProps {
  className?: string;
}

export function MobileNav({ className = '' }: MobileNavProps) {
  const [location] = useLocation();
  const [isIOS, setIsIOS] = useState(false);
  
  // Check if the device is iOS
  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(userAgent));
  }, []);
  
  // Determine if a link is active
  const isActive = (path: string) => location === path;

  return (
    <div className={cn(
      'fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200',
      isIOS && 'pb-[env(safe-area-inset-bottom)] shadow-[0_-2px_8px_rgba(0,0,0,0.05)]',
      className
    )}>
      <div className="flex justify-around items-center py-2">
        <Link href="/dashboard">
          <div className={cn(
            "flex flex-col items-center p-2 cursor-pointer transition-colors",
            "active:bg-gray-50 touch-action-manipulation",
            isIOS && "min-h-[44px] min-w-[44px]",
            isActive('/dashboard') || isActive('/view-plan')
              ? "text-primary font-medium"
              : "text-neutral-600"
          )}>
            <Home className="h-6 w-6" />
            <span className="text-xs mt-1">Home</span>
          </div>
        </Link>

        <Link href="/user-data">
          <div className={cn(
            "flex flex-col items-center p-2 cursor-pointer transition-colors",
            "active:bg-gray-50 touch-action-manipulation",
            isIOS && "min-h-[44px] min-w-[44px]",
            isActive('/user-data')
              ? "text-primary font-medium"
              : "text-neutral-600"
          )}>
            <User className="h-6 w-6" />
            <span className="text-xs mt-1">Profile</span>
          </div>
        </Link>

        <Link href="/set-goals">
          <div className={cn(
            "flex flex-col items-center p-2 cursor-pointer transition-colors",
            "active:bg-gray-50 touch-action-manipulation",
            isIOS && "min-h-[44px] min-w-[44px]",
            isActive('/set-goals')
              ? "text-primary font-medium"
              : "text-neutral-600"
          )}>
            <Target className="h-6 w-6" />
            <span className="text-xs mt-1">Goals</span>
          </div>
        </Link>

        <Link href="/daily-log">
          <div className={cn(
            "flex flex-col items-center p-2 cursor-pointer transition-colors",
            "active:bg-gray-50 touch-action-manipulation",
            isIOS && "min-h-[44px] min-w-[44px]",
            isActive('/daily-log')
              ? "text-primary font-medium"
              : "text-neutral-600"
          )}>
            <Calendar className="h-6 w-6" />
            <span className="text-xs mt-1">Log</span>
          </div>
        </Link>

        <Link href="/progress">
          <div className={cn(
            "flex flex-col items-center p-2 cursor-pointer transition-colors",
            "active:bg-gray-50 touch-action-manipulation",
            isIOS && "min-h-[44px] min-w-[44px]",
            isActive('/progress') || isActive('/body-stats')
              ? "text-primary font-medium"
              : "text-neutral-600"
          )}>
            <Activity className="h-6 w-6" />
            <span className="text-xs mt-1">Progress</span>
          </div>
        </Link>
      </div>
    </div>
  );
}