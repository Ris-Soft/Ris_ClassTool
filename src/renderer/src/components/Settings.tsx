import React from 'react';
import { Card, Typography, Switch, Button, Space, Divider } from 'antd';
import { 
  SettingOutlined, 
  InfoCircleOutlined,
  FolderOpenOutlined,
  ReloadOutlined
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

const Settings: React.FC = () => {
  const handleOpenDataFolder = async () => {
    // 这里可以调用electron API打开数据文件夹
    console.log('打开数据文件夹');
  };

  const handleClearCache = () => {
    // 清理缓存逻辑
    console.log('清理缓存');
  };

  return (
    <div className="content-container">
      <div className="page-header">
        <Title level={2} className="page-title">设置</Title>
        <Paragraph className="page-description">
          配置应用程序的各项设置
        </Paragraph>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* 通用设置 */}
        <Card title="通用设置" size="small">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Text strong>自动启动</Text>
                <br />
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  系统启动时自动打开应用
                </Text>
              </div>
              <Switch defaultChecked={false} />
            </div>

            <Divider style={{ margin: '8px 0' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Text strong>最小化到系统托盘</Text>
                <br />
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  关闭窗口时最小化到系统托盘
                </Text>
              </div>
              <Switch defaultChecked={true} />
            </div>

            <Divider style={{ margin: '8px 0' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Text strong>自动检查更新</Text>
                <br />
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  定期检查应用和插件更新
                </Text>
              </div>
              <Switch defaultChecked={true} />
            </div>
          </div>
        </Card>

        {/* 插件设置 */}
        <Card title="插件设置" size="small">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Text strong>允许插件网络访问</Text>
                <br />
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  插件可以访问网络资源
                </Text>
              </div>
              <Switch defaultChecked={true} />
            </div>

            <Divider style={{ margin: '8px 0' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Text strong>允许插件文件系统访问</Text>
                <br />
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  插件可以读写本地文件
                </Text>
              </div>
              <Switch defaultChecked={true} />
            </div>

            <Divider style={{ margin: '8px 0' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Text strong>插件沙盒模式</Text>
                <br />
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  在受限环境中运行插件
                </Text>
              </div>
              <Switch defaultChecked={false} />
            </div>
          </div>
        </Card>

        {/* 数据管理 */}
        <Card title="数据管理" size="small">
          <Space direction="vertical" style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Text strong>数据文件夹</Text>
                <br />
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  打开应用数据存储位置
                </Text>
              </div>
              <Button 
                icon={<FolderOpenOutlined />}
                onClick={handleOpenDataFolder}
              >
                打开
              </Button>
            </div>

            <Divider style={{ margin: '8px 0' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Text strong>清理缓存</Text>
                <br />
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  清理应用缓存和临时文件
                </Text>
              </div>
              <Button 
                icon={<ReloadOutlined />}
                onClick={handleClearCache}
              >
                清理
              </Button>
            </div>
          </Space>
        </Card>

        {/* 关于 */}
        <Card title="关于" size="small">
          <Space direction="vertical" style={{ width: '100%' }}>
            <div>
              <Text strong>RIS ClassTool</Text>
              <br />
              <Text type="secondary">版本 1.0.0</Text>
            </div>
            <Paragraph type="secondary" style={{ fontSize: '12px', margin: 0 }}>
              基于Electron的课堂工具框架，支持插件扩展和项目管理。
            </Paragraph>
            <div style={{ marginTop: '16px' }}>
              <Button type="link" size="small" icon={<InfoCircleOutlined />}>
                查看许可证
              </Button>
              <Button type="link" size="small">
                检查更新
              </Button>
            </div>
          </Space>
        </Card>
      </div>
    </div>
  );
};

export default Settings;