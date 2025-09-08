import React, { useEffect, useState } from "react";

export default function LeetCodeSolutions() {
  const [folders, setFolders] = useState([]);
  const [filteredFolders, setFilteredFolders] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Mock data as fallback when API fails
  const getMockData = () => {
    return [
      {
        name: "1",
        files: [
          { name: "TwoSum.java", displayName: "TwoSum", url: "demo" },
          { name: "Solution.java", displayName: "Solution", url: "demo" }
        ]
      },
      {
        name: "2", 
        files: [
          { name: "AddTwoNumbers.java", displayName: "AddTwoNumbers", url: "demo" }
        ]
      },
      {
        name: "3",
        files: [
          { name: "LongestSubstring.java", displayName: "LongestSubstring", url: "demo" }
        ]
      },
      {
        name: "4",
        files: [
          { name: "MedianTwoArrays.java", displayName: "MedianTwoArrays", url: "demo" }
        ]
      },
      {
        name: "5",
        files: [
          { name: "LongestPalindrome.java", displayName: "LongestPalindrome", url: "demo" }
        ]
      },
      {
        name: "20",
        files: [
          { name: "ValidParentheses.java", displayName: "ValidParentheses", url: "demo" }
        ]
      },
      {
        name: "21",
        files: [
          { name: "MergeTwoLists.java", displayName: "MergeTwoLists", url: "demo" }
        ]
      },
      {
        name: "121",
        files: [
          { name: "BestTimeBuyStock.java", displayName: "BestTimeBuyStock", url: "demo" }
        ]
      },
      {
        name: "125",
        files: [
          { name: "ValidPalindrome.java", displayName: "ValidPalindrome", url: "demo" }
        ]
      },
      {
        name: "217",
        files: [
          { name: "ContainsDuplicate.java", displayName: "ContainsDuplicate", url: "demo" }
        ]
      }
    ];
  };

  useEffect(() => {
    async function fetchSolutions() {
      const repo = "Shashidharak89/MY-LEETCODE-SOLUTIONS";
      
      try {
        setLoading(true);
        setError(null);
        
        // Try multiple approaches to fetch data
        let folderData = [];
        let fetchSuccess = false;

        // Approach 1: Try GitHub API directly with different proxies
        const proxies = [
          `https://api.allorigins.win/get?url=${encodeURIComponent(`https://api.github.com/repos/${repo}/contents/`)}`,
          `https://cors-anywhere.herokuapp.com/https://api.github.com/repos/${repo}/contents/`,
          `https://api.github.com/repos/${repo}/contents/`
        ];

        for (const proxyUrl of proxies) {
          try {
            console.log(`Trying to fetch from: ${proxyUrl}`);
            const res = await fetch(proxyUrl);
            
            if (res.ok) {
              let data;
              if (proxyUrl.includes('allorigins.win')) {
                const proxyData = await res.json();
                data = JSON.parse(proxyData.contents);
              } else {
                data = await res.json();
              }

              if (Array.isArray(data)) {
                const dirs = data
                  .filter(item => item.type === "dir")
                  .sort((a, b) => parseInt(a.name) - parseInt(b.name))
                  .slice(0, 10); // Limit to first 10 to avoid rate limits

                // Process directories with better error handling
                for (let dir of dirs) {
                  try {
                    const dirUrl = proxyUrl.includes('allorigins.win') ? 
                      `https://api.allorigins.win/get?url=${encodeURIComponent(dir.url)}` : 
                      dir.url;
                    
                    const res2 = await fetch(dirUrl);
                    if (!res2.ok) continue;
                    
                    let filesInFolder;
                    if (proxyUrl.includes('allorigins.win')) {
                      const proxyData2 = await res2.json();
                      filesInFolder = JSON.parse(proxyData2.contents);
                    } else {
                      filesInFolder = await res2.json();
                    }

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
                    continue;
                  }
                }

                if (folderData.length > 0) {
                  fetchSuccess = true;
                  break;
                }
              }
            }
          } catch (proxyError) {
            console.warn(`Proxy ${proxyUrl} failed:`, proxyError);
            continue;
          }
        }

        // If all API attempts failed, use mock data
        if (!fetchSuccess) {
          console.log("All API attempts failed, using mock data");
          folderData = getMockData();
          setError("Using demo data - GitHub API unavailable");
        }

        setFolders(folderData);
        setFilteredFolders(folderData);
        
      } catch (error) {
        console.error("Error fetching solutions:", error);
        // Use mock data as fallback
        const mockData = getMockData();
        setFolders(mockData);
        setFilteredFolders(mockData);
        setError("Using demo data - API connection failed");
      } finally {
        setLoading(false);
      }
    }

    fetchSolutions();
  }, []);

  useEffect(() => {
    filterAndSortFolders();
  }, [searchQuery, sortOrder, folders]);

  function filterAndSortFolders() {
    let filtered = folders.filter(folder => {
      const folderMatch = folder.name.toLowerCase().includes(searchQuery.toLowerCase());
      const fileMatch = folder.files.some(file => 
        file.displayName.toLowerCase().includes(searchQuery.toLowerCase())
      );
      return folderMatch || fileMatch;
    });

    filtered.sort((a, b) => {
      const aNum = parseInt(a.name);
      const bNum = parseInt(b.name);
      return sortOrder === "asc" ? aNum - bNum : bNum - aNum;
    });

    setFilteredFolders(filtered);
  }

  async function openFile(file) {
    setSelectedFile(file);
    setFileContent("Loading...");
    setIsPopupOpen(true);

    try {
      // If it's a demo file, show demo code immediately
      if (file.url === "demo") {
        const demoCode = getDemoCode(file.displayName);
        setFileContent(demoCode);
        return;
      }

      // Try to fetch actual file with multiple strategies
      const strategies = [
        () => fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(file.url)}`).then(res => res.json()).then(data => data.contents),
        () => fetch(`https://cors-anywhere.herokuapp.com/${file.url}`).then(res => res.text()),
        () => fetch(file.url).then(res => res.text())
      ];

      let content = null;
      for (const strategy of strategies) {
        try {
          content = await strategy();
          if (content) break;
        } catch (e) {
          continue;
        }
      }

      if (content) {
        setFileContent(content);
      } else {
        // Fallback to demo code
        const demoCode = getDemoCode(file.displayName);
        setFileContent(demoCode);
      }
    } catch (fetchError) {
      console.error("Error loading file:", fetchError);
      const demoCode = getDemoCode(file.displayName);
      setFileContent(demoCode);
    }
  }

  function getDemoCode(fileName) {
    const demoSolutions = {
      "TwoSum": `class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (map.containsKey(complement)) {
                return new int[] { map.get(complement), i };
            }
            map.put(nums[i], i);
        }
        return null;
    }
}`,
      "ValidParentheses": `class Solution {
    public boolean isValid(String s) {
        Stack<Character> stack = new Stack<>();
        for (char c : s.toCharArray()) {
            if (c == '(') stack.push(')');
            else if (c == '{') stack.push('}');
            else if (c == '[') stack.push(']');
            else if (stack.isEmpty() || stack.pop() != c) return false;
        }
        return stack.isEmpty();
    }
}`,
      "AddTwoNumbers": `class Solution {
    public ListNode addTwoNumbers(ListNode l1, ListNode l2) {
        ListNode dummy = new ListNode(0);
        ListNode current = dummy;
        int carry = 0;
        
        while (l1 != null || l2 != null || carry != 0) {
            int val1 = l1 != null ? l1.val : 0;
            int val2 = l2 != null ? l2.val : 0;
            int sum = val1 + val2 + carry;
            
            carry = sum / 10;
            current.next = new ListNode(sum % 10);
            current = current.next;
            
            if (l1 != null) l1 = l1.next;
            if (l2 != null) l2 = l2.next;
        }
        
        return dummy.next;
    }
}`,
      "LongestSubstring": `class Solution {
    public int lengthOfLongestSubstring(String s) {
        Map<Character, Integer> map = new HashMap<>();
        int left = 0, maxLen = 0;
        
        for (int right = 0; right < s.length(); right++) {
            char c = s.charAt(right);
            if (map.containsKey(c)) {
                left = Math.max(left, map.get(c) + 1);
            }
            map.put(c, right);
            maxLen = Math.max(maxLen, right - left + 1);
        }
        
        return maxLen;
    }
}`,
      "MedianTwoArrays": `class Solution {
    public double findMedianSortedArrays(int[] nums1, int[] nums2) {
        if (nums1.length > nums2.length) {
            return findMedianSortedArrays(nums2, nums1);
        }
        
        int x = nums1.length;
        int y = nums2.length;
        int low = 0, high = x;
        
        while (low <= high) {
            int cutX = (low + high) / 2;
            int cutY = (x + y + 1) / 2 - cutX;
            
            int maxLeftX = cutX == 0 ? Integer.MIN_VALUE : nums1[cutX - 1];
            int maxLeftY = cutY == 0 ? Integer.MIN_VALUE : nums2[cutY - 1];
            
            int minRightX = cutX == x ? Integer.MAX_VALUE : nums1[cutX];
            int minRightY = cutY == y ? Integer.MAX_VALUE : nums2[cutY];
            
            if (maxLeftX <= minRightY && maxLeftY <= minRightX) {
                if ((x + y) % 2 == 0) {
                    return (Math.max(maxLeftX, maxLeftY) + Math.min(minRightX, minRightY)) / 2.0;
                } else {
                    return Math.max(maxLeftX, maxLeftY);
                }
            } else if (maxLeftX > minRightY) {
                high = cutX - 1;
            } else {
                low = cutX + 1;
            }
        }
        
        return 1.0;
    }
}`,
      "LongestPalindrome": `class Solution {
    public String longestPalindrome(String s) {
        if (s == null || s.length() < 1) return "";
        int start = 0, end = 0;
        
        for (int i = 0; i < s.length(); i++) {
            int len1 = expandAroundCenter(s, i, i);
            int len2 = expandAroundCenter(s, i, i + 1);
            int len = Math.max(len1, len2);
            
            if (len > end - start) {
                start = i - (len - 1) / 2;
                end = i + len / 2;
            }
        }
        
        return s.substring(start, end + 1);
    }
    
    private int expandAroundCenter(String s, int left, int right) {
        while (left >= 0 && right < s.length() && s.charAt(left) == s.charAt(right)) {
            left--;
            right++;
        }
        return right - left - 1;
    }
}`,
      "MergeTwoLists": `class Solution {
    public ListNode mergeTwoLists(ListNode list1, ListNode list2) {
        ListNode dummy = new ListNode(-1);
        ListNode current = dummy;
        
        while (list1 != null && list2 != null) {
            if (list1.val <= list2.val) {
                current.next = list1;
                list1 = list1.next;
            } else {
                current.next = list2;
                list2 = list2.next;
            }
            current = current.next;
        }
        
        current.next = list1 != null ? list1 : list2;
        return dummy.next;
    }
}`,
      "BestTimeBuyStock": `class Solution {
    public int maxProfit(int[] prices) {
        int minPrice = Integer.MAX_VALUE;
        int maxProfit = 0;
        
        for (int price : prices) {
            if (price < minPrice) {
                minPrice = price;
            } else if (price - minPrice > maxProfit) {
                maxProfit = price - minPrice;
            }
        }
        
        return maxProfit;
    }
}`,
      "ValidPalindrome": `class Solution {
    public boolean isPalindrome(String s) {
        int left = 0, right = s.length() - 1;
        
        while (left < right) {
            while (left < right && !Character.isLetterOrDigit(s.charAt(left))) {
                left++;
            }
            while (left < right && !Character.isLetterOrDigit(s.charAt(right))) {
                right--;
            }
            
            if (Character.toLowerCase(s.charAt(left)) != Character.toLowerCase(s.charAt(right))) {
                return false;
            }
            
            left++;
            right--;
        }
        
        return true;
    }
}`,
      "ContainsDuplicate": `class Solution {
    public boolean containsDuplicate(int[] nums) {
        Set<Integer> seen = new HashSet<>();
        for (int num : nums) {
            if (seen.contains(num)) {
                return true;
            }
            seen.add(num);
        }
        return false;
    }
}`
    };

    return demoSolutions[fileName] || `// Demo Java Solution for ${fileName}
class Solution {
    public void ${fileName.toLowerCase()}() {
        // This is a demo solution
        // Replace with actual implementation
        System.out.println("Hello from ${fileName}!");
    }
}`;
  }

  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(fileContent);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
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

  function closePopup() {
    setIsPopupOpen(false);
    setSelectedFile(null);
    setFileContent("");
  }

  function toggleTheme() {
    setIsDarkMode(!isDarkMode);
  }

  if (loading) {
    return (
      <div className={`leetcode-container ${isDarkMode ? 'leetcode-dark' : 'leetcode-light'}`} style={{
        minHeight: '100vh',
        backgroundColor: isDarkMode ? '#1a1a2e' : '#f8f9fa',
        fontFamily: 'Inter, system-ui, sans-serif',
        padding: '2rem'
      }}>
        <div className="leetcode-loading" style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          gap: '1rem'
        }}>
          <div className="leetcode-spinner" style={{
            width: '40px',
            height: '40px',
            border: '4px solid',
            borderColor: isDarkMode ? '#3d4465 transparent #3d4465 transparent' : '#e5e7eb transparent #3b82f6 transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p style={{ color: isDarkMode ? '#a0a0a0' : '#6b7280', fontSize: '1.1rem' }}>Loading LeetCode solutions...</p>
          <style jsx>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  return (
    <div className={`leetcode-container ${isDarkMode ? 'leetcode-dark' : 'leetcode-light'}`} style={{
      minHeight: '100vh',
      backgroundColor: isDarkMode ? '#1a1a2e' : '#f8f9fa',
      fontFamily: 'Inter, system-ui, sans-serif',
      color: isDarkMode ? '#e4e4e7' : '#374151'
    }}>
      <header className="leetcode-header" style={{
        background: isDarkMode ? 'linear-gradient(135deg, #16213e 0%, #0f172a 100%)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '2rem',
        borderRadius: '0 0 24px 24px',
        marginBottom: '2rem',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
      }}>
        <div className="leetcode-header-content" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div className="leetcode-title-section">
            <h1 className="leetcode-title" style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              color: 'white',
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span className="leetcode-icon">📂</span>
              My LeetCode Solutions
            </h1>
            <p className="leetcode-subtitle" style={{
              fontSize: '1.1rem',
              color: 'rgba(255,255,255,0.8)',
              margin: '0.5rem 0 0 0'
            }}>Browse and view Java solutions</p>
          </div>
          <button onClick={toggleTheme} className="leetcode-theme-toggle" style={{
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            borderRadius: '50%',
            width: '50px',
            height: '50px',
            fontSize: '1.5rem',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            backdropFilter: 'blur(10px)'
          }}>
            {isDarkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      {error && (
        <div style={{
          background: isDarkMode ? '#2d1b69' : '#fef3c7',
          color: isDarkMode ? '#fbbf24' : '#d97706',
          padding: '1rem',
          borderRadius: '12px',
          margin: '0 2rem 2rem 2rem',
          border: `1px solid ${isDarkMode ? '#3730a3' : '#f59e0b'}`
        }}>
          ℹ️ {error}
        </div>
      )}

      {/* Controls */}
      <div className="leetcode-controls" style={{
        display: 'flex',
        gap: '1rem',
        padding: '0 2rem',
        marginBottom: '2rem',
        flexWrap: 'wrap'
      }}>
        <div className="leetcode-search-container" style={{
          position: 'relative',
          flex: '1',
          minWidth: '300px'
        }}>
          <input
            type="text"
            placeholder="Search solutions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="leetcode-search-input"
            style={{
              width: '100%',
              padding: '12px 40px 12px 16px',
              border: `2px solid ${isDarkMode ? '#3d4465' : '#e5e7eb'}`,
              borderRadius: '12px',
              fontSize: '1rem',
              backgroundColor: isDarkMode ? '#16213e' : 'white',
              color: isDarkMode ? '#e4e4e7' : '#374151',
              outline: 'none',
              transition: 'border-color 0.3s ease'
            }}
          />
          <span className="leetcode-search-icon" style={{
            position: 'absolute',
            right: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: '1.2rem',
            opacity: 0.6
          }}>🔍</span>
        </div>
        
        <div className="leetcode-filter-container" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <label htmlFor="sort-order" style={{
            fontSize: '0.9rem',
            fontWeight: '500',
            color: isDarkMode ? '#a0a0a0' : '#6b7280'
          }}>Sort:</label>
          <select
            id="sort-order"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="leetcode-sort-select"
            style={{
              padding: '8px 12px',
              border: `2px solid ${isDarkMode ? '#3d4465' : '#e5e7eb'}`,
              borderRadius: '8px',
              backgroundColor: isDarkMode ? '#16213e' : 'white',
              color: isDarkMode ? '#e4e4e7' : '#374151',
              fontSize: '0.9rem',
              cursor: 'pointer'
            }}
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>
      </div>

      {/* Main Content */}
      <div className="leetcode-main" style={{
        padding: '0 2rem'
      }}>
        {filteredFolders.length === 0 ? (
          <div className="leetcode-no-results" style={{
            textAlign: 'center',
            padding: '4rem 2rem',
            color: isDarkMode ? '#a0a0a0' : '#6b7280'
          }}>
            <div className="leetcode-no-results-icon" style={{
              fontSize: '4rem',
              marginBottom: '1rem'
            }}>🔍</div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>No solutions found</h3>
            <p style={{ fontSize: '1rem' }}>Try adjusting your search query</p>
          </div>
        ) : (
          <div className="leetcode-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.5rem',
            maxWidth: '1200px',
            margin: '0 auto'
          }}>
            {filteredFolders.map(folder => (
              <div key={folder.name} className="leetcode-card" style={{
                backgroundColor: isDarkMode ? '#16213e' : 'white',
                borderRadius: '16px',
                padding: '1.5rem',
                boxShadow: isDarkMode ? '0 8px 32px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.1)',
                border: `1px solid ${isDarkMode ? '#3d4465' : '#e5e7eb'}`,
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}>
                <div className="leetcode-card-header" style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1rem'
                }}>
                  <h3 className="leetcode-card-title" style={{
                    fontSize: '1.3rem',
                    fontWeight: '600',
                    color: isDarkMode ? '#e4e4e7' : '#1f2937',
                    margin: 0
                  }}>Problem {folder.name}</h3>
                  <span className="leetcode-file-count" style={{
                    backgroundColor: isDarkMode ? '#3d4465' : '#f3f4f6',
                    color: isDarkMode ? '#a0a0a0' : '#6b7280',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: '500'
                  }}>{folder.files.length} files</span>
                </div>
                <div className="leetcode-card-content" style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem'
                }}>
                  {folder.files.map(file => (
                    <button
                      key={file.name}
                      onClick={() => openFile(file)}
                      className="leetcode-solution-button"
                      title={file.name}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '12px 16px',
                        backgroundColor: isDarkMode ? '#0f172a' : '#f8f9fa',
                        border: `1px solid ${isDarkMode ? '#3d4465' : '#e5e7eb'}`,
                        borderRadius: '10px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        fontSize: '0.95rem',
                        fontWeight: '500',
                        color: isDarkMode ? '#e4e4e7' : '#374151',
                        textAlign: 'left'
                      }}
                    >
                      <span className="leetcode-file-icon">☕</span>
                      <span className="leetcode-file-name" style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>{file.displayName}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Popup Modal */}
      {isPopupOpen && (
        <div className="leetcode-popup-overlay" onClick={closePopup} style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '2rem'
        }}>
          <div className="leetcode-popup-modal" onClick={(e) => e.stopPropagation()} style={{
            backgroundColor: isDarkMode ? '#16213e' : 'white',
            borderRadius: '16px',
            width: '90%',
            maxWidth: '800px',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 20px 64px rgba(0,0,0,0.3)',
            border: `1px solid ${isDarkMode ? '#3d4465' : '#e5e7eb'}`
          }}>
            <div className="leetcode-popup-header" style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1.5rem',
              borderBottom: `1px solid ${isDarkMode ? '#3d4465' : '#e5e7eb'}`
            }}>
              <div className="leetcode-popup-info">
                <h3 className="leetcode-popup-title" style={{
                  fontSize: '1.3rem',
                  fontWeight: '600',
                  color: isDarkMode ? '#e4e4e7' : '#1f2937',
                  margin: 0
                }}>
                  {selectedFile?.name || 'Loading...'}
                </h3>
                <span className="leetcode-popup-type" style={{
                  color: isDarkMode ? '#a0a0a0' : '#6b7280',
                  fontSize: '0.9rem'
                }}>Java Solution</span>
              </div>
              <div className="leetcode-popup-actions" style={{
                display: 'flex',
                gap: '0.5rem'
              }}>
                <button
                  onClick={copyToClipboard}
                  className="leetcode-popup-copy"
                  disabled={fileContent === "Loading..." || fileContent.startsWith("⚠")}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: copySuccess ? '#10b981' : (isDarkMode ? '#3b82f6' : '#2563eb'),
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {copySuccess ? "✅ Copied!" : "📋 Copy"}
                </button>
                <button onClick={closePopup} className="leetcode-popup-close" style={{
                  padding: '8px 12px',
                  backgroundColor: 'transparent',
                  color: isDarkMode ? '#a0a0a0' : '#6b7280',
                  border: `1px solid ${isDarkMode ? '#3d4465' : '#e5e7eb'}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '500',
                  transition: 'all 0.2s ease'
                }}>
                  ✕
                </button>
              </div>
            </div>
            
            <div className="leetcode-popup-content" style={{
              flex: 1,
              overflow: 'auto',
              padding: '1.5rem'
            }}>
              <pre className="leetcode-popup-code" style={{
                backgroundColor: isDarkMode ? '#0f172a' : '#f8f9fa',
                padding: '1.5rem',
                borderRadius: '12px',
                border: `1px solid ${isDarkMode ? '#3d4465' : '#e5e7eb'}`,
                fontSize: '0.9rem',
                fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                lineHeight: '1.5',
                color: isDarkMode ? '#e4e4e7' : '#374151',
                overflow: 'auto',
                margin: 0
              }}>
                <code>{fileContent}</code>
              </pre>
            </div>
          </div>
        </div>
      )}
      
      <style jsx>{`
        .leetcode-card:hover {
          transform: translateY(-2px);
          box-shadow: ${isDarkMode ? '0 12px 40px rgba(0,0,0,0.4)' : '0 8px 32px rgba(0,0,0,0.15)'} !important;
        }
        
        .leetcode-solution-button:hover {
          background-color: ${isDarkMode ? '#1e293b' : '#e5e7eb'} !important;
          border-color: ${isDarkMode ? '#475569' : '#d1d5db'} !important;
        }
        
        .leetcode-search-input:focus {
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        
        .leetcode-theme-toggle:hover {
          background: rgba(255,255,255,0.3) !important;
          transform: scale(1.05);
        }
        
        .leetcode-popup-copy:hover:not(:disabled) {
          background-color: ${isDarkMode ? '#2563eb' : '#1d4ed8'} !important;
        }
        
        .leetcode-popup-close:hover {
          background-color: ${isDarkMode ? '#1e293b' : '#f3f4f6'} !important;
        }
      `}</style>
    </div>
  );
}