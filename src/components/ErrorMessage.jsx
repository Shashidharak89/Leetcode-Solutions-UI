import React from 'react';
import './styles/ErrorMessage.css';

const ErrorMessage = ({ error, onRetry }) => {
  return (
    <div className="leetcode-error">
      <p>{error}</p>
      <button onClick={onRetry} className="leetcode-retry-btn">
        Retry
      </button>
    </div>
  );
};

export default ErrorMessage;