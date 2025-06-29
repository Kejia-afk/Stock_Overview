/**
 * 个股数据模型
 * 定义个股相关的数据结构
 */

/**
 * 股票基本信息模型
 * @typedef {Object} Stock
 * @property {string} code - 股票代码
 * @property {string} name - 股票名称
 * @property {number} price - 当前价格
 * @property {number} change - 涨跌额
 * @property {number} changePercent - 涨跌幅
 * @property {string} status - 状态（up/down）
 * @property {string} sector - 所属板块
 * @property {string} [sectorPosition] - 板块内地位
 * @property {Array<string>} tags - 标签
 * @property {Date} timestamp - 数据时间戳
 * @property {StockData} [data] - 详细数据
 */

/**
 * 股票详细数据模型
 * @typedef {Object} StockData
 * @property {Array<KlineData>} klines - K线数据
 * @property {Array<VolumeData>} volumes - 成交量数据
 * @property {Object} [technicalIndicators] - 技术指标
 * @property {Array<number>} [technicalIndicators.ma5] - 5日均线
 * @property {Array<number>} [technicalIndicators.ma10] - 10日均线
 * @property {Array<number>} [technicalIndicators.ma20] - 20日均线
 * @property {Array<number>} [technicalIndicators.ma60] - 60日均线
 * @property {Array<MacdData>} [technicalIndicators.macd] - MACD指标
 * @property {Array<KdjData>} [technicalIndicators.kdj] - KDJ指标
 * @property {Object} [capitalFlow] - 资金流向
 * @property {number} [capitalFlow.main] - 主力资金
 * @property {number} [capitalFlow.retail] - 散户资金
 * @property {number} [capitalFlow.super] - 超大单
 * @property {number} [capitalFlow.large] - 大单
 * @property {number} [capitalFlow.medium] - 中单
 * @property {number} [capitalFlow.small] - 小单
 */

/**
 * K线数据模型
 * @typedef {Object} KlineData
 * @property {Date} date - 日期
 * @property {number} open - 开盘价
 * @property {number} close - 收盘价
 * @property {number} high - 最高价
 * @property {number} low - 最低价
 * @property {number} volume - 成交量
 */

/**
 * 成交量数据模型
 * @typedef {Object} VolumeData
 * @property {Date} date - 日期
 * @property {number} volume - 成交量
 * @property {number} amount - 成交额
 */

/**
 * MACD指标数据模型
 * @typedef {Object} MacdData
 * @property {Date} date - 日期
 * @property {number} dif - DIF值
 * @property {number} dea - DEA值
 * @property {number} macd - MACD值
 */

/**
 * KDJ指标数据模型
 * @typedef {Object} KdjData
 * @property {Date} date - 日期
 * @property {number} k - K值
 * @property {number} d - D值
 * @property {number} j - J值
 */

/**
 * 创建股票基本信息对象
 * @param {Object} data - 股票数据
 * @returns {Stock} 股票基本信息对象
 */
export function createStock(data) {
  return {
    code: data.code || '',
    name: data.name || '',
    price: data.price || 0,
    change: data.change || 0,
    changePercent: data.changePercent || 0,
    status: data.change > 0 ? 'up' : 'down',
    sector: data.sector || '',
    sectorPosition: data.sectorPosition || '',
    tags: data.tags || [],
    timestamp: data.timestamp || new Date(),
    data: data.data || null
  };
}

/**
 * 创建K线数据对象
 * @param {Object} data - K线数据
 * @returns {KlineData} K线数据对象
 */
export function createKlineData(data) {
  return {
    date: data.date || new Date(),
    open: data.open || 0,
    close: data.close || 0,
    high: data.high || 0,
    low: data.low || 0,
    volume: data.volume || 0
  };
}

/**
 * 创建成交量数据对象
 * @param {Object} data - 成交量数据
 * @returns {VolumeData} 成交量数据对象
 */
export function createVolumeData(data) {
  return {
    date: data.date || new Date(),
    volume: data.volume || 0,
    amount: data.amount || 0
  };
}

/**
 * 计算技术指标
 * @param {Array<KlineData>} klineData - K线数据
 * @returns {Object} 技术指标数据
 */
export function calculateTechnicalIndicators(klineData) {
  if (!klineData || klineData.length === 0) {
    return {};
  }
  
  // 这里只是简单实现，实际应用中需要更复杂的计算
  const closePrices = klineData.map(k => k.close);
  
  // 计算移动平均线
  const ma5 = calculateMA(closePrices, 5);
  const ma10 = calculateMA(closePrices, 10);
  const ma20 = calculateMA(closePrices, 20);
  const ma60 = calculateMA(closePrices, 60);
  
  return {
    ma5,
    ma10,
    ma20,
    ma60
    // 其他指标如MACD、KDJ等需要更复杂的计算
  };
}

/**
 * 计算移动平均线
 * @param {Array<number>} data - 价格数据
 * @param {number} period - 周期
 * @returns {Array<number>} 移动平均线数据
 */
function calculateMA(data, period) {
  const result = [];
  
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(null);
    } else {
      let sum = 0;
      for (let j = 0; j < period; j++) {
        sum += data[i - j];
      }
      result.push(sum / period);
    }
  }
  
  return result;
}