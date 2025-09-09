import React, { useState, useEffect } from 'react';
import { useLeetCode } from '../context/LeetcodeContext';
import { FiChevronDown, FiSearch, FiTrash2, FiSave, FiFilter } from 'react-icons/fi';
import './styles/Controls.css';

const Controls = () => {
  const { 
    searchTerm, 
    sortOrder, 
    handleSearchChange, 
    handleSortChange,
    theme = 'light'
  } = useLeetCode();

  const [showRepoInput, setShowRepoInput] = useState(false);
  const [repoInput, setRepoInput] = useState("");
  const [currentRepo, setCurrentRepo] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  // Load existing repo when component mounts or dropdown opens
  useEffect(() => {
    const savedRepo = localStorage.getItem("repo") || "";
    setCurrentRepo(savedRepo);
    if (showRepoInput) {
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
    setCurrentRepo(normalized);
    
    setIsSubmitting(false);
    setShowRepoInput(false);
    
    // Success feedback
    setTimeout(() => {
      alert(`✅ Repo saved: ${normalized}`);
    }, 200);
  };

  const handleDeleteRepo = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDeleteRepo = () => {
    localStorage.removeItem("repo");
    setCurrentRepo("");
    setRepoInput("");
    setShowDeleteConfirm(false);
    setShowRepoInput(false);
    
    // Success feedback
    setTimeout(() => {
      alert("🗑️ Repository removed successfully!");
    }, 200);
  };

  const cancelDeleteRepo = () => {
    setShowDeleteConfirm(false);
  };

  const handleFilterSelect = (order) => {
    handleSortChange(order);
    setShowFilterDropdown(false);
  };

  return (
    <div className={`lc-controls-enhanced ${theme}`}>
      <div className="lc-controls-main-enhanced">
        {/* Search Section */}
        <div className="lc-search-wrapper-enhanced">
          <div className="lc-search-container-enhanced">
            <FiSearch className="lc-search-icon-enhanced" />
            <input
              type="text"
              placeholder="Search problems..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="lc-search-input-enhanced"
            />
            
            {/* Search Bar Right Icons Container */}
            <div className="lc-search-icons-container-enhanced">
              {/* Mobile Filter Button */}
              <div className="lc-mobile-filter-enhanced">
                <button
                  onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                  className={`lc-filter-btn-enhanced ${showFilterDropdown ? 'lc-active-enhanced' : ''}`}
                  aria-label="Sort options"
                >
                  <FiFilter size={18} />
                </button>
                
                {/* Filter Dropdown */}
                <div className={`lc-filter-dropdown-enhanced ${showFilterDropdown ? 'lc-visible-enhanced' : ''}`}>
                  <button
                    onClick={() => handleFilterSelect('ascending')}
                    className={`lc-filter-option-enhanced ${sortOrder === 'ascending' ? 'lc-selected-enhanced' : ''}`}
                  >
                    <span className="lc-filter-arrow-enhanced">↑</span>
                    Ascending
                  </button>
                  <button
                    onClick={() => handleFilterSelect('descending')}
                    className={`lc-filter-option-enhanced ${sortOrder === 'descending' ? 'lc-selected-enhanced' : ''}`}
                  >
                    <span className="lc-filter-arrow-enhanced">↓</span>
                    Descending
                  </button>
                </div>
              </div>

              {/* Repository V Icon Button */}
              <button
                className={`lc-repo-toggle-enhanced lc-search-repo-toggle-enhanced ${showRepoInput ? 'lc-active-enhanced' : ''}`}
                onClick={() => setShowRepoInput(!showRepoInput)}
                aria-label="Toggle repository settings"
              >
                <FiChevronDown 
                  className={`lc-chevron-enhanced ${showRepoInput ? 'lc-rotated-enhanced' : ''}`} 
                  size={18} 
                />
              </button>
            </div>
          </div>
        </div>

        {/* Sort Section - Desktop */}
        
      </div>

      {/* Repo Input Dropdown */}
      <div className={`lc-repo-dropdown-enhanced ${showRepoInput ? 'lc-visible-enhanced' : ''}`}>
        <div className="lc-repo-content-enhanced">
          <div className="lc-repo-header-enhanced">
            <h4 className="lc-repo-title-enhanced">GitHub Repository</h4>
            <p className="lc-repo-subtitle-enhanced">
              Enter your repository in format: <code>owner/repo</code>
            </p>
            {currentRepo && (
              <p className="lc-current-repo-enhanced">
                Current: <span className="lc-repo-name-enhanced">{currentRepo}</span>
              </p>
            )}
          </div>
          
          <div className="lc-repo-input-group-enhanced">
            <input
              type="text"
              placeholder="e.g., adarsh23/react"
              value={repoInput}
              onChange={(e) => {
                setRepoInput(e.target.value);
                setError("");
              }}
              className="lc-repo-input-enhanced"
              disabled={isSubmitting}
            />
            <div className="lc-repo-actions-enhanced">
              <button 
                onClick={handleRepoSubmit} 
                className={`lc-repo-submit-enhanced ${isSubmitting ? 'lc-loading-enhanced' : ''}`}
                disabled={isSubmitting || !repoInput.trim()}
                title="Save repository"
              >
                {isSubmitting ? (
                  <div className="lc-spinner-enhanced"></div>
                ) : (
                  <FiSave size={16} />
                )}
              </button>
              
              {currentRepo && (
                <button 
                  onClick={handleDeleteRepo}
                  className="lc-repo-delete-enhanced"
                  disabled={isSubmitting}
                  title="Delete repository"
                >
                  <FiTrash2 size={16} />
                </button>
              )}
            </div>
          </div>
          
          {error && (
            <div className="lc-error-message-enhanced">
              {error}
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {showDeleteConfirm && (
            <div className="lc-delete-overlay-enhanced">
              <div className="lc-delete-modal-enhanced">
                <h5 className="lc-delete-title-enhanced">Confirm Deletion</h5>
                <p className="lc-delete-message-enhanced">
                  Are you sure you want to remove the repository <strong>{currentRepo}</strong>?
                </p>
                <div className="lc-delete-actions-enhanced">
                  <button 
                    onClick={cancelDeleteRepo}
                    className="lc-cancel-btn-enhanced"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={confirmDeleteRepo}
                    className="lc-confirm-delete-btn-enhanced"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Controls;