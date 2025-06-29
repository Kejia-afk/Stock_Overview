import React from 'react';
import './styles/App.css';
import { useAppContext } from './context/AppContext';

// 组件导入
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import UserCenter from './components/UserCenter';
import MarketOverview from './components/MarketOverview';
import MarketSentimentAnalysis from './components/MarketSentimentAnalysis';
import HotSectorAnalysis from './components/HotSectorAnalysis';
import StockAnalysis from './components/StockAnalysis';
import TradeReview from './components/TradeReview';
import TomorrowStrategy from './components/TomorrowStrategy';
import KnowledgeRepository from './components/KnowledgeRepository';

function App() {
  // 使用应用上下文
  const { activeModule, changeModule, isLoading, error } = useAppContext();

  // 渲染当前选中的功能模块
  const renderActiveModule = () => {
    // 如果正在加载，显示加载状态
    if (isLoading) {
      return <div className="loading-container">加载中...</div>;
    }
    
    // 如果有错误，显示错误信息
    if (error) {
      return <div className="error-container">出错了: {error}</div>;
    }
    switch(activeModule) {
      case 'userCenter':
        return <UserCenter />;
      case 'marketOverview':
        return <MarketOverview />;
      case 'marketSentiment':
        return <MarketSentimentAnalysis />;
      case 'hotSectors':
        return <HotSectorAnalysis />;
      case 'stockAnalysis':
        return <StockAnalysis />;
      case 'tradeReview':
        return <TradeReview />;
      case 'tomorrowStrategy':
        return <TomorrowStrategy />;
      case 'knowledgeBase':
        return <KnowledgeRepository />;
      default:
        return <MarketOverview />;
    }
  };

  return (
    <div className="app">
      <Header />
      <div className="main-container">
        <Sidebar 
          activeModule={activeModule} 
          setActiveModule={changeModule} 
        />
        <main className="content">
          {renderActiveModule()}
        </main>
      </div>
    </div>
  );
}

export default App;