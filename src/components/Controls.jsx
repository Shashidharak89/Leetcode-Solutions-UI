import React, { useState } from 'react';
import { useLeetCode } from '../context/LeetcodeContext';
import { FiChevronDown } from 'react-icons/fi';
import './styles/Controls.css';

const Controls = () => {
  const { 
    searchTerm, 
    sortOrder, 
    handleSearchChange, 
    handleSortChange 
  } = useLeetCode();

  const [showRepoInput, setShowRepoInput] = useState(false);
  const [repoInput, setRepoInput] = useState("");

  // 🔧 Normalize repo input
  const normalizeRepo = (input) => {
    try {
      // If full GitHub URL
      if (input.includes("github.com")) {
        const parts = input
          .replace("https://", "")
          .replace("http://", "")
          .replace("www.", "")
          .split("/");
        return `${parts[1]}/${parts[2].replace(/\.git$/, "")}`;
      }
      // If directly owner/repo
      return input.replace(/\.git$/, "");
    } catch {
      return input;
    }
  };

  const handleRepoSubmit = () => {
    if (!repoInput.trim()) return;
    const normalized = normalizeRepo(repoInput.trim());
    localStorage.setItem("repo", normalized);
    alert(`✅ Repo saved: ${normalized}`);
    setRepoInput("");
    setShowRepoInput(false);
  };

  return (
    <div className="leetcode-controls">
      {/* Search */}
      <div className="leetcode-search-container">
        <input
          type="text"
          placeholder="🔍 Search problems..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="leetcode-search-input"
        />
      </div>

      {/* Sort */}
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

        {/* Repo Selector */}
        <button
          className="leetcode-repo-btn"
          onClick={() => setShowRepoInput(!showRepoInput)}
        >
          <FiChevronDown size={18} />
        </button>
      </div>

      {/* Repo Input Dropdown */}
      {showRepoInput && (
        <div className="leetcode-repo-dropdown">
          <input
            type="text"
            placeholder="Enter GitHub repo (owner/repo)"
            value={repoInput}
            onChange={(e) => setRepoInput(e.target.value)}
            className="leetcode-repo-input"
          />
          <button onClick={handleRepoSubmit} className="leetcode-repo-submit">
            Save
          </button>
        </div>
      )}
    </div>
  );
};

export default Controls;
