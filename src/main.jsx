import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { AppContextProvider } from './context/AppContext';
import './styles/main.css';

// 获取根元素
const rootElement = document.getElementById('root');

// 创建React根
const root = createRoot(rootElement);

// 渲染应用
root.render(
  <React.StrictMode>
    <AppContextProvider>
      <App />
    </AppContextProvider>
  </React.StrictMode>
);