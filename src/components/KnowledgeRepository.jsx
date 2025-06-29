import React, { useState, useEffect } from 'react';
import '../styles/components/KnowledgeRepository.css';
import { useAppContext } from '../context/AppContext';

function KnowledgeRepository() {
  // 使用应用上下文获取数据服务和主题
  const { knowledgeDataService, theme, isLoading } = useAppContext();
  
  // 状态管理
  const [categories, setCategories] = useState([]);
  const [knowledgeItems, setKnowledgeItems] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newKnowledgeItem, setNewKnowledgeItem] = useState({
    title: '',
    category: '',
    content: '',
    tags: [],
    source: '',
    importance: 'medium'
  });
  const [monthlyStats, setMonthlyStats] = useState(0);
  
  // 加载知识库数据
  useEffect(() => {
    const loadKnowledgeData = async () => {
      try {
        // 获取知识分类
        const categoriesData = await knowledgeDataService.getCategories();
        setCategories(categoriesData);
        
        // 获取知识条目
        const knowledgeData = await knowledgeDataService.getKnowledgeItems();
        setKnowledgeItems(knowledgeData);
        
        // 获取本月新增统计
        const stats = await knowledgeDataService.getMonthlyStats();
        setMonthlyStats(stats.newItemsCount);
      } catch (error) {
        console.error('加载知识库数据失败:', error);
      }
    };
    
    loadKnowledgeData();
  }, [knowledgeDataService]);
  
  // 处理添加知识条目
  const handleAddKnowledge = async () => {
    try {
      // 验证表单
      if (!newKnowledgeItem.title || !newKnowledgeItem.category || !newKnowledgeItem.content) {
        alert('请填写标题、分类和内容');
        return;
      }
      
      // 处理标签 - 如果是字符串，转换为数组
      const tags = typeof newKnowledgeItem.tags === 'string' 
        ? newKnowledgeItem.tags.split(',').map(tag => tag.trim()) 
        : newKnowledgeItem.tags;
      
      // 添加知识条目
      const result = await knowledgeDataService.addKnowledgeItem({
        ...newKnowledgeItem,
        tags
      });
      
      if (result.success) {
        // 重新加载知识条目
        const knowledgeData = await knowledgeDataService.getKnowledgeItems();
        setKnowledgeItems(knowledgeData);
        
        // 重置表单
        setNewKnowledgeItem({
          title: '',
          category: '',
          content: '',
          tags: [],
          source: '',
          importance: 'medium'
        });
        
        // 关闭表单
        setShowAddForm(false);
      }
    } catch (error) {
      console.error('添加知识条目失败:', error);
      alert('添加知识条目失败，请稍后再试');
    }
  };
  
  // 处理删除知识条目
  const handleDeleteKnowledge = async (id) => {
    if (window.confirm('确定要删除这条知识吗？')) {
      try {
        const result = await knowledgeDataService.deleteKnowledgeItem(id);
        
        if (result.success) {
          // 更新本地状态
          setKnowledgeItems(knowledgeItems.filter(item => item.id !== id));
        }
      } catch (error) {
        console.error('删除知识条目失败:', error);
        alert('删除知识条目失败，请稍后再试');
      }
    }
  };
  
  // 处理收藏知识条目
  const handleFavoriteKnowledge = async (id) => {
    try {
      const result = await knowledgeDataService.toggleFavorite(id);
      
      if (result.success) {
        // 更新本地状态
        setKnowledgeItems(knowledgeItems.map(item => 
          item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
        ));
      }
    } catch (error) {
      console.error('收藏知识条目失败:', error);
    }
  };

  // 根据分类和搜索关键词筛选知识条目
  const filteredItems = knowledgeItems.filter(item => {
    const matchCategory = selectedCategoryId ? item.category === categories.find(c => c.id === selectedCategoryId)?.name : true;
    const matchKeyword = searchKeyword ? 
      item.title.toLowerCase().includes(searchKeyword.toLowerCase()) || 
      item.content.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchKeyword.toLowerCase())) :
      true;
    return matchCategory && matchKeyword;
  });
  
  // 处理搜索
  const handleSearch = () => {
    // 搜索已经在filteredItems中实现，这里可以添加额外的搜索逻辑
    console.log('搜索关键词:', searchKeyword);
  };
  
  // 处理表单输入变化
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewKnowledgeItem({
      ...newKnowledgeItem,
      [name]: value
    });
  };

  return (
    <div className={`knowledge-repository ${theme}`}>
      <h2 className="module-title">知识积累库</h2>
      
      {/* 加载状态显示 */}
      {isLoading && <div className="loading-indicator">加载知识库数据中...</div>}
      
      {/* 搜索和添加区域 */}
      <section className="knowledge-search-section card">
        <div className="search-container">
          <input 
            type="text" 
            className="search-input" 
            placeholder="搜索知识库..." 
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
          />
          <button 
            className="btn btn-primary" 
            onClick={handleSearch}
            disabled={isLoading}
          >
            搜索
          </button>
        </div>
        <button 
          className="btn btn-secondary add-knowledge-btn"
          onClick={() => setShowAddForm(!showAddForm)}
          disabled={isLoading}
        >
          <span className="add-icon">+</span> 添加知识
        </button>
      </section>
      
      <div className="knowledge-main-container">
        {/* 知识分类侧边栏 */}
        <aside className="knowledge-categories card">
          <h3>知识分类</h3>
          <ul className="category-list">
            <li 
              className={selectedCategoryId === null ? 'active' : ''}
              onClick={() => setSelectedCategoryId(null)}
            >
              <span className="category-name">全部</span>
              <span className="category-count">{knowledgeItems.length}</span>
            </li>
            {categories.map(category => (
              <li 
                key={category.id} 
                className={selectedCategoryId === category.id ? 'active' : ''}
                onClick={() => setSelectedCategoryId(category.id)}
              >
                <span className="category-name">{category.name}</span>
                <span className="category-count">{category.count}</span>
              </li>
            ))}
          </ul>
          <div className="category-actions">
            <button className="btn btn-text">管理分类</button>
          </div>
        </aside>
        
        {/* 知识条目列表 */}
        <section className="knowledge-list">
          {filteredItems.length > 0 ? (
            filteredItems.map(item => (
              <div key={item.id} className={`knowledge-item card importance-${item.importance}`}>
                <div className="knowledge-header">
                  <h3 className="knowledge-title">{item.title}</h3>
                  <span className="knowledge-category">{item.category}</span>
                </div>
                <div className="knowledge-content">
                  <p>{item.content}</p>
                </div>
                <div className="knowledge-meta">
                  <div className="knowledge-tags">
                    {item.tags.map((tag, index) => (
                      <span key={index} className="tag">{tag}</span>
                    ))}
                  </div>
                  <div className="knowledge-source">
                    <span className="source-label">来源:</span>
                    <span className="source-value">{item.source}</span>
                  </div>
                  <div className="knowledge-date">{item.createdAt}</div>
                </div>
                <div className="knowledge-actions">
                  <button 
                    className="btn-icon" 
                    onClick={() => {
                      setNewKnowledgeItem(item);
                      setShowAddForm(true);
                    }}
                  >
                    编辑
                  </button>
                  <button 
                    className="btn-icon"
                    onClick={() => handleDeleteKnowledge(item.id)}
                  >
                    删除
                  </button>
                  <button 
                    className={`btn-icon ${item.isFavorite ? 'favorite' : ''}`}
                    onClick={() => handleFavoriteKnowledge(item.id)}
                  >
                    {item.isFavorite ? '已收藏' : '收藏'}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="no-results card">
              <p>没有找到匹配的知识条目</p>
              <button className="btn btn-secondary">创建新条目</button>
            </div>
          )}
        </section>
      </div>
      
      {/* 知识统计与导出 */}
      <section className="knowledge-stats-section card">
        <h3>知识统计</h3>
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-value">{knowledgeItems.length}</div>
            <div className="stat-label">知识总数</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{categories.length}</div>
            <div className="stat-label">分类数量</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{knowledgeItems.filter(item => item.importance === 'high').length}</div>
            <div className="stat-label">重要知识</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{monthlyStats}</div>
            <div className="stat-label">本月新增</div>
          </div>
        </div>
        <div className="export-actions">
          <button 
            className="btn btn-secondary"
            onClick={() => knowledgeDataService.exportKnowledge()}
            disabled={isLoading}
          >
            导出知识库
          </button>
          <button 
            className="btn btn-secondary"
            onClick={() => knowledgeDataService.generateReport()}
            disabled={isLoading}
          >
            生成学习报告
          </button>
        </div>
      </section>
      
      {/* 添加知识表单 */}
      {showAddForm && (
        <div className="add-knowledge-form card">
          <h3>{newKnowledgeItem.id ? '编辑知识' : '添加知识'}</h3>
          <div className="form-group">
            <label htmlFor="title">标题</label>
            <input
              type="text"
              id="title"
              name="title"
              value={newKnowledgeItem.title}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="category">分类</label>
            <select
              id="category"
              name="category"
              value={newKnowledgeItem.category}
              onChange={handleInputChange}
              required
            >
              <option value="">选择分类</option>
              {categories.map(category => (
                <option key={category.id} value={category.name}>{category.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="content">内容</label>
            <textarea
              id="content"
              name="content"
              value={newKnowledgeItem.content}
              onChange={handleInputChange}
              required
              rows="5"
            ></textarea>
          </div>
          <div className="form-group">
            <label htmlFor="tags">标签 (用逗号分隔)</label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={Array.isArray(newKnowledgeItem.tags) ? newKnowledgeItem.tags.join(', ') : newKnowledgeItem.tags}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="source">来源</label>
            <input
              type="text"
              id="source"
              name="source"
              value={newKnowledgeItem.source}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="importance">重要性</label>
            <select
              id="importance"
              name="importance"
              value={newKnowledgeItem.importance}
              onChange={handleInputChange}
            >
              <option value="low">低</option>
              <option value="medium">中</option>
              <option value="high">高</option>
            </select>
          </div>
          <div className="form-actions">
            <button 
              className="btn btn-primary" 
              onClick={handleAddKnowledge}
              disabled={isLoading}
            >
              {newKnowledgeItem.id ? '保存修改' : '添加知识'}
            </button>
            <button 
              className="btn btn-secondary" 
              onClick={() => {
                setShowAddForm(false);
                setNewKnowledgeItem({
                  title: '',
                  category: '',
                  content: '',
                  tags: [],
                  source: '',
                  importance: 'medium'
                });
              }}
            >
              取消
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default KnowledgeRepository;