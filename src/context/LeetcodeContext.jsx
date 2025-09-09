import React, { createContext, useContext, useState, useEffect } from 'react';

const LeetCodeContext = createContext();

export const useLeetCode = () => {
  const context = useContext(LeetCodeContext);
  if (!context) {
    throw new Error('useLeetCode must be used within a LeetCodeProvider');
  }
  return context;
};

export const LeetCodeProvider = ({ children }) => {
  const [folders, setFolders] = useState([]);
  const [filteredFolders, setFilteredFolders] = useState([]);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [selectedSolution, setSelectedSolution] = useState(0);
  const [fileContent, setFileContent] = useState("");
  const [theme, setTheme] = useState(() => {
    // Load theme from localStorage, fallback to 'light'
    return localStorage.getItem('theme') || 'light';
  });
  const [fontSize, setFontSize] = useState(100);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('ascending');

  // Persist theme to localStorage
  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.body.setAttribute("data-theme", theme); // optional: for global styles
  }, [theme]);

  // Filter and sort problems when dependencies change
  useEffect(() => {
    filterAndSortProblems();
  }, [folders, searchTerm, sortOrder]);

  const filterAndSortProblems = () => {
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
  };

  const fetchSolutions = async () => {
    const repo = "Shashidharak89/MY-LEETCODE-SOLUTIONS";
    const url = `https://api.github.com/repos/${repo}/contents/`;
    
    try {
      setLoading(true);
      const res = await fetch(url);
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      
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
  };

  const openSolution = async (problem, solutionIndex = 0) => {
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
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedProblem(null);
    setFileContent("");
  };

  const copyToClipboard = () => {
    if (fileContent && fileContent !== "Loading..." && !fileContent.includes("⚠️")) {
      navigator.clipboard.writeText(fileContent);
      alert("✅ Code copied to clipboard!");
    }
  };

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const increaseFontSize = () => {
    setFontSize(prev => Math.min(prev + 10, 200));
  };

  const decreaseFontSize = () => {
    setFontSize(prev => Math.max(prev - 10, 60));
  };

  const resetFontSize = () => {
    setFontSize(100);
  };

  const switchSolution = (direction) => {
    if (!selectedProblem || selectedProblem.files.length <= 1) return;
    
    let newIndex;
    if (direction === 'next') {
      newIndex = (selectedSolution + 1) % selectedProblem.files.length;
    } else {
      newIndex = selectedSolution === 0 ? selectedProblem.files.length - 1 : selectedSolution - 1;
    }
    
    openSolution(selectedProblem, newIndex);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSortChange = (order) => {
    setSortOrder(order);
  };

  const value = {
    // State
    folders,
    filteredFolders,
    selectedProblem,
    selectedSolution,
    fileContent,
    theme,
    fontSize,
    loading,
    error,
    showModal,
    searchTerm,
    sortOrder,
    
    // Actions
    fetchSolutions,
    openSolution,
    closeModal,
    copyToClipboard,
    toggleTheme,
    increaseFontSize,
    decreaseFontSize,
    resetFontSize,
    switchSolution,
    handleSearchChange,
    handleSortChange,
  };

  return (
    <LeetCodeContext.Provider value={value}>
      {children}
    </LeetCodeContext.Provider>
  );
};
