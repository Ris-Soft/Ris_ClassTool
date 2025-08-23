import React, { useState } from 'react';
import { 
  Card, 
  Button, 
  Switch, 
  Typography, 
  Space, 
  Tag, 
  Modal, 
  message,
  Empty,
  Popconfirm
} from 'antd';
import { 
  PlusOutlined, 
  DeleteOutlined, 
  SettingOutlined,
  ApiOutlined,
  ExclamationCircleOutlined,
  AppstoreOutlined,
  CalculatorOutlined,
  ToolOutlined,
  BugOutlined,
  CodeOutlined,
  DatabaseOutlined,
  FileTextOutlined,
  GlobalOutlined,
  HomeOutlined,
  SettingFilled
} from '@ant-design/icons';
import { Plugin } from '../types/electron';

const { Title, Paragraph, Text } = Typography;

interface PluginManagerProps {
  plugins: Plugin[];
  onPluginChange: () => void;
}

const PluginManager: React.FC<PluginManagerProps> = ({ 
  plugins, 
  onPluginChange 
}) => {
  const [loading, setLoading] = useState<string | null>(null);

  // 获取插件图标组件
  const getPluginIcon = (plugin: Plugin) => {
    // 根据插件ID或名称返回对应的图标
    const iconMap: { [key: string]: React.ReactNode } = {
      'example-calculator': <CalculatorOutlined />,
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

    // 优先根据插件ID匹配
    if (iconMap[plugin.id]) {
      return iconMap[plugin.id];
    }

    // 根据插件名称关键词匹配
    const name = plugin.name.toLowerCase();
    for (const [key, icon] of Object.entries(iconMap)) {
      if (name.includes(key)) {
        return icon;
      }
    }

    // 默认图标
    return <ApiOutlined />;
  };

  const handleInstallPlugin = async () => {
    try {
      const pluginPath = await window.electronAPI.fs.selectFolder();
      if (!pluginPath) return;

      setLoading('install');
      const result = await window.electronAPI.plugin.install(pluginPath);
      
      if (result.success) {
        message.success('插件安装成功');
        onPluginChange();
      } else {
        message.error(result.error || '插件安装失败');
      }
    } catch (error: any) {
      message.error(error.message || '插件安装失败');
    } finally {
      setLoading(null);
    }
  };

  const handleUninstallPlugin = async (pluginId: string) => {
    try {
      setLoading(pluginId);
      const result = await window.electronAPI.plugin.uninstall(pluginId);
      
      if (result.success) {
        message.success('插件卸载成功');
        onPluginChange();
      } else {
        message.error(result.error || '插件卸载失败');
      }
    } catch (error: any) {
      message.error(error.message || '插件卸载失败');
    } finally {
      setLoading(null);
    }
  };

  const handleTogglePlugin = async (pluginId: string, enabled: boolean) => {
    try {
      setLoading(pluginId);
      const result = enabled 
        ? await window.electronAPI.plugin.enable(pluginId)
        : await window.electronAPI.plugin.disable(pluginId);
      
      if (result.success) {
        message.success(enabled ? '插件已启用' : '插件已禁用');
        onPluginChange();
      } else {
        message.error(result.error || '操作失败');
      }
    } catch (error: any) {
      message.error(error.message || '操作失败');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="content-container">
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Title level={2} className="page-title">插件管理</Title>
            <Paragraph className="page-description">
              安装、管理和配置课堂工具插件
            </Paragraph>
          </div>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={handleInstallPlugin}
            loading={loading === 'install'}
          >
            安装插件
          </Button>
        </div>
      </div>

      {plugins.length === 0 ? (
        <div className="empty-state">
          <Empty
            image={<ApiOutlined />}
            description={
              <div>
                <p>暂无已安装的插件</p>
                <p style={{ fontSize: '12px', color: '#8c8c8c' }}>
                  点击上方"安装插件"按钮开始添加功能
                </p>
              </div>
            }
          />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {plugins.map((plugin) => (
            <Card key={plugin.id} className="plugin-card">
              <div className="plugin-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: 48,
                    height: 48,
                    background: plugin.enabled ? '#1890ff' : '#d9d9d9',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '20px'
                  }}>
                    {getPluginIcon(plugin)}
                  </div>
                  <div>
                    <div className="plugin-name">{plugin.name}</div>
                    <Space size="small">
                      <span className="plugin-version">v{plugin.version}</span>
                      {plugin.author && (
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          by {plugin.author}
                        </Text>
                      )}
                    </Space>
                  </div>
                </div>
                <Switch
                  checked={plugin.enabled}
                  onChange={(checked) => handleTogglePlugin(plugin.id, checked)}
                  loading={loading === plugin.id}
                />
              </div>

              {plugin.description && (
                <div className="plugin-description">
                  {plugin.description}
                </div>
              )}

              <div style={{ marginBottom: '12px' }}>
                {plugin.permissions.length > 0 && (
                  <div style={{ marginBottom: '8px' }}>
                    <Text type="secondary" style={{ fontSize: '12px' }}>权限:</Text>
                    <div style={{ marginTop: '4px' }}>
                      {plugin.permissions.map(permission => (
                        <Tag key={permission} color="blue">
                          {permission}
                        </Tag>
                      ))}
                    </div>
                  </div>
                )}

                {plugin.dependencies.length > 0 && (
                  <div>
                    <Text type="secondary" style={{ fontSize: '12px' }}>依赖:</Text>
                    <div style={{ marginTop: '4px' }}>
                      {plugin.dependencies.map(dep => (
                        <Tag key={dep.id} color="orange">
                          {dep.id} {dep.version && `(${dep.version})`}
                        </Tag>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="plugin-meta">
                <Space>
                  <Button 
                    type="text" 
                    size="small" 
                    icon={<SettingOutlined />}
                    disabled={!plugin.enabled}
                  >
                    配置
                  </Button>
                </Space>
                <Popconfirm
                  title="确定要卸载此插件吗？"
                  description="卸载后插件的所有数据将被删除"
                  onConfirm={() => handleUninstallPlugin(plugin.id)}
                  okText="确定"
                  cancelText="取消"
                  icon={<ExclamationCircleOutlined style={{ color: 'red' }} />}
                >
                  <Button 
                    type="text" 
                    size="small" 
                    danger
                    icon={<DeleteOutlined />}
                    loading={loading === plugin.id}
                  >
                    卸载
                  </Button>
                </Popconfirm>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PluginManager;