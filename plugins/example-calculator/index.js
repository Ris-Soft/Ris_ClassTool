// 计算器插件示例
// 通用工具插件 - 重构为更通用的接口
const path = require('path');
const fs = require('fs');

let pluginWindows = new Map(); // 管理多个窗口
let context = null;

// 插件初始化函数
async function initialize(ctx) {
  context = ctx;
  console.log('通用工具插件已初始化');
  
  // 监听应用启动事件
  ctx.on('app-started', (data) => {
    console.log('应用已启动，通用工具插件准备就绪');
  });
}

// 通用窗口创建方法
// 通用窗口创建方法
// 通用窗口创建方法
function createWindow(options = {}, ctx = null) {
  const {
    windowId = 'default',
    title = '工具窗口',
    width = 400,
    height = 300,
    htmlFile = null,
    html = null,
    ...otherOptions
  } = options;

  // 使用传入的上下文或全局上下文
  const pluginContext = ctx || context;

  console.log(`尝试创建窗口 ${windowId}，上下文状态:`, pluginContext ? '存在' : '不存在');

  // 如果窗口已存在，尝试聚焦
  if (pluginWindows.has(windowId)) {
    try {
      const existingWindow = pluginWindows.get(windowId);
      if (existingWindow && existingWindow.focus) {
        console.log(`窗口 ${windowId} 已存在，尝试聚焦`);
        existingWindow.focus();
        return existingWindow;
      }
    } catch (error) {
      console.log(`窗口 ${windowId} 已销毁，重新创建`);
      pluginWindows.delete(windowId);
    }
  }

  if (!pluginContext) {
    console.error('插件上下文不可用');
    return null;
  }

  if (!pluginContext.createWindow) {
    console.error('createWindow方法不可用');
    console.error('上下文对象内容:', Object.keys(pluginContext));
    return null;
  }

  try {
    let windowOptions = {
      title,
      width,
      height,
      resizable: true,
      ...otherOptions
    };

    // 如果指定了HTML文件，使用文件路径
    if (htmlFile) {
      const htmlPath = path.join(pluginContext.pluginPath, htmlFile);
      console.log(`检查HTML文件: ${htmlPath}`);
      if (fs.existsSync(htmlPath)) {
        console.log(`HTML文件存在: ${htmlPath}`);
        windowOptions.file = htmlPath;
      } else {
        console.error(`HTML文件不存在: ${htmlPath}`);
        return null;
      }
    } else if (html) {
      windowOptions.html = html;
    }

    console.log(`正在创建窗口 ${windowId}，选项:`, JSON.stringify(windowOptions));
    const pluginWindow = pluginContext.createWindow(windowOptions);
    
    if (!pluginWindow) {
      console.error(`创建窗口 ${windowId} 失败: createWindow返回null或undefined`);
      return null;
    }
    
    console.log(`窗口 ${windowId} 创建成功:`, pluginWindow ? '对象存在' : '对象不存在');

    // 存储窗口引用
    pluginWindows.set(windowId, pluginWindow);
    
    // 确保窗口显示
    if (pluginWindow.show) {
      console.log(`显示窗口 ${windowId}`);
      pluginWindow.show();
    }
    
    return pluginWindow;
  } catch (error) {
    console.error(`创建窗口 ${windowId} 失败:`, error);
    return null;
  }
}

// 关闭指定窗口
function closeWindow(windowId = 'default') {
  const pluginWindow = pluginWindows.get(windowId);
  if (pluginWindow) {
    try {
      if (pluginWindow.window && !pluginWindow.window.isDestroyed()) {
        pluginWindow.window.close();
      }
    } catch (error) {
      console.error(`关闭窗口 ${windowId} 失败:`, error);
    }
    pluginWindows.delete(windowId);
  }
}

// 获取窗口列表
function getWindows() {
  const windows = [];
  for (const [windowId, pluginWindow] of pluginWindows) {
    try {
      if (pluginWindow.window && !pluginWindow.window.isDestroyed()) {
        windows.push({
          windowId,
          title: pluginWindow.window.getTitle(),
          isVisible: pluginWindow.window.isVisible(),
          bounds: pluginWindow.window.getBounds()
        });
      }
    } catch (error) {
      // 窗口可能已销毁，从映射中移除
      pluginWindows.delete(windowId);
    }
  }
  return windows;
}

