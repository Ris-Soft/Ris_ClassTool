// 计算器插件示例 - 使用事件化接口
const path = require('path');
const fs = require('fs');

// 存储窗口ID映射
let windowIdMap = new Map();
let context = null;

/**
 * 插件初始化函数
 * @param {Object} ctx - 插件上下文
 */
async function initialize(ctx) {
  context = ctx;
  console.log('通用工具插件已初始化');
  
  // 监听应用启动事件
  ctx.on('app-started', (data) => {
    console.log('应用已启动，通用工具插件准备就绪', data);
  });
}

/**
 * 项目操作：打开计算器
 * @param {Object} params - 参数对象
 * @param {Object} ctx - 插件上下文
 */
async function openProject(params, ctx) {
  console.log('openProject 被调用，接收到的参数:', params);
  
  try {
    // 检查接口是否可用
    if (!ctx.api || !ctx.api.createWindow) {
      console.error('createWindow 接口不可用');
      return { success: false, error: 'createWindow 接口不可用' };
    }
    
    // 使用通用接口创建窗口
    const htmlPath = path.join(ctx.pluginPath, 'components/calculator.html');
    
    if (!fs.existsSync(htmlPath)) {
      console.error(`HTML文件不存在: ${htmlPath}`);
      return { success: false, error: `HTML文件不存在: ${htmlPath}` };
    }
    
    // 支持不同的标题栏样式
    const titleBarStyle = params && params.titleBarStyle ? params.titleBarStyle : 'system';
    
    // 使用接口代理创建窗口
    const result = await ctx.api.createWindow({
      title: '计算器',
      width: 300,
      height: titleBarStyle === 'custom' ? 432 : 400,
      minWidth: 250,
      minHeight: titleBarStyle === 'custom' ? 382 : 350,
      file: htmlPath,
      titleBarStyle: titleBarStyle
    });
    
    if (result && result.windowId) {
      // 存储窗口ID映射
      windowIdMap.set('calculator', result.windowId);
      return { success: true, windowId: result.windowId };
    } else {
      return { success: false, error: '创建窗口失败' };
    }
  } catch (error) {
    console.error('打开计算器窗口失败:', error);
    return { success: false, error: error.message };
  }
}

/**
 * 渲染项目内容
 * @param {Object} params - 参数对象
 * @param {Object} ctx - 插件上下文
 */
async function renderProject(params, ctx) {
  try {
    // 返回简化的HTML内容，避免复杂的脚本加载问题
    return `<div style="padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="font-size: 48px; margin-bottom: 10px;">🧮</div>
          <h2 style="margin: 0; color: #1890ff;">计算器工具</h2>
          <p style="color: #666; margin: 10px 0;">这是一个简单的计算器工具，支持基本的数学运算。</p>
        </div>
        
        <div style="display: flex; gap: 10px; justify-content: center; margin-bottom: 30px; flex-wrap: wrap;">
          <button onclick="openCalculator()" style="
            background: #1890ff; 
            color: white; 
            border: none; 
            padding: 12px 24px; 
            border-radius: 6px; 
            cursor: pointer; 
            font-size: 14px;
            display: flex;
            align-items: center;
            gap: 8px;
          ">
            <span>🖩</span>
            打开计算器
          </button>
          <button onclick="showAbout()" style="
            background: #52c41a; 
            color: white; 
            border: none; 
            padding: 12px 24px; 
            border-radius: 6px; 
            cursor: pointer; 
            font-size: 14px;
            display: flex;
            align-items: center;
            gap: 8px;
          ">
            <span>ℹ️</span>
            关于插件
          </button>
          <button onclick="createShortcut()" style="
            background: #722ed1; 
            color: white; 
            border: none; 
            padding: 12px 24px; 
            border-radius: 6px; 
            cursor: pointer; 
            font-size: 14px;
            display: flex;
            align-items: center;
            gap: 8px;
          ">
            <span>🔗</span>
            创建快捷方式
          </button>
        </div>
        
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="margin-top: 0; color: #333;">功能特点</h3>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="font-size: 20px;">➕</span>
              <span>基本四则运算</span>
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="font-size: 20px;">⌨️</span>
              <span>键盘快捷键操作</span>
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="font-size: 20px;">🎨</span>
              <span>简洁美观界面</span>
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="font-size: 20px;">⚡</span>
              <span>实时计算结果</span>
            </div>
          </div>
        </div>
        
        <div style="display: flex; justify-content: space-between; font-size: 12px; color: #999;">
          <span>版本: 1.0.0</span>
          <span>作者: LessonPlugin</span>
          <span>类型: 工具插件</span>
        </div>
        
        <script>
          function openCalculator() {
            console.log('openCalculator 被调用');
            if (window.electronAPI && window.electronAPI.plugin) {
              try {
                window.electronAPI.plugin.executeAction('example-calculator', 'openProject', {
                  titleBarStyle: 'custom'
                });
              } catch (error) {
                console.error('打开计算器失败:', error);
                alert('打开计算器失败: ' + error.message);
              }
            } else {
              alert('插件接口不可用');
            }
          }

          function showAbout() {
            console.log('showAbout 被调用');
            if (window.electronAPI && window.electronAPI.plugin) {
              try {
                window.electronAPI.plugin.executeAction('example-calculator', 'showAbout', {
                  titleBarStyle: 'custom'
                });
              } catch (error) {
                console.error('显示关于信息失败:', error);
                alert('显示关于信息失败: ' + error.message);
              }
            } else {
              alert('插件接口不可用');
            }
          }

          async function createShortcut() {
            console.log('createShortcut 被调用');
            try {
              if (window.electronAPI && window.electronAPI.plugin) {
                const result = await window.electronAPI.plugin.callInterface('createShortcut', {
                  name: '计算器',
                  pluginId: 'example-calculator',
                  action: 'openProject',
                  params: {},
                  icon: 'calculator'
                });
                
                if (result && result.success) {
                  alert('桌面快捷方式创建成功！');
                } else {
                  alert('创建失败：' + (result ? result.error : '未知错误'));
                }
              } else {
                alert('快捷方式功能不可用');
              }
            } catch (error) {
              console.error('创建快捷方式失败:', error);
              alert('创建失败：' + error.message);
            }
          }
        </script>
      </div>
    `;
  } catch (error) {
    console.error('渲染项目内容失败:', error);
    return `<div style="padding: 20px; text-align: center; color: #f5222d;">
      <h3>加载失败</h3>
      <p>错误信息: ${error.message}</p>
    </div>`;
  }
}

