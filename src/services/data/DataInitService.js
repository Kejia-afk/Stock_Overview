/**
 * 数据初始化服务
 * 用于初始化应用所需的所有数据服务和示例数据
 */
import storageFactory from '../storage/StorageFactory';
import { marketDataService, stockDataService, tradeDataService, userDataService } from './index';

class DataInitService {
  constructor() {
    this.initialized = false;
  }

  /**
   * 初始化所有数据服务
   * @returns {Promise<void>}
   */
  async initAllServices() {
    if (this.initialized) {
      console.log('数据服务已初始化');
      return;
    }

    try {
      console.log('开始初始化数据服务...');
      
      // 初始化存储服务
      await storageFactory.initAllServices();
      
      // 初始化用户设置
      await userDataService.initUserSettings();
      
      // 检查是否需要加载示例数据
      const needInitSampleData = await this.checkNeedInitSampleData();
      if (needInitSampleData) {
        await this.initSampleData();
      }
      
      this.initialized = true;
      console.log('数据服务初始化完成');
    } catch (error) {
      console.error('数据服务初始化失败:', error);
      throw error;
    }
  }

  /**
   * 检查是否需要初始化示例数据
   * @returns {Promise<boolean>}
   */
  async checkNeedInitSampleData() {
    try {
      // 检查是否已有市场指数数据
      const indices = await marketDataService.getMarketIndices();
      if (indices && indices.length > 0) {
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('检查示例数据失败:', error);
      return true;
    }
  }

  /**
   * 初始化示例数据
   * @returns {Promise<void>}
   */
  async initSampleData() {
    console.log('开始初始化示例数据...');
    
    try {
      // 初始化市场指数数据
      await this.initMarketIndicesData();
      
      // 初始化板块数据
      await this.initSectorsData();
      
      // 初始化市场情绪数据
      await this.initMarketSentimentData();
      
      // 初始化股票数据
      await this.initStocksData();
      
      // 初始化交易记录数据
      await this.initTradeRecordsData();
      
      // 初始化策略数据
      await this.initStrategiesData();
      
      console.log('示例数据初始化完成');
    } catch (error) {
      console.error('示例数据初始化失败:', error);
      throw error;
    }
  }

  /**
   * 初始化市场指数示例数据
   * @returns {Promise<void>}
   */
  async initMarketIndicesData() {
    const indices = [
      {
        code: '000001',
        name: '上证指数',
        value: 3532.88,
        change: 12.75,
        changePercent: 0.36,
        timestamp: new Date()
      },
      {
        code: '399001',
        name: '深证成指',
        value: 11568.30,
        change: 86.73,
        changePercent: 0.76,
        timestamp: new Date()
      },
      {
        code: '399006',
        name: '创业板指',
        value: 2243.14,
        change: 22.31,
        changePercent: 1.00,
        timestamp: new Date()
      },
      {
        code: '000016',
        name: '上证50',
        value: 3132.99,
        change: -3.25,
        changePercent: -0.10,
        timestamp: new Date()
      },
      {
        code: '000300',
        name: '沪深300',
        value: 4112.68,
        change: 15.23,
        changePercent: 0.37,
        timestamp: new Date()
      },
      {
        code: '000905',
        name: '中证500',
        value: 6532.41,
        change: 45.67,
        changePercent: 0.70,
        timestamp: new Date()
      }
    ];
    
    await marketDataService.saveMarketIndices(indices);
  }

  /**
   * 初始化板块示例数据
   * @returns {Promise<void>}
   */
  async initSectorsData() {
    const sectors = [
      {
        code: 'BK0001',
        name: '半导体',
        change: 2.35,
        hotDays: 5,
        stage: '爆发',
        stocks: [
          { code: '688981', name: '中芯国际', position: '中军股' },
          { code: '688012', name: '中微公司', position: '高度股' },
          { code: '688126', name: '沪硅产业', position: '弹性股' }
        ],
        timestamp: new Date()
      },
      {
        code: 'BK0002',
        name: '新能源车',
        change: 1.87,
        hotDays: 3,
        stage: '启动',
        stocks: [
          { code: '300750', name: '宁德时代', position: '中军股' },
          { code: '002594', name: '比亚迪', position: '高度股' },
          { code: '600733', name: '北汽蓝谷', position: '弹性股' }
        ],
        timestamp: new Date()
      },
      {
        code: 'BK0003',
        name: '人工智能',
        change: 2.56,
        hotDays: 4,
        stage: '爆发',
        stocks: [
          { code: '002230', name: '科大讯飞', position: '中军股' },
          { code: '300024', name: '机器人', position: '高度股' },
          { code: '688256', name: '寒武纪', position: '弹性股' }
        ],
        timestamp: new Date()
      },
      {
        code: 'BK0004',
        name: '医药生物',
        change: -0.75,
        hotDays: 0,
        stage: '回流',
        stocks: [
          { code: '600276', name: '恒瑞医药', position: '中军股' },
          { code: '300122', name: '智飞生物', position: '高度股' },
          { code: '688185', name: '康希诺', position: '弹性股' }
        ],
        timestamp: new Date()
      },
      {
        code: 'BK0005',
        name: '光伏设备',
        change: 1.23,
        hotDays: 2,
        stage: '观察',
        stocks: [
          { code: '601012', name: '隆基股份', position: '中军股' },
          { code: '002459', name: '晶澳科技', position: '高度股' },
          { code: '688599', name: '天合光能', position: '弹性股' }
        ],
        timestamp: new Date()
      }
    ];
    
    await marketDataService.saveSectors(sectors);
  }

  /**
   * 初始化市场情绪示例数据
   * @returns {Promise<void>}
   */
  async initMarketSentimentData() {
    const sentiment = {
      date: new Date(),
      upStocks: { value: 2876, total: 4687, percent: 61.36 },
      yesterdayLimit: { success: 32, total: 58, percent: 55.17 },
      limitUp: { value: 78, percent: 1.66 },
      limitDown: { value: 12, percent: 0.26 },
      profitEffect: {
        summary: '赚钱效应较强',
        description: '市场整体呈现普涨格局，赚钱效应较强，热点板块轮动活跃，资金参与度高。',
        exampleStocks: [
          { id: '1', name: '中芯国际', code: '688981', changePercent: 8.35 },
          { id: '2', name: '比亚迪', code: '002594', changePercent: 5.67 },
          { id: '3', name: '宁德时代', code: '300750', changePercent: 4.89 }
        ]
      },
      lossEffect: {
        summary: '亏钱效应较弱',
        description: '市场下跌个股较少，主要集中在前期涨幅过大的高位股和业绩不达预期的个股。',
        exampleStocks: [
          { id: '1', name: '恒瑞医药', code: '600276', changePercent: -2.35 },
          { id: '2', name: '贵州茅台', code: '600519', changePercent: -1.87 },
          { id: '3', name: '中国平安', code: '601318', changePercent: -1.56 }
        ]
      }
    };
    
    await marketDataService.saveMarketSentiment(sentiment);
  }

  /**
   * 初始化股票示例数据
   * @returns {Promise<void>}
   */
  async initStocksData() {
    const stocks = [
      {
        code: '688981',
        name: '中芯国际',
        price: 68.75,
        change: 5.32,
        changePercent: 8.35,
        sector: 'BK0001',
        sectorPosition: '中军股',
        tags: ['半导体', '芯片', '科技'],
        timestamp: new Date()
      },
      {
        code: '002594',
        name: '比亚迪',
        price: 245.67,
        change: 13.21,
        changePercent: 5.67,
        sector: 'BK0002',
        sectorPosition: '高度股',
        tags: ['新能源车', '电池', '汽车'],
        timestamp: new Date()
      },
      {
        code: '300750',
        name: '宁德时代',
        price: 312.45,
        change: 14.56,
        changePercent: 4.89,
        sector: 'BK0002',
        sectorPosition: '中军股',
        tags: ['新能源车', '电池', '储能'],
        timestamp: new Date()
      },
      {
        code: '002230',
        name: '科大讯飞',
        price: 42.35,
        change: 1.87,
        changePercent: 4.62,
        sector: 'BK0003',
        sectorPosition: '中军股',
        tags: ['人工智能', '语音识别', '科技'],
        timestamp: new Date()
      },
      {
        code: '600276',
        name: '恒瑞医药',
        price: 32.45,
        change: -0.78,
        changePercent: -2.35,
        sector: 'BK0004',
        sectorPosition: '中军股',
        tags: ['医药', '创新药', '医疗'],
        timestamp: new Date()
      },
      {
        code: '601012',
        name: '隆基股份',
        price: 56.78,
        change: 1.23,
        changePercent: 2.21,
        sector: 'BK0005',
        sectorPosition: '中军股',
        tags: ['光伏', '新能源', '硅片'],
        timestamp: new Date()
      }
    ];
    
    await stockDataService.saveStocks(stocks);
  }

  /**
   * 初始化交易记录示例数据
   * @returns {Promise<void>}
   */
  async initTradeRecordsData() {
    const tradeRecords = [
      {
        stockCode: '688981',
        stockName: '中芯国际',
        type: '买入',
        price: 60.25,
        quantity: 200,
        date: new Date(new Date().setDate(new Date().getDate() - 10)),
        reason: '半导体行业景气度高，公司基本面良好'
      },
      {
        stockCode: '688981',
        stockName: '中芯国际',
        type: '卖出',
        price: 68.75,
        quantity: 200,
        date: new Date(),
        reason: '获利了结'
      },
      {
        stockCode: '002594',
        stockName: '比亚迪',
        type: '买入',
        price: 230.45,
        quantity: 100,
        date: new Date(new Date().setDate(new Date().getDate() - 5)),
        reason: '新能源车销量持续增长，行业前景看好'
      },
      {
        stockCode: '600276',
        stockName: '恒瑞医药',
        type: '买入',
        price: 35.67,
        quantity: 300,
        date: new Date(new Date().setDate(new Date().getDate() - 15)),
        reason: '医药板块调整到位，估值合理'
      },
      {
        stockCode: '600276',
        stockName: '恒瑞医药',
        type: '卖出',
        price: 32.45,
        quantity: 300,
        date: new Date(),
        reason: '止损出局'
      }
    ];
    
    for (const record of tradeRecords) {
      await tradeDataService.saveTradeRecord(record);
    }
  }

  /**
   * 初始化策略示例数据
   * @returns {Promise<void>}
   */
  async initStrategiesData() {
    const strategies = [
      {
        name: '半导体行业龙头布局',
        type: '行业龙头',
        description: '半导体行业景气度持续提升，国产替代加速，布局行业龙头',
        date: new Date(),
        stocks: [
          {
            code: '688981',
            name: '中芯国际',
            reason: '国内晶圆制造龙头，受益于国产替代',
            sector: '半导体',
            position: '中军股',
            targetPrice: 75.00,
            stopLoss: 62.00
          },
          {
            code: '688012',
            name: '中微公司',
            reason: '设备国产化龙头，市占率持续提升',
            sector: '半导体',
            position: '高度股',
            targetPrice: 120.00,
            stopLoss: 95.00
          }
        ],
        parameters: {
          holdPeriod: '中长期',
          expectedReturn: '20%以上'
        },
        tags: ['半导体', '科技', '国产替代']
      },
      {
        name: '新能源车产业链配置',
        type: '主题投资',
        description: '新能源车渗透率持续提升，产业链景气度高',
        date: new Date(),
        stocks: [
          {
            code: '300750',
            name: '宁德时代',
            reason: '全球动力电池龙头，技术领先',
            sector: '新能源车',
            position: '中军股',
            targetPrice: 350.00,
            stopLoss: 280.00
          },
          {
            code: '002594',
            name: '比亚迪',
            reason: '新能源车销量持续增长，垂直整合优势明显',
            sector: '新能源车',
            position: '高度股',
            targetPrice: 280.00,
            stopLoss: 220.00
          }
        ],
        parameters: {
          holdPeriod: '中长期',
          expectedReturn: '25%以上'
        },
        tags: ['新能源车', '电池', '汽车']
      }
    ];
    
    for (const strategy of strategies) {
      await tradeDataService.saveStrategy(strategy);
    }
  }
  


  /**
   * 清理所有数据
   * @returns {Promise<void>}
   */
  async clearAllData() {
    try {
      console.log('开始清理所有数据...');
      
      // 清理IndexedDB中的所有存储对象
      const indexedDB = storageFactory.getIndexedDBService();
      await indexedDB.clear('marketIndices');
      await indexedDB.clear('sectors');
      await indexedDB.clear('marketSentiment');
      await indexedDB.clear('stocks');
      await indexedDB.clear('tradeRecords');
      await indexedDB.clear('strategies');
      await indexedDB.clear('knowledge');
      await indexedDB.clear('userSettings');
      await indexedDB.clear('exportHistory');
      
      // 清理LocalStorage
      const localStorage = storageFactory.getLocalStorageService();
      localStorage.clearAll();
      
      // 重置初始化标志
      this.initialized = false;
      
      console.log('所有数据清理完成');
    } catch (error) {
      console.error('数据清理失败:', error);
      throw error;
    }
  }
}

// 创建单例实例
const dataInitService = new DataInitService();

export default dataInitService;