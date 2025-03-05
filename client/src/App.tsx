import { Route, Switch } from 'wouter';
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from './lib/queryClient';
import { MobileNav } from './components/ui/mobile-nav';
import { ThemeToggle } from './components/ui/theme-toggle';
import Header from './components/shared/header';
import UserData from './pages/user-data';
import SetGoals from './pages/set-goals';
import DailyLog from './pages/daily-log';
import BodyStats from './pages/body-stats';
import ViewPlan from './pages/view-plan';
import NotFound from './pages/not-found';

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 dark:text-white">
      <Header />
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

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Switch>
        <Route path="/" component={() => <AppLayout><UserData /></AppLayout>} />
        <Route path="/user-data" component={() => <AppLayout><UserData /></AppLayout>} />
        <Route path="/goals" component={() => <AppLayout><SetGoals /></AppLayout>} />
        <Route path="/log" component={() => <AppLayout><DailyLog /></AppLayout>} />
        <Route path="/stats" component={() => <AppLayout><BodyStats /></AppLayout>} />
        <Route path="/plan" component={() => <AppLayout><ViewPlan /></AppLayout>} />
        <Route component={() => <AppLayout><NotFound /></AppLayout>} />
      </Switch>
    </QueryClientProvider>
  );
};

export default App;