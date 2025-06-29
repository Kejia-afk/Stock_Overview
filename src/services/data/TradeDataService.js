/**
 * 交易数据服务
 * 用于管理交易记录和策略数据
 */
import storageFactory from '../storage/StorageFactory';
import { createTradeRecord, createTradeAnalysis, createStrategy } from '../models';

class TradeDataService {
  constructor() {
    this.indexedDB = storageFactory.getIndexedDBService();
  }

  /**
   * 保存交易记录
   * @param {Object} tradeData - 交易记录数据
   * @returns {Promise<string>} 交易记录ID
   */
  async saveTradeRecord(tradeData) {
    const store = 'tradeRecords';
    
    // 转换交易类型格式
    const formattedData = {
      ...tradeData,
      type: tradeData.type === 'buy' ? '买入' : '卖出',
      quantity: parseInt(tradeData.amount, 10) || 0
    };
    
    const trade = createTradeRecord(formattedData);
    
    // 如果是卖出交易，计算盈亏和持仓天数
    if (trade.type === '卖出' && trade.stockCode) {
      // 查找对应的买入交易
      const buyTrades = await this.getTradeRecordsByStock(trade.stockCode, '买入');
      
      if (buyTrades.length > 0) {
        // 简单起见，假设最早的买入交易对应当前卖出
        const buyTrade = buyTrades[0];
        
        // 计算盈亏
        const buyAmount = buyTrade.price * buyTrade.quantity;
        const sellAmount = trade.price * trade.quantity;
        const profitAmount = sellAmount - buyAmount;
        const profitPercent = (profitAmount / buyAmount) * 100;
        
        // 计算持仓天数
        const buyDate = new Date(buyTrade.date);
        const sellDate = new Date(trade.date);
        const holdDays = Math.floor((sellDate - buyDate) / (1000 * 60 * 60 * 24));
        
        // 更新交易记录
        trade.isProfit = profitAmount > 0;
        trade.profitAmount = profitAmount;
        trade.profitPercent = profitPercent;
        trade.holdDays = holdDays;
      }
    }
    
    // 保存交易记录
    const id = await this.indexedDB.add(store, trade);
    return id;
  }

  /**
   * 获取交易记录
   * @param {string} [id] - 交易记录ID，不传则获取所有交易记录
   * @returns {Promise<Array|Object>} 交易记录数组或单个交易记录
   */
  async getTradeRecords(id) {
    const store = 'tradeRecords';
    
    if (id) {
      const record = await this.indexedDB.get(store, id);
      return this.formatTradeRecord(record);
    } else {
      const records = await this.indexedDB.getAll(store);
      // 按日期排序（降序）
      records.sort((a, b) => new Date(b.date) - new Date(a.date));
      // 格式化记录以匹配组件期望的格式
      return records.map(record => this.formatTradeRecord(record));
    }
  }
  
  /**
   * 格式化交易记录以匹配组件期望的格式
   * @param {Object} record - 原始交易记录
   * @returns {Object} 格式化后的交易记录
   * @private
   */
  formatTradeRecord(record) {
    if (!record) return null;
    
    return {
      ...record,
      // 转换交易类型格式（'买入'/'卖出' -> 'buy'/'sell'）
      type: record.type === '买入' ? 'buy' : 'sell',
      // 确保数量字段存在（quantity -> amount）
      amount: record.quantity || 0
    };
  }

  /**
   * 按股票代码获取交易记录
   * @param {string} stockCode - 股票代码
   * @param {string} [type] - 交易类型（买入/卖出），不传则获取所有类型
   * @returns {Promise<Array>} 交易记录数组
   */
  async getTradeRecordsByStock(stockCode, type) {
    const store = 'tradeRecords';
    let records = await this.indexedDB.getByIndex(store, 'stockCode', stockCode);
    
    // 按类型筛选
    if (type) {
      records = records.filter(record => record.type === type);
    }
    
    // 按日期排序（升序）
    records.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    return records;
  }

