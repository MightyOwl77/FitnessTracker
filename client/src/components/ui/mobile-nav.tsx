import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Home, 
  User, 
  Target, 
  Calendar, 
  BarChart2 
} from 'lucide-react';

interface MobileNavProps {
  className?: string;
}

export function MobileNav({ className = '' }: MobileNavProps) {
  return (
    <div className={`fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 ${className}`}>
      <div className="flex justify-around items-center py-2">
        <Link to="/" className="flex flex-col items-center p-2 text-neutral-600 hover:text-primary-600">
          <Home className="h-6 w-6" />
          <span className="text-xs mt-1">Dashboard</span>
        </Link>

        <Link to="/profile" className="flex flex-col items-center p-2 text-neutral-600 hover:text-primary-600">
          <User className="h-6 w-6" />
          <span className="text-xs mt-1">Profile</span>
        </Link>

        <Link to="/goals" className="flex flex-col items-center p-2 text-neutral-600 hover:text-primary-600">
          <Target className="h-6 w-6" />
          <span className="text-xs mt-1">Goals</span>
        </Link>

        <Link to="/log" className="flex flex-col items-center p-2 text-neutral-600 hover:text-primary-600">
          <Calendar className="h-6 w-6" />
          <span className="text-xs mt-1">Log</span>
        </Link>

        <Link to="/progress" className="flex flex-col items-center p-2 text-neutral-600 hover:text-primary-600">
          <BarChart2 className="h-6 w-6" />
          <span className="text-xs mt-1">Progress</span>
        </Link>
      </div>
    </div>
  );
}