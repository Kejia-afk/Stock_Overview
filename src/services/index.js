/**
 * 服务索引
 * 统一导出所有服务
 */

// 存储服务
import storageFactory from './storage/StorageFactory';

// 数据服务
import { marketDataService, stockDataService, tradeDataService, userDataService } from './data';
import dataInitService from './data/DataInitService';

// 数据模型
import * as models from './models';

// 导出所有服务
export {
  // 存储服务
  storageFactory,
  
  // 数据服务
  marketDataService,
  stockDataService,
  tradeDataService,
  userDataService,
  dataInitService,
  
  // 数据模型
  models
};