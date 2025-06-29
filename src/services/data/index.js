/**
 * 数据服务索引
 * 统一导出所有数据服务
 */

// 市场数据服务
import marketDataService from './MarketDataService';

// 个股数据服务
import stockDataService from './StockDataService';

// 交易数据服务
import tradeDataService from './TradeDataService';

// 用户数据服务
import userDataService from './UserDataService';

// 导出所有服务
export {
  marketDataService,
  stockDataService,
  tradeDataService,
  userDataService
};