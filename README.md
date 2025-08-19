# RIS ClassTool - 课堂工具框架

基于Electron的可扩展课堂工具框架，支持插件系统和项目管理。

## 功能特性

### 🔧 核心功能
- **现代化界面**: 基于React + Ant Design的美观UI
- **插件系统**: 完整的插件管理和加载机制
- **项目管理**: 插件可创建和管理项目条目
- **窗口管理**: 支持多窗口和弹窗功能
- **安全机制**: 插件权限控制和沙盒运行

### 🎯 主要特点
- 左侧导航栏设计，支持项目快速切换
- 响应式布局，适配不同屏幕尺寸
- 插件热加载和依赖管理
- 文件系统安全访问控制
- 统一的UI/UX设计规范

## 项目结构

```
Ris_Classtool/
├── package.json                 # 主项目配置
├── src/
│   ├── main/                   # Electron主进程
│   │   ├── main.js            # 应用入口
│   │   ├── plugin-manager.js  # 插件管理器
│   │   ├── window-manager.js  # 窗口管理器
│   │   └── preload.js         # 预加载脚本
│   └── renderer/              # React渲染进程
│       ├── package.json       # 前端依赖
│       ├── public/
│       │   └── index.html     # HTML模板
│       └── src/
│           ├── App.tsx        # 主应用组件
│           ├── components/    # React组件
│           └── types/         # TypeScript类型定义
└── example-plugin/            # 示例插件
    ├── manifest.json          # 插件清单
    └── index.js              # 插件主文件
```

## 快速开始

### 1. 安装依赖

```bash
# 安装主项目依赖
npm install

# 安装前端依赖
cd src/renderer
npm install
```

### 2. 启动开发环境

```bash
# 启动应用（开发模式）
npm run dev
```

### 3. 构建应用

```bash
# 构建生产版本
npm run build
```

## 插件开发

### 插件结构

每个插件需要包含以下文件：

#### manifest.json
```json
{
  "id": "your-plugin-id",
  "name": "插件名称",
  "version": "1.0.0",
  "description": "插件描述",
  "author": "作者",
  "main": "index.js",
  "permissions": ["storage", "network", "ui"],
  "projects": [
    {
      "id": "project-id",
      "name": "项目名称",
      "description": "项目描述",
      "icon": "🔧",
      "component": "ComponentName"
    }
  ],
  "dependencies": [
    {
      "id": "dependency-plugin-id",
      "version": "^1.0.0"
    }
  ]
}
```

#### index.js
```javascript
module.exports = {
  // 渲染项目页面
  renderProject: async (params, context) => {
    const { projectId } = params;
    return '<div>项目内容HTML</div>';
  },
  
  // 其他插件方法...
};
```

### 插件权限

- `storage`: 文件系统访问权限
- `network`: 网络访问权限
- `ui`: 用户界面操作权限
- `system`: 系统级操作权限

### 插件上下文

插件运行时会获得以下上下文：

```javascript
{
  pluginPath: '/path/to/plugin',      // 插件目录路径
  dataPath: '/path/to/plugin/data',   // 插件数据目录
  permissions: ['storage', 'ui'],     // 插件权限列表
  getPlugin: (id) => Plugin,          // 获取其他插件实例
  executeAction: (pluginId, action, params) => Promise // 调用其他插件方法
}
```

## API文档

### 主进程API

#### 插件管理
- `plugin:list` - 获取已安装插件列表
- `plugin:install` - 安装插件
- `plugin:uninstall` - 卸载插件
- `plugin:enable` - 启用插件
- `plugin:disable` - 禁用插件
- `plugin:getProjects` - 获取插件项目列表
- `plugin:executeAction` - 执行插件方法

#### 窗口管理
- `window:create` - 创建新窗口
- `window:close` - 关闭窗口

#### 文件系统
- `fs:selectFolder` - 选择文件夹
- `fs:selectFile` - 选择文件

### 渲染进程API

通过 `window.electronAPI` 访问：

```javascript
// 插件操作
const plugins = await window.electronAPI.plugin.list();
await window.electronAPI.plugin.install('/path/to/plugin');

// 窗口操作
const { windowId } = await window.electronAPI.window.create({
  width: 800,
  height: 600,
  title: '新窗口'
});

// 文件操作
const folderPath = await window.electronAPI.fs.selectFolder();
```

## 示例插件

项目包含一个计算器示例插件，展示了：
- 基本的插件结构
- 项目页面渲染
- 数据持久化
- 用户交互处理

安装示例插件：
1. 打开应用
2. 进入"插件管理"页面
3. 点击"安装插件"
4. 选择 `example-plugin` 文件夹

## 开发指南

### 添加新功能
1. 在主进程中添加IPC处理器
2. 在预加载脚本中暴露API
3. 在渲染进程中调用API
4. 更新TypeScript类型定义

### 插件开发最佳实践
1. 遵循插件清单规范
2. 合理声明权限需求
3. 处理异步操作和错误
4. 保持UI风格一致性
5. 提供清晰的用户反馈

### 安全考虑
- 插件运行在受限环境中
- 网络和文件访问需要权限声明
- 用户数据加密存储
- 定期更新依赖包

## 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 许可证

MIT License - 详见 LICENSE 文件

## 支持

如有问题或建议，请提交 Issue 或联系开发团队。