// 简单示例插件 - 展示新的事件化接口使用方法

let context = null;

/**
 * 插件初始化函数
 * @param {Object} ctx - 插件上下文
 */
async function initialize(ctx) {
  context = ctx;
  console.log('简单示例插件已初始化');
  console.log('可用接口:', Object.keys(ctx.api || {}));
  
  // 监听应用启动事件
  ctx.on('app-started', (data) => {
    console.log('应用已启动，简单示例插件准备就绪', data);
    
    // 显示欢迎消息
    if (ctx.ui && ctx.ui.message) {
      ctx.ui.message.success('简单示例插件已加载', 3);
    }
  });
}

/**
 * 打开项目
 * @param {Object} params - 参数对象
 * @param {Object} ctx - 插件上下文
 */
async function openProject(params, ctx) {
  console.log('openProject 被调用');
  
  try {
    // 检查接口是否可用
    if (!ctx.api || !ctx.api.createWindow) {
      throw new Error('createWindow 接口不可用');
    }
    
    // 创建一个简单的HTML窗口
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>简单工具</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
            background: #f5f5f5;
          }
          .container {
            max-width: 400px;
            margin: 0 auto;
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          button {
            background: #1890ff;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
            margin: 5px;
          }
          button:hover {
            background: #40a9ff;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>简单工具演示</h2>
          <p>这是一个使用新接口系统的简单插件示例。</p>
          <button onclick="showMessage('success', '成功消息')">成功消息</button>
          <button onclick="showMessage('info', '信息消息')">信息消息</button>
          <button onclick="showMessage('warning', '警告消息')">警告消息</button>
          <button onclick="showMessage('error', '错误消息')">错误消息</button>
          <br>
          <button onclick="createNewWindow()">创建新窗口</button>
          <button onclick="listAllWindows()">列出所有窗口</button>
        </div>
        
        <script>
          // 模拟消息显示功能
          function showMessage(type, content) {
            alert(type.toUpperCase() + ': ' + content);
          }
          
          function createNewWindow() {
            alert('创建新窗口功能需要通过插件接口实现');
          }
          
          function listAllWindows() {
            alert('列出窗口功能需要通过插件接口实现');
          }
        </script>
      </body>
      </html>
    `;
    
    // 使用接口创建窗口
    const result = await ctx.api.createWindow({
      title: '简单工具',
      width: 500,
      height: 400,
      html: htmlContent,
      titleBarStyle: 'system'
    });
    
    if (result && result.windowId) {
      console.log('窗口创建成功:', result.windowId);
      return { success: true, windowId: result.windowId };
    } else {
      throw new Error('创建窗口失败');
    }
    
  } catch (error) {
    console.error('打开项目失败:', error);
    
    // 显示错误消息
    if (ctx.ui && ctx.ui.message) {
      ctx.ui.message.error(`打开项目失败: ${error.message}`, 5);
    }
    
    return { success: false, error: error.message };
  }
}

/**
 * 渲染项目内容
 * @param {Object} params - 参数对象
 * @param {Object} ctx - 插件上下文
 */
async function renderProject(params, ctx) {
  return `<div style="padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <div style="text-align: center; margin-bottom: 20px;">
        <div style="font-size: 48px; margin-bottom: 10px;">🛠️</div>
        <h3 style="margin: 0; color: #1890ff;">简单示例插件</h3>
        <p style="color: #666; margin: 10px 0;">这是一个展示新接口系统的简单插件。</p>
      </div>
      
      <div style="background: #f0f2f5; padding: 15px; border-radius: 6px; margin-bottom: 15px;">
        <h4 style="margin-top: 0; color: #333;">可用接口演示</h4>
        <p style="margin: 5px 0; font-size: 14px; color: #666;">
          此插件演示了如何使用新的事件化接口系统。点击上方的"打开"按钮来启动工具窗口。
        </p>
      </div>
      
      <div style="display: flex; gap: 10px; justify-content: center; margin-top: 20px;">
        <button onclick="demonstrateInterfaces()" style="
          background: #52c41a; 
          color: white; 
          border: none; 
          padding: 8px 16px; 
          border-radius: 4px; 
          cursor: pointer; 
          font-size: 12px;
        ">
          演示接口调用
        </button>
      </div>
      
      <script>
        async function demonstrateInterfaces() {
          console.log('demonstrateInterfaces 被调用');
          if (window.electronAPI && window.electronAPI.plugin) {
            try {
              const result = await window.electronAPI.plugin.executeAction('simple-example', 'demonstrateInterfaces', {});
              console.log('接口演示结果:', result);
              alert('接口演示完成，请查看控制台输出');
            } catch (error) {
              console.error('接口演示失败:', error);
              alert('接口演示失败: ' + error.message);
            }
          } else {
            alert('插件接口不可用');
          }
        }
      </script>
    </div>
  `;
}

/**
 * 演示接口调用
 * @param {Object} params - 参数对象
 * @param {Object} ctx - 插件上下文
 */
async function demonstrateInterfaces(params, ctx) {
  console.log('演示接口调用');
  
  try {
    const results = {};
    
    // 测试文件读取接口
    if (ctx.api && ctx.api.readFile) {
      try {
        const fileResult = await ctx.api.readFile({
          filePath: ctx.pluginPath + '/manifest.json'
        });
        results.readFile = fileResult;
        console.log('文件读取结果:', fileResult);
      } catch (error) {
        results.readFile = { success: false, error: error.message };
      }
    }
    
    // 测试窗口列表接口
    if (ctx.api && ctx.api.listWindows) {
      try {
        const windowsResult = await ctx.api.listWindows();
        results.listWindows = windowsResult;
        console.log('窗口列表结果:', windowsResult);
      } catch (error) {
        results.listWindows = { success: false, error: error.message };
      }
    }
    
    // 显示结果消息
    if (ctx.ui && ctx.ui.message) {
      ctx.ui.message.info('接口调用演示完成，请查看控制台输出', 3);
    }
    
    return { success: true, results };
    
  } catch (error) {
    console.error('演示接口调用失败:', error);
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
  
  // 演示方法
  demonstrateInterfaces
};