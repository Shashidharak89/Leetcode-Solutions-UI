import React from 'react';
import { useLeetCode } from '../context/LeetcodeContext';
import './styles/ProblemCard.css';

const ProblemCard = ({ folder }) => {
  const { openSolution } = useLeetCode();

  return (
    <div className="leetcode-problem-card">
      <h3 className="leetcode-problem-title">
        {parseInt(folder.name.match(/\d+/)?.[0] || '0')}. {folder.displayName}
      </h3>
      <div className="leetcode-solutions-grid">
        {folder.files.map((file, fileIndex) => (
          <button
            key={file.name}
            onClick={() => openSolution(folder, fileIndex)}
            className="leetcode-solution-card"
          >
            <div className="leetcode-solution-info">
              <span className="leetcode-solution-filename">
                {file.displayName}
              </span>
              <span className="leetcode-solution-lang">
                .{file.language}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProblemCard;