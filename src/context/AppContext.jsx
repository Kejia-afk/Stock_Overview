/**
 * 应用上下文
 * 用于在应用中共享数据服务和状态
 */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  marketDataService, 
  stockDataService, 
  tradeDataService, 
  userDataService,
  dataInitService
} from '../services';

// 创建上下文
const AppContext = createContext();

/**
 * 应用上下文提供者
 * @param {Object} props - 组件属性
 * @returns {JSX.Element} 上下文提供者组件
 */
export const AppContextProvider = ({ children }) => {
  // 应用状态
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [theme, setTheme] = useState('light');
  const [activeModule, setActiveModule] = useState('marketOverview');
  
  // 市场数据状态
  const [marketIndices, setMarketIndices] = useState([]);
  const [hotSectors, setHotSectors] = useState([]);
  const [marketSentiment, setMarketSentiment] = useState(null);
  
  // 初始化应用
  useEffect(() => {
    const initApp = async () => {
      try {
        setIsLoading(true);
        
        // 初始化数据服务
        await dataInitService.initAllServices();
        
        // 加载用户设置
        const settings = userDataService.getUserSettings();
        setTheme(settings.theme);
        setActiveModule(settings.defaultModule);
        
        // 加载初始数据
        await loadInitialData();
        
        setIsInitialized(true);
        setIsLoading(false);
      } catch (err) {
        console.error('应用初始化失败:', err);
        setError(err.message);
        setIsLoading(false);
      }
    };
    
    initApp();
  }, []);
  
  // 加载初始数据
  const loadInitialData = async () => {
    try {
      // 加载市场指数数据
      const indices = await marketDataService.getMarketIndices();
      setMarketIndices(indices);
      
      // 加载热门板块数据
      const sectors = await marketDataService.getHotSectors(5);
      setHotSectors(sectors);
      
      // 加载市场情绪数据
      const sentiment = await marketDataService.getMarketSentiment();
      setMarketSentiment(sentiment);
    } catch (err) {
      console.error('加载初始数据失败:', err);
      throw err;
    }
  };
  
  // 切换主题
  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    try {
      await userDataService.setTheme(newTheme);
      setTheme(newTheme);
    } catch (err) {
      console.error('切换主题失败:', err);
    }
  };
  
  // 切换模块
  const changeModule = (moduleName) => {
    setActiveModule(moduleName);
  };
  
  // 刷新数据
  const refreshData = async () => {
    try {
      setIsLoading(true);
      await loadInitialData();
      setIsLoading(false);
    } catch (err) {
      console.error('刷新数据失败:', err);
      setError(err.message);
      setIsLoading(false);
    }
  };
  
  // 上下文值
  const contextValue = {
    // 应用状态
    isInitialized,
    isLoading,
    error,
    theme,
    activeModule,
    
    // 数据服务
    marketDataService,
    stockDataService,
    tradeDataService,
    userDataService,
    
    // 市场数据
    marketIndices,
    hotSectors,
    marketSentiment,
    
    // 方法
    toggleTheme,
    changeModule,
    refreshData
  };
  
  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

/**
 * 使用应用上下文的钩子
 * @returns {Object} 上下文值
 */
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext必须在AppContextProvider内部使用');
  }
  return context;
};