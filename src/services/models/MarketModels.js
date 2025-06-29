/**
 * 市场数据模型
 * 定义市场相关的数据结构
 */

/**
 * 指数数据模型
 * @typedef {Object} MarketIndex
 * @property {string} code - 指数代码
 * @property {string} name - 指数名称
 * @property {number} value - 当前点位
 * @property {number} change - 涨跌点数
 * @property {number} changePercent - 涨跌百分比
 * @property {string} status - 状态（up/down）
 * @property {Date} timestamp - 数据时间戳
 * @property {Array<KlineData>} [historicalData] - 历史数据
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
 * 板块数据模型
 * @typedef {Object} Sector
 * @property {string} code - 板块代码
 * @property {string} name - 板块名称
 * @property {number} change - 涨跌幅
 * @property {string} status - 状态（up/down）
 * @property {number} hotDays - 热门持续天数
 * @property {string} stage - 板块阶段（观察、启动、爆发、分歧、回流）
 * @property {Array<SectorStock>} stocks - 板块内股票
 * @property {Date} timestamp - 数据时间戳
 */

/**
 * 板块内股票模型
 * @typedef {Object} SectorStock
 * @property {string} code - 股票代码
 * @property {string} name - 股票名称
 * @property {string} position - 板块内地位（中军股、高度股、弹性股、低位补涨等）
 */

/**
 * 市场情绪数据模型
 * @typedef {Object} MarketSentiment
 * @property {Date} date - 日期
 * @property {Object} upStocks - 上涨家数
 * @property {number} upStocks.value - 数量
 * @property {number} upStocks.total - 总数
 * @property {number} upStocks.percent - 百分比
 * @property {Object} yesterdayLimit - 昨日连板表现
 * @property {number} yesterdayLimit.success - 成功家数
 * @property {number} yesterdayLimit.total - 总数
 * @property {number} yesterdayLimit.percent - 百分比
 * @property {Object} limitUp - 涨停家数
 * @property {number} limitUp.value - 数量
 * @property {number} limitUp.percent - 百分比
 * @property {Object} limitDown - 跌停家数
 * @property {number} limitDown.value - 数量
 * @property {number} limitDown.percent - 百分比
 * @property {Object} profitEffect - 赚钱效应
 * @property {string} profitEffect.summary - 简要描述
 * @property {string} profitEffect.description - 详细描述
 * @property {Array<ExampleStock>} profitEffect.exampleStocks - 代表性个股
 * @property {Object} lossEffect - 亏钱效应
 * @property {string} lossEffect.summary - 简要描述
 * @property {string} lossEffect.description - 详细描述
 * @property {Array<ExampleStock>} lossEffect.exampleStocks - 代表性个股
 */

/**
 * 示例股票模型
 * @typedef {Object} ExampleStock
 * @property {string} id - ID
 * @property {string} name - 股票名称
 * @property {string} code - 股票代码
 * @property {number} changePercent - 涨跌幅
 */

/**
 * 创建指数数据对象
 * @param {Object} data - 指数数据
 * @returns {MarketIndex} 指数数据对象
 */
export function createMarketIndex(data) {
  return {
    code: data.code || '',
    name: data.name || '',
    value: data.value || 0,
    change: data.change || 0,
    changePercent: data.changePercent || 0,
    status: data.change > 0 ? 'up' : 'down',
    timestamp: data.timestamp || new Date(),
    historicalData: data.historicalData || []
  };
}

/**
 * 创建板块数据对象
 * @param {Object} data - 板块数据
 * @returns {Sector} 板块数据对象
 */
export function createSector(data) {
  return {
    code: data.code || '',
    name: data.name || '',
    change: data.change || 0,
    status: data.change > 0 ? 'up' : 'down',
    hotDays: data.hotDays || 0,
    stage: data.stage || '观察',
    stocks: data.stocks || [],
    timestamp: data.timestamp || new Date()
  };
}

/**
 * 创建市场情绪数据对象
 * @param {Object} data - 市场情绪数据
 * @returns {MarketSentiment} 市场情绪数据对象
 */
export function createMarketSentiment(data) {
  return {
    date: data.date || new Date(),
    upStocks: data.upStocks || { value: 0, total: 0, percent: 0 },
    yesterdayLimit: data.yesterdayLimit || { success: 0, total: 0, percent: 0 },
    limitUp: data.limitUp || { value: 0, percent: 0 },
    limitDown: data.limitDown || { value: 0, percent: 0 },
    profitEffect: data.profitEffect || {
      summary: '',
      description: '',
      exampleStocks: []
    },
    lossEffect: data.lossEffect || {
      summary: '',
      description: '',
      exampleStocks: []
    }
  };
}