import React, { useState, useEffect } from 'react';
import '../styles/components/TomorrowStrategy.css';
import { useAppContext } from '../context/AppContext';

function TomorrowStrategy() {
  // 使用应用上下文获取数据服务和主题
  const { strategyDataService, marketDataService, theme, isLoading } = useAppContext();
  
  // 状态管理
  const [profitStocks, setProfitStocks] = useState([]);
  const [lossStocks, setLossStocks] = useState([]);
  const [strategies, setStrategies] = useState([]);
  
  // 加载策略数据
  useEffect(() => {
    const loadStrategyData = async () => {
      try {
        // 获取赚钱效应观察股
        const profitStocksData = await strategyDataService.getObservationStocks({ type: 'profit' });
        setProfitStocks(profitStocksData);
        
        // 获取亏钱效应观察股
        const lossStocksData = await strategyDataService.getObservationStocks({ type: 'loss' });
        setLossStocks(lossStocksData);
        
        // 获取策略数据
        const strategiesData = await strategyDataService.getStrategies();
        setStrategies(strategiesData);
      } catch (error) {
        console.error('加载策略数据失败:', error);
      }
    };
    
    loadStrategyData();
  }, [strategyDataService]);

  return (
    <div className={`tomorrow-strategy ${theme}`}>
      <h2 className="module-title">明日策略</h2>
      
      {/* 加载状态显示 */}
      {isLoading && <div className="loading-indicator">加载策略数据中...</div>}
      
      {/* 观察股区域 */}
      <section className="observation-stocks-section">
        <h3>观察股</h3>
        
        {/* 赚钱效应观察股 */}
        <div className="stock-category card">
          <h4>赚钱效应观察股</h4>
          <div className="stocks-table">
            <table>
              <thead>
                <tr>
                  <th>代码</th>
                  <th>名称</th>
                  <th>价格</th>
                  <th>涨跌幅</th>
                  <th>所属板块</th>
                  <th>板块内地位</th>
                </tr>
              </thead>
              <tbody>
                {profitStocks.map(stock => (
                  <tr key={stock.code}>
                    <td>{stock.code}</td>
                    <td>{stock.name}</td>
                    <td>{stock.price.toFixed(2)}</td>
                    <td className={stock.change > 0 ? 'up' : 'down'}>
                      {stock.change > 0 ? '+' : ''}{stock.change.toFixed(2)} ({stock.change > 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%)
                    </td>
                    <td>{stock.sector}</td>
                    <td>{stock.position}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* 亏钱效应观察股 */}
        <div className="stock-category card">
          <h4>亏钱效应观察股</h4>
          <div className="stocks-table">
            <table>
              <thead>
                <tr>
                  <th>代码</th>
                  <th>名称</th>
                  <th>价格</th>
                  <th>涨跌幅</th>
                  <th>所属板块</th>
                  <th>板块内地位</th>
                </tr>
              </thead>
              <tbody>
                {lossStocks.map(stock => (
                  <tr key={stock.code}>
                    <td>{stock.code}</td>
                    <td>{stock.name}</td>
                    <td>{stock.price.toFixed(2)}</td>
                    <td className={stock.change > 0 ? 'up' : 'down'}>
                      {stock.change > 0 ? '+' : ''}{stock.change.toFixed(2)} ({stock.change > 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%)
                    </td>
                    <td>{stock.sector}</td>
                    <td>{stock.position}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
      
      {/* 策略区域 */}
      <section className="strategies-section">
        <h3>策略</h3>
        <div className="strategies-list">
          {strategies.map(strategy => (
            <div key={strategy.id} className="strategy-card card">
              <div className="strategy-header">
                <h4>观察股表现</h4>
                <p>{strategy.observation}</p>
              </div>
              <div className="strategy-content">
                <h4>相应策略</h4>
                <p className="strategy-action">{strategy.action}</p>
                <div className="strategy-details">
                  <p>{strategy.details}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default TomorrowStrategy;