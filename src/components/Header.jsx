import React from 'react';
import { useLeetCode } from '../context/LeetcodeContext';
import { FiSun, FiMoon } from 'react-icons/fi';
import './styles/Header.css';

const Header = () => {
  const { theme, toggleTheme } = useLeetCode();

  return (
    <header className={`leetcode-header ${theme}`}>
      <div className="leetcode-header-content">
        <div className="leetcode-left">
          <img 
            src="https://res.cloudinary.com/dsojdpkgh/image/upload/v1757338892/logo_falrwg.png" 
            alt="Logo" 
            className="leetcode-logo"
          />
          <h1 className="leetcode-title">My LeetCode Solutions</h1>
        </div>
        <button 
          onClick={toggleTheme}
          className="leetcode-theme-toggle"
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
        >
          {theme === 'light' ? <FiMoon /> : <FiSun />}
        </button>
      </div>
    </header>
  );
};

export default Header;
