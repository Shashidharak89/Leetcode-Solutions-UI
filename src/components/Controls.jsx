import React from "react";
import { useLeetCode } from "../context/LeetcodeContext";
import { FaSortAlphaDown, FaSortAlphaUp, FaClock } from "react-icons/fa";
import "./styles/Controls.css";

const Controls = () => {
  const { searchTerm, sortOrder, handleSearchChange, handleSortChange } =
    useLeetCode();

  return (
    <div className="leetcode-controls">
      {/* 🔍 Search */}
      <div className="leetcode-search-container">
        <input
          type="text"
          placeholder="Search problems..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="leetcode-search-input"
        />
      </div>

      {/* ↕ Sort Buttons */}
      <div className="leetcode-sort-container">
        <span className="leetcode-sort-label">Sort:</span>

        <button
          onClick={() => handleSortChange("ascending")}
          className={`leetcode-sort-btn ${
            sortOrder === "ascending" ? "active" : ""
          }`}
        >
          <FaSortAlphaDown /> Asc
        </button>

        <button
          onClick={() => handleSortChange("descending")}
          className={`leetcode-sort-btn ${
            sortOrder === "descending" ? "active" : ""
          }`}
        >
          <FaSortAlphaUp /> Desc
        </button>

        <button
          onClick={() => handleSortChange("latest")}
          className={`leetcode-sort-btn ${
            sortOrder === "latest" ? "active" : ""
          }`}
        >
          <FaClock /> Latest
        </button>
      </div>
    </div>
  );
};

export default Controls;
