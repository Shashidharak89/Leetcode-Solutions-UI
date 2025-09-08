import React, { useEffect } from 'react';
import { useLeetCode, LeetCodeProvider } from '../context/LeetcodeContext';
import Header from './Header';
import Controls from './Controls';
import ProblemsGrid from './ProblemsGrid';
import Modal from './Modal';
import './styles/Dashboard.css';

// Main content component that uses the context
const DashboardContent = () => {
  const { theme, fetchSolutions } = useLeetCode();

  useEffect(() => {
    fetchSolutions();
  }, []);

  return (
    <div className={`leetcode-container ${theme}`}>
      <Header />
      <main className="leetcode-main">
        <div className="leetcode-content">
          <Controls />
          <ProblemsGrid />
        </div>
      </main>
      <Modal />
    </div>
  );
};

// Root Dashboard component that provides the context
const Dashboard = () => {
  return (
    <LeetCodeProvider>
      <DashboardContent />
    </LeetCodeProvider>
  );
};

export default Dashboard;
