
import { Link, useLocation } from "wouter";
import { Home, User, Goal, LineChart, Calendar, Menu } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();
  
  const navItems = [
    { href: "/user-data", label: "Profile", icon: User },
    { href: "/goals", label: "Goals", icon: Goal },
    { href: "/log", label: "Log", icon: Calendar },
    { href: "/stats", label: "Stats", icon: LineChart },
    { href: "/plan", label: "Plan", icon: Home },
  ];

  return (
    <>
      {/* Mobile bottom navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-neutral-200 z-50">
        <div className="flex justify-around">
          {navItems.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;
            
            return (
              <Link href={item.href} key={item.href}>
                <a className={cn(
                  "flex flex-col items-center py-2 px-3",
                  isActive ? "text-primary-600" : "text-neutral-500"
                )}>
                  <Icon className="h-5 w-5" />
                  <span className="text-xs mt-1">{item.label}</span>
                </a>
              </Link>
            );
          })}
        </div>
      </div>
      
      {/* Desktop sidebar - hidden on mobile */}
      <div className="hidden md:flex fixed left-0 top-0 h-full bg-white border-r border-neutral-200 w-56 flex-col p-4">
        <div className="font-bold text-xl mb-6 text-primary-600 px-4">FitTransform</div>
        <nav className="space-y-2">
          {navItems.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;
            
            return (
              <Link href={item.href} key={item.href}>
                <a className={cn(
                  "flex items-center py-2 px-4 rounded-lg transition-colors",
                  isActive 
                    ? "bg-primary-50 text-primary-600" 
                    : "text-neutral-600 hover:bg-neutral-100"
                )}>
                  <Icon className="h-5 w-5 mr-3" />
                  <span>{item.label}</span>
                </a>
              </Link>
            );
          })}
        </nav>
      </div>
      
      {/* Content padding for desktop */}
      <div className="hidden md:block md:pl-56"></div>
      
      {/* Mobile bottom padding */}
      <div className="md:hidden h-16"></div>
    </>
  );
}
