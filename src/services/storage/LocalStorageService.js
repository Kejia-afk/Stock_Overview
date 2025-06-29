/**
 * 本地存储服务 - 使用浏览器的localStorage API
 * 用于存储简单的键值对数据，如用户设置、偏好等
 */
class LocalStorageService {
  /**
   * 保存数据到localStorage
   * @param {string} key - 存储键名
   * @param {any} data - 要存储的数据（会被JSON序列化）
   */
  saveData(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('保存数据到localStorage失败:', error);
      return false;
    }
  }
  
  /**
   * 从localStorage获取数据
   * @param {string} key - 存储键名
   * @returns {any|null} 解析后的数据，如果不存在或解析失败则返回null
   */
  getData(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('从localStorage获取数据失败:', error);
      return null;
    }
  }
  
  /**
   * 删除localStorage中的数据
   * @param {string} key - 要删除的键名
   */
  removeData(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('从localStorage删除数据失败:', error);
      return false;
    }
  }
  
  /**
   * 清空所有localStorage数据
   */
  clearAll() {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('清空localStorage失败:', error);
      return false;
    }
  }

  /**
   * 获取所有键名
   * @returns {Array<string>} 所有键名的数组
   */
  getAllKeys() {
    try {
      return Object.keys(localStorage);
    } catch (error) {
      console.error('获取localStorage键名失败:', error);
      return [];
    }
  }

  /**
   * 检查键是否存在
   * @param {string} key - 要检查的键名
   * @returns {boolean} 是否存在
   */
  hasKey(key) {
    return localStorage.getItem(key) !== null;
  }

  /**
   * 获取localStorage已用空间（近似值）
   * @returns {number} 已用空间（字节）
   */
  getUsedSpace() {
    try {
      let totalSize = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const value = localStorage.getItem(key);
        totalSize += key.length + value.length;
      }
      return totalSize * 2; // UTF-16编码，每个字符2字节
    } catch (error) {
      console.error('计算localStorage空间失败:', error);
      return 0;
    }
  }
}

export default LocalStorageService;