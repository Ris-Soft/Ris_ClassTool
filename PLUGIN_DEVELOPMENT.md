# 插件开发指南

## 概述

LessonPlugin 支持基于插件的扩展开发，插件可以提供自定义的工具和功能。本文档介绍如何开发插件。

## 插件结构

```
your-plugin/
├── manifest.json     # 插件清单文件
├── index.js         # 插件主文件
├── *.html          # 外置HTML文件（推荐）
├── *.js            # 外置JavaScript文件
├── *.css           # 样式文件
└── assets/         # 资源文件
```

## 清单文件 (manifest.json)

```json
{
  "id": "your-plugin-id",
  "name": "插件名称",
  "version": "1.0.0",
  "description": "插件描述",
  "author": "作者名称",
  "main": "index.js",
  "permissions": [
    "storage",    // 存储权限
    "ui",         // UI权限
    "system",     // 系统权限
    "shortcut"    // 快捷方式权限
  ],
  "projects": [
    {
      "id": "project-id",
      "name": "项目名称",
      "description": "项目描述",
      "icon": "CalculatorOutlined",
      "component": "ComponentName"
    }
  ],
  "apis": [
    {
      "name": "methodName",
      "description": "方法描述",
      "parameters": ["param1", "param2"]
    }
  ],
  "dependencies": []
}
```

## 插件主文件 (index.js)

### 基本结构

```javascript
let context = null;
let windows = new Map();

// 插件初始化
async function initialize(ctx) {
  context = ctx;
  console.log('插件已初始化');
  
  // 监听应用事件
  ctx.on('app-started', (data) => {
    console.log('应用已启动');
  });
}

// 项目渲染
async function renderProject(params, ctx) {
  return `
    <div>
      <h2>项目内容</h2>
      <button onclick="openTool()">打开工具</button>
    </div>
    <script>
      function openTool() {
        window.electronAPI.plugin.executeAction('your-plugin-id', 'openProject', {});
      }
    </script>
  `;
}

// 打开项目
async function openProject(params, ctx) {
  return createWindow({
    windowId: 'main',
    title: '工具窗口',
    width: 400,
    height: 300,
    htmlFile: 'tool.html'  // 使用外置HTML文件
  });
}

// 导出方法
module.exports = {
  initialize,
  renderProject,
  openProject
};
```

## 通用接口

### 窗口管理

```javascript
// 创建窗口
function createWindow(options) {
  const {
    windowId = 'default',
    title = '窗口标题',
    width = 400,
    height = 300,
    htmlFile = null,    // 外置HTML文件路径
    html = null,        // 内联HTML内容
    ...otherOptions
  } = options;

  return context.createWindow({
    title,
    width,
    height,
    file: htmlFile ? path.join(context.pluginPath, htmlFile) : undefined,
    html: html,
    ...otherOptions
  });
}

// 关闭窗口
function closeWindow(windowId) {
  const window = windows.get(windowId);
  if (window && window.window) {
    window.window.close();
  }
}
```

### 快捷方式管理

```javascript
// 创建桌面快捷方式
async function createDesktopShortcut(params, ctx) {
  const { name, action, params: actionParams = {}, icon } = params;
  
  return ctx.createShortcut({
    name,
    pluginId: 'your-plugin-id',
    action,
    params: actionParams,
    icon
  });
}
```

## 外置HTML文件

推荐将HTML内容外置到独立文件中，便于开发和维护：

### tool.html
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>工具</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="container">
    <h1>我的工具</h1>
    <button onclick="doSomething()">执行操作</button>
  </div>
  
  <script src="tool.js"></script>
</body>
</html>
```

### tool.js
```javascript
function doSomething() {
  console.log('执行操作');
}

// 访问Electron API
if (window.electronAPI) {
  // 可以调用系统API
  window.electronAPI.system.openExternal('https://example.com');
}
```

## 插件上下文 (Context)

插件上下文提供以下API：

```javascript
{
  pluginPath: string,           // 插件路径
  dataPath: string,             // 数据路径
  permissions: string[],        // 权限列表
  
  // 方法
  getPlugin: (id) => Plugin,    // 获取其他插件
  executeAction: (pluginId, action, params) => any,  // 执行插件操作
  createWindow: (options) => Window,                  // 创建窗口
  on: (event, handler) => void,                       // 监听事件
  emit: (event, data) => void,                        // 发送事件
  showMainWindow: (page) => void,                     // 显示主窗口
  createShortcut: (options) => Promise,               // 创建快捷方式
  removeShortcut: (name) => Promise,                  // 删除快捷方式
  listShortcuts: () => Promise                        // 列出快捷方式
}
```

## 最佳实践

1. **使用外置HTML文件**：将HTML内容放在独立文件中，便于开发和调试
2. **模块化设计**：将功能拆分为多个文件，保持代码清晰
3. **错误处理**：添加适当的错误处理和用户反馈
4. **权限最小化**：只申请必要的权限
5. **资源清理**：在插件卸载时清理创建的窗口和资源
6. **通用接口**：提供通用的API接口，便于其他插件调用

## 示例插件

参考 `plugins/example-calculator/` 目录下的示例插件，了解完整的插件开发流程。

## 调试

1. 在开发环境中，主窗口会自动打开开发者工具
2. 插件窗口可以通过右键菜单打开开发者工具
3. 使用 `console.log()` 输出调试信息
4. 检查插件清单文件的语法正确性

## 发布

1. 将插件文件打包为zip格式
2. 确保zip文件根目录包含 `manifest.json`
3. 通过应用的插件管理界面安装插件