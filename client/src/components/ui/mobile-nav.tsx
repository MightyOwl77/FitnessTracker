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
  
  const navItems = [
    {
      label: 'Home',
      href: '/',
      icon: Home,
      active: location === '/' || location === '/dashboard',
    },
    {
      label: 'Profile',
      href: '/user-data',
      icon: User,
      active: location === '/user-data',
    },
    {
      label: 'Goals',
      href: '/set-goals',
      icon: Target,
      active: location === '/set-goals',
    },
    {
      label: 'Log',
      href: '/daily-log',
      icon: ClipboardList,
      active: location === '/daily-log',
    },
    {
      label: 'Progress',
      href: '/progress',
      icon: BarChart2,
      active: location === '/progress' || location === '/body-stats',
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
}

function NavItem({ href, label, active, Icon }: NavItemProps) {
  return (
    <Link href={href}>
      <a className={cn(
        'flex flex-col items-center justify-center gap-1 rounded-md px-3 py-2 text-xs transition-colors',
        active 
          ? 'text-primary font-medium' 
          : 'text-muted-foreground hover:text-foreground'
      )}>
        <Icon 
          size={20} 
          className={cn(
            'transition-all',
            active && 'text-primary' 
          )} 
        />
        <span>{label}</span>
        
        {/* Indicator dot for active item */}
        {active && (
          <span 
            className="absolute bottom-1 h-1 w-1 rounded-full bg-primary"
            style={{ backgroundColor: brandColors.primary }}
          />
        )}
      </a>
    </Link>
  );
}