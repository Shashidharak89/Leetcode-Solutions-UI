import React from 'react';
import { useLeetCode } from '../context/LeetcodeContext';
import './styles/Controls.css';

const Controls = () => {
  const { 
    searchTerm, 
    sortOrder, 
    handleSearchChange, 
    handleSortChange 
  } = useLeetCode();

  return (
    <div className="leetcode-controls">
      <div className="leetcode-search-container">
        <input
          type="text"
          placeholder="🔍 Search problems..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="leetcode-search-input"
        />
      </div>
      
      <div className="leetcode-sort-container">
        <span className="leetcode-sort-label">Sort:</span>
        <button
          onClick={() => handleSortChange('ascending')}
          className={`leetcode-sort-btn ${sortOrder === 'ascending' ? 'active' : ''}`}
        >
          ↑ Ascending
        </button>
        <button
          onClick={() => handleSortChange('descending')}
          className={`leetcode-sort-btn ${sortOrder === 'descending' ? 'active' : ''}`}
        >
          ↓ Descending
        </button>
      </div>
    </div>
  );
};

export default Controls;