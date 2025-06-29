import React, { useState, useEffect } from 'react';
import '../styles/components/TradeReview.css';
import { useAppContext } from '../context/AppContext';
import ReactECharts from 'echarts-for-react';

function TradeReview() {
  // 使用应用上下文获取数据服务和主题
  const { tradeDataService, stockDataService, theme, isLoading } = useAppContext();
  
  // 状态管理
  const [tradeRecords, setTradeRecords] = useState([]);
  const [tradeAnalysis, setTradeAnalysis] = useState(null);
  const [formData, setFormData] = useState({
    stockName: '',
    stockCode: '',
    type: 'buy',
    price: '',
    amount: '',
    date: new Date().toISOString().split('T')[0], // 默认今天
    reason: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [stockSuggestions, setStockSuggestions] = useState([]);
  
  // 加载交易记录和分析
  useEffect(() => {
    const loadTradeData = async () => {
      try {
        // 获取交易记录
        const records = await tradeDataService.getTradeRecords();
        setTradeRecords(records);
        
        // 获取交易分析
        const analysis = await tradeDataService.getTradeAnalysis();
        setTradeAnalysis(analysis);
      } catch (error) {
        console.error('加载交易数据失败:', error);
      }
    };
    
    loadTradeData();
  }, [tradeDataService]);
  
  // 处理表单输入变化
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // 如果是股票代码或名称，尝试获取建议
    if (name === 'stockCode' || name === 'stockName') {
      searchStocks(value);
    }
  };
  
  // 搜索股票
  const searchStocks = async (query) => {
    if (!query || query.length < 2) {
      setStockSuggestions([]);
      return;
    }
    
    try {
      // 搜索股票
      const stocks = await stockDataService.searchStocks(query, { limit: 5 });
      setStockSuggestions(stocks);
    } catch (error) {
      console.error('搜索股票失败:', error);
    }
  };
  
  // 选择股票建议
  const selectStockSuggestion = (stock) => {
    setFormData(prev => ({
      ...prev,
      stockName: stock.name,
      stockCode: stock.code
    }));
    setStockSuggestions([]);
  };
  
  // 提交表单
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const tradeData = {
        ...formData,
        price: parseFloat(formData.price),
        amount: parseInt(formData.amount, 10)
      };
      
      if (editingId) {
        // 更新现有记录
        await tradeDataService.updateTradeRecord(editingId, tradeData);
      } else {
        // 添加新记录
        await tradeDataService.saveTradeRecord(tradeData);
      }
      
      // 重置表单
      setFormData({
        stockName: '',
        stockCode: '',
        type: 'buy',
        price: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        reason: ''
      });
      setEditingId(null);
      
      // 刷新数据
      const records = await tradeDataService.getTradeRecords();
      setTradeRecords(records);
      
      const analysis = await tradeDataService.getTradeAnalysis();
      setTradeAnalysis(analysis);
    } catch (error) {
      console.error('保存交易记录失败:', error);
    }
  };
  
  // 编辑记录
  const handleEdit = async (id) => {
    try {
      const record = await tradeDataService.getTradeRecord(id);
      if (record) {
        setFormData({
          stockName: record.stockName,
          stockCode: record.stockCode,
          type: record.type,
          price: record.price.toString(),
          amount: record.amount.toString(),
          date: record.date,
          reason: record.reason || ''
        });
        setEditingId(id);
      }
    } catch (error) {
      console.error('获取交易记录失败:', error);
    }
  };
  
  // 删除记录
  const handleDelete = async (id) => {
    if (window.confirm('确定要删除这条交易记录吗？')) {
      try {
        await tradeDataService.deleteTradeRecord(id);
        
        // 刷新数据
        const records = await tradeDataService.getTradeRecords();
        setTradeRecords(records);
        
        const analysis = await tradeDataService.getTradeAnalysis();
        setTradeAnalysis(analysis);
      } catch (error) {
        console.error('删除交易记录失败:', error);
      }
    }
  };

  // 生成交易决策图表配置
  const getTradeDecisionOption = () => {
    if (!tradeRecords || tradeRecords.length === 0) {
      return {
        title: { text: '暂无交易数据' },
        tooltip: { trigger: 'axis' }
      };
    }
    
    // 按股票分组交易记录
    const stockGroups = {};
    tradeRecords.forEach(record => {
      if (!stockGroups[record.stockCode]) {
        stockGroups[record.stockCode] = [];
      }
      stockGroups[record.stockCode].push(record);
    });
    
    // 准备图表数据
    const series = [];
    const legend = [];
    
    Object.entries(stockGroups).forEach(([stockCode, records]) => {
      // 按日期排序
      records.sort((a, b) => new Date(a.date) - new Date(b.date));
      
      const stockName = records[0].stockName;
      legend.push(stockName);
      
      // 准备数据点
      const data = records.map(record => ({
        name: record.date,
        value: [
          record.date,
          record.price,
          record.type === 'buy' ? 1 : -1, // 1表示买入，-1表示卖出
          record.amount,
          record.reason
        ]
      }));
      
      series.push({
        name: stockName,
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: (value, params) => {
          // 买入点大，卖出点小
          return value[2] > 0 ? 10 : 7;
        },
        itemStyle: {
          color: (params) => {
            // 买入点红色，卖出点绿色
            return params.value[2] > 0 ? '#ef232a' : '#14b143';
          }
        },
        data: data
      });
    });
    
    return {
      backgroundColor: theme === 'dark' ? '#1f1f1f' : '#fff',
      legend: {
        data: legend,
        textStyle: { color: theme === 'dark' ? '#ddd' : '#333' }
      },
      tooltip: {
        trigger: 'item',
        formatter: (params) => {
          const value = params.value;
          return `<div>
            <div>${params.seriesName} (${value[0]})</div>
            <div>价格: ${value[1]}</div>
            <div>类型: ${value[2] > 0 ? '买入' : '卖出'}</div>
            <div>数量: ${value[3]}</div>
            <div>原因: ${value[4] || '无'}</div>
          </div>`;
        }
      },
      xAxis: {
        type: 'time',
        axisLine: { lineStyle: { color: theme === 'dark' ? '#555' : '#999' } },
        axisLabel: { color: theme === 'dark' ? '#ddd' : '#333' }
      },
      yAxis: {
        type: 'value',
        scale: true,
        axisLine: { lineStyle: { color: theme === 'dark' ? '#555' : '#999' } },
        splitLine: { show: true, lineStyle: { color: theme === 'dark' ? '#333' : '#eee' } },
        axisLabel: { color: theme === 'dark' ? '#ddd' : '#333' }
      },
      dataZoom: [
        { type: 'inside', start: 0, end: 100 },
        { show: true, type: 'slider', bottom: '0%', start: 0, end: 100 }
      ],
      series: series
    };
  };

  return (
    <div className={`trade-review ${theme}`}>
      <h2 className="module-title">交易复盘</h2>
      
      {/* 加载状态显示 */}
      {isLoading && <div className="loading-indicator">加载交易数据中...</div>}
      
      {/* 交易记录录入 */}
      <section className="trade-record-section card">
        <h3>{editingId ? '编辑交易记录' : '交易记录录入'}</h3>
        <form className="trade-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>股票名称</label>
              <div className="suggestion-container">
                <input 
                  type="text" 
                  name="stockName"
                  value={formData.stockName}
                  onChange={handleInputChange}
                  placeholder="输入股票名称" 
                  required
                />
                {stockSuggestions.length > 0 && (
                  <div className="suggestions">
                    {stockSuggestions.map(stock => (
                      <div 
                        key={stock.code} 
                        className="suggestion-item"
                        onClick={() => selectStockSuggestion(stock)}
                      >
                        {stock.name} ({stock.code})
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="form-group">
              <label>股票代码</label>
              <input 
                type="text" 
                name="stockCode"
                value={formData.stockCode}
                onChange={handleInputChange}
                placeholder="输入股票代码" 
                required
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>交易类型</label>
              <select 
                name="type"
                value={formData.type}
                onChange={handleInputChange}
              >
                <option value="buy">买入</option>
                <option value="sell">卖出</option>
              </select>
            </div>
            <div className="form-group">
              <label>交易日期</label>
              <input 
                type="date" 
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>交易价格</label>
              <input 
                type="number" 
                step="0.01" 
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="输入交易价格" 
                required
              />
            </div>
            <div className="form-group">
              <label>交易数量</label>
              <input 
                type="number" 
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                placeholder="输入交易数量" 
                required
              />
            </div>
          </div>
          
          <div className="form-group">
            <label>交易原因</label>
            <textarea 
              name="reason"
              value={formData.reason}
              onChange={handleInputChange}
              placeholder="输入交易原因和分析"
            ></textarea>
          </div>
          
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              {editingId ? '更新记录' : '添加记录'}
            </button>
            {editingId && (
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => {
                  setEditingId(null);
                  setFormData({
                    stockName: '',
                    stockCode: '',
                    type: 'buy',
                    price: '',
                    amount: '',
                    date: new Date().toISOString().split('T')[0],
                    reason: ''
                  });
                }}
              >
                取消编辑
              </button>
            )}
          </div>
        </form>
      </section>
      
      {/* 交易记录列表 */}
      <section className="trade-list-section card">
        <h3>交易记录</h3>
        {tradeRecords.length > 0 ? (
          <table className="trade-table">
            <thead>
              <tr>
                <th>日期</th>
                <th>股票</th>
                <th>类型</th>
                <th>价格</th>
                <th>数量</th>
                <th>金额</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {tradeRecords.map(record => (
                <tr key={record.id}>
                  <td>{record.date}</td>
                  <td>
                    <div>{record.stockName}</div>
                    <div className="stock-code">{record.stockCode}</div>
                  </td>
                  <td className={record.type === 'buy' ? 'buy-type' : 'sell-type'}>
                    {record.type === 'buy' ? '买入' : '卖出'}
                  </td>
                  <td>{record.price.toFixed(2)}</td>
                  <td>{record.amount}</td>
                  <td>{(record.price * record.amount).toFixed(2)}</td>
                  <td>
                    <button 
                      className="btn-icon" 
                      onClick={() => handleEdit(record.id)}
                      title="编辑"
                    >
                      编辑
                    </button>
                    <button 
                      className="btn-icon" 
                      onClick={() => handleDelete(record.id)}
                      title="删除"
                    >
                      删除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            <p>暂无交易记录，请添加您的第一笔交易</p>
          </div>
        )}
      </section>
      
      {/* 交易结果分析 */}
      <section className="trade-analysis-section card">
        <h3>交易结果分析</h3>
        {tradeAnalysis ? (
          <div className="analysis-grid">
            <div className="analysis-item">
              <div className="analysis-label">总交易次数</div>
              <div className="analysis-value">{tradeAnalysis.totalTrades}</div>
            </div>
            <div className="analysis-item">
              <div className="analysis-label">盈利交易</div>
              <div className="analysis-value up">{tradeAnalysis.profitTrades}</div>
            </div>
            <div className="analysis-item">
              <div className="analysis-label">亏损交易</div>
              <div className="analysis-value down">{tradeAnalysis.lossTrades}</div>
            </div>
            <div className="analysis-item">
              <div className="analysis-label">总盈亏</div>
              <div className={`analysis-value ${tradeAnalysis.totalProfit >= 0 ? 'up' : 'down'}`}>
                {tradeAnalysis.totalProfit >= 0 ? '+' : ''}{tradeAnalysis.totalProfit.toFixed(2)}
              </div>
            </div>
            <div className="analysis-item">
              <div className="analysis-label">胜率</div>
              <div className="analysis-value">{tradeAnalysis.winRate}</div>
            </div>
            <div className="analysis-item">
              <div className="analysis-label">平均持仓天数</div>
              <div className="analysis-value">{tradeAnalysis.avgHoldingDays.toFixed(1)}</div>
            </div>
          </div>
        ) : (
          <div className="empty-state">
            <p>暂无交易分析数据</p>
          </div>
        )}
      </section>
      
      {/* 交易决策回顾 */}
      <section className="trade-decision-section card">
        <h3>交易决策回顾</h3>
        {tradeRecords.length > 0 ? (
          <ReactECharts 
            option={getTradeDecisionOption()} 
            style={{ height: '400px', width: '100%' }} 
            className="echarts-trade-decision"
            theme={theme === 'dark' ? 'dark' : ''}
          />
        ) : (
          <div className="decision-placeholder">
            <p>暂无交易数据，无法生成决策回顾图表</p>
          </div>
        )}
      </section>
    </div>
  );
}

export default TradeReview;