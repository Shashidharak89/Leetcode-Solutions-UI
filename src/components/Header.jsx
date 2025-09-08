import React from 'react';
import { useLeetCode } from '../context/LeetcodeContext';
import './styles/Header.css';

const Header = () => {
  const { theme, toggleTheme } = useLeetCode();

  return (
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
  );
};

export default Header;