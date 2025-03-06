import React from 'react';
import { Link } from 'wouter';
import { 
  Home, 
  User, 
  Target, 
  Calendar, 
  BarChart2, 
  Activity
} from 'lucide-react';

interface MobileNavProps {
  className?: string;
}

export function MobileNav({ className = '' }: MobileNavProps) {
  return (
    <div className={`fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 ${className}`}>
      <div className="flex justify-around items-center py-2">
        <Link href="/view-plan">
          <div className="flex flex-col items-center p-2 text-neutral-600 hover:text-primary-600 cursor-pointer">
            <Home className="h-6 w-6" />
            <span className="text-xs mt-1">Plan</span>
          </div>
        </Link>

        <Link href="/user-data">
          <div className="flex flex-col items-center p-2 text-neutral-600 hover:text-primary-600 cursor-pointer">
            <User className="h-6 w-6" />
            <span className="text-xs mt-1">Profile</span>
          </div>
        </Link>

        <Link href="/set-goals">
          <div className="flex flex-col items-center p-2 text-neutral-600 hover:text-primary-600 cursor-pointer">
            <Target className="h-6 w-6" />
            <span className="text-xs mt-1">Goals</span>
          </div>
        </Link>

        <Link href="/daily-log">
          <div className="flex flex-col items-center p-2 text-neutral-600 hover:text-primary-600 cursor-pointer">
            <Calendar className="h-6 w-6" />
            <span className="text-xs mt-1">Log</span>
          </div>
        </Link>

        <Link href="/body-stats">
          <div className="flex flex-col items-center p-2 text-neutral-600 hover:text-primary-600 cursor-pointer">
            <Activity className="h-6 w-6" />
            <span className="text-xs mt-1">Stats</span>
          </div>
        </Link>
      </div>
    </div>
  );
}