/**
 * 显示关于信息
 * @param {Object} params - 参数对象
 * @param {Object} ctx - 插件上下文
 */
async function showAbout(params, ctx) {
  try {
    // 检查接口是否可用
    if (!ctx.api || !ctx.api.createWindow) {
      console.error('createWindow 接口不可用');
      return { success: false, error: 'createWindow 接口不可用' };
    }
    
    const htmlPath = path.join(ctx.pluginPath, 'components/about.html');
    
    if (!fs.existsSync(htmlPath)) {
      throw new Error(`HTML文件不存在: ${htmlPath}`);
    }
    
    // 支持不同的标题栏样式
    const titleBarStyle = params && params.titleBarStyle ? params.titleBarStyle : 'system';
    
    // 使用接口代理创建窗口
    const result = await ctx.api.createWindow({
      title: '关于计算器',
      width: 450,
      height: titleBarStyle === 'custom' ? 432 : 400,
      resizable: false,
      file: htmlPath,
      titleBarStyle: titleBarStyle
    });
    
    if (result && result.windowId) {
      // 存储窗口ID映射
      windowIdMap.set('about', result.windowId);
      return { success: true, windowId: result.windowId };
    } else {
      return { success: false, error: '创建窗口失败' };
    }
  } catch (error) {
    console.error('显示关于窗口失败:', error);
    return { success: false, error: error.message };
  }
}

/**
 * 显示Ant Design演示
 * @param {Object} params - 参数对象
 * @param {Object} ctx - 插件上下文
 */
async function showAntDesignDemo(params, ctx) {
  try {
    // 检查接口是否可用
    if (!ctx.api || !ctx.api.createWindow) {
      console.error('createWindow 接口不可用');
      return { success: false, error: 'createWindow 接口不可用' };
    }
    
    const htmlPath = path.join(ctx.pluginPath, 'components/antd-demo.html');
    
    if (!fs.existsSync(htmlPath)) {
      throw new Error(`HTML文件不存在: ${htmlPath}`);
    }
    
    // 支持不同的标题栏样式
    const titleBarStyle = params && params.titleBarStyle ? params.titleBarStyle : 'system';
    
    // 使用接口代理创建窗口
    const result = await ctx.api.createWindow({
      title: 'Ant Design 演示',
      width: 800,
      height: 600,
      minWidth: 600,
      minHeight: 500,
      file: htmlPath,
      titleBarStyle: titleBarStyle
    });
    
    if (result && result.windowId) {
      // 存储窗口ID映射
      windowIdMap.set('antd-demo', result.windowId);
      return { success: true, windowId: result.windowId };
    } else {
      return { success: false, error: '创建窗口失败' };
    }
  } catch (error) {
    console.error('显示Ant Design演示窗口失败:', error);
    return { success: false, error: error.message };
  }
}

/**
 * 创建自定义窗口
 * @param {Object} params - 参数对象
 * @param {Object} ctx - 插件上下文
 */
