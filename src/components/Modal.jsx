import React from 'react';
import { useLeetCode } from '../context/LeetcodeContext';
import './styles/Modal.css';

const Modal = () => {
  const {
    showModal,
    selectedProblem,
    selectedSolution,
    fileContent,
    fontSize,
    closeModal,
    copyToClipboard,
    switchSolution,
    increaseFontSize,
    decreaseFontSize,
    resetFontSize,
    theme
  } = useLeetCode();

  if (!showModal) return null;

  return (
    <div className="leetcode-modal-overlay" onClick={closeModal}>
      <div
        className={`leetcode-modal ${theme}`} // 🔹 theme-aware
        onClick={e => e.stopPropagation()}
      >
        <div className="leetcode-modal-header">
          <div className="leetcode-modal-info">
            <h2 className="leetcode-modal-title">
              {selectedProblem?.displayName}
            </h2>
            <div className="leetcode-modal-file-info">
              <span className="leetcode-modal-filename">
                {selectedProblem?.files[selectedSolution]?.name}
              </span>
              {selectedProblem?.files.length > 1 && (
                <span className="leetcode-modal-counter">
                  {selectedSolution + 1} of {selectedProblem.files.length}
                </span>
              )}
            </div>
          </div>
          
          <div className="leetcode-modal-controls">
            {selectedProblem?.files.length > 1 && (
              <div className="leetcode-modal-nav">
                <button
                  onClick={() => switchSolution('prev')}
                  className="leetcode-modal-nav-btn"
                  title="Previous solution"
                >
                  ←
                </button>
                <button
                  onClick={() => switchSolution('next')}
                  className="leetcode-modal-nav-btn"
                  title="Next solution"
                >
                  →
                </button>
              </div>
            )}
            
            <div className="leetcode-modal-font-controls">
              <button
                onClick={decreaseFontSize}
                className="leetcode-modal-font-btn"
                title="Decrease font size"
              >
                A−
              </button>
              <span className="leetcode-modal-font-size">
                {fontSize}%
              </span>
              <button
                onClick={increaseFontSize}
                className="leetcode-modal-font-btn"
                title="Increase font size"
              >
                A+
              </button>
              <button
                onClick={resetFontSize}
                className="leetcode-modal-font-reset"
                title="Reset font size"
              >
                Reset
              </button>
            </div>
            
            <button
              onClick={copyToClipboard}
              className="leetcode-modal-copy-btn"
              disabled={!fileContent || fileContent === "Loading..." || fileContent.includes("⚠️")}
            >
              📋 Copy
            </button>
            
            <button
              onClick={closeModal}
              className="leetcode-modal-close-btn"
              title="Close modal"
            >
              ×
            </button>
          </div>
        </div>

        <div className="leetcode-modal-content">
          <pre 
            className="leetcode-modal-code-pre"
            style={{ fontSize: `${fontSize}%` }}
          >
            <code className="leetcode-modal-code">
              {fileContent}
            </code>
          </pre>
        </div>
      </div>
    </div>
  );
};

export default Modal;
