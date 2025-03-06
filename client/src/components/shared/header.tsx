import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Activity, Menu, User } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { brandColors, brandValues } from '@/lib/brand';

export default function Header() {
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
                <Link href="/">
                  <a className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors py-2">
                    <div className="h-9 w-9 rounded-md bg-primary/10 flex items-center justify-center">
                      <Activity className="h-5 w-5 text-primary" />
                    </div>
                    <span>Dashboard</span>
                  </a>
                </Link>
                <Link href="/user-data">
                  <a className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors py-2">
                    <div className="h-9 w-9 rounded-md bg-primary/10 flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <span>My Profile</span>
                  </a>
                </Link>
                <Link href="/set-goals">
                  <a className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors py-2">
                    <div className="h-9 w-9 rounded-md bg-primary/10 flex items-center justify-center">
                      <Activity className="h-5 w-5 text-primary" />
                    </div>
                    <span>Set Goals</span>
                  </a>
                </Link>
                <Link href="/daily-log">
                  <a className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors py-2">
                    <div className="h-9 w-9 rounded-md bg-primary/10 flex items-center justify-center">
                      <Activity className="h-5 w-5 text-primary" />
                    </div>
                    <span>Daily Log</span>
                  </a>
                </Link>
                <Link href="/progress">
                  <a className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors py-2">
                    <div className="h-9 w-9 rounded-md bg-primary/10 flex items-center justify-center">
                      <Activity className="h-5 w-5 text-primary" />
                    </div>
                    <span>Progress</span>
                  </a>
                </Link>
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