/**
 * 数据库配置
 * 定义应用所需的数据库结构，包括存储对象和索引
 */

// 数据库名称和版本
export const DB_NAME = 'StockReviewMasterDB';
export const DB_VERSION = 1;

// 存储对象配置
export const STORES = [
  // 市场指数数据存储
  {
    name: 'marketIndices',
    keyPath: 'code',
    indexes: [
      { name: 'timestamp', keyPath: 'timestamp' }
    ]
  },
  
  // 板块数据存储
  {
    name: 'sectors',
    keyPath: 'code',
    indexes: [
      { name: 'name', keyPath: 'name' },
      { name: 'timestamp', keyPath: 'timestamp' },
      { name: 'stage', keyPath: 'stage' }
    ]
  },
  
  // 市场情绪数据存储
  {
    name: 'marketSentiment',
    keyPath: 'date',
    indexes: []
  },
  
  // 个股数据存储
  {
    name: 'stocks',
    keyPath: 'code',
    indexes: [
      { name: 'name', keyPath: 'name' },
      { name: 'sector', keyPath: 'sector' },
      { name: 'timestamp', keyPath: 'timestamp' },
      { name: 'tags', keyPath: 'tags', options: { multiEntry: true } }
    ]
  },
  
  // 交易记录存储
  {
    name: 'tradeRecords',
    keyPath: 'id',
    autoIncrement: true,
    indexes: [
      { name: 'stockCode', keyPath: 'stockCode' },
      { name: 'date', keyPath: 'date' },
      { name: 'type', keyPath: 'type' }
    ]
  },
  
  // 策略数据存储
  {
    name: 'strategies',
    keyPath: 'id',
    autoIncrement: true,
    indexes: [
      { name: 'date', keyPath: 'date' }
    ]
  },
  
  // 知识库存储
  {
    name: 'knowledge',
    keyPath: 'id',
    autoIncrement: true,
    indexes: [
      { name: 'title', keyPath: 'title' },
      { name: 'createdAt', keyPath: 'createdAt' },
      { name: 'tags', keyPath: 'tags', options: { multiEntry: true } }
    ]
  },
  
  // 用户设置存储
  {
    name: 'userSettings',
    keyPath: 'id',
    indexes: []
  },
  
  // 导出历史记录存储
  {
    name: 'exportHistory',
    keyPath: 'id',
    indexes: [
      { name: 'date', keyPath: 'date' },
      { name: 'type', keyPath: 'type' },
      { name: 'format', keyPath: 'format' }
    ]
  },
  
  // 分享导出记录存储
  {
    name: 'sharedExports',
    keyPath: 'id',
    indexes: [
      { name: 'originalId', keyPath: 'originalId' },
      { name: 'sharedAt', keyPath: 'sharedAt' },
      { name: 'expiresAt', keyPath: 'expiresAt' }
    ]
  }
];

// 存储键名常量
export const STORAGE_KEYS = {
  // LocalStorage键名
  LAST_SYNC_TIME: 'lastSyncTime',
  USER_PREFERENCES: 'userPreferences',
  THEME: 'theme',
  DEFAULT_MODULE: 'defaultModule',
  FAVORITE_STOCKS: 'favoriteStocks',
  FAVORITE_SECTORS: 'favoriteSectors',
  
  // 其他常量
  CURRENT_USER_ID: 'currentUserId'
};