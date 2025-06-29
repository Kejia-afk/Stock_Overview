import React, { useState, useEffect } from 'react';
import '../styles/components/MarketSentimentAnalysis.css';
import { useAppContext } from '../context/AppContext';

function MarketSentimentAnalysis() {
  // 使用应用上下文获取数据服务和主题
  const { marketDataService, stockDataService, theme, isLoading } = useAppContext();
  
  // 状态管理
  const [profitEffect, setProfitEffect] = useState(null);
  const [lossEffect, setLossEffect] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [addingTo, setAddingTo] = useState(null); // 'profit' 或 'loss'
  
  // 加载市场情绪数据
  useEffect(() => {
    const loadSentimentData = async () => {
      try {
        // 获取市场赚钱效应数据
        const profitData = await marketDataService.getMarketProfitEffect();
        setProfitEffect(profitData);
        
        // 获取市场亏钱效应数据
        const lossData = await marketDataService.getMarketLossEffect();
        setLossEffect(lossData);
      } catch (error) {
        console.error('加载市场情绪数据失败:', error);
      }
    };
    
    loadSentimentData();
  }, [marketDataService]);

  // 搜索股票
  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }
    
    try {
      const results = await stockDataService.searchStocks(query, { limit: 5 });
      setSearchResults(results);
    } catch (error) {
      console.error('搜索股票失败:', error);
    }
  };
  
  // 开始添加股票
  const startAddingStock = (type) => {
    setAddingTo(type);
    setSearchQuery('');
    setSearchResults([]);
  };
  
  // 取消添加股票
  const cancelAddingStock = () => {
    setAddingTo(null);
    setSearchQuery('');
    setSearchResults([]);
  };
  
  // 添加股票到市场赚钱效应描述
  const addStockToProfit = async (stock) => {
    try {
      // 获取股票详细信息
      const stockDetail = await stockDataService.getStockDetail(stock.code);
      
      // 添加到赚钱效应示例股票
      const updatedProfitEffect = await marketDataService.addStockToProfitEffect({
        id: Date.now(), // 临时ID
        name: stock.name,
        code: stock.code,
        changePercent: stockDetail.changePercent
      });
      
      setProfitEffect(updatedProfitEffect);
      setAddingTo(null);
      setSearchQuery('');
      setSearchResults([]);
    } catch (error) {
      console.error('添加股票到市场赚钱效应失败:', error);
    }
  };

  // 添加股票到市场亏钱效应描述
  const addStockToLoss = async (stock) => {
    try {
      // 获取股票详细信息
      const stockDetail = await stockDataService.getStockDetail(stock.code);
      
      // 添加到亏钱效应示例股票
      const updatedLossEffect = await marketDataService.addStockToLossEffect({
        id: Date.now(), // 临时ID
        name: stock.name,
        code: stock.code,
        changePercent: stockDetail.changePercent
      });
      
      setLossEffect(updatedLossEffect);
      setAddingTo(null);
      setSearchQuery('');
      setSearchResults([]);
    } catch (error) {
      console.error('添加股票到市场亏钱效应失败:', error);
    }
  };

  return (
    <div className={`market-sentiment-analysis ${theme}`}>
      <h2 className="module-title">每日市场情绪分析</h2>
      
      {/* 加载状态显示 */}
      {isLoading && <div className="loading-indicator">加载市场情绪数据中...</div>}
      
      {/* 股票搜索弹窗 */}
      {addingTo && (
        <div className="stock-search-modal">
          <div className="search-modal-content">
            <h3>添加代表性个股</h3>
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              placeholder="输入股票名称或代码"
              autoFocus
            />
            
            {searchResults.length > 0 && (
              <div className="search-results">
                {searchResults.map(stock => (
                  <div 
                    key={stock.code} 
                    className="search-result-item"
                    onClick={() => addingTo === 'profit' ? addStockToProfit(stock) : addStockToLoss(stock)}
                  >
                    {stock.name} ({stock.code})
                  </div>
                ))}
              </div>
            )}
            
            <div className="modal-actions">
              <button className="btn-secondary" onClick={cancelAddingStock}>取消</button>
            </div>
          </div>
        </div>
      )}
      
      {/* 市场赚钱效应 */}
      {profitEffect && (
        <section className="market-effect-section card profit-effect">
          <h3>市场赚钱效应</h3>
          <div className="effect-summary">{profitEffect.summary}</div>
          <div className="effect-description">{profitEffect.description}</div>
          
          <div className="example-stocks">
            <h4>代表性个股</h4>
            <div className="stocks-container">
              {profitEffect.exampleStocks.map(stock => (
                <div key={stock.id} className="stock-tag up">
                  {stock.name} ({stock.code}) +{stock.changePercent}%
                </div>
              ))}
              <button 
                className="add-stock-btn" 
                onClick={() => startAddingStock('profit')}
                title="添加代表性个股"
              >
                +
              </button>
            </div>
          </div>
        </section>
      )}
      
      {/* 市场亏钱效应 */}
      {lossEffect && (
        <section className="market-effect-section card loss-effect">
          <h3>市场亏钱效应</h3>
          <div className="effect-summary">{lossEffect.summary}</div>
          <div className="effect-description">{lossEffect.description}</div>
          
          <div className="example-stocks">
            <h4>代表性个股</h4>
            <div className="stocks-container">
              {lossEffect.exampleStocks.map(stock => (
                <div key={stock.id} className="stock-tag down">
                  {stock.name} ({stock.code}) {stock.changePercent}%
                </div>
              ))}
              <button 
                className="add-stock-btn" 
                onClick={() => startAddingStock('loss')}
                title="添加代表性个股"
              >
                +
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

export default MarketSentimentAnalysis;