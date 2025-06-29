import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';

function Header() {
  // 使用应用上下文获取主题和刷新数据方法
  const { theme, refreshData, isLoading } = useAppContext();
  const [searchQuery, setSearchQuery] = useState('');
  
  const handleSearch = (e) => {
    e.preventDefault();
    // 实现搜索功能
    console.log('搜索:', searchQuery);
  };

  return (
    <header className={`header ${theme}`}>
      <div className="header-left">
        <div className="logo">
          <img src="/src/assets/images/logo.svg" alt="Stock Insights" />
          <h1>Stock Insights</h1>
        </div>
        <nav className="main-nav">
          <ul>
            <li className="active">Home</li>
            <li>Markets</li>
            <li>News</li>
            <li>Analysis</li>
            <li>Community</li>
          </ul>
        </nav>
      </div>
      <div className="header-right">
        <form className="search-form" onSubmit={handleSearch}>
          <div className="search-input-container">
            <img src="/src/assets/images/search_icon.svg" alt="Search" className="search-icon" />
            <input 
              type="text" 
              placeholder="Search" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
        </form>
        <button 
          className="refresh-button" 
          onClick={refreshData} 
          disabled={isLoading}
        >
          {isLoading ? '刷新中...' : '刷新数据'}
        </button>
        <div className="user-profile">
          <img src="/src/assets/images/user_icon.svg" alt="User" />
        </div>
      </div>
    </header>
  );
}

export default Header;