// 项目操作：打开计算器
// 项目操作：打开计算器
// 项目操作：打开计算器
// 项目操作：打开计算器
async function openProject(params, ctx) {
  console.log('openProject 被调用，上下文状态:', ctx ? '存在' : '不存在');
  try {
    // 直接使用插件上下文创建窗口，绕过本地createWindow函数
    if (ctx && ctx.createWindow) {
      console.log('使用插件上下文直接创建窗口');
      const htmlPath = path.join(ctx.pluginPath, 'calculator.html');
      
      if (!fs.existsSync(htmlPath)) {
        console.error(`HTML文件不存在: ${htmlPath}`);
        return { success: false, error: `HTML文件不存在: ${htmlPath}` };
      }
      
      const windowOptions = {
        title: '计算器',
        width: 300,
        height: 400,
        minWidth: 250,
        minHeight: 350,
        file: htmlPath,
        pluginId: 'example-calculator'
      };
      
      console.log('窗口选项:', JSON.stringify(windowOptions));
      const window = ctx.createWindow(windowOptions);
      
      if (!window) {
        console.error('创建窗口失败: ctx.createWindow返回null');
        return { success: false, error: '创建窗口失败: 返回null' };
      }

      window.show();
      
      console.log('窗口创建成功:', window ? '对象存在' : '对象不存在');
      return { success: true, windowId: 'calculator' };
    } else {
      console.error('插件上下文或createWindow方法不可用');
      return { success: false, error: '插件上下文或createWindow方法不可用' };
    }
  } catch (error) {
    console.error('打开计算器窗口失败:', error);
    return { success: false, error: error.message };
  }
}

// 渲染项目内容
async function renderProject(params, ctx) {
  return `
    <div style="text-align: center; padding: 40px;">
      <div style="font-size: 48px; margin-bottom: 20px;">🧮</div>
      <h2 style="color: #333; margin-bottom: 16px;">计算器工具</h2>
      <p style="color: #666; margin-bottom: 24px;">
        这是一个简单的计算器工具，支持基本的数学运算。
      </p>
      <div style="margin-bottom: 20px;">
        <button 
          onclick="openCalculator()" 
          style="
            background: #1890ff;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            font-size: 16px;
            cursor: pointer;
            margin-right: 12px;
          "
        >
          打开计算器
        </button>
        <button 
          onclick="showAbout()" 
          style="
            background: #52c41a;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            font-size: 16px;
            cursor: pointer;
          "
        >
          关于插件
        </button>
        <button 
          onclick="createShortcut()" 
          style="
            background: #fa8c16;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            font-size: 16px;
            cursor: pointer;
            margin-left: 12px;
          "
        >
          创建快捷方式
        </button>
      </div>
      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin-top: 20px;">
        <h3 style="color: #333; margin-bottom: 12px;">功能特点</h3>
        <ul style="text-align: left; color: #666; max-width: 300px; margin: 0 auto;">
          <li>支持基本四则运算</li>
          <li>支持键盘快捷键操作</li>
          <li>简洁美观的界面设计</li>
          <li>实时计算结果显示</li>
          <li>支持桌面快捷方式</li>
        </ul>
      </div>
    </div>
    
    <script>
      function openCalculator() {
        if (window.pluginActions && window.pluginActions.openCalculator) {
          window.pluginActions.openCalculator();
        } else {
          try {
            window.electronAPI.plugin.executeAction('example-calculator', 'openProject', {});
          } catch (error) {
            alert('打开计算器失败: ' + (error.message || '未知错误'));
          }
        }
      }
      
      function showAbout() {
        if (window.pluginActions && window.pluginActions.showAbout) {
          window.pluginActions.showAbout();
        } else {
          try {
            window.electronAPI.plugin.executeAction('example-calculator', 'showAbout', {});
          } catch (error) {
            alert('显示关于信息失败: ' + (error.message || '未知错误'));
          }
        }
      }
      
      async function createShortcut() {
        try {
          if (window.electronAPI && window.electronAPI.shortcut) {
            const result = await window.electronAPI.shortcut.create({
              name: '计算器',
              pluginId: 'example-calculator',
              action: 'openProject',
              params: {},
              icon: 'calculator'
            });
            
            if (result.success) {
              alert('桌面快捷方式创建成功！');
            } else {
              alert('创建失败：' + (result.error || '未知错误'));
            }
          } else {
            alert('快捷方式功能不可用');
          }
        } catch (error) {
          alert('创建失败：' + error.message);
        }
      }
    </script>
  `;
}

