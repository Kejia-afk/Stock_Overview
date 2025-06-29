/**
 * 个股数据服务
 * 用于管理个股相关数据，包括基本信息、K线数据和技术指标
 */
import storageFactory from '../storage/StorageFactory';
import { createStock, createKlineData, calculateTechnicalIndicators } from '../models';

class StockDataService {
  constructor() {
    this.indexedDB = storageFactory.getIndexedDBService();
    this.localStorage = storageFactory.getLocalStorageService();
  }

  /**
   * 保存股票数据
   * @param {Object|Array} stockData - 单个股票数据对象或股票数据数组
   * @returns {Promise<void>}
   */
  async saveStocks(stockData) {
    const store = 'stocks';
    const stocks = Array.isArray(stockData) ? stockData : [stockData];
    
    // 格式化并保存每个股票数据
    for (const data of stocks) {
      const stock = createStock(data);
      await this.indexedDB.add(store, stock);
    }
  }

  /**
   * 获取股票数据
   * @param {string} [code] - 股票代码，不传则获取所有股票
   * @returns {Promise<Array|Object>} 股票数据数组或单个股票数据
   */
  async getStocks(code) {
    const store = 'stocks';
    
    if (code) {
      return await this.indexedDB.get(store, code);
    } else {
      return await this.indexedDB.getAll(store);
    }
  }

  /**
   * 按板块获取股票
   * @param {string} sector - 板块代码
   * @returns {Promise<Array>} 股票数据数组
   */
  async getStocksBySector(sector) {
    const store = 'stocks';
    return await this.indexedDB.getByIndex(store, 'sector', sector);
  }

  /**
   * 按标签获取股票
   * @param {string} tag - 标签
   * @returns {Promise<Array>} 股票数据数组
   */
  async getStocksByTag(tag) {
    const store = 'stocks';
    return await this.indexedDB.getByIndex(store, 'tags', tag);
  }

  /**
   * 更新股票数据
   * @param {Object} stockData - 股票数据
   * @returns {Promise<void>}
   */
  async updateStock(stockData) {
    const store = 'stocks';
    const stock = createStock(stockData);
    await this.indexedDB.update(store, stock);
  }

  /**
   * 删除股票数据
   * @param {string} code - 股票代码
   * @returns {Promise<void>}
   */
  async deleteStock(code) {
    const store = 'stocks';
    await this.indexedDB.delete(store, code);
  }

  /**
   * 保存股票K线数据
   * @param {string} code - 股票代码
   * @param {Array} klineData - K线数据数组
   * @returns {Promise<void>}
   */
  async saveStockKlines(code, klineData) {
    const stock = await this.getStocks(code);
    if (!stock) {
      throw new Error(`股票 ${code} 不存在`);
    }
    
    // 格式化K线数据
    const formattedKlines = klineData.map(data => createKlineData(data));
    
    // 计算技术指标
    const technicalIndicators = calculateTechnicalIndicators(formattedKlines);
    
    // 更新股票数据
    if (!stock.data) {
      stock.data = {};
    }
    
    stock.data.klines = formattedKlines;
    stock.data.technicalIndicators = technicalIndicators;
    
    // 保存更新后的股票数据
    await this.updateStock(stock);
  }

  /**
   * 获取股票K线数据
   * @param {string} code - 股票代码
   * @returns {Promise<Array>} K线数据数组
   */
  async getStockKlines(code) {
    const stock = await this.getStocks(code);
    if (!stock || !stock.data || !stock.data.klines) {
      return [];
    }
    
    return stock.data.klines;
  }

  /**
   * 获取股票技术指标
   * @param {string} code - 股票代码
   * @returns {Promise<Object>} 技术指标数据
   */
  async getStockTechnicalIndicators(code) {
    const stock = await this.getStocks(code);
    if (!stock || !stock.data || !stock.data.technicalIndicators) {
      return {};
    }
    
    return stock.data.technicalIndicators;
  }

  /**
   * 获取收藏的股票
   * @returns {Promise<Array>} 收藏的股票数据数组
   */
  async getFavoriteStocks() {
    // 从LocalStorage获取收藏的股票代码
    const favoriteStockCodes = this.localStorage.getData('favoriteStocks') || [];
    
    if (favoriteStockCodes.length === 0) {
      return [];
    }
    
    // 获取每个收藏股票的详细数据
    const favoriteStocks = [];
    for (const code of favoriteStockCodes) {
      const stock = await this.getStocks(code);
      if (stock) {
        favoriteStocks.push(stock);
      }
    }
    
    return favoriteStocks;
  }

  /**
   * 添加收藏股票
   * @param {string} code - 股票代码
   * @returns {Promise<void>}
   */
  async addFavoriteStock(code) {
    // 检查股票是否存在
    const stock = await this.getStocks(code);
    if (!stock) {
      throw new Error(`股票 ${code} 不存在`);
    }
    
    // 获取当前收藏的股票代码
    let favoriteStockCodes = this.localStorage.getData('favoriteStocks') || [];
    
    // 如果已经收藏，则不重复添加
    if (favoriteStockCodes.includes(code)) {
      return;
    }
    
    // 添加到收藏
    favoriteStockCodes.push(code);
    this.localStorage.saveData('favoriteStocks', favoriteStockCodes);
  }

  /**
   * 移除收藏股票
   * @param {string} code - 股票代码
   * @returns {Promise<void>}
   */
  async removeFavoriteStock(code) {
    // 获取当前收藏的股票代码
    let favoriteStockCodes = this.localStorage.getData('favoriteStocks') || [];
    
    // 从收藏中移除
    favoriteStockCodes = favoriteStockCodes.filter(item => item !== code);
    this.localStorage.saveData('favoriteStocks', favoriteStockCodes);
  }

  /**
   * 检查股票是否已收藏
   * @param {string} code - 股票代码
   * @returns {boolean} 是否已收藏
   */
  isFavoriteStock(code) {
    const favoriteStockCodes = this.localStorage.getData('favoriteStocks') || [];
    return favoriteStockCodes.includes(code);
  }
}

// 创建单例实例
const stockDataService = new StockDataService();

export default stockDataService;