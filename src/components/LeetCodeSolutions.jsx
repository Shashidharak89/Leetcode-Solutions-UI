import React, { useEffect, useState } from "react";
import "./styles/LeetCodeSolutions.css";

export default function LeetCodeSolutions() {
  const [folders, setFolders] = useState([]);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [selectedSolution, setSelectedSolution] = useState(0);
  const [fileContent, setFileContent] = useState("");
  const [theme, setTheme] = useState('light');
  const [fontSize, setFontSize] = useState(100);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSolutions();
  }, []);

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
        <aside className="leetcode-sidebar">
          <h2 className="leetcode-sidebar-title">Problems</h2>
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
            <div className="leetcode-problems-list">
              {folders.map((folder, index) => (
                <div key={folder.name} className="leetcode-problem-item">
                  <h3 className="leetcode-problem-title">
                    {index + 1}. {folder.displayName}
                  </h3>
                  <div className="leetcode-solutions">
                    {folder.files.map((file, fileIndex) => (
                      <button
                        key={file.name}
                        onClick={() => openSolution(folder, fileIndex)}
                        className={`leetcode-solution-btn ${
                          selectedProblem?.name === folder.name && selectedSolution === fileIndex
                            ? 'active'
                            : ''
                        }`}
                      >
                        <span className="leetcode-solution-name">
                          Solution {fileIndex + 1}
                        </span>
                        <span className="leetcode-solution-lang">
                          .{file.language}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </aside>

        <section className="leetcode-code-viewer">
          {selectedProblem ? (
            <>
              <div className="leetcode-code-header">
                <div className="leetcode-code-info">
                  <h2 className="leetcode-code-title">
                    {selectedProblem.displayName}
                  </h2>
                  <div className="leetcode-file-info">
                    <span className="leetcode-filename">
                      {selectedProblem.files[selectedSolution]?.name}
                    </span>
                    {selectedProblem.files.length > 1 && (
                      <span className="leetcode-solution-counter">
                        Solution {selectedSolution + 1} of {selectedProblem.files.length}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="leetcode-code-controls">
                  {selectedProblem.files.length > 1 && (
                    <div className="leetcode-solution-nav">
                      <button
                        onClick={() => switchSolution('prev')}
                        className="leetcode-nav-btn"
                        title="Previous solution"
                      >
                        ←
                      </button>
                      <button
                        onClick={() => switchSolution('next')}
                        className="leetcode-nav-btn"
                        title="Next solution"
                      >
                        →
                      </button>
                    </div>
                  )}
                  
                  <div className="leetcode-font-controls">
                    <button
                      onClick={decreaseFontSize}
                      className="leetcode-font-btn"
                      title="Decrease font size"
                    >
                      A−
                    </button>
                    <span className="leetcode-font-size">
                      {fontSize}%
                    </span>
                    <button
                      onClick={increaseFontSize}
                      className="leetcode-font-btn"
                      title="Increase font size"
                    >
                      A+
                    </button>
                    <button
                      onClick={resetFontSize}
                      className="leetcode-font-reset"
                      title="Reset font size"
                    >
                      Reset
                    </button>
                  </div>
                  
                  <button
                    onClick={copyToClipboard}
                    className="leetcode-copy-btn"
                    disabled={!fileContent || fileContent === "Loading..." || fileContent.includes("⚠️")}
                  >
                    📋 Copy Code
                  </button>
                </div>
              </div>

              <div className="leetcode-code-content">
                <pre 
                  className="leetcode-code-pre"
                  style={{ fontSize: `${fontSize}%` }}
                >
                  <code className="leetcode-code">
                    {fileContent}
                  </code>
                </pre>
              </div>
            </>
          ) : (
            <div className="leetcode-code-placeholder">
              <div className="leetcode-placeholder-content">
                <h3>👈 Select a problem to view the solution</h3>
                <p>Choose any problem from the sidebar to see its code implementation.</p>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}