// 插件操作：显示关于信息
// 插件操作：显示关于信息
// 插件操作：显示关于信息
// 插件操作：显示关于信息
async function showAbout(params, ctx) {
  console.log('showAbout 被调用，上下文状态:', ctx ? '存在' : '不存在');
  try {
    // 直接使用插件上下文创建窗口
    if (ctx && ctx.createWindow) {
      console.log('使用插件上下文直接创建窗口');
      const htmlPath = path.join(ctx.pluginPath, 'about.html');
      
      if (!fs.existsSync(htmlPath)) {
        console.error(`HTML文件不存在: ${htmlPath}`);
        return { success: false, error: `HTML文件不存在: ${htmlPath}` };
      }
      
      const windowOptions = {
        title: '关于计算器',
        width: 450,
        height: 400,
        resizable: false,
        file: htmlPath,
        pluginId: 'example-calculator'
      };
      
      console.log('窗口选项:', JSON.stringify(windowOptions));
      const window = ctx.createWindow(windowOptions);
      
      if (!window) {
        console.error('创建窗口失败: ctx.createWindow返回null');
        return { success: false, error: '创建窗口失败: 返回null' };
      }

      window.show();
      
      console.log('窗口创建成功:', window ? '对象存在' : '对象不存在');
      return { success: true, windowId: 'about' };
    } else {
      console.error('插件上下文或createWindow方法不可用');
      return { success: false, error: '插件上下文或createWindow方法不可用' };
    }
  } catch (error) {
    console.error('显示关于窗口失败:', error);
    return { success: false, error: error.message };
  }
}

// 通用API：创建自定义窗口
async function createCustomWindow(params, ctx) {
  console.log('createCustomWindow 被调用，上下文状态:', ctx ? '存在' : '不存在');
  try {
    const { windowId, title, width, height, htmlFile, html, ...options } = params;
    const customWindowId = windowId || `custom_${Date.now()}`;
    
    createWindow({
      windowId: customWindowId,
      title: title || '自定义窗口',
      width: width || 400,
      height: height || 300,
      htmlFile,
      html,
      ...options
    }, ctx);
    
    return { success: true, windowId: customWindowId };
  } catch (error) {
    console.error('创建自定义窗口失败:', error);
    return { success: false, error: error.message };
  }
}

// 通用API：关闭窗口
async function closeCustomWindow(params, ctx) {
  const { windowId } = params;
  closeWindow(windowId);
  return { success: true };
}

// 通用API：获取窗口列表
async function listWindows(params, ctx) {
  return getWindows();
}

// 通用API：创建桌面快捷方式
async function createDesktopShortcut(params, ctx) {
  const { name, action, params: actionParams = {}, icon } = params;
  
  if (!name || !action) {
    throw new Error('缺少必要参数：name, action');
  }

  // 通过插件上下文访问快捷方式API
  if (ctx.createShortcut) {
    return ctx.createShortcut({
      name,
      pluginId: 'example-calculator',
      action,
      params: actionParams,
      icon
    });
  } else {
    throw new Error('快捷方式功能不可用');
  }
}

// 导出插件方法 - 提供通用接口
module.exports = {
  // 生命周期方法
  initialize,
  
  // 项目相关方法
  openProject,
  renderProject,
  showAbout,
  
  // 通用窗口管理API
  createCustomWindow,
  closeCustomWindow,
  listWindows,
  
  // 快捷方式API
  createDesktopShortcut,

  // 向后兼容的方法
  createCalculatorWindow: (ctx) => {
    try {
      createWindow({
        windowId: 'calculator',
        title: '计算器',
        width: 300,
        height: 400,
        htmlFile: 'calculator.html'
      }, ctx || context);
      return { success: true, windowId: 'calculator' };
    } catch (error) {
      console.error('创建计算器窗口失败:', error);
      return { success: false, error: error.message };
    }
  },
  closeCalculatorWindow: () => {
    closeWindow('calculator');
    return { success: true };
  }
};
