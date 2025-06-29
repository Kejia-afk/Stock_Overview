import React, { useEffect, useState } from 'react';
import '../styles/components/MarketOverview.css';
import { useAppContext } from '../context/AppContext';

function MarketOverview() {
  // 使用应用上下文获取数据服务和主题
  const { marketDataService, theme, isLoading } = useAppContext();
  
  // 状态管理
  const [marketIndices, setMarketIndices] = useState([]);
  const [hotSectors, setHotSectors] = useState([]);
  const [marketSentiment, setMarketSentiment] = useState(null);

  // 加载市场数据
  useEffect(() => {
    const loadMarketData = async () => {
      try {
        // 获取市场指数数据
        const indices = await marketDataService.getMarketIndices();
        setMarketIndices(indices);

        // 获取热门板块数据 - 按热门天数排序，限制6个
        const sectors = await marketDataService.getSectors({
          sortBy: 'hotDays',
          limit: 6
        });
        setHotSectors(sectors);

        // 获取最新市场情绪数据
        const sentiment = await marketDataService.getMarketSentiment({ latest: true });
        setMarketSentiment(sentiment);
      } catch (error) {
        console.error('加载市场数据失败:', error);
      }
    };

    loadMarketData();
  }, [marketDataService]);

  // 处理市场情绪指标数据
  const marketSentimentIndicators = marketSentiment ? {
    upStocks: { 
      value: marketSentiment.upStocks, 
      total: marketSentiment.totalStocks, 
      percent: ((marketSentiment.upStocks / marketSentiment.totalStocks) * 100).toFixed(1) 
    },
    yesterdayLimit: { 
      success: marketSentiment.yesterdayLimitSuccess, 
      total: marketSentiment.yesterdayLimitTotal, 
      percent: marketSentiment.yesterdayLimitTotal > 0 
        ? ((marketSentiment.yesterdayLimitSuccess / marketSentiment.yesterdayLimitTotal) * 100).toFixed(1) 
        : 0 
    },
    limitUp: { 
      value: marketSentiment.limitUpStocks, 
      percent: ((marketSentiment.limitUpStocks / marketSentiment.totalStocks) * 100).toFixed(1) 
    },
    limitDown: { 
      value: marketSentiment.limitDownStocks, 
      percent: ((marketSentiment.limitDownStocks / marketSentiment.totalStocks) * 100).toFixed(1) 
    }
  } : {
    upStocks: { value: 0, total: 0, percent: 0 },
    yesterdayLimit: { success: 0, total: 0, percent: 0 },
    limitUp: { value: 0, percent: 0 },
    limitDown: { value: 0, percent: 0 }
  };

  return (
    <div className={`market-overview ${theme}`}>
      <div className="page-header">
        <h2 className="module-title">Market Overview</h2>
        <p className="module-description">Stay updated with the latest market trends and insights.</p>
      </div>
      
      {/* 加载状态显示 */}
      {isLoading && <div className="loading-indicator">加载市场数据中...</div>}
      
      {/* 大盘指数区域 */}
      <section className="market-indices-section">
        <div className="section-header">
          <h3>Market Indices</h3>
        </div>
        <div className="indices-container">
          {marketIndices.map((index) => (
            <div key={index.code} className="index-card">
              <div className="index-header">
                <h4>{index.name}</h4>
                <span className="index-code">{index.code}</span>
              </div>
              <div className="index-value data-value">{index.value.toFixed(2)}</div>
              <div className={`index-change ${index.status}`}>
                {index.change > 0 ? '+' : ''}{index.change.toFixed(2)} ({index.change > 0 ? '+' : ''}{index.changePercent.toFixed(2)}%)
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="market-data-grid">
        {/* 近期热门板块 */}
        <section className="hot-sectors-section">
          <div className="section-header">
            <h3>Hot Sectors</h3>
          </div>
          <div className="hot-sectors-grid">
            {hotSectors.map((sector) => (
              <div 
                key={sector.name} 
                className={`hot-sector-block ${sector.status}`}
              >
                <div className="sector-name">{sector.name}</div>
                <div className="sector-change">
                  {sector.change > 0 ? '+' : ''}{sector.change.toFixed(1)}%
                </div>
                <div className="sector-hot-days">
                  <span className="hot-icon">🔥</span> {sector.hotDays} days
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 市场情绪指标 */}
        <section className="market-sentiment-section">
          <div className="section-header">
            <h3>Market Sentiment</h3>
          </div>
          <div className="sentiment-indicators">
            <div className="sentiment-indicator">
              <h4>Rising Stocks</h4>
              <div className="indicator-value">{marketSentimentIndicators.upStocks.value}</div>
              <div className="indicator-percent">{marketSentimentIndicators.upStocks.percent}%</div>
              <div className="indicator-detail">Total: {marketSentimentIndicators.upStocks.total}</div>
            </div>
            <div className="sentiment-indicator">
              <h4>Yesterday's Limit Performance</h4>
              <div className="indicator-value">{marketSentimentIndicators.yesterdayLimit.success}</div>
              <div className="indicator-percent">{marketSentimentIndicators.yesterdayLimit.percent}%</div>
              <div className="indicator-detail">Total: {marketSentimentIndicators.yesterdayLimit.total}</div>
            </div>
            <div className="sentiment-indicator">
              <h4>Limit Up Stocks</h4>
              <div className="indicator-value">{marketSentimentIndicators.limitUp.value}</div>
              <div className="indicator-percent">{marketSentimentIndicators.limitUp.percent}%</div>
              <div className="indicator-detail">Percentage of total</div>
            </div>
            <div className="sentiment-indicator">
              <h4>Limit Down Stocks</h4>
              <div className="indicator-value">{marketSentimentIndicators.limitDown.value}</div>
              <div className="indicator-percent">{marketSentimentIndicators.limitDown.percent}%</div>
              <div className="indicator-detail">Percentage of total</div>
            </div>
          </div>
        </section>
      </div>

      {/* 删除了今日重要市场事件提醒部分 */}
    </div>
  );
}

export default MarketOverview;