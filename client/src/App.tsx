import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import UserData from './pages/user-data';
import SetGoals from './pages/set-goals';
import DailyLog from './pages/daily-log';
import BodyStats from './pages/body-stats';
import ViewPlan from './pages/view-plan';
import NotFound from './pages/not-found';

// Create a client
const queryClient = new QueryClient();

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<UserData />} />
          <Route path="/user-data" element={<UserData />} />
          <Route path="/goals" element={<SetGoals />} />
          <Route path="/log" element={<DailyLog />} />
          <Route path="/stats" element={<BodyStats />} />
          <Route path="/plan" element={<ViewPlan />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;