import React, { useState, useEffect } from 'react';
import '../styles/components/UserCenter.css';
import { useAppContext } from '../context/AppContext';

function UserCenter() {
  // 使用应用上下文获取数据服务和主题
  const { userDataService, theme, toggleTheme, isLoading } = useAppContext();
  
  // 用户状态
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  
  // 表单状态
  const [activeForm, setActiveForm] = useState('login'); // login 或 register
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    email: ''
  });

  // 用户设置
  const [userSettings, setUserSettings] = useState({
    theme: theme, // 使用上下文中的主题
    indicators: {
      macd: true,
      kdj: true,
      rsi: true,
      boll: false
    },
    autoBackup: false
  });
  
  // 错误信息
  const [error, setError] = useState('');
  
  // 加载用户数据
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const loginStatus = await userDataService.checkLoginStatus();
        setIsLoggedIn(loginStatus.isLoggedIn);
        
        if (loginStatus.isLoggedIn) {
          // 获取用户数据
          const user = await userDataService.getUserData();
          setUserData(user);
          
          // 获取用户设置
          const settings = await userDataService.getUserSettings();
          setUserSettings(settings);
        }
      } catch (error) {
        console.error('检查登录状态失败:', error);
      }
    };
    
    checkLoginStatus();
  }, [userDataService]);

  // 处理表单输入变化
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // 处理设置变化
  const handleSettingChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'theme') {
      // 使用上下文中的主题切换函数
      toggleTheme();
      setUserSettings({
        ...userSettings,
        theme: value
      });
    } else if (name.startsWith('indicator-')) {
      const indicator = name.replace('indicator-', '');
      const updatedSettings = {
        ...userSettings,
        indicators: {
          ...userSettings.indicators,
          [indicator]: checked
        }
      };
      setUserSettings(updatedSettings);
    } else if (name === 'autoBackup') {
      const updatedSettings = {
        ...userSettings,
        autoBackup: checked
      };
      setUserSettings(updatedSettings);
    }
  };

  // 处理登录
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      // 调用登录API
      const result = await userDataService.login(formData.username, formData.password);
      
      if (result.success) {
        setIsLoggedIn(true);
        setUserData(result.userData);
        setUserSettings(result.userSettings);
      } else {
        setError(result.message || '登录失败，请检查用户名和密码');
      }
    } catch (error) {
      console.error('登录失败:', error);
      setError('登录过程中发生错误，请稍后再试');
    }
  };

  // 处理注册
  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    
    // 验证密码
    if (formData.password !== formData.confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }
    
    try {
      // 调用注册API
      const result = await userDataService.register({
        username: formData.username,
        password: formData.password,
        email: formData.email
      });
      
      if (result.success) {
        setIsLoggedIn(true);
        setUserData(result.userData);
        setUserSettings(result.userSettings);
      } else {
        setError(result.message || '注册失败，请稍后再试');
      }
    } catch (error) {
      console.error('注册失败:', error);
      setError('注册过程中发生错误，请稍后再试');
    }
  };

  // 处理登出
  const handleLogout = async () => {
    try {
      await userDataService.logout();
      setIsLoggedIn(false);
      setUserData(null);
      setFormData({
        username: '',
        password: '',
        confirmPassword: '',
        email: ''
      });
    } catch (error) {
      console.error('登出失败:', error);
    }
  };
  
  // 保存用户设置
  const saveUserSettings = async () => {
    try {
      await userDataService.saveUserSettings(userSettings);
      alert('设置已保存');
    } catch (error) {
      console.error('保存设置失败:', error);
      alert('保存设置失败，请稍后再试');
    }
  };
  
  // 备份数据
  const backupData = async () => {
    try {
      await userDataService.backupData();
      alert('数据已备份');
    } catch (error) {
      console.error('备份数据失败:', error);
      alert('备份数据失败，请稍后再试');
    }
  };
  
  // 恢复数据
  const restoreData = async () => {
    try {
      await userDataService.restoreData();
      alert('数据已恢复');
    } catch (error) {
      console.error('恢复数据失败:', error);
      alert('恢复数据失败，请稍后再试');
    }
  };

  // 渲染登录表单
  const renderLoginForm = () => (
    <form onSubmit={handleLogin} className="auth-form">
      {error && <div className="error-message">{error}</div>}
      
      <div className="form-group">
        <label htmlFor="username">用户名</label>
        <input
          type="text"
          id="username"
          name="username"
          value={formData.username}
          onChange={handleInputChange}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="password">密码</label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          required
        />
      </div>
      <button type="submit" className="btn btn-primary" disabled={isLoading}>
        {isLoading ? '登录中...' : '登录'}
      </button>
      <p className="form-switch">
        还没有账号？
        <span onClick={() => { setActiveForm('register'); setError(''); }}>立即注册</span>
      </p>
    </form>
  );

  // 渲染注册表单
  const renderRegisterForm = () => (
    <form onSubmit={handleRegister} className="auth-form">
      {error && <div className="error-message">{error}</div>}
      
      <div className="form-group">
        <label htmlFor="username">用户名</label>
        <input
          type="text"
          id="username"
          name="username"
          value={formData.username}
          onChange={handleInputChange}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="email">电子邮箱</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="password">密码</label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          required
          minLength="6"
        />
      </div>
      <div className="form-group">
        <label htmlFor="confirmPassword">确认密码</label>
        <input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleInputChange}
          required
        />
      </div>
      <button type="submit" className="btn btn-primary" disabled={isLoading}>
        {isLoading ? '注册中...' : '注册'}
      </button>
      <p className="form-switch">
        已有账号？
        <span onClick={() => { setActiveForm('login'); setError(''); }}>立即登录</span>
      </p>
    </form>
  );

  // 渲染用户设置
  const renderUserSettings = () => (
    <div className="user-settings">
      <h3>个性化设置</h3>
      
      <div className="settings-section">
        <h4>界面风格</h4>
        <div className="form-group">
          <label>
            <input
              type="radio"
              name="theme"
              value="dark"
              checked={theme === 'dark'}
              onChange={handleSettingChange}
            />
            深色模式
          </label>
          <label>
            <input
              type="radio"
              name="theme"
              value="light"
              checked={theme === 'light'}
              onChange={handleSettingChange}
            />
            浅色模式
          </label>
        </div>
      </div>
      
      <div className="settings-section">
        <h4>分析指标选择</h4>
        <div className="form-group">
          <label>
            <input
              type="checkbox"
              name="indicator-macd"
              checked={userSettings.indicators.macd}
              onChange={handleSettingChange}
            />
            MACD指标
          </label>
          <label>
            <input
              type="checkbox"
              name="indicator-kdj"
              checked={userSettings.indicators.kdj}
              onChange={handleSettingChange}
            />
            KDJ指标
          </label>
          <label>
            <input
              type="checkbox"
              name="indicator-rsi"
              checked={userSettings.indicators.rsi}
              onChange={handleSettingChange}
            />
            RSI指标
          </label>
          <label>
            <input
              type="checkbox"
              name="indicator-boll"
              checked={userSettings.indicators.boll}
              onChange={handleSettingChange}
            />
            BOLL指标
          </label>
        </div>
      </div>
      
      <div className="settings-section">
        <h4>数据备份</h4>
        <div className="form-group">
          <label>
            <input
              type="checkbox"
              name="autoBackup"
              checked={userSettings.autoBackup}
              onChange={handleSettingChange}
            />
            启用自动备份
          </label>
        </div>
        <div className="backup-actions">
          <button 
            className="btn btn-secondary" 
            onClick={backupData}
            disabled={isLoading}
          >
            立即备份
          </button>
          <button 
            className="btn btn-secondary" 
            onClick={restoreData}
            disabled={isLoading}
          >
            恢复数据
          </button>
        </div>
      </div>
      
      <div className="settings-actions">
        <button 
          className="btn btn-primary" 
          onClick={saveUserSettings}
          disabled={isLoading}
        >
          保存设置
        </button>
        <button 
          className="btn btn-secondary" 
          onClick={handleLogout}
          disabled={isLoading}
        >
          退出登录
        </button>
      </div>
    </div>
  );

  return (
    <div className={`user-center ${theme}`}>
      <h2 className="module-title">用户中心</h2>
      
      {/* 加载状态显示 */}
      {isLoading && <div className="loading-indicator">加载用户数据中...</div>}
      
      <div className="user-center-content card">
        {isLoggedIn ? (
          <>
            {userData && (
              <div className="user-info">
                <h3>欢迎，{userData.username}</h3>
                <p>上次登录时间: {new Date(userData.lastLogin).toLocaleString()}</p>
              </div>
            )}
            {renderUserSettings()}
          </>
        ) : (
          <div className="auth-container">
            {activeForm === 'login' ? renderLoginForm() : renderRegisterForm()}
          </div>
        )}
      </div>
    </div>
  );
}

export default UserCenter;