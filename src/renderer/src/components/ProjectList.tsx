import React from 'react';
import { Card, Button, Empty, Typography } from 'antd';
import { 
  PlusOutlined, 
  AppstoreOutlined, 
  ReloadOutlined,
  CalculatorOutlined,
  ToolOutlined,
  BugOutlined,
  CodeOutlined,
  DatabaseOutlined,
  FileTextOutlined,
  GlobalOutlined,
  HomeOutlined,
  SettingFilled,
  CloudOutlined,
  BookOutlined,
  EditOutlined,
  FileOutlined,
  PictureOutlined,
  PlayCircleOutlined,
  QuestionCircleOutlined,
  SearchOutlined,
  UserOutlined,
  VideoCameraOutlined
} from '@ant-design/icons';
import * as AntdIcons from '@ant-design/icons';
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
  // 获取项目图标组件
  const getProjectIcon = (project: Project) => {
    // 首先检查项目中是否指定了图标
    if (project.icon && typeof project.icon === 'string') {
      // 尝试从Ant Design图标库中获取图标
      const IconComponent = (AntdIcons as any)[project.icon];
      if (IconComponent) {
        return React.createElement(IconComponent);
      }
    }
    
    // 根据项目ID或名称返回对应的图标
    const iconMap: { [key: string]: React.ReactNode } = {
      'calculator-project': <CalculatorOutlined />,
      'calculator': <CalculatorOutlined />,
      'tool': <ToolOutlined />,
      'debug': <BugOutlined />,
      'code': <CodeOutlined />,
      'database': <DatabaseOutlined />,
      'file': <FileTextOutlined />,
      'web': <GlobalOutlined />,
      'home': <HomeOutlined />,
      'setting': <SettingFilled />,
      'app': <AppstoreOutlined />
    };

    // 优先根据项目ID匹配
    if (iconMap[project.id]) {
      return iconMap[project.id];
    }

    // 根据项目名称关键词匹配
    const name = project.name.toLowerCase();
    for (const [key, icon] of Object.entries(iconMap)) {
      if (name.includes(key)) {
        return icon;
      }
    }

    // 默认图标
    return <AppstoreOutlined />;
  };

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
            image={<AppstoreOutlined style={{ fontSize: '64px', color: '#d9d9d9' }} />}
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {projects.map((project) => (
            <div
              key={project.id}
              className="project-item"
              onClick={() => onProjectSelect(project)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{ 
                  width: 48, 
                  height: 48, 
                  background: '#1890ff', 
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '20px'
                }}>
                  {getProjectIcon(project)}
                </div>
                <div style={{ flex: 1 }}>
                  <div className="project-title">{project.name}</div>
                  <div className="project-plugin">来自: {project.pluginName}</div>
                </div>
              </div>
              <div className="project-description">
                {project.description || '暂无描述'}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectList;