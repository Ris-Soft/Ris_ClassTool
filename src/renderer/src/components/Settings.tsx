import React, { useState } from 'react';
import { Card, Typography, Switch, Button, Space, Divider, Upload, message, theme } from 'antd';
import { 
  SettingOutlined, 
  InfoCircleOutlined,
  FolderOpenOutlined,
  ReloadOutlined,
  UploadOutlined
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

const Settings: React.FC = () => {
  const [uploading, setUploading] = useState(false);
  const { token } = theme.useToken();
  
  // 深色主题配色
  const darkThemeColors = {
    cardBackground: '#1f1f1f',
    textPrimary: '#ffffff',
    textSecondary: '#a0a0a0',
    dividerColor: '#333333',
    buttonBackground: '#177ddc'
  };

  const handleOpenDataFolder = async () => {
    try {
      await window.electronAPI.system.openDataFolder();
    } catch (error) {
      message.error('打开数据文件夹失败');
    }
  };

  const handleClearCache = () => {
    // 清理缓存逻辑
    console.log('清理缓存');
  };

  const handlePluginUpload = async (file: File) => {
    if (!file.name.endsWith('.zip')) {
      message.error('请选择zip格式的插件文件');
      return false;
    }

    setUploading(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = new Uint8Array(arrayBuffer);
      
      // 创建临时文件路径
      const tempPath = `temp-plugin-${Date.now()}.zip`;
      
      // 通过electron API安装插件
      const result = await window.electronAPI.plugin.installFromBuffer(buffer, tempPath);
      
      if (result.success) {
        message.success(`插件 ${result.plugin.name} 安装成功`);
      } else {
        message.error(result.error || '插件安装失败');
      }
    } catch (error) {
      console.error('插件安装失败:', error);
      message.error('插件安装失败');
    } finally {
      setUploading(false);
    }
    
    return false; // 阻止默认上传行为
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
        <Card 
          title="通用设置" 
          size="small"
          style={{ 
            background: darkThemeColors.cardBackground, 
            color: darkThemeColors.textPrimary,
            borderColor: darkThemeColors.dividerColor
          }}
          headStyle={{ color: darkThemeColors.textPrimary, borderColor: darkThemeColors.dividerColor }}
>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Text strong style={{ color: darkThemeColors.textPrimary }}>自动启动</Text>
                <br />
                <Text type="secondary" style={{ fontSize: '12px', color: darkThemeColors.textSecondary }}>
                  系统启动时自动打开应用
                </Text>
              </div>
              <Switch defaultChecked={false} />
            </div>

            <Divider style={{ margin: '8px 0' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Text strong style={{ color: darkThemeColors.textPrimary }}>最小化到系统托盘</Text>
                <br />
                <Text type="secondary" style={{ fontSize: '12px', color: darkThemeColors.textSecondary }}>
                  关闭窗口时最小化到系统托盘
                </Text>
              </div>
              <Switch defaultChecked={true} />
            </div>

            <Divider style={{ margin: '8px 0' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Text strong style={{ color: darkThemeColors.textPrimary }}>自动检查更新</Text>
                <br />
                <Text type="secondary" style={{ fontSize: '12px', color: darkThemeColors.textSecondary }}>
                  定期检查应用和插件更新
                </Text>
              </div>
              <Switch defaultChecked={true} />
            </div>
          </div>
        </Card>

        {/* 插件设置 */}
        <Card 
          title="插件设置" 
          size="small"
          style={{ 
            background: darkThemeColors.cardBackground, 
            color: darkThemeColors.textPrimary,
            borderColor: darkThemeColors.dividerColor
          }}
          headStyle={{ color: darkThemeColors.textPrimary, borderColor: darkThemeColors.dividerColor }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Text strong style={{ color: darkThemeColors.textPrimary }}>导入插件</Text>
                <br />
                <Text type="secondary" style={{ fontSize: '12px', color: darkThemeColors.textSecondary }}>
                  从zip文件安装插件
                </Text>
              </div>
              <Upload
                beforeUpload={handlePluginUpload}
                showUploadList={false}
                accept=".zip"
              >
                <Button 
                  icon={<UploadOutlined />}
                  loading={uploading}
                >
                  选择zip文件
                </Button>
              </Upload>
            </div>

            <Divider style={{ margin: '8px 0' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Text strong style={{ color: darkThemeColors.textPrimary }}>允许插件网络访问</Text>
                <br />
                <Text type="secondary" style={{ fontSize: '12px', color: darkThemeColors.textSecondary }}>
                  插件可以访问网络资源
                </Text>
              </div>
              <Switch defaultChecked={true} />
            </div>

            <Divider style={{ margin: '8px 0' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Text strong style={{ color: darkThemeColors.textPrimary }}>允许插件文件系统访问</Text>
                <br />
                <Text type="secondary" style={{ fontSize: '12px', color: darkThemeColors.textSecondary }}>
                  插件可以读写本地文件
                </Text>
              </div>
              <Switch defaultChecked={true} />
            </div>

            <Divider style={{ margin: '8px 0' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Text strong style={{ color: darkThemeColors.textPrimary }}>插件沙盒模式</Text>
                <br />
                <Text type="secondary" style={{ fontSize: '12px', color: darkThemeColors.textSecondary }}>
                  在受限环境中运行插件
                </Text>
              </div>
              <Switch defaultChecked={false} />
            </div>
          </div>
        </Card>

        {/* 数据管理 */}
        <Card 
          title="数据管理" 
          size="small"
          style={{ 
            background: darkThemeColors.cardBackground, 
            color: darkThemeColors.textPrimary,
            borderColor: darkThemeColors.dividerColor
          }}
          headStyle={{ color: darkThemeColors.textPrimary, borderColor: darkThemeColors.dividerColor }}
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Text strong style={{ color: darkThemeColors.textPrimary }}>插件文件夹</Text>
                <br />
                <Text type="secondary" style={{ fontSize: '12px', color: darkThemeColors.textSecondary }}>
                  打开插件存储位置
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
                <Text strong style={{ color: darkThemeColors.textPrimary }}>清理缓存</Text>
                <br />
                <Text type="secondary" style={{ fontSize: '12px', color: darkThemeColors.textSecondary }}>
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
        <Card 
          title="关于" 
          size="small"
          style={{ 
            background: darkThemeColors.cardBackground, 
            color: darkThemeColors.textPrimary,
            borderColor: darkThemeColors.dividerColor
          }}
          headStyle={{ color: darkThemeColors.textPrimary, borderColor: darkThemeColors.dividerColor }}
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            <div>
              <Text strong style={{ color: darkThemeColors.textPrimary }}>LessonPlugin</Text>
              <br />
              <Text type="secondary" style={{ color: darkThemeColors.textSecondary }}>版本 1.0.0</Text>
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