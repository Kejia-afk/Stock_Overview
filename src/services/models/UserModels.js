/**
 * 用户数据模型
 * 定义用户设置和知识库相关的数据结构
 */

/**
 * 用户设置模型
 * @typedef {Object} UserSettings
 * @property {string} id - 设置ID（通常为'default'）
 * @property {string} theme - 主题（light/dark）
 * @property {string} defaultModule - 默认模块
 * @property {Array<string>} favoriteStocks - 收藏的股票代码
 * @property {Array<string>} favoriteSectors - 收藏的板块代码
 * @property {Object} chartPreferences - 图表偏好设置
 * @property {Object} notificationSettings - 通知设置
 * @property {Date} lastUpdated - 最后更新时间
 */

/**
 * 知识库条目模型
 * @typedef {Object} KnowledgeEntry
 * @property {string} [id] - 条目ID（自动生成）
 * @property {string} title - 标题
 * @property {string} content - 内容
 * @property {string} type - 类型（笔记/规则/经验/教训）
 * @property {Array<string>} tags - 标签
 * @property {Date} createdAt - 创建时间
 * @property {Date} updatedAt - 更新时间
 * @property {Array<string>} [relatedStocks] - 相关股票
 * @property {Array<string>} [relatedSectors] - 相关板块
 * @property {Array<string>} [attachments] - 附件
 */

/**
 * 创建用户设置对象
 * @param {Object} data - 用户设置数据
 * @returns {UserSettings} 用户设置对象
 */
export function createUserSettings(data = {}) {
  return {
    id: data.id || 'default',
    theme: data.theme || 'light',
    defaultModule: data.defaultModule || 'marketOverview',
    favoriteStocks: data.favoriteStocks || [],
    favoriteSectors: data.favoriteSectors || [],
    chartPreferences: data.chartPreferences || {
      klineType: 'candle', // candle/bar/line
      indicatorVisible: true,
      volumeVisible: true,
      maVisible: true,
      macdVisible: false,
      kdjVisible: false
    },
    notificationSettings: data.notificationSettings || {
      enabled: true,
      marketOpen: true,
      marketClose: true,
      favoriteStockAlert: true,
      limitUpDown: true
    },
    lastUpdated: data.lastUpdated || new Date()
  };
}

/**
 * 创建知识库条目对象
 * @param {Object} data - 知识库条目数据
 * @returns {KnowledgeEntry} 知识库条目对象
 */
export function createKnowledgeEntry(data) {
  const now = new Date();
  return {
    id: data.id,
    title: data.title || '',
    content: data.content || '',
    type: data.type || '笔记',
    tags: data.tags || [],
    createdAt: data.createdAt || now,
    updatedAt: data.updatedAt || now,
    relatedStocks: data.relatedStocks || [],
    relatedSectors: data.relatedSectors || [],
    attachments: data.attachments || []
  };
}

/**
 * 创建默认用户设置
 * @returns {UserSettings} 默认用户设置对象
 */
export function createDefaultUserSettings() {
  return createUserSettings();
}

/**
 * 验证用户设置对象
 * @param {UserSettings} settings - 用户设置对象
 * @returns {boolean} 是否有效
 */
export function validateUserSettings(settings) {
  if (!settings || typeof settings !== 'object') {
    return false;
  }
  
  // 检查必要字段
  if (!settings.id || !settings.theme || !settings.defaultModule) {
    return false;
  }
  
  // 检查主题值是否有效
  if (settings.theme !== 'light' && settings.theme !== 'dark') {
    return false;
  }
  
  // 检查数组字段
  if (!Array.isArray(settings.favoriteStocks) || !Array.isArray(settings.favoriteSectors)) {
    return false;
  }
  
  return true;
}