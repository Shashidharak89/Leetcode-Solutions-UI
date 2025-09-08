import React from 'react';
import { useLeetCode } from '../context/LeetcodeContext';
import ProblemCard from './ProblemCard';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import NoResults from './NoResults';
import './styles/ProblemsGrid.css';

const ProblemsGrid = () => {
  const { 
    loading, 
    error, 
    filteredFolders, 
    searchTerm, 
    fetchSolutions 
  } = useLeetCode();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage error={error} onRetry={fetchSolutions} />;
  }

  if (filteredFolders.length === 0 && searchTerm) {
    return <NoResults />;
  }

  return (
    <div className="leetcode-problems-grid">
      {filteredFolders.map((folder) => (
        <ProblemCard key={folder.name} folder={folder} />
      ))}
    </div>
  );
};

export default ProblemsGrid;