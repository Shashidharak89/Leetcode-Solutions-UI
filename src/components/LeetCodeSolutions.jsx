import React, { useEffect, useState } from "react";
import "./styles/LeetCodeSolutions.css";

export default function LeetCodeSolutions() {
  const [folders, setFolders] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    async function fetchSolutions() {
      const repo = "Shashidharak89/MY-LEETCODE-SOLUTIONS";
      const url = `https://api.github.com/repos/${repo}/contents/`;

      try {
        setLoading(true);
        setError(null);
        
        const res = await fetch(url);
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const data = await res.json();

        // Only folders, sorted numerically
        const dirs = data
          .filter(item => item.type === "dir")
          .sort((a, b) => parseInt(a.name) - parseInt(b.name));

        let folderData = [];

        for (let dir of dirs) {
          try {
            const res2 = await fetch(dir.url);
            if (!res2.ok) continue;
            
            const filesInFolder = await res2.json();

            const javaFiles = filesInFolder
              .filter(f => f.name.endsWith(".java"))
              .map(f => ({
                name: f.name,
                url: f.download_url,
                displayName: f.name.replace(".java", ""),
              }));

            if (javaFiles.length > 0) {
              folderData.push({
                name: dir.name,
                files: javaFiles,
              });
            }
          } catch (dirError) {
            console.warn(`Error fetching folder ${dir.name}:`, dirError);
          }
        }

        setFolders(folderData);
      } catch (error) {
        console.error("Error fetching solutions:", error);
        setError("Failed to load LeetCode solutions. Please check the repository URL.");
      } finally {
        setLoading(false);
      }
    }

    fetchSolutions();
  }, []);

  async function openFile(file) {
    setSelectedFile(file);
    setFileContent("Loading...");

    try {
      const res = await fetch(file.url);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const text = await res.text();
      setFileContent(text);
    } catch (fetchError) {
      console.error("Error loading file:", fetchError);
      setFileContent("⚠ Error loading file. The file might not be accessible.");
    }
  }

  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(fileContent);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = fileContent;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  }

  if (loading) {
    return (
      <div className="leetcode-container">
        <div className="leetcode-loading">
          <div className="leetcode-spinner"></div>
          <p>Loading LeetCode solutions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="leetcode-container">
        <div className="leetcode-error">
          <h2>⚠ Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="leetcode-container">
      <header className="leetcode-header">
        <h1 className="leetcode-title">
          <span className="leetcode-icon">📂</span>
          My LeetCode Solutions
        </h1>
        <p className="leetcode-subtitle">Browse and view Java solutions</p>
      </header>

      <div className="leetcode-layout">
        {/* Sidebar */}
        <aside className="leetcode-sidebar">
          <div className="leetcode-sidebar-header">
            <h3>Problem Categories</h3>
            <span className="leetcode-count">{folders.length} folders</span>
          </div>
          
          {folders.length === 0 ? (
            <div className="leetcode-no-data">
              <p>No solutions found</p>
            </div>
          ) : (
            <div className="leetcode-folders">
              {folders.map(folder => (
                <div key={folder.name} className="leetcode-folder">
                  <h4 className="leetcode-folder-title">
                    Problem {folder.name}
                  </h4>
                  <ul className="leetcode-files">
                    {folder.files.map(file => (
                      <li key={file.name} className="leetcode-file-item">
                        <button
                          onClick={() => openFile(file)}
                          className={`leetcode-file-button ${
                            selectedFile?.name === file.name ? 'leetcode-file-active' : ''
                          }`}
                          title={file.name}
                        >
                          <span className="leetcode-file-icon">☕</span>
                          <span className="leetcode-file-name">{file.displayName}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </aside>

        {/* Code Viewer */}
        <main className="leetcode-viewer">
          {selectedFile ? (
            <>
              <div className="leetcode-viewer-header">
                <div className="leetcode-file-info">
                  <h3 className="leetcode-current-file">{selectedFile.name}</h3>
                  <span className="leetcode-file-type">Java Solution</span>
                </div>
                <button
                  onClick={copyToClipboard}
                  className="leetcode-copy-button"
                  disabled={fileContent === "Loading..." || fileContent.startsWith("⚠")}
                >
                  {copySuccess ? "✅ Copied!" : "📋 Copy Code"}
                </button>
              </div>
              
              <div className="leetcode-code-container">
                <pre className="leetcode-code">
                  <code>{fileContent}</code>
                </pre>
              </div>
            </>
          ) : (
            <div className="leetcode-empty-state">
              <div className="leetcode-empty-icon">👆</div>
              <h3>Select a solution to view</h3>
              <p>Choose a Java file from the sidebar to see the code</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}