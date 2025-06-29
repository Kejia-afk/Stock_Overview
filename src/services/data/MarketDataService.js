/**
 * 市场数据服务
 * 用于管理市场相关数据，包括指数、板块和市场情绪
 */
import storageFactory from '../storage/StorageFactory';
import { createMarketIndex, createSector, createMarketSentiment } from '../models';
import { stockDataService } from '../index';

class MarketDataService {
  constructor() {
    this.indexedDB = storageFactory.getIndexedDBService();
    this.localStorage = storageFactory.getLocalStorageService();
  }

  /**
   * 保存市场指数数据
   * @param {Object|Array} indexData - 单个指数数据对象或指数数据数组
   * @returns {Promise<void>}
   */
  async saveMarketIndices(indexData) {
    const store = 'marketIndices';
    const indices = Array.isArray(indexData) ? indexData : [indexData];
    
    // 格式化并保存每个指数数据
    for (const data of indices) {
      const index = createMarketIndex(data);
      await this.indexedDB.add(store, index);
    }
  }

  /**
   * 获取市场指数数据
   * @param {string} [code] - 指数代码，不传则获取所有指数
   * @returns {Promise<Array|Object>} 指数数据数组或单个指数数据
   */
  async getMarketIndices(code) {
    const store = 'marketIndices';
    
    if (code) {
      return await this.indexedDB.get(store, code);
    } else {
      return await this.indexedDB.getAll(store);
    }
  }

  /**
   * 更新市场指数数据
   * @param {Object} indexData - 指数数据
   * @returns {Promise<void>}
   */
  async updateMarketIndex(indexData) {
    const store = 'marketIndices';
    const index = createMarketIndex(indexData);
    await this.indexedDB.update(store, index);
  }

  /**
   * 删除市场指数数据
   * @param {string} code - 指数代码
   * @returns {Promise<void>}
   */
  async deleteMarketIndex(code) {
    const store = 'marketIndices';
    await this.indexedDB.delete(store, code);
  }

  /**
   * 保存板块数据
   * @param {Object|Array} sectorData - 单个板块数据对象或板块数据数组
   * @returns {Promise<void>}
   */
  async saveSectors(sectorData) {
    const store = 'sectors';
    const sectors = Array.isArray(sectorData) ? sectorData : [sectorData];
    
    // 格式化并保存每个板块数据
    for (const data of sectors) {
      const sector = createSector(data);
      await this.indexedDB.add(store, sector);
    }
  }

  /**
   * 获取板块数据
   * @param {string} [code] - 板块代码，不传则获取所有板块
   * @param {Object} [options] - 查询选项
   * @param {string} [options.stage] - 按板块阶段筛选
   * @param {number} [options.limit] - 限制返回数量
   * @returns {Promise<Array|Object>} 板块数据数组或单个板块数据
   */
  async getSectors(code, options = {}) {
    const store = 'sectors';
    
    if (code) {
      return await this.indexedDB.get(store, code);
    } else {
      let sectors = await this.indexedDB.getAll(store);
      
      // 按阶段筛选
      if (options.stage) {
        sectors = sectors.filter(sector => sector.stage === options.stage);
      }
      
      // 按热门天数排序
      sectors.sort((a, b) => b.hotDays - a.hotDays);
      
      // 限制返回数量
      if (options.limit && options.limit > 0) {
        sectors = sectors.slice(0, options.limit);
      }
      
      return sectors;
    }
  }

  /**
   * 获取热门板块
   * @param {number} [limit=5] - 限制返回数量
   * @returns {Promise<Array>} 热门板块数据数组
   */
  async getHotSectors(limit = 5) {
    const sectors = await this.getSectors(null, { limit });
    const result = [];
    
    // 转换数据结构，将stocks数组转换为coreStocks对象
    for (const sector of sectors) {
      // 查找中军股、高度股和弹性股
      const leaderStock = sector.stocks.find(stock => stock.position === '中军股') || {};
      const heightStock = sector.stocks.find(stock => stock.position === '高度股') || {};
      const elasticStock = sector.stocks.find(stock => stock.position === '弹性股') || {};
      
      // 获取股票详细数据，包括涨跌幅
      let leaderStockData = {};
      let heightStockData = {};
      let elasticStockData = {};
      
      try {
        if (leaderStock.code) {
          leaderStockData = await stockDataService.getStocks(leaderStock.code) || {};
        }
        if (heightStock.code) {
          heightStockData = await stockDataService.getStocks(heightStock.code) || {};
        }
        if (elasticStock.code) {
          elasticStockData = await stockDataService.getStocks(elasticStock.code) || {};
        }
      } catch (error) {
        console.error('获取股票数据失败:', error);
      }
      
      // 构建coreStocks对象
      const coreStocks = {
        leader: {
          name: leaderStock.name || '',
          code: leaderStock.code || '',
          changePercent: leaderStockData.changePercent || sector.change || 0
        },
        height: {
          name: heightStock.name || '',
          code: heightStock.code || '',
          changePercent: heightStockData.changePercent || sector.change || 0
        },
        elastic: {
          name: elasticStock.name || '',
          code: elasticStock.code || '',
          changePercent: elasticStockData.changePercent || sector.change || 0
        }
      };
      
      // 添加转换后的板块数据
      result.push({
        ...sector,
        coreStocks,
        id: sector.code // 确保有id属性用于React的key
      });
    }
    
    return result;
  }

  /**
   * 更新板块数据
   * @param {Object} sectorData - 板块数据
   * @returns {Promise<void>}
   */
  async updateSector(sectorData) {
    const store = 'sectors';
    const sector = createSector(sectorData);
    await this.indexedDB.update(store, sector);
  }