async function createCustomWindow(params, ctx) {
  try {
    // 检查接口是否可用
    if (!ctx.api || !ctx.api.createWindow) {
      console.error('createWindow 接口不可用');
      return { success: false, error: 'createWindow 接口不可用' };
    }
    
    const { windowId, title, width, height, htmlFile, html, ...options } = params;
    const customWindowId = windowId || `custom_${Date.now()}`;
    
    let windowOptions = {
      title: title || '自定义窗口',
      width: width || 400,
      height: height || 300,
      ...options
    };
    
    // 处理HTML内容
    if (htmlFile) {
      const htmlPath = path.join(ctx.pluginPath, htmlFile);
      if (fs.existsSync(htmlPath)) {
        windowOptions.file = htmlPath;
      } else {
        throw new Error(`HTML文件不存在: ${htmlPath}`);
      }
    } else if (html) {
      windowOptions.html = html;
    }
    
    // 使用接口代理创建窗口
    const result = await ctx.api.createWindow(windowOptions);
    
    if (result && result.windowId) {
      // 存储窗口ID映射
      windowIdMap.set(customWindowId, result.windowId);
      return { success: true, windowId: result.windowId };
    } else {
      return { success: false, error: '创建窗口失败' };
    }
  } catch (error) {
    console.error('创建自定义窗口失败:', error);
    return { success: false, error: error.message };
  }
}

/**
 * 关闭窗口
 * @param {Object} params - 参数对象
 * @param {Object} ctx - 插件上下文
 */
async function closeCustomWindow(params, ctx) {
  try {
    // 检查接口是否可用
    if (!ctx.api || !ctx.api.closeWindow) {
      console.error('closeWindow 接口不可用');
      return { success: false, error: 'closeWindow 接口不可用' };
    }
    
    const { windowId } = params;
    
    // 获取实际窗口ID
    const actualWindowId = windowIdMap.get(windowId) || windowId;
    
    // 使用接口代理关闭窗口
    const result = await ctx.api.closeWindow({ windowId: actualWindowId });
    
    if (result && result.success) {
      // 从映射中移除
      windowIdMap.delete(windowId);
    }
    
    return result;
  } catch (error) {
    console.error('关闭窗口失败:', error);
    return { success: false, error: error.message };
  }
}

/**
 * 获取窗口列表
 * @param {Object} params - 参数对象
 * @param {Object} ctx - 插件上下文
 */
async function listWindows(params, ctx) {
  try {
    // 检查接口是否可用
    if (!ctx.api || !ctx.api.listWindows) {
      console.error('listWindows 接口不可用');
      return { success: false, error: 'listWindows 接口不可用' };
    }
    
    // 使用接口代理获取窗口列表
    return await ctx.api.listWindows();
  } catch (error) {
    console.error('获取窗口列表失败:', error);
    return { success: false, error: error.message };
  }
}

/**
 * 创建桌面快捷方式
 * @param {Object} params - 参数对象
 * @param {Object} ctx - 插件上下文
 */
async function createDesktopShortcut(params, ctx) {
  try {
    // 检查接口是否可用
    if (!ctx.api || !ctx.api.createShortcut) {
      console.error('createShortcut 接口不可用');
      return { success: false, error: 'createShortcut 接口不可用' };
    }
    
    const { name, action, params: actionParams = {}, icon } = params;
    
    if (!name || !action) {
      throw new Error('缺少必要参数：name, action');
    }
    
    // 使用接口代理创建快捷方式
    return await ctx.api.createShortcut({
      name,
      pluginId: 'example-calculator',
      action,
      params: actionParams,
      icon
    });
  } catch (error) {
    console.error('创建桌面快捷方式失败:', error);
    return { success: false, error: error.message };
  }
}

/**
 * 显示UI消息
 * @param {Object} params - 参数对象
 * @param {Object} ctx - 插件上下文
 */
async function showMessage(params, ctx) {
  try {
    const { type = 'info', content, duration } = params;
    
    // 调用对应的消息类型方法
    switch (type) {
      case 'success':
        ctx.ui.message.success(content, duration);
        break;
      case 'error':
        ctx.ui.message.error(content, duration);
        break;
      case 'warning':
        ctx.ui.message.warning(content, duration);
        break;
      case 'loading':
        ctx.ui.message.loading(content, duration);
        break;
      case 'info':
      default:
        ctx.ui.message.info(content, duration);
        break;
    }
    
    return { success: true };
  } catch (error) {
    console.error('显示UI消息失败:', error);
    return { success: false, error: error.message };
  }
}

// 导出插件方法
module.exports = {
  // 生命周期方法
  initialize,
  
  // 项目相关方法
  openProject,
  renderProject,
  showAbout,
  
  // Ant Design演示
  showAntDesignDemo,
  
  // 通用窗口管理API
  createCustomWindow,
  closeCustomWindow,
  listWindows,
  
  // 快捷方式API
  createDesktopShortcut,
  
  // UI消息API
  showMessage
};
