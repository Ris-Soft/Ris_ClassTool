import React, { useState, useEffect } from 'react';
import { Button, Typography, Spin, Alert } from 'antd';
import { ArrowLeftOutlined, AppstoreOutlined } from '@ant-design/icons';
import { Project } from '../types/electron';

const { Title, Paragraph } = Typography;

interface ProjectViewProps {
  project: Project;
  onBack: () => void;
}

const ProjectView: React.FC<ProjectViewProps> = ({ project, onBack }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [content, setContent] = useState<any>(null);

  // 定义插件操作处理函数
  const handlePluginAction = async (action: string, params = {}) => {
    try {
      return await window.electronAPI.plugin.executeAction(
        project.pluginId,
        action,
        params
      );
    } catch (error: any) {
      console.error(`执行插件操作 ${action} 失败:`, error);
      alert(`执行操作失败: ${error.message || '未知错误'}`);
    }
  };

  useEffect(() => {
    loadProjectContent();
  }, [project]);

  useEffect(() => {
    // 将插件操作函数暴露给全局，以便内联脚本调用
    (window as any).pluginActions = {
      openCalculator: (params = {}) => handlePluginAction('openProject', params),
      showAbout: (params = {}) => handlePluginAction('showAbout', params)
    };
    
    // 清理函数
    return () => {
      delete (window as any).pluginActions;
    };
  }, []);

  const loadProjectContent = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 调用插件的项目渲染方法
      const result = await window.electronAPI.plugin.executeAction(
        project.pluginId,
        'renderProject',
        { projectId: project.id }
      );
      
      setContent(result);
    } catch (error: any) {
      setError(error.message || '加载项目内容失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="content-container">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Button 
            type="text" 
            icon={<ArrowLeftOutlined />}
            onClick={onBack}
          >
            返回
          </Button>
          <div>
            <Title level={2} className="page-title">{project.name}</Title>
            <Paragraph className="page-description">
              来自插件: {project.pluginName}
            </Paragraph>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <Spin size="large" />
        </div>
      ) : error ? (
        <Alert
          message="加载失败"
          description={error}
          type="error"
          showIcon
          action={
            <Button size="small" onClick={loadProjectContent}>
              重试
            </Button>
          }
        />
      ) : (
        <div style={{ 
          background: '#1f1f1f', 
          borderRadius: '8px', 
          padding: '24px',
          minHeight: '400px',
          border: '1px solid #333333'
        }}>
          {content ? (
            <div 
              ref={(el) => {
                if (el && content) {
                  // 先设置HTML内容
                  el.innerHTML = content;
                  
                  // 确保全局函数可用
                  (window as any).pluginActions = {
                    openCalculator: (params = {}) => handlePluginAction('openProject', params),
                    showAbout: (params = {}) => handlePluginAction('showAbout', params)
                  };
                  
                  // 执行脚本
                  const scripts = el.querySelectorAll('script');
                  scripts.forEach(oldScript => {
                    try {
                      // 创建新的script元素以确保脚本被正确执行
                      const newScript = document.createElement('script');
                      
                      // 复制所有属性
                      Array.from(oldScript.attributes).forEach(attr => {
                        newScript.setAttribute(attr.name, attr.value);
                      });
                      
                      // 处理内联脚本或外部脚本
                      if (oldScript.src) {
                        newScript.src = oldScript.src;
                        newScript.async = false; // 确保按顺序执行
                      } else {
                        // 内联脚本，复制内容
                        newScript.textContent = oldScript.textContent;
                      }
                      
                      // 替换原始脚本
                      oldScript.parentNode?.replaceChild(newScript, oldScript);
                    } catch (error) {
                      console.error('执行脚本失败:', error);
                    }
                  });
                }
              }}
            />
          ) : (
            <div style={{ 
              textAlign: 'center', 
              padding: '60px 20px',
              color: '#8c8c8c'
            }}>
              <AppstoreOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
              <p>项目内容为空</p>
              <p style={{ fontSize: '12px' }}>
                插件可能尚未实现项目渲染功能
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProjectView;