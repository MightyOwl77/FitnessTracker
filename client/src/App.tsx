import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";

// Import pages
import UserData from "@/pages/user-data";
import SetGoals from "@/pages/set-goals";
import ViewPlan from "@/pages/view-plan";
import DailyLog from "@/pages/daily-log";
import BodyStats from "@/pages/body-stats";

// Import shared components
import Header from "@/components/shared/header";
import ProgressBar from "@/components/shared/progress-bar";
import TabNavigation from "@/components/shared/tab-navigation";

function Router() {
  const [location] = useLocation();
  
  // Calculate current step based on location
  const getStepFromPath = (path: string) => {
    switch (path) {
      case "/":
      case "/user-data":
        return 1;
      case "/set-goals":
        return 2;
      case "/view-plan":
        return 3;
      case "/daily-log":
        return 4;
      case "/body-stats":
        return 5;
      default:
        return 1;
    }
  };
  
  const currentStep = getStepFromPath(location);
  
  return (
    <div className="bg-neutral-100 min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-6 max-w-3xl">
        <ProgressBar step={currentStep} totalSteps={5} />
        <TabNavigation activeTab={currentStep} />
        
        <Switch>
          <Route path="/" component={UserData} />
          <Route path="/user-data" component={UserData} />
          <Route path="/set-goals" component={SetGoals} />
          <Route path="/view-plan" component={ViewPlan} />
          <Route path="/daily-log" component={DailyLog} />
          <Route path="/body-stats" component={BodyStats} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