  /**
   * 按日期范围获取交易记录
   * @param {Date} startDate - 开始日期
   * @param {Date} endDate - 结束日期
   * @returns {Promise<Array>} 交易记录数组
   */
  async getTradeRecordsByDateRange(startDate, endDate) {
    const store = 'tradeRecords';
    const records = await this.indexedDB.getAll(store);
    
    // 转换日期字符串为Date对象进行比较
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // 筛选日期范围内的记录
    const filteredRecords = records.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate >= start && recordDate <= end;
    });
    
    // 按日期排序（降序）
    filteredRecords.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    return filteredRecords;
  }

  /**
   * 更新交易记录
   * @param {string} id - 交易记录ID
   * @param {Object} tradeData - 交易记录数据
   * @returns {Promise<void>}
   */
  async updateTradeRecord(id, tradeData) {
    const store = 'tradeRecords';
    
    // 转换交易类型格式
    const formattedData = {
      ...tradeData,
      id: id,
      type: tradeData.type === 'buy' ? '买入' : '卖出',
      quantity: parseInt(tradeData.amount, 10) || 0
    };
    
    const trade = createTradeRecord(formattedData);
    await this.indexedDB.update(store, trade);
  }

  /**
   * 删除交易记录
   * @param {string} id - 交易记录ID
   * @returns {Promise<void>}
   */
  async deleteTradeRecord(id) {
    const store = 'tradeRecords';
    await this.indexedDB.delete(store, id);
  }

  /**
   * 获取交易分析
   * @param {Date} [startDate] - 开始日期，不传则分析所有交易
   * @param {Date} [endDate] - 结束日期，不传则使用当前日期
   * @returns {Promise<Object>} 交易分析数据
   */
  async getTradeAnalysis(startDate, endDate) {
    let tradeRecords;
    
    if (startDate && endDate) {
      tradeRecords = await this.getTradeRecordsByDateRange(startDate, endDate);
    } else {
      tradeRecords = await this.indexedDB.getAll('tradeRecords');
    }
    
    const analysis = createTradeAnalysis(tradeRecords);
    
    // 格式化分析数据以匹配组件期望的格式
    return {
      totalTrades: analysis.totalTrades || 0,
      profitTrades: analysis.profitTrades || 0,
      lossTrades: analysis.lossTrades || 0,
      totalProfit: analysis.totalProfit || 0,
      winRate: analysis.winRate ? `${analysis.winRate.toFixed(1)}%` : '0%',
      avgHoldingDays: analysis.averageHoldDays || 0
    };
  }

  /**
   * 保存策略
   * @param {Object} strategyData - 策略数据
   * @returns {Promise<string>} 策略ID
   */
  async saveStrategy(strategyData) {
    const store = 'strategies';
    const strategy = createStrategy(strategyData);
    const id = await this.indexedDB.add(store, strategy);
    return id;
  }

  /**
   * 获取策略
   * @param {string} [id] - 策略ID，不传则获取所有策略
   * @returns {Promise<Array|Object>} 策略数组或单个策略
   */
  async getStrategies(id) {
    const store = 'strategies';
    
    if (id) {
      return await this.indexedDB.get(store, id);
    } else {
      const strategies = await this.indexedDB.getAll(store);
      // 按日期排序（降序）
      strategies.sort((a, b) => new Date(b.date) - new Date(a.date));
      return strategies;
    }
  }

  /**
   * 按日期获取策略
   * @param {Date} date - 日期
   * @returns {Promise<Array>} 策略数组
   */
  async getStrategiesByDate(date) {
    const store = 'strategies';
    const strategies = await this.indexedDB.getByIndex(store, 'date', date);
    return strategies;
  }

  /**
   * 按类型获取策略
   * @param {string} type - 策略类型
   * @returns {Promise<Array>} 策略数组
   */
  async getStrategiesByType(type) {
    const store = 'strategies';
    const strategies = await this.indexedDB.getAll(store);
    
    // 筛选指定类型的策略
    const filteredStrategies = strategies.filter(strategy => strategy.type === type);
    
    // 按日期排序（降序）
    filteredStrategies.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    return filteredStrategies;
  }

  /**
   * 更新策略
   * @param {Object} strategyData - 策略数据
   * @returns {Promise<void>}
   */
  async updateStrategy(strategyData) {
    const store = 'strategies';
    const strategy = createStrategy(strategyData);
    await this.indexedDB.update(store, strategy);
  }

  /**
   * 删除策略
   * @param {string} id - 策略ID
   * @returns {Promise<void>}
   */
  async deleteStrategy(id) {
    const store = 'strategies';
    await this.indexedDB.delete(store, id);
  }
}

// 创建单例实例
const tradeDataService = new TradeDataService();

export default tradeDataService;