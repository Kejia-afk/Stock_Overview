import React from 'react';
import { useAppContext } from '../context/AppContext';

function Sidebar({ activeModule, setActiveModule }) {
  // 使用应用上下文获取主题
  const { theme, toggleTheme } = useAppContext();
  // 导航项配置
  const navItems = [
    { id: 'marketOverview', name: '市场概览', icon: '📊' },
    { id: 'marketSentiment', name: '市场情绪分析', icon: '🔍' },
    { id: 'hotSectors', name: '热门板块分析', icon: '🔥' },
    { id: 'stockAnalysis', name: '个股分析', icon: '📈' },
    { id: 'tradeReview', name: '交易复盘', icon: '🔄' },
    { id: 'tomorrowStrategy', name: '明日策略', icon: '🎯' },
    { id: 'knowledgeBase', name: '知识积累', icon: '📚' },
    { id: 'userCenter', name: '用户中心', icon: '👤' }
  ];

  return (
    <aside className={`sidebar ${theme}`}>
      <div className="sidebar-header">
        <h3>功能导航</h3>
      </div>
      <nav className="sidebar-nav">
        <ul className="nav-items">
          {navItems.map((item) => (
            <li
              key={item.id}
              className={`nav-item ${activeModule === item.id ? 'active' : ''}`}
              onClick={() => setActiveModule(item.id)}
            >
              <span className="nav-item-icon">{item.icon}</span>
              <span className="nav-item-text">{item.name}</span>
              {activeModule === item.id && <span className="active-indicator"></span>}
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="sidebar-footer">
        {/* 主题切换按钮 */}
        <button className="theme-toggle-btn" onClick={toggleTheme}>
          {theme === 'light' ? '🌙 暗色模式' : '☀️ 亮色模式'}
        </button>
        <div className="app-version">版本 1.0.0</div>
      </div>
    </aside>
  );
}

export default Sidebar;