  /**
   * 删除板块数据
   * @param {string} code - 板块代码
   * @returns {Promise<void>}
   */
  async deleteSector(code) {
    const store = 'sectors';
    await this.indexedDB.delete(store, code);
  }

  /**
   * 保存市场情绪数据
   * @param {Object} sentimentData - 市场情绪数据
   * @returns {Promise<void>}
   */
  async saveMarketSentiment(sentimentData) {
    const store = 'marketSentiment';
    const sentiment = createMarketSentiment(sentimentData);
    await this.indexedDB.add(store, sentiment);
  }

  /**
   * 获取市场情绪数据
   * @param {Date|string} [date] - 日期，不传则获取最新数据
   * @returns {Promise<Object>} 市场情绪数据
   */
  async getMarketSentiment(date) {
    const store = 'marketSentiment';
    
    if (date) {
      // 如果是字符串日期，转换为Date对象
      const dateKey = typeof date === 'string' ? new Date(date).toISOString().split('T')[0] : date.toISOString().split('T')[0];
      return await this.indexedDB.get(store, dateKey);
    } else {
      // 获取所有数据并按日期排序，返回最新的
      const allSentiments = await this.indexedDB.getAll(store);
      if (allSentiments.length === 0) {
        return null;
      }
      
      // 按日期排序（降序）
      allSentiments.sort((a, b) => new Date(b.date) - new Date(a.date));
      return allSentiments[0];
    }
  }

  /**
   * 更新市场情绪数据
   * @param {Object} sentimentData - 市场情绪数据
   * @returns {Promise<void>}
   */
  async updateMarketSentiment(sentimentData) {
    const store = 'marketSentiment';
    const sentiment = createMarketSentiment(sentimentData);
    await this.indexedDB.update(store, sentiment);
  }

  /**
   * 删除市场情绪数据
   * @param {Date|string} date - 日期
   * @returns {Promise<void>}
   */
  async deleteMarketSentiment(date) {
    const store = 'marketSentiment';
    // 如果是字符串日期，转换为Date对象
    const dateKey = typeof date === 'string' ? new Date(date).toISOString().split('T')[0] : date.toISOString().split('T')[0];
    await this.indexedDB.delete(store, dateKey);
  }
  
  /**
   * 获取市场赚钱效应数据
   * @param {Date|string} [date] - 日期，不传则获取最新数据
   * @returns {Promise<Object>} 市场赚钱效应数据
   */
  async getMarketProfitEffect(date) {
    // 从市场情绪数据中提取赚钱效应部分
    const sentiment = await this.getMarketSentiment(date);
    if (!sentiment) return null;
    
    return {
      date: sentiment.date,
      upStocks: sentiment.upStocks,
      downStocks: sentiment.downStocks,
      limitUpStocks: sentiment.limitUpStocks,
      limitDownStocks: sentiment.limitDownStocks,
      profitSectors: sentiment.profitSectors || [],
      summary: sentiment.profitSummary || '市场赚钱效应分析',
      description: sentiment.profitDescription || '暂无详细描述',
      exampleStocks: sentiment.profitExampleStocks || []
    };
  }
  
  /**
   * 获取市场亏钱效应数据
   * @param {Date|string} [date] - 日期，不传则获取最新数据
   * @returns {Promise<Object>} 市场亏钱效应数据
   */
  async getMarketLossEffect(date) {
    // 从市场情绪数据中提取亏钱效应部分
    const sentiment = await this.getMarketSentiment(date);
    if (!sentiment) return null;
    
    return {
      date: sentiment.date,
      upStocks: sentiment.upStocks,
      downStocks: sentiment.downStocks,
      limitUpStocks: sentiment.limitUpStocks,
      limitDownStocks: sentiment.limitDownStocks,
      lossSectors: sentiment.lossSectors || [],
      summary: sentiment.lossSummary || '市场亏钱效应分析',
      description: sentiment.lossDescription || '暂无详细描述',
      exampleStocks: sentiment.lossExampleStocks || []
    };
  }
  
  /**
   * 添加股票到市场赚钱效应
   * @param {Object} stockData - 股票数据
   * @returns {Promise<Object>} 更新后的市场赚钱效应数据
   */
  async addStockToProfitEffect(stockData) {
    // 获取最新的市场情绪数据
    const sentiment = await this.getMarketSentiment();
    if (!sentiment) {
      throw new Error('没有找到市场情绪数据');
    }
    
    // 确保exampleStocks字段存在
    if (!sentiment.profitExampleStocks) {
      sentiment.profitExampleStocks = [];
    }
    
    // 添加新股票
    sentiment.profitExampleStocks.push(stockData);
    
    // 更新市场情绪数据
    await this.updateMarketSentiment(sentiment);
    
    // 返回更新后的赚钱效应数据
    return await this.getMarketProfitEffect();
  }
  
  /**
   * 添加股票到市场亏钱效应
   * @param {Object} stockData - 股票数据
   * @returns {Promise<Object>} 更新后的市场亏钱效应数据
   */
  async addStockToLossEffect(stockData) {
    // 获取最新的市场情绪数据
    const sentiment = await this.getMarketSentiment();
    if (!sentiment) {
      throw new Error('没有找到市场情绪数据');
    }
    
    // 确保exampleStocks字段存在
    if (!sentiment.lossExampleStocks) {
      sentiment.lossExampleStocks = [];
    }
    
    // 添加新股票
    sentiment.lossExampleStocks.push(stockData);
    
    // 更新市场情绪数据
    await this.updateMarketSentiment(sentiment);
    
    // 返回更新后的亏钱效应数据
    return await this.getMarketLossEffect();
  }
}

// 创建单例实例
const marketDataService = new MarketDataService();

export default marketDataService;