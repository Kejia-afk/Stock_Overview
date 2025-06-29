/**
 * IndexedDB存储服务
 * 用于存储大量结构化数据，如交易记录、策略数据、知识库等
 */
class IndexedDBService {
  /**
   * 构造函数
   * @param {string} dbName - 数据库名称
   * @param {number} version - 数据库版本
   * @param {Array<Object>} stores - 存储对象配置，格式：[{name: '存储名', keyPath: '主键路径', indexes: [{name: '索引名', keyPath: '索引路径', options: {unique: false}}]}]
   */
  constructor(dbName, version, stores = []) {
    this.dbName = dbName;
    this.version = version;
    this.stores = stores;
    this.db = null;
    this.isInitializing = false;
    this.initPromise = null;
  }
  
  /**
   * 初始化数据库
   * @returns {Promise<IDBDatabase>} 数据库实例
   */
  async initDB() {
    // 如果已经初始化或正在初始化，则返回现有的promise
    if (this.db) return Promise.resolve(this.db);
    if (this.initPromise) return this.initPromise;
    
    this.initPromise = new Promise((resolve, reject) => {
      try {
        const request = indexedDB.open(this.dbName, this.version);
        
        request.onupgradeneeded = (event) => {
          const db = event.target.result;
          
          // 创建存储对象
          this.stores.forEach(store => {
            if (!db.objectStoreNames.contains(store.name)) {
              const objectStore = db.createObjectStore(store.name, { keyPath: store.keyPath, autoIncrement: store.autoIncrement || false });
              
              // 创建索引
              if (store.indexes) {
                store.indexes.forEach(index => {
                  objectStore.createIndex(index.name, index.keyPath, index.options || {});
                });
              }
            }
          });
        };
        
        request.onsuccess = (event) => {
          this.db = event.target.result;
          this.isInitializing = false;
          resolve(this.db);
        };
        
        request.onerror = (event) => {
          this.isInitializing = false;
          reject(`数据库初始化失败: ${event.target.error}`);
        };
      } catch (error) {
        this.isInitializing = false;
        reject(`数据库初始化异常: ${error.message}`);
      }
    });
    
    return this.initPromise;
  }
  
  /**
   * 添加数据
   * @param {string} storeName - 存储对象名称
   * @param {Object} data - 要添加的数据
   * @returns {Promise<any>} 添加结果
   */
  async add(storeName, data) {
    try {
      await this.initDB();
      
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.add(data);
        
        request.onsuccess = (event) => {
          resolve(event.target.result);
        };
        
        request.onerror = (event) => {
          reject(`添加数据失败: ${event.target.error}`);
        };
      });
    } catch (error) {
      throw new Error(`添加数据异常: ${error.message}`);
    }
  }
  
  /**
   * 获取数据
   * @param {string} storeName - 存储对象名称
   * @param {any} key - 主键值
   * @returns {Promise<any>} 获取的数据
   */
  async get(storeName, key) {
    try {
      await this.initDB();
      
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([storeName]);
        const store = transaction.objectStore(storeName);
        const request = store.get(key);
        
        request.onsuccess = (event) => {
          resolve(event.target.result);
        };
        
        request.onerror = (event) => {
          reject(`获取数据失败: ${event.target.error}`);
        };
      });
    } catch (error) {
      throw new Error(`获取数据异常: ${error.message}`);
    }
  }
  
  /**
   * 更新数据
   * @param {string} storeName - 存储对象名称
   * @param {Object} data - 要更新的数据
   * @returns {Promise<any>} 更新结果
   */
  async update(storeName, data) {
    try {
      await this.initDB();
      
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.put(data);
        
        request.onsuccess = (event) => {
          resolve(event.target.result);
        };
        
        request.onerror = (event) => {
          reject(`更新数据失败: ${event.target.error}`);
        };
      });
    } catch (error) {
      throw new Error(`更新数据异常: ${error.message}`);
    }
  }
  
  /**
   * 删除数据
   * @param {string} storeName - 存储对象名称
   * @param {any} key - 主键值
   * @returns {Promise<void>} 删除结果
   */
  async delete(storeName, key) {
    try {
      await this.initDB();
      
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.delete(key);
        
        request.onsuccess = (event) => {
          resolve();
        };
        
        request.onerror = (event) => {
          reject(`删除数据失败: ${event.target.error}`);
        };
      });
    } catch (error) {
      throw new Error(`删除数据异常: ${error.message}`);
    }
  }
  
  /**
   * 获取所有数据
   * @param {string} storeName - 存储对象名称
   * @returns {Promise<Array<any>>} 所有数据
   */
  async getAll(storeName) {
    try {
      await this.initDB();
      
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([storeName]);
        const store = transaction.objectStore(storeName);
        const request = store.getAll();
        
        request.onsuccess = (event) => {
          resolve(event.target.result);
        };
        
        request.onerror = (event) => {
          reject(`获取所有数据失败: ${event.target.error}`);
        };
      });
    } catch (error) {
      throw new Error(`获取所有数据异常: ${error.message}`);
    }
  }

  /**
   * 使用索引查询数据
   * @param {string} storeName - 存储对象名称
   * @param {string} indexName - 索引名称
   * @param {any} indexValue - 索引值
   * @returns {Promise<Array<any>>} 查询结果
   */
  async getByIndex(storeName, indexName, indexValue) {
    try {
      await this.initDB();
      
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([storeName]);
        const store = transaction.objectStore(storeName);
        const index = store.index(indexName);
        const request = index.getAll(indexValue);
        
        request.onsuccess = (event) => {
          resolve(event.target.result);
        };
        
        request.onerror = (event) => {
          reject(`索引查询失败: ${event.target.error}`);
        };
      });
    } catch (error) {
      throw new Error(`索引查询异常: ${error.message}`);
    }
  }

  /**
   * 清空存储对象
   * @param {string} storeName - 存储对象名称
   * @returns {Promise<void>} 清空结果
   */
  async clear(storeName) {
    try {
      await this.initDB();
      
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.clear();
        
        request.onsuccess = (event) => {
          resolve();
        };
        
        request.onerror = (event) => {
          reject(`清空存储对象失败: ${event.target.error}`);
        };
      });
    } catch (error) {
      throw new Error(`清空存储对象异常: ${error.message}`);
    }
  }

  /**
   * 关闭数据库连接
   */
  close() {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }

  /**
   * 删除数据库
   * @returns {Promise<void>} 删除结果
   */
  async deleteDatabase() {
    this.close();
    
    return new Promise((resolve, reject) => {
      const request = indexedDB.deleteDatabase(this.dbName);
      
      request.onsuccess = () => {
        resolve();
      };
      
      request.onerror = (event) => {
        reject(`删除数据库失败: ${event.target.error}`);
      };
    });
  }

  /**
   * 获取存储对象中的记录数量
   * @param {string} storeName - 存储对象名称
   * @returns {Promise<number>} 记录数量
   */
  async count(storeName) {
    try {
      await this.initDB();
      
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([storeName]);
        const store = transaction.objectStore(storeName);
        const request = store.count();
        
        request.onsuccess = (event) => {
          resolve(event.target.result);
        };
        
        request.onerror = (event) => {
          reject(`获取记录数量失败: ${event.target.error}`);
        };
      });
    } catch (error) {
      throw new Error(`获取记录数量异常: ${error.message}`);
    }
  }
}

export default IndexedDBService;