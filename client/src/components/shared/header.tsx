import React from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { 
  Activity, 
  Menu, 
  User, 
  Home, 
  Target, 
  ClipboardList, 
  BarChart2, 
  ArrowRight,
  ChevronRight
} from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { brandColors, brandValues } from '@/lib/brand';
import { cn } from '@/lib/utils';

export default function Header() {
  const [location] = useLocation();
  
  const navItems = [
    {
      label: 'Dashboard',
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
      label: 'Set Goals',
      href: '/set-goals',
      icon: Target,
      active: location === '/set-goals',
    },
    {
      label: 'Daily Log',
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
  
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Link href="/">
            <a className="flex items-center space-x-2">
              <div className="rounded-md bg-primary p-1">
                <Activity className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
                BodyTransform
              </span>
            </a>
          </Link>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          {navItems.map((item, index) => (
            <div key={item.href} className="flex items-center">
              <Link href={item.href}>
                <a className={cn(
                  "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors relative",
                  item.active 
                    ? "text-primary bg-primary/10" 
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}>
                  <item.icon className="h-4 w-4 mr-2" />
                  {item.label}
                  
                  {/* Active indicator */}
                  {item.active && (
                    <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1/2 h-0.5 bg-primary rounded-t-full" />
                  )}
                </a>
              </Link>
              
              {/* Add connecting arrows between navigation steps */}
              {index < navItems.length - 1 && index < 4 && (
                <ChevronRight className="h-4 w-4 text-muted-foreground ml-1" />
              )}
            </div>
          ))}
        </nav>
        
        {/* Stage indicator for small screens */}
        {currentStage > 0 && (
          <div className="md:hidden flex items-center">
            <span className="text-xs text-muted-foreground">
              Stage {currentStage}/5
            </span>
          </div>
        )}
        
        <div className="flex items-center gap-2">
          <ThemeToggle />
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle className="text-left">Menu</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-4 mt-8">
                {navItems.map((item) => (
                  <Link key={item.href} href={item.href}>
                    <a className={cn(
                      "flex items-center gap-2 transition-colors py-2 relative pl-2",
                      item.active 
                        ? "text-foreground" 
                        : "text-muted-foreground hover:text-foreground"
                    )}>
                      {/* Active indicator */}
                      {item.active && (
                        <span className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full" />
                      )}
                      <div className={cn(
                        "h-9 w-9 rounded-md flex items-center justify-center",
                        item.active ? "bg-primary/20" : "bg-primary/10"
                      )}>
                        <item.icon className="h-5 w-5 text-primary" />
                      </div>
                      <span className={item.active ? "font-medium" : ""}>{item.label}</span>
                      
                      {/* Show arrow for active item */}
                      {item.active && (
                        <ArrowRight className="h-4 w-4 ml-auto text-primary" />
                      )}
                    </a>
                  </Link>
                ))}
              </nav>
              
              <div className="mt-auto pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium text-foreground">{brandValues.tagline}</p>
                  <p className="mt-1">Scientific approach to fitness</p>
                  <p>Personalized for your body</p>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          
          <Link href="/user-data">
            <a className="hidden md:flex">
              <Button variant="ghost" size="icon" className="rounded-full">
                <User className="h-5 w-5" />
                <span className="sr-only">Profile</span>
              </Button>
            </a>
          </Link>
        </div>
      </div>
    </header>
  );
}