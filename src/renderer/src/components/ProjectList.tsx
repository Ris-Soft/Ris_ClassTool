import React from 'react';
import { Card, Button, Empty, Typography } from 'antd';
import { PlusOutlined, AppstoreOutlined, ReloadOutlined } from '@ant-design/icons';
import { Project } from '../types/electron';

const { Title, Paragraph } = Typography;

interface ProjectListProps {
  projects: Project[];
  onProjectSelect: (project: Project) => void;
  onRefresh: () => void;
}

const ProjectList: React.FC<ProjectListProps> = ({ 
  projects, 
  onProjectSelect, 
  onRefresh 
}) => {
  return (
    <div className="content-container">
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Title level={2} className="page-title">项目</Title>
            <Paragraph className="page-description">
              管理您的课堂工具项目，每个项目由插件提供特定功能
            </Paragraph>
          </div>
          <Button 
            icon={<ReloadOutlined />} 
            onClick={onRefresh}
            type="text"
          >
            刷新
          </Button>
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="empty-state">
          <Empty
            image={<AppstoreOutlined />}
            description={
              <div>
                <p>暂无项目</p>
                <p style={{ fontSize: '12px', color: '#8c8c8c' }}>
                  安装插件后，插件可以创建项目条目
                </p>
              </div>
            }
          />
        </div>
      ) : (
        <div className="card-grid">
          {projects.map((project) => (
            <Card
              key={project.id}
              className="project-card"
              hoverable
              onClick={() => onProjectSelect(project)}
              actions={[
                <Button type="text" size="small">
                  打开项目
                </Button>
              ]}
            >
              <Card.Meta
                avatar={
                  <div style={{ 
                    width: 40, 
                    height: 40, 
                    background: '#1890ff', 
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '18px'
                  }}>
                    {project.icon || <AppstoreOutlined />}
                  </div>
                }
                title={project.name}
                description={
                  <div>
                    <div style={{ marginBottom: '8px' }}>
                      {project.description || '暂无描述'}
                    </div>
                    <div style={{ 
                      fontSize: '12px', 
                      color: '#8c8c8c',
                      display: 'flex',
                      justifyContent: 'space-between'
                    }}>
                      <span>插件: {project.pluginName}</span>
                    </div>
                  </div>
                }
              />
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectList;