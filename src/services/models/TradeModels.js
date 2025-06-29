/**
 * 交易和策略数据模型
 * 定义交易记录和策略相关的数据结构
 */

/**
 * 交易记录模型
 * @typedef {Object} TradeRecord
 * @property {string} [id] - 交易ID（自动生成）
 * @property {string} stockCode - 股票代码
 * @property {string} stockName - 股票名称
 * @property {string} type - 交易类型（买入/卖出）
 * @property {number} price - 交易价格
 * @property {number} quantity - 交易数量
 * @property {Date} date - 交易日期
 * @property {string} reason - 交易原因
 * @property {string} [notes] - 交易备注
 * @property {Array<string>} [tags] - 交易标签
 * @property {boolean} [isProfit] - 是否盈利（卖出时有效）
 * @property {number} [profitAmount] - 盈利金额（卖出时有效）
 * @property {number} [profitPercent] - 盈利百分比（卖出时有效）
 * @property {number} [holdDays] - 持仓天数（卖出时有效）
 */

/**
 * 交易分析模型
 * @typedef {Object} TradeAnalysis
 * @property {number} totalTrades - 总交易次数
 * @property {number} profitTrades - 盈利交易次数
 * @property {number} lossTrades - 亏损交易次数
 * @property {number} totalProfit - 总盈亏
 * @property {number} winRate - 胜率
 * @property {number} averageHoldDays - 平均持仓天数
 * @property {Object} [monthlyStats] - 月度统计
 * @property {Object} [typeStats] - 类型统计
 * @property {Object} [reasonStats] - 原因统计
 */

/**
 * 策略模型
 * @typedef {Object} Strategy
 * @property {string} [id] - 策略ID（自动生成）
 * @property {string} name - 策略名称
 * @property {string} type - 策略类型
 * @property {string} description - 策略描述
 * @property {Date} date - 策略日期
 * @property {Array<StrategyStock>} stocks - 策略相关股票
 * @property {Object} [parameters] - 策略参数
 * @property {Array<string>} [tags] - 策略标签
 */

/**
 * 策略股票模型
 * @typedef {Object} StrategyStock
 * @property {string} code - 股票代码
 * @property {string} name - 股票名称
 * @property {string} reason - 选股理由
 * @property {string} [sector] - 所属板块
 * @property {string} [position] - 板块内地位
 * @property {number} [targetPrice] - 目标价格
 * @property {number} [stopLoss] - 止损价格
 */

/**
 * 创建交易记录对象
 * @param {Object} data - 交易数据
 * @returns {TradeRecord} 交易记录对象
 */
export function createTradeRecord(data) {
  return {
    id: data.id,
    stockCode: data.stockCode || '',
    stockName: data.stockName || '',
    type: data.type || '买入',
    price: data.price || 0,
    quantity: data.quantity || 0,
    date: data.date || new Date(),
    reason: data.reason || '',
    notes: data.notes || '',
    tags: data.tags || [],
    isProfit: data.isProfit,
    profitAmount: data.profitAmount,
    profitPercent: data.profitPercent,
    holdDays: data.holdDays
  };
}

/**
 * 创建交易分析对象
 * @param {Array<TradeRecord>} tradeRecords - 交易记录数组
 * @returns {TradeAnalysis} 交易分析对象
 */
export function createTradeAnalysis(tradeRecords) {
  if (!tradeRecords || tradeRecords.length === 0) {
    return {
      totalTrades: 0,
      profitTrades: 0,
      lossTrades: 0,
      totalProfit: 0,
      winRate: 0,
      averageHoldDays: 0
    };
  }
  
  // 筛选出卖出交易
  const sellTrades = tradeRecords.filter(trade => trade.type === '卖出' && trade.isProfit !== undefined);
  
  // 计算盈利和亏损交易
  const profitTrades = sellTrades.filter(trade => trade.isProfit).length;
  const lossTrades = sellTrades.filter(trade => !trade.isProfit).length;
  
  // 计算总盈亏
  const totalProfit = sellTrades.reduce((sum, trade) => sum + (trade.profitAmount || 0), 0);
  
  // 计算胜率
  const winRate = sellTrades.length > 0 ? (profitTrades / sellTrades.length) * 100 : 0;
  
  // 计算平均持仓天数
  const totalHoldDays = sellTrades.reduce((sum, trade) => sum + (trade.holdDays || 0), 0);
  const averageHoldDays = sellTrades.length > 0 ? totalHoldDays / sellTrades.length : 0;
  
  return {
    totalTrades: sellTrades.length,
    profitTrades,
    lossTrades,
    totalProfit,
    winRate,
    averageHoldDays
  };
}

/**
 * 创建策略对象
 * @param {Object} data - 策略数据
 * @returns {Strategy} 策略对象
 */
export function createStrategy(data) {
  return {
    id: data.id,
    name: data.name || '',
    type: data.type || '',
    description: data.description || '',
    date: data.date || new Date(),
    stocks: data.stocks || [],
    parameters: data.parameters || {},
    tags: data.tags || []
  };
}

/**
 * 创建策略股票对象
 * @param {Object} data - 策略股票数据
 * @returns {StrategyStock} 策略股票对象
 */
export function createStrategyStock(data) {
  return {
    code: data.code || '',
    name: data.name || '',
    reason: data.reason || '',
    sector: data.sector || '',
    position: data.position || '',
    targetPrice: data.targetPrice,
    stopLoss: data.stopLoss
  };
}