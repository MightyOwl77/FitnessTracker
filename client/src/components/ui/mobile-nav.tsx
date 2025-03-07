import React from 'react';
import { Link, useLocation } from 'wouter';
import { Home, User, Target, ClipboardList, BarChart2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { brandColors } from '@/lib/brand';

interface MobileNavProps {
  className?: string;
}

/**
 * Mobile Navigation Component
 * 
 * A fixed bottom navigation bar for mobile devices with 5 key sections:
 * - Home (Dashboard)
 * - Profile (User data)
 * - Goals (Set goals)
 * - Log (Daily log)
 * - Progress (Track progress)
 */
export function MobileNav({ className = '' }: MobileNavProps) {
  const [location] = useLocation();
  
  // Calculate which stage the user is in based on location
  const getCurrentStage = () => {
    if (location === '/user-data') return 1;
    if (location === '/set-goals') return 2;
    if (location === '/view-plan') return 3;
    if (location === '/daily-log') return 4;
    if (location === '/progress' || location === '/body-stats') return 5;
    return 0; // Dashboard or unknown
  };

  const currentStage = getCurrentStage();
  
  const navItems = [
    {
      label: 'Home',
      href: '/',
      icon: Home,
      active: location === '/' || location === '/dashboard',
      stage: 0
    },
    {
      label: 'Profile',
      href: '/user-data',
      icon: User,
      active: location === '/user-data',
      stage: 1
    },
    {
      label: 'Goals',
      href: '/set-goals',
      icon: Target,
      active: location === '/set-goals',
      stage: 2
    },
    {
      label: 'Log',
      href: '/daily-log',
      icon: ClipboardList,
      active: location === '/daily-log',
      stage: 4
    },
    {
      label: 'Progress',
      href: '/progress',
      icon: BarChart2,
      active: location === '/progress' || location === '/body-stats',
      stage: 5
    },
  ];

  return (
    <nav className={cn(
      'fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t bg-background px-2 md:hidden',
      className
    )}>
      {navItems.map((item) => (
        <NavItem
          key={item.href}
          href={item.href}
          label={item.label}
          active={item.active}
          Icon={item.icon}
          stage={item.stage}
          currentStage={currentStage}
        />
      ))}
    </nav>
  );
}

interface NavItemProps {
  href: string;
  label: string;
  active: boolean;
  Icon: React.ElementType;
  stage: number;
  currentStage: number;
}

function NavItem({ href, label, active, Icon, stage, currentStage }: NavItemProps) {
  // Determine if this nav item is completed (user has progressed past this stage)
  const isCompleted = currentStage > stage && stage > 0;
  
  // Determine if this nav item is the current stage
  const isCurrent = currentStage === stage;
  
  // Determine if this nav item is a future stage that hasn't been reached
  const isFuture = currentStage < stage && stage > 0;

  return (
    <Link href={href}>
      <a className={cn(
        'flex flex-col items-center justify-center gap-1 rounded-md px-3 py-2 text-xs transition-colors relative',
        active 
          ? 'text-primary font-medium' 
          : 'text-muted-foreground hover:text-foreground',
        isCompleted && 'text-green-500',
        isFuture && 'text-muted-foreground'
      )}>
        <div className={cn(
          'relative flex items-center justify-center',
          active && 'text-primary'
        )}>
          {/* Show completed checkmark or stage number for non-dashboard items */}
          {stage > 0 && (
            <div className={cn(
              'absolute -top-1 -right-1 h-3 w-3 flex items-center justify-center rounded-full text-[10px] font-bold',
              isCompleted ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground',
              active && 'bg-primary text-primary-foreground'
            )}>
              {stage}
            </div>
          )}
          
          <Icon 
            size={20} 
            className={cn(
              'transition-all',
              active && 'text-primary',
              isCompleted && 'text-green-500',
              isFuture && 'text-muted-foreground'
            )} 
          />
        </div>
        
        <span>{label}</span>
        
        {/* Enhanced indicator for active item */}
        {active && (
          <div className="absolute w-full h-full pointer-events-none">
            <span 
              className="absolute bottom-1 h-1 w-1 rounded-full bg-primary"
              style={{ backgroundColor: active ? brandColors.primary : undefined }}
            />
            <span className="absolute top-0 inset-x-2 h-0.5 bg-primary rounded-b-full opacity-80" />
          </div>
        )}
      </a>
    </Link>
  );
}