import React, { useState, useEffect } from 'react';
import { useLeetCode } from '../context/LeetcodeContext';
import { FiChevronDown, FiSearch } from 'react-icons/fi';
import './styles/Controls.css';

const Controls = () => {
  const { 
    searchTerm, 
    sortOrder, 
    handleSearchChange, 
    handleSortChange,
    theme = 'light' // assuming theme comes from context
  } = useLeetCode();

  const [showRepoInput, setShowRepoInput] = useState(false);
  const [repoInput, setRepoInput] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load existing repo when dropdown opens
  useEffect(() => {
    if (showRepoInput) {
      const savedRepo = localStorage.getItem("repo") || "";
      setRepoInput(savedRepo);
      setError("");
    }
  }, [showRepoInput]);

  // Normalize repo input
  const normalizeRepo = (input) => {
    try {
      if (input.includes("github.com")) {
        const parts = input
          .replace("https://", "")
          .replace("http://", "")
          .replace("www.", "")
          .split("/");
        return `${parts[1]}/${parts[2].replace(/\.git$/, "")}`;
      }
      return input.replace(/\.git$/, "");
    } catch {
      return input;
    }
  };

  const handleRepoSubmit = async () => {
    if (!repoInput.trim()) {
      setError("⚠️ Please enter a valid repo (owner/repo).");
      return;
    }

    setIsSubmitting(true);
    setError("");

    // Simulate async operation for smooth animation
    await new Promise(resolve => setTimeout(resolve, 800));

    const normalized = normalizeRepo(repoInput.trim());
    localStorage.setItem("repo", normalized);
    
    setIsSubmitting(false);
    setShowRepoInput(false);
    
    // Success feedback
    setTimeout(() => {
      alert(`✅ Repo saved: ${normalized}`);
    }, 200);
  };

  return (
    <div className={`lc-controls ${theme}`}>
      <div className="lc-controls-main">
        {/* Search Section */}
        <div className="lc-search-wrapper">
          <div className="lc-search-container">
            <FiSearch className="lc-search-icon" />
            <input
              type="text"
              placeholder="Search problems..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="lc-search-input"
            />
          </div>
        </div>

        {/* Sort Section */}
        <div className="lc-sort-wrapper">
          <span className="lc-sort-label">Sort by:</span>
          <div className="lc-sort-buttons">
            <button
              onClick={() => handleSortChange('ascending')}
              className={`lc-sort-btn ${sortOrder === 'ascending' ? 'lc-active' : ''}`}
            >
              <span className="lc-sort-arrow">↑</span>
              Ascending
            </button>
            <button
              onClick={() => handleSortChange('descending')}
              className={`lc-sort-btn ${sortOrder === 'descending' ? 'lc-active' : ''}`}
            >
              <span className="lc-sort-arrow">↓</span>
              Descending
            </button>
          </div>

          {/* Repo Selector Button */}
          <button
            className={`lc-repo-toggle ${showRepoInput ? 'lc-active' : ''}`}
            onClick={() => setShowRepoInput(!showRepoInput)}
            aria-label="Toggle repository settings"
          >
            <FiChevronDown 
              className={`lc-chevron ${showRepoInput ? 'lc-rotated' : ''}`} 
              size={18} 
            />
          </button>
        </div>
      </div>

      {/* Repo Input Dropdown */}
      <div className={`lc-repo-dropdown ${showRepoInput ? 'lc-visible' : ''}`}>
        <div className="lc-repo-content">
          <div className="lc-repo-header">
            <h4 className="lc-repo-title">GitHub Repository</h4>
            <p className="lc-repo-subtitle">
              Enter your repository in format: <code>owner/repo</code>
            </p>
          </div>
          
          <div className="lc-repo-input-group">
            <input
              type="text"
              placeholder="e.g., adarsh23/react"
              value={repoInput}
              onChange={(e) => {
                setRepoInput(e.target.value);
                setError("");
              }}
              className="lc-repo-input"
              disabled={isSubmitting}
            />
            <button 
              onClick={handleRepoSubmit} 
              className={`lc-repo-submit ${isSubmitting ? 'lc-loading' : ''}`}
              disabled={isSubmitting || !repoInput.trim()}
            >
              {isSubmitting ? (
                <div className="lc-spinner"></div>
              ) : (
                'Save'
              )}
            </button>
          </div>
          
          {error && (
            <div className="lc-error-message">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Controls;