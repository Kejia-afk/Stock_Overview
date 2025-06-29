import React, { useState, useEffect, useRef } from 'react';
import '../styles/components/StockAnalysis.css';
import { useAppContext } from '../context/AppContext';
import ReactECharts from 'echarts-for-react';

function StockAnalysis() {
  // 使用应用上下文获取数据服务和主题
  const { stockDataService, theme, isLoading } = useAppContext();
  
  // 状态管理
  const [stockData, setStockData] = useState(null);
  const [klineData, setKlineData] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [timePeriod, setTimePeriod] = useState('day'); // 'day', 'week', 'month'
  const [favoriteStocks, setFavoriteStocks] = useState([]);
  const [selectedStock, setSelectedStock] = useState(null);
  
  // 初始加载默认股票数据
  useEffect(() => {
    const loadDefaultStock = async () => {
      try {
        // 获取收藏的股票列表
        const favorites = await stockDataService.getFavoriteStocks();
        setFavoriteStocks(favorites);
        
        // 如果有收藏的股票，加载第一个；否则加载默认股票
        const stockCode = favorites.length > 0 ? favorites[0].code : '600000';
        await loadStockData(stockCode);
      } catch (error) {
        console.error('加载默认股票数据失败:', error);
      }
    };
    
    loadDefaultStock();
  }, [stockDataService]);
  
  // 加载股票数据
  const loadStockData = async (code) => {
    try {
      // 获取股票基本信息
      const stock = await stockDataService.getStock(code);
      setStockData(stock);
      setSelectedStock(stock);
      
      // 获取K线数据
      await loadKlineData(code, timePeriod);
    } catch (error) {
      console.error(`加载股票 ${code} 数据失败:`, error);
    }
  };
  
  // 加载K线数据
  const loadKlineData = async (code, period) => {
    try {
      const klineData = await stockDataService.getStockKlineData(code, { period });
      setKlineData(klineData);
    } catch (error) {
      console.error(`加载股票 ${code} K线数据失败:`, error);
    }
  };
  
  // 处理股票搜索
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    try {
      // 搜索股票
      const stock = await stockDataService.getStock(searchQuery);
      if (stock) {
        await loadStockData(stock.code);
      } else {
        console.log('未找到股票:', searchQuery);
      }
    } catch (error) {
      console.error('搜索股票失败:', error);
    }
  };
  
  // 切换时间周期
  const handlePeriodChange = async (period) => {
    setTimePeriod(period);
    if (selectedStock) {
      await loadKlineData(selectedStock.code, period);
    }
  };
  
  // 添加或移除收藏
  const toggleFavorite = async () => {
    if (!stockData) return;
    
    try {
      const isFavorite = await stockDataService.isStockFavorite(stockData.code);
      
      if (isFavorite) {
        await stockDataService.removeFavoriteStock(stockData.code);
      } else {
        await stockDataService.addFavoriteStock(stockData.code);
      }
      
      // 刷新收藏列表
      const favorites = await stockDataService.getFavoriteStocks();
      setFavoriteStocks(favorites);
    } catch (error) {
      console.error('切换收藏状态失败:', error);
    }
  };

  // 生成K线图配置
  const getKlineOption = () => {
    if (!klineData || !klineData.dates || klineData.dates.length === 0) {
      return {
        title: { text: '暂无K线数据' },
        tooltip: { trigger: 'axis' }
      };
    }
    
    return {
      backgroundColor: theme === 'dark' ? '#1f1f1f' : '#fff',
      animation: false,
      legend: {
        data: ['K线', '成交量', 'MA5', 'MA10', 'MA20'],
        textStyle: { color: theme === 'dark' ? '#ddd' : '#333' }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'cross' }
      },
      grid: [
        { left: '3%', right: '3%', top: '8%', height: '60%' },
        { left: '3%', right: '3%', top: '75%', height: '15%' }
      ],
      xAxis: [
        {
          type: 'category',
          data: klineData.dates,
          scale: true,
          axisLine: { lineStyle: { color: theme === 'dark' ? '#555' : '#999' } },
          axisLabel: { color: theme === 'dark' ? '#ddd' : '#333' }
        },
        {
          type: 'category',
          gridIndex: 1,
          data: klineData.dates,
          axisLabel: { show: false }
        }
      ],
      yAxis: [
        {
          scale: true,
          splitNumber: 5,
          axisLine: { lineStyle: { color: theme === 'dark' ? '#555' : '#999' } },
          splitLine: { show: true, lineStyle: { color: theme === 'dark' ? '#333' : '#eee' } },
          axisLabel: { color: theme === 'dark' ? '#ddd' : '#333' }
        },
        {
          gridIndex: 1,
          splitNumber: 3,
          axisLine: { lineStyle: { color: theme === 'dark' ? '#555' : '#999' } },
          axisLabel: { color: theme === 'dark' ? '#ddd' : '#333' },
          splitLine: { show: false }
        }
      ],
      dataZoom: [
        { type: 'inside', xAxisIndex: [0, 1], start: 50, end: 100 },
        { show: true, xAxisIndex: [0, 1], type: 'slider', bottom: '0%', start: 50, end: 100 }
      ],
      series: [
        {
          name: 'K线',
          type: 'candlestick',
          data: klineData.values,
          itemStyle: {
            color: '#ef232a',
            color0: '#14b143',
            borderColor: '#ef232a',
            borderColor0: '#14b143'
          }
        },
        {
          name: 'MA5',
          type: 'line',
          data: klineData.ma5 || [],
          smooth: true,
          lineStyle: { width: 1, opacity: 0.7 },
          itemStyle: { color: '#39afe6' }
        },
        {
          name: 'MA10',
          type: 'line',
          data: klineData.ma10 || [],
          smooth: true,
          lineStyle: { width: 1, opacity: 0.7 },
          itemStyle: { color: '#da6ee8' }
        },
        {
          name: 'MA20',
          type: 'line',
          data: klineData.ma20 || [],
          smooth: true,
          lineStyle: { width: 1, opacity: 0.7 },
          itemStyle: { color: '#ffb400' }
        },
        {
          name: '成交量',
          type: 'bar',
          xAxisIndex: 1,
          yAxisIndex: 1,
          data: klineData.volumes,
          itemStyle: {
            color: (params) => {
              const i = params.dataIndex;
              return klineData.values[i][0] <= klineData.values[i][3] ? '#ef232a' : '#14b143';
            }
          }
        }
      ]
    };
  };

  return (
    <div className={`stock-analysis ${theme}`}>
      <h2 className="module-title">个股分析</h2>
      
      {/* 加载状态显示 */}
      {isLoading && <div className="loading-indicator">加载股票数据中...</div>}
      
      {/* 股票搜索和收藏区域 */}
      <div className="stock-search-section">
        <form onSubmit={handleSearch} className="search-form">
          <input 
            type="text" 
            placeholder="输入股票代码或名称" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit">搜索</button>
        </form>
        
        {/* 收藏股票快速选择 */}
        {favoriteStocks.length > 0 && (
          <div className="favorite-stocks">
            <span>收藏:</span>
            {favoriteStocks.map(stock => (
              <button 
                key={stock.code} 
                className={`favorite-stock-btn ${selectedStock && selectedStock.code === stock.code ? 'active' : ''}`}
                onClick={() => loadStockData(stock.code)}
              >
                {stock.name}
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* 股票基本信息区域 */}
      {stockData && (
        <div className="stock-info-section card">
          <div className="stock-header">
            <div className="stock-title">
              <h3>{stockData.name}</h3>
              <span className="stock-code">{stockData.code}</span>
              <button 
                className="favorite-toggle" 
                onClick={toggleFavorite}
                title={favoriteStocks.some(s => s.code === stockData.code) ? '取消收藏' : '添加收藏'}
              >
                {favoriteStocks.some(s => s.code === stockData.code) ? '★' : '☆'}
              </button>
            </div>
            <div className="stock-price-info">
              <div className="current-price">{stockData.price}</div>
              <div className={`price-change ${stockData.change > 0 ? 'up' : 'down'}`}>
                {stockData.change > 0 ? '+' : ''}{stockData.change} ({stockData.changePercent}%)
              </div>
            </div>
          </div>
          
          <div className="stock-details-grid">
            <div className="detail-item">
              <div className="detail-label">成交量</div>
              <div className="detail-value">{(stockData.volume / 10000).toFixed(2)}万手</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">成交额</div>
              <div className="detail-value">{(stockData.turnover / 100000000).toFixed(2)}亿</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">市盈率</div>
              <div className="detail-value">{stockData.pe}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">市净率</div>
              <div className="detail-value">{stockData.pb}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">市值</div>
              <div className="detail-value">{stockData.marketCap}亿</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">所属行业</div>
              <div className="detail-value">{stockData.industry}</div>
            </div>
          </div>
        </div>
      )}
      
      {/* K线图区域 */}
      <div className="kline-section card">
        <h3>K线和成交量分析图表</h3>
        <div className="chart-controls">
          <div className="time-period-selector">
            <button 
              className={`btn btn-secondary ${timePeriod === 'day' ? 'active' : ''}`}
              onClick={() => handlePeriodChange('day')}
            >
              日K
            </button>
            <button 
              className={`btn btn-secondary ${timePeriod === 'week' ? 'active' : ''}`}
              onClick={() => handlePeriodChange('week')}
            >
              周K
            </button>
            <button 
              className={`btn btn-secondary ${timePeriod === 'month' ? 'active' : ''}`}
              onClick={() => handlePeriodChange('month')}
            >
              月K
            </button>
          </div>
        </div>
        <div className="chart-container">
          {klineData ? (
            <ReactECharts 
              option={getKlineOption()} 
              style={{ height: '400px', width: '100%' }} 
              className="echarts-kline"
              theme={theme === 'dark' ? 'dark' : ''}
            />
          ) : (
            <div className="chart-placeholder">
              <p>加载K线数据中...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default StockAnalysis;