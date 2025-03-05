import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import UserData from './pages/user-data';
import SetGoals from './pages/set-goals';
import DailyLog from './pages/daily-log';
import BodyStats from './pages/body-stats';
import ViewPlan from './pages/view-plan';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<UserData />} />
        <Route path="/goals" element={<SetGoals />} />
        <Route path="/log" element={<DailyLog />} />
        <Route path="/stats" element={<BodyStats />} />
        <Route path="/plan" element={<ViewPlan />} />
      </Routes>
    </Router>
  );
};

export default App;