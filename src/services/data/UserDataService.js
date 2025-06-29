/**
 * 用户数据服务
 * 用于管理用户设置和知识库数据
 */
import storageFactory from '../storage/StorageFactory';
import { createUserSettings, createDefaultUserSettings, validateUserSettings, createKnowledgeEntry } from '../models';
import { STORAGE_KEYS } from '../storage/dbConfig';

class UserDataService {
  constructor() {
    this.indexedDB = storageFactory.getIndexedDBService();
    this.localStorage = storageFactory.getLocalStorageService();
  }

  /**
   * 初始化用户设置
   * @returns {Promise<void>}
   */
  async initUserSettings() {
    // 检查LocalStorage中是否已有用户设置
    const localSettings = this.localStorage.getData(STORAGE_KEYS.USER_PREFERENCES);
    
    if (!localSettings || !validateUserSettings(localSettings)) {
      // 创建默认设置并保存
      const defaultSettings = createDefaultUserSettings();
      this.localStorage.saveData(STORAGE_KEYS.USER_PREFERENCES, defaultSettings);
      
      // 同时保存到IndexedDB
      const store = 'userSettings';
      await this.indexedDB.add(store, defaultSettings);
    }
  }

  /**
   * 获取用户设置
   * @returns {Object} 用户设置
   */
  getUserSettings() {
    // 优先从LocalStorage获取，保证快速访问
    const settings = this.localStorage.getData(STORAGE_KEYS.USER_PREFERENCES);
    
    if (settings && validateUserSettings(settings)) {
      return settings;
    }
    
    // 如果LocalStorage中没有有效设置，返回默认设置
    return createDefaultUserSettings();
  }

  /**
   * 更新用户设置
   * @param {Object} settingsData - 用户设置数据
   * @returns {Promise<void>}
   */
  async updateUserSettings(settingsData) {
    // 合并现有设置和新设置
    const currentSettings = this.getUserSettings();
    const newSettings = { ...currentSettings, ...settingsData, lastUpdated: new Date() };
    
    // 验证设置有效性
    if (!validateUserSettings(newSettings)) {
      throw new Error('无效的用户设置');
    }
    
    // 保存到LocalStorage
    this.localStorage.saveData(STORAGE_KEYS.USER_PREFERENCES, newSettings);
    
    // 同时更新IndexedDB
    const store = 'userSettings';
    await this.indexedDB.update(store, newSettings);
  }

  /**
   * 获取主题设置
   * @returns {string} 主题（light/dark）
   */
  getTheme() {
    const settings = this.getUserSettings();
    return settings.theme || 'light';
  }

  /**
   * 设置主题
   * @param {string} theme - 主题（light/dark）
   * @returns {Promise<void>}
   */
  async setTheme(theme) {
    if (theme !== 'light' && theme !== 'dark') {
      throw new Error('无效的主题设置');
    }
    
    // 更新设置
    await this.updateUserSettings({ theme });
    
    // 同时单独保存到LocalStorage，方便快速访问
    this.localStorage.saveData(STORAGE_KEYS.THEME, theme);
  }

  /**
   * 获取默认模块
   * @returns {string} 默认模块
   */
  getDefaultModule() {
    const settings = this.getUserSettings();
    return settings.defaultModule || 'marketOverview';
  }

  /**
   * 设置默认模块
   * @param {string} module - 默认模块
   * @returns {Promise<void>}
   */
  async setDefaultModule(module) {
    // 更新设置
    await this.updateUserSettings({ defaultModule: module });
    
    // 同时单独保存到LocalStorage，方便快速访问
    this.localStorage.saveData(STORAGE_KEYS.DEFAULT_MODULE, module);
  }

  /**
   * 保存知识库条目
   * @param {Object} entryData - 知识库条目数据
   * @returns {Promise<string>} 条目ID
   */
  async saveKnowledgeEntry(entryData) {
    const store = 'knowledge';
    const entry = createKnowledgeEntry(entryData);
    const id = await this.indexedDB.add(store, entry);
    return id;
  }

  /**
   * 获取知识库条目
   * @param {string} [id] - 条目ID，不传则获取所有条目
   * @returns {Promise<Array|Object>} 知识库条目数组或单个条目
   */
  async getKnowledgeEntries(id) {
    const store = 'knowledge';
    
    if (id) {
      return await this.indexedDB.get(store, id);
    } else {
      const entries = await this.indexedDB.getAll(store);
      // 按创建时间排序（降序）
      entries.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return entries;
    }
  }

  /**
   * 按标题搜索知识库条目
   * @param {string} title - 标题关键词
   * @returns {Promise<Array>} 知识库条目数组
   */
  async searchKnowledgeByTitle(title) {
    const store = 'knowledge';
    const entries = await this.indexedDB.getAll(store);
    
    // 筛选标题包含关键词的条目
    const filteredEntries = entries.filter(entry => 
      entry.title.toLowerCase().includes(title.toLowerCase())
    );
    
    // 按创建时间排序（降序）
    filteredEntries.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    return filteredEntries;
  }

  /**
   * 按标签获取知识库条目
   * @param {string} tag - 标签
   * @returns {Promise<Array>} 知识库条目数组
   */
  async getKnowledgeByTag(tag) {
    const store = 'knowledge';
    return await this.indexedDB.getByIndex(store, 'tags', tag);
  }

  /**
   * 更新知识库条目
   * @param {Object} entryData - 知识库条目数据
   * @returns {Promise<void>}
   */
  async updateKnowledgeEntry(entryData) {
    const store = 'knowledge';
    // 更新修改时间
    const entry = createKnowledgeEntry({
      ...entryData,
      updatedAt: new Date()
    });
    await this.indexedDB.update(store, entry);
  }

  /**
   * 删除知识库条目
   * @param {string} id - 条目ID
   * @returns {Promise<void>}
   */
  async deleteKnowledgeEntry(id) {
    const store = 'knowledge';
    await this.indexedDB.delete(store, id);
  }

  /**
   * 获取最后同步时间
   * @returns {Date|null} 最后同步时间
   */
  getLastSyncTime() {
    const timestamp = this.localStorage.getData(STORAGE_KEYS.LAST_SYNC_TIME);
    return timestamp ? new Date(timestamp) : null;
  }

  /**
   * 更新最后同步时间
   * @param {Date} [time=new Date()] - 同步时间，默认为当前时间
   */
  updateLastSyncTime(time = new Date()) {
    this.localStorage.saveData(STORAGE_KEYS.LAST_SYNC_TIME, time.toISOString());
  }
}

// 创建单例实例
const userDataService = new UserDataService();

export default userDataService;