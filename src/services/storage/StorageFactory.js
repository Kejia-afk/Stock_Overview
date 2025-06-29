/**
 * 存储服务工厂
 * 用于统一管理和访问不同的存储服务
 */
import LocalStorageService from './LocalStorageService';
import IndexedDBService from './IndexedDBService';
import { DB_NAME, DB_VERSION, STORES } from './dbConfig';

class StorageFactory {
  constructor() {
    this.services = {};
  }

  /**
   * 获取LocalStorage服务实例
   * @returns {LocalStorageService} LocalStorage服务实例
   */
  getLocalStorageService() {
    if (!this.services.localStorage) {
      this.services.localStorage = new LocalStorageService();
    }
    return this.services.localStorage;
  }

  /**
   * 获取IndexedDB服务实例
   * @returns {IndexedDBService} IndexedDB服务实例
   */
  getIndexedDBService() {
    if (!this.services.indexedDB) {
      this.services.indexedDB = new IndexedDBService(DB_NAME, DB_VERSION, STORES);
    }
    return this.services.indexedDB;
  }

  /**
   * 初始化所有存储服务
   * @returns {Promise<void>}
   */
  async initAllServices() {
    // 初始化LocalStorage服务
    this.getLocalStorageService();
    
    // 初始化IndexedDB服务
    const indexedDBService = this.getIndexedDBService();
    await indexedDBService.initDB();
    
    console.log('所有存储服务初始化完成');
  }

  /**
   * 清理所有存储服务
   */
  clearAllServices() {
    // 关闭IndexedDB连接
    if (this.services.indexedDB) {
      this.services.indexedDB.close();
    }
    
    // 清空服务缓存
    this.services = {};
  }
}

// 创建单例实例
const storageFactory = new StorageFactory();

export default storageFactory;