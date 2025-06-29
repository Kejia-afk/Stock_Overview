import React, { useState, useEffect } from 'react';
import '../styles/components/HotSectorAnalysis.css';
import { useAppContext } from '../context/AppContext';

function HotSectorAnalysis() {
  // 使用应用上下文获取数据服务和主题
  const { marketDataService, theme, isLoading } = useAppContext();
  
  // 状态管理
  const [hotSectors, setHotSectors] = useState([]);
  
  // 加载热门板块数据
  useEffect(() => {
    const loadSectorData = async () => {
      try {
        const sectors = await marketDataService.getHotSectors();
        setHotSectors(sectors);
      } catch (error) {
        console.error('加载热门板块数据失败:', error);
      }
    };
    
    loadSectorData();
  }, [marketDataService]);

  // 控制显示的板块数量
  const [showAll, setShowAll] = useState(false);
  const displaySectors = showAll ? hotSectors : hotSectors.slice(0, 5);

  // 获取板块阶段对应的样式类
  const getSectorStageClass = (stage) => {
    switch(stage) {
      case '观察': return 'stage-observe';
      case '启动': return 'stage-startup';
      case '爆发': return 'stage-explosion';
      case '分歧': return 'stage-divergence';
      case '回流': return 'stage-reflux';
      default: return '';
    }
  };

  return (
    <div className={`hot-sector-analysis ${theme}`}>
      <div className="page-header">
        <h2 className="module-title">Hot Sector Analysis</h2>
        <p className="module-description">Track the performance of trending sectors and their key stocks.</p>
      </div>
      
      {/* 加载状态显示 */}
      {isLoading && <div className="loading-indicator">Loading sector data...</div>}
      
      <div className="sector-cards-container">
        {displaySectors.map(sector => (
          <div key={sector.id} className="sector-card">
            <div className="sector-header">
              <h3 className="sector-name">{sector.name}</h3>
              <div className={`sector-stage ${getSectorStageClass(sector.stage)}`}>
                {sector.stage}
              </div>
            </div>
            
            <div className="core-stocks">
              <div className="stock-category">
                <div className="category-label">Leader Stock</div>
                <div className={`stock-info ${sector.coreStocks.leader.changePercent >= 0 ? 'up' : 'down'}`}>
                  <span className="stock-name">{sector.coreStocks.leader.name}</span>
                  <span className="stock-code">{sector.coreStocks.leader.code}</span>
                  <span className="stock-change">
                    {sector.coreStocks.leader.changePercent >= 0 ? '+' : ''}
                    {sector.coreStocks.leader.changePercent}%
                  </span>
                </div>
              </div>
              
              <div className="stock-category">
                <div className="category-label">High Performer</div>
                <div className={`stock-info ${sector.coreStocks.height.changePercent >= 0 ? 'up' : 'down'}`}>
                  <span className="stock-name">{sector.coreStocks.height.name}</span>
                  <span className="stock-code">{sector.coreStocks.height.code}</span>
                  <span className="stock-change">
                    {sector.coreStocks.height.changePercent >= 0 ? '+' : ''}
                    {sector.coreStocks.height.changePercent}%
                  </span>
                </div>
              </div>
              
              <div className="stock-category">
                <div className="category-label">Elastic Stock</div>
                <div className={`stock-info ${sector.coreStocks.elastic.changePercent >= 0 ? 'up' : 'down'}`}>
                  <span className="stock-name">{sector.coreStocks.elastic.name}</span>
                  <span className="stock-code">{sector.coreStocks.elastic.code}</span>
                  <span className="stock-change">
                    {sector.coreStocks.elastic.changePercent >= 0 ? '+' : ''}
                    {sector.coreStocks.elastic.changePercent}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {hotSectors.length > 5 && (
        <div className="show-more-container">
          <button 
            className="show-more-btn"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? 'Show Less' : `Show More (${hotSectors.length - 5})`}
          </button>
        </div>
      )}
    </div>
  );
}

export default HotSectorAnalysis;