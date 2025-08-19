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

  useEffect(() => {
    loadProjectContent();
  }, [project]);

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
          background: '#fff', 
          borderRadius: '8px', 
          padding: '24px',
          minHeight: '400px'
        }}>
          {content ? (
            <div dangerouslySetInnerHTML={{ __html: content }} />
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