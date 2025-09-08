import React, { useEffect, useState } from "react";
import "./styles/LeetCodeSolutions.css";

export default function LeetCodeSolutions() {
  const [folders, setFolders] = useState([]);
  const [filteredFolders, setFilteredFolders] = useState([]);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [selectedSolution, setSelectedSolution] = useState(0);
  const [fileContent, setFileContent] = useState("");
  const [theme, setTheme] = useState('light');
  const [fontSize, setFontSize] = useState(100);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('ascending');

  useEffect(() => {
    fetchSolutions();
  }, []);

  useEffect(() => {
    filterAndSortProblems();
  }, [folders, searchTerm, sortOrder]);

  function filterAndSortProblems() {
    let filtered = folders.filter(folder =>
      folder.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      folder.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    filtered.sort((a, b) => {
      const aNum = parseInt(a.name.match(/\d+/)?.[0] || '0');
      const bNum = parseInt(b.name.match(/\d+/)?.[0] || '0');
      
      if (sortOrder === 'ascending') {
        return aNum - bNum;
      } else {
        return bNum - aNum;
      }
    });

    setFilteredFolders(filtered);
  }

  async function fetchSolutions() {
    const repo = "Shashidharak89/MY-LEETCODE-SOLUTIONS";
    const url = `https://api.github.com/repos/${repo}/contents/`;
    
    try {
      setLoading(true);
      const res = await fetch(url);
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      
      // Filter directories and sort them
      const dirs = data
        .filter(item => item.type === "dir")
        .sort((a, b) => {
          const aNum = parseInt(a.name.match(/\d+/)?.[0] || '0');
          const bNum = parseInt(b.name.match(/\d+/)?.[0] || '0');
          return aNum - bNum;
        });

      let folderData = [];
      
      for (let dir of dirs) {
        try {
          const res2 = await fetch(dir.url);
          if (!res2.ok) continue;
          
          const filesInFolder = await res2.json();
          const codeFiles = filesInFolder
            .filter(f => f.name.endsWith(".java") || f.name.endsWith(".cpp") || f.name.endsWith(".py") || f.name.endsWith(".js"))
            .map(f => ({
              name: f.name,
              displayName: f.name.replace(/\.(java|cpp|py|js)$/, ''),
              downloadUrl: f.download_url,
              language: f.name.split('.').pop()
            }));

          if (codeFiles.length > 0) {
            folderData.push({
              name: dir.name,
              displayName: dir.name.replace(/-/g, ' ').replace(/^\d+\s*/, ''),
              files: codeFiles,
            });
          }
        } catch (err) {
          console.warn(`Failed to fetch files for ${dir.name}:`, err);
        }
      }
      
      setFolders(folderData);
      setError(null);
    } catch (error) {
      console.error("Error fetching solutions:", error);
      setError("Failed to load solutions. Please try again later.");
    } finally {
      setLoading(false);
    }
  }

  async function openSolution(problem, solutionIndex = 0) {
    setSelectedProblem(problem);
    setSelectedSolution(solutionIndex);
    setFileContent("Loading...");
    setShowModal(true);
    
    try {
      const file = problem.files[solutionIndex];
      const res = await fetch(file.downloadUrl);
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const text = await res.text();
      setFileContent(text);
    } catch (error) {
      console.error("Error loading file:", error);
      setFileContent("⚠️ Error loading file. Please try again.");
    }
  }

  function closeModal() {
    setShowModal(false);
    setSelectedProblem(null);
    setFileContent("");
  }

  function copyToClipboard() {
    if (fileContent && fileContent !== "Loading..." && !fileContent.includes("⚠️")) {
      navigator.clipboard.writeText(fileContent);
      alert("✅ Code copied to clipboard!");
    }
  }

  function toggleTheme() {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  }

  function increaseFontSize() {
    setFontSize(prev => Math.min(prev + 10, 200));
  }

  function decreaseFontSize() {
    setFontSize(prev => Math.max(prev - 10, 60));
  }

  function resetFontSize() {
    setFontSize(100);
  }

  function switchSolution(direction) {
    if (!selectedProblem || selectedProblem.files.length <= 1) return;
    
    let newIndex;
    if (direction === 'next') {
      newIndex = (selectedSolution + 1) % selectedProblem.files.length;
    } else {
      newIndex = selectedSolution === 0 ? selectedProblem.files.length - 1 : selectedSolution - 1;
    }
    
    openSolution(selectedProblem, newIndex);
  }

  function handleSearchChange(e) {
    setSearchTerm(e.target.value);
  }

  function handleSortChange(order) {
    setSortOrder(order);
  }

  return (
    <div className={`leetcode-container ${theme}`}>
      <header className="leetcode-header">
        <div className="leetcode-header-content">
          <img 
            src="https://res.cloudinary.com/dsojdpkgh/image/upload/v1757338892/logo_falrwg.png" 
            alt="Logo" 
            className="leetcode-logo"
          />
          <h1 className="leetcode-title">My LeetCode Solutions</h1>
          <button 
            onClick={toggleTheme}
            className="leetcode-theme-toggle"
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>
      </header>

      <main className="leetcode-main">
        <div className="leetcode-content">
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

          <div className="leetcode-problems-grid">
            {loading ? (
              <div className="leetcode-loading">
                <div className="leetcode-spinner"></div>
                <p>Loading solutions...</p>
              </div>
            ) : error ? (
              <div className="leetcode-error">
                <p>{error}</p>
                <button onClick={fetchSolutions} className="leetcode-retry-btn">
                  Retry
                </button>
              </div>
            ) : (
              <>
                {filteredFolders.length === 0 && searchTerm ? (
                  <div className="leetcode-no-results">
                    <h3>No problems found</h3>
                    <p>Try adjusting your search terms</p>
                  </div>
                ) : (
                  filteredFolders.map((folder, index) => (
                    <div key={folder.name} className="leetcode-problem-card">
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
                  ))
                )}
              </>
            )}
          </div>
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div className="leetcode-modal-overlay" onClick={closeModal}>
          <div className="leetcode-modal" onClick={e => e.stopPropagation()}>
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
      )}
    </div>
  );
}