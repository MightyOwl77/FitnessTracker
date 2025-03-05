import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MobileNav } from './components/ui/mobile-nav';
import { ThemeToggle } from './components/ui/theme-toggle';
import UserData from './pages/user-data';
import SetGoals from './pages/set-goals';
import DailyLog from './pages/daily-log';
import BodyStats from './pages/body-stats';
import ViewPlan from './pages/view-plan';
import NotFound from './pages/not-found';

// Create a client
const queryClient = new QueryClient();

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 dark:text-white">
      <MobileNav />
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="flex justify-end mb-4">
          <ThemeToggle />
        </div>
        {children}
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout><UserData /></AppLayout>} />
          <Route path="/user-data" element={<AppLayout><UserData /></AppLayout>} />
          <Route path="/goals" element={<AppLayout><SetGoals /></AppLayout>} />
          <Route path="/log" element={<AppLayout><DailyLog /></AppLayout>} />
          <Route path="/stats" element={<AppLayout><BodyStats /></AppLayout>} />
          <Route path="/plan" element={<AppLayout><ViewPlan /></AppLayout>} />
          <Route path="*" element={<AppLayout><NotFound /></AppLayout>} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;