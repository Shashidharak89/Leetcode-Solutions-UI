import React from 'react';
import './styles/LoadingSpinner.css';

const LoadingSpinner = () => {
  return (
    <div className="leetcode-loading">
      <div className="leetcode-spinner"></div>
      <p>Loading solutions...</p>
    </div>
  );
};

export default LoadingSpinner;