import React, { useState, useEffect } from 'react';
import { Layout, Menu, Typography, Spin, message, theme } from 'antd';
import { 
  AppstoreOutlined, 
  SettingOutlined, 
  FolderOutlined,
  ApiOutlined
} from '@ant-design/icons';
import TitleBar from './components/TitleBar';
import ProjectList from './components/ProjectList';
import ProjectView from './components/ProjectView';
import PluginManager from './components/PluginManager';
import Settings from './components/Settings';
import { Plugin, Project } from './types/electron';
import './App.css';

const { Header, Sider, Content } = Layout;

const App: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedKey, setSelectedKey] = useState('projects');
  const [projects, setProjects] = useState<Project[]>([]);
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [pluginsData, projectsData] = await Promise.all([
        window.electronAPI.plugin.list(),
        window.electronAPI.plugin.getProjects()
      ]);
      
      setPlugins(pluginsData);
      setProjects(projectsData);
    } catch (error) {
      console.error('加载数据失败:', error);
      message.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project);
    setSelectedKey(`project-${project.id}`);
  };

  const handleBackToProjects = () => {
    setSelectedProject(null);
    setSelectedKey('projects');
  };

  const menuItems = [
    {
      key: 'projects',
      icon: <FolderOutlined />,
      label: '项目',
    },
    {
      key: 'plugins',
      icon: <ApiOutlined />,
      label: '插件管理',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '设置',
    },
  ];

  // 添加项目菜单项
  const projectMenuItems = projects.map(project => ({
    key: `project-${project.id}`,
    icon: <AppstoreOutlined />,
    label: project.name,
    className: 'project-menu-item'
  }));

  const allMenuItems = [
    ...menuItems,
    ...(projects.length > 0 ? [
      { type: 'divider' as const },
      ...projectMenuItems
    ] : [])
  ];

  const renderContent = () => {
    if (loading) {
      return (
        <div className="loading-container">
          <Spin size="large" />
        </div>
      );
    }

    if (selectedProject) {
      return (
        <ProjectView 
          project={selectedProject} 
          onBack={handleBackToProjects}
        />
      );
    }

    switch (selectedKey) {
      case 'projects':
        return (
          <ProjectList 
            projects={projects} 
            onProjectSelect={handleProjectSelect}
            onRefresh={loadData}
          />
        );
      case 'plugins':
        return (
          <PluginManager 
            plugins={plugins} 
            onPluginChange={loadData}
          />
        );
      case 'settings':
        return <Settings />;
      default:
        return <ProjectList projects={projects} onProjectSelect={handleProjectSelect} onRefresh={loadData} />;
    }
  };

  return (
    <div className="App">
      <TitleBar />
      <Layout style={{ height: 'calc(100vh - 32px)' }}>
        <Header>
          <div className="logo">
            <AppstoreOutlined />
            <span>LessonPlugin</span>
          </div>
        </Header>
        <Layout>
          <Sider 
            width={250} 
            collapsible 
            collapsed={collapsed} 
            onCollapse={setCollapsed}
          >
            <Menu
              mode="inline"
              selectedKeys={[selectedKey]}
              items={allMenuItems}
              onClick={({ key }) => {
                if (key.startsWith('project-')) {
                  const projectId = key.replace('project-', '');
                  const project = projects.find(p => p.id === projectId);
                  if (project) {
                    handleProjectSelect(project);
                  }
                } else {
                  setSelectedKey(key);
                  setSelectedProject(null);
                }
              }}
              className="sidebar-menu"
            />
          </Sider>
          <Content>
            <div className="content-wrapper">
              {renderContent()}
            </div>
          </Content>
        </Layout>
      </Layout>
    </div>
  );
};

export default App;