const { BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const HtmlLoader = require('./html-loader');

class WindowManager {
  constructor() {
    this.windows = new Map();
    this.mainWindow = null;
    this.windowCounter = 0;
    this.setupIPC();
  }

  setMainWindow(mainWindow) {
    this.mainWindow = mainWindow;
  }

  createWindow(options = {}) {
    const windowId = `window_${++this.windowCounter}`;
    
    // 处理标题栏选项
    let titleBarOptions = {};
    switch (options.titleBarStyle) {
      case 'none':
        // 无标题栏
        titleBarOptions = {
          frame: false,
          titleBarStyle: 'hidden'
        };
        break;
      case 'system':
        // 系统标题栏
        titleBarOptions = {
          frame: true,
          titleBarStyle: 'default'
        };
        break;
      case 'custom':
        // 自定义标题栏（类似设置页面）
        titleBarOptions = {
          frame: false,
          titleBarStyle: 'hidden'
        };
        break;
      default:
        // 默认使用系统标题栏
        titleBarOptions = {
          frame: true,
          titleBarStyle: 'default'
        };
    }
    
    const defaultOptions = {
      width: 800,
      height: 600,
      minWidth: 400,
      minHeight: 300,
      show: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        enableRemoteModule: false,
        preload: path.join(__dirname, 'preload.js')
      },
      ...titleBarOptions
    };

    const windowOptions = { ...defaultOptions, ...options };
    const window = new BrowserWindow(windowOptions);

    // 存储窗口信息
    this.windows.set(windowId, {
      window,
      pluginId: options.pluginId,
      options: windowOptions,
      created: Date.now()
    });

    // 设置窗口事件
    window.once('ready-to-show', () => {
      if (windowOptions.show !== false) {
        window.show();
      }
    });

    window.on('closed', () => {
      this.windows.delete(windowId);
    });

    // 加载内容
    if (options.url) {
      window.loadURL(options.url);
    } else if (options.file) {
      // 检查是否需要处理外部HTML文件
      if (options.pluginId && options.processExternalFiles !== false) {
        // 异步加载HTML文件并处理外部引用
        this.loadHtmlWithExternalReferences(window, options.file, options.pluginId, options.injectTitleBar, windowId);
      } else {
        // 直接加载文件
        window.loadFile(options.file);
      }
    } else if (options.html) {
      let htmlContent = options.html;
      // 如果需要注入自定义标题栏
      if (options.injectTitleBar) {
        htmlContent = this.injectCustomTitleBar(htmlContent, windowId, options.title);
      }
      window.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`);
    } else {
      // 默认加载空白页面
      window.loadURL('about:blank');
    }

    return {
      windowId,
      window,
      show: () => window.show(),
      hide: () => window.hide(),
      close: () => window.close(),
      focus: () => window.focus(),
      minimize: () => window.minimize(),
      maximize: () => window.maximize(),
      restore: () => window.restore(),
      setTitle: (title) => window.setTitle(title),
      setBounds: (bounds) => window.setBounds(bounds),
      getBounds: () => window.getBounds(),
      setSize: (width, height) => window.setSize(width, height),
      getSize: () => window.getSize(),
      setPosition: (x, y) => window.setPosition(x, y),
      getPosition: () => window.getPosition(),
      setAlwaysOnTop: (flag) => window.setAlwaysOnTop(flag),
      isAlwaysOnTop: () => window.isAlwaysOnTop(),
      setResizable: (resizable) => window.setResizable(resizable),
      isResizable: () => window.isResizable(),
      setMaximizable: (maximizable) => window.setMaximizable(maximizable),
      isMaximizable: () => window.isMaximizable(),
      setMinimizable: (minimizable) => window.setMinimizable(minimizable),
      isMinimizable: () => window.isMinimizable(),
      setClosable: (closable) => window.setClosable(closable),
      isClosable: () => window.isClosable(),
      loadURL: (url) => window.loadURL(url),
      loadFile: (filePath) => window.loadFile(filePath),
      reload: () => window.reload(),
      webContents: window.webContents
    };
  }

  getWindow(windowId) {
    const windowInfo = this.windows.get(windowId);
    return windowInfo ? windowInfo.window : null;
  }

  closeWindow(windowId) {
    const windowInfo = this.windows.get(windowId);
    if (windowInfo) {
      windowInfo.window.close();
      return { success: true };
    }
    return { success: false, error: '窗口不存在' };
  }

  closePluginWindows(pluginId) {
    const windowsToClose = [];
    for (const [windowId, windowInfo] of this.windows) {
      if (windowInfo.pluginId === pluginId) {
        windowsToClose.push(windowId);
      }
    }
    
    windowsToClose.forEach(windowId => {
      this.closeWindow(windowId);
    });
    
    return windowsToClose.length;
  }

  getAllWindows() {
    const windows = [];
    for (const [windowId, windowInfo] of this.windows) {
      windows.push({
        windowId,
        pluginId: windowInfo.pluginId,
        title: windowInfo.window.getTitle(),
        bounds: windowInfo.window.getBounds(),
        isVisible: windowInfo.window.isVisible(),
        isMinimized: windowInfo.window.isMinimized(),
        isMaximized: windowInfo.window.isMaximized(),
        created: windowInfo.created
      });
    }
    return windows;
  }

  getPluginWindows(pluginId) {
    const windows = [];
    for (const [windowId, windowInfo] of this.windows) {
      if (windowInfo.pluginId === pluginId) {
        windows.push({
          windowId,
          title: windowInfo.window.getTitle(),
          bounds: windowInfo.window.getBounds(),
          isVisible: windowInfo.window.isVisible(),
          isMinimized: windowInfo.window.isMinimized(),
          isMaximized: windowInfo.window.isMaximized(),
          created: windowInfo.created
        });
      }
    }
    return windows;
  }

  updateWindowOptions(windowId, options) {
    const windowInfo = this.windows.get(windowId);
    if (!windowInfo) {
      return { success: false, error: '窗口不存在' };
    }

    const window = windowInfo.window;
    
    try {
      // 更新窗口属性
      if (options.title !== undefined) window.setTitle(options.title);
      if (options.bounds !== undefined) window.setBounds(options.bounds);
      if (options.size !== undefined) window.setSize(options.size.width, options.size.height);
      if (options.position !== undefined) window.setPosition(options.position.x, options.position.y);
      if (options.alwaysOnTop !== undefined) window.setAlwaysOnTop(options.alwaysOnTop);
      if (options.resizable !== undefined) window.setResizable(options.resizable);
      if (options.maximizable !== undefined) window.setMaximizable(options.maximizable);
      if (options.minimizable !== undefined) window.setMinimizable(options.minimizable);
      if (options.closable !== undefined) window.setClosable(options.closable);
      
      // 更新存储的选项
      windowInfo.options = { ...windowInfo.options, ...options };
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * 加载HTML文件并处理外部引用
   * @param {BrowserWindow} window - Electron窗口实例
   * @param {string} filePath - HTML文件路径
   * @param {string} pluginId - 插件ID
   * @param {boolean} injectTitleBar - 是否注入自定义标题栏
   * @param {string} windowId - 窗口ID
   */
  async loadHtmlWithExternalReferences(window, filePath, pluginId, injectTitleBar = false, windowId = null) {
    try {
      // 获取插件路径
      const pluginPath = path.dirname(path.dirname(filePath));
      
      // 获取HTML文件相对于插件根目录的路径
      const relativePath = path.relative(pluginPath, filePath);
      
      // 加载并处理HTML文件
      let processedHtml = await HtmlLoader.loadHtmlFile(pluginPath, relativePath);
      
      // 如果需要注入自定义标题栏
      if (injectTitleBar) {
        const windowInfo = this.windows.get(windowId);
        const title = windowInfo ? windowInfo.window.getTitle() : '插件窗口';
        processedHtml = this.injectCustomTitleBar(processedHtml, windowId, title);
      }
      
      // 注入窗口ID到全局变量
      if (windowId) {
        processedHtml = processedHtml.replace(/<head([^>]*)>/i, `<head$1><script>window.__WINDOW_ID__ = '${windowId}';</script>`);
      }
      
      // 加载处理后的HTML内容
      window.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(processedHtml)}`);
    } catch (error) {
      console.error('加载HTML文件失败:', error);
      // 加载错误页面
      window.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(`
        <html>
          <body style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h2>加载失败</h2>
            <p>无法加载HTML文件: ${error.message}</p>
          </body>
        </html>
      `)}`);
    }
  }

  /**
   * 注入自定义标题栏到HTML内容中
   * @param {string} htmlContent - 原始HTML内容
   * @param {string} windowId - 窗口ID
   * @returns {string} 注入标题栏后的HTML内容
   */
  injectCustomTitleBar(htmlContent, windowId = null, title = '插件窗口') {
    // 自定义标题栏的HTML和CSS - 与主窗口样式保持一致
    const titleBarHtml = `
      <div id="custom-title-bar" style="
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        height: 32px;
        background: #1f1f1f;
        border-bottom: 1px solid #333333;
        display: flex;
        align-items: center;
        z-index: 10001;
        -webkit-app-region: drag;
        user-select: none;
      ">
        <div style="
          display: flex;
          align-items: center;
          padding-left: 12px;
          -webkit-app-region: drag;
        ">
          <div style="
            display: flex;
            align-items: center;
            gap: 8px;
            color: #ffffff;
            font-size: 14px;
            font-weight: 600;
          ">
            <span style="font-size: 13px;">${title}</span>
          </div>
        </div>
        
        <div style="flex: 1; height: 100%;">
          <div style="width: 100%; height: 100%; -webkit-app-region: drag;"></div>
        </div>
        
        <div style="
          display: flex;
          align-items: center;
          height: 100%;
          -webkit-app-region: no-drag;
        ">
          <button id="title-bar-minimize" style="
            width: 46px;
            height: 32px;
            border-radius: 0;
            border: none;
            background: transparent;
            color: #a0a0a0;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
            padding: 0;
            cursor: pointer;
          " onmouseover="this.style.background='#333333'; this.style.color='#ffffff';" onmouseout="this.style.background='transparent'; this.style.color='#a0a0a0';" onmousedown="this.style.background='#404040';">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
              <rect x="0" y="5" width="12" height="2"/>
            </svg>
          </button>
          <button id="title-bar-maximize" style="
            width: 46px;
            height: 32px;
            border-radius: 0;
            border: none;
            background: transparent;
            color: #a0a0a0;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
            padding: 0;
            cursor: pointer;
          " onmouseover="this.style.background='#333333'; this.style.color='#ffffff';" onmouseout="this.style.background='transparent'; this.style.color='#a0a0a0';" onmousedown="this.style.background='#404040';">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
              <rect x="1" y="1" width="10" height="10" fill="none" stroke="currentColor" stroke-width="1"/>
            </svg>
          </button>
          <button id="title-bar-close" style="
            width: 46px;
            height: 32px;
            border-radius: 0;
            border: none;
            background: transparent;
            color: #a0a0a0;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
            padding: 0;
            cursor: pointer;
          " onmouseover="this.style.background='#e81123'; this.style.color='#ffffff';" onmouseout="this.style.background='transparent'; this.style.color='#a0a0a0';" onmousedown="this.style.background='#c50e1f';">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
              <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
      </div>
      <div id="content-wrapper"></div>
    `;

    // 添加全局样式来处理滚动条和布局
    const globalStyles = `
      <style>
        /* 禁止整个页面滚动 */
        html, body {
          margin: 0 !important;
          padding: 0 !important;
          height: 100% !important;
          overflow: hidden !important;
          background: #141414 !important;
          color: #ffffff !important;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif !important;
        }
        
        /* 标题栏样式 */
        #custom-title-bar {
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          right: 0 !important;
          height: 32px !important;
          z-index: 10001 !important;
        }
        
        /* 内容容器样式 */
        #content-wrapper {
          position: fixed !important;
          top: 32px !important;
          left: 0 !important;
          right: 0 !important;
          bottom: 0 !important;
          overflow-y: auto !important;
          overflow-x: hidden !important;
        }
        
        /* 滚动条样式 */
        #content-wrapper::-webkit-scrollbar {
          width: 8px;
        }
        
        #content-wrapper::-webkit-scrollbar-track {
          background: #1f1f1f;
        }
        
        #content-wrapper::-webkit-scrollbar-thumb {
          background: #434343;
          border-radius: 4px;
        }
        
        #content-wrapper::-webkit-scrollbar-thumb:hover {
          background: #595959;
        }
        
        /* 修复可能的布局问题 */
        * {
          box-sizing: border-box;
        }
      </style>
    `;

    // 标题栏控制脚本 - 使用IPC控制当前窗口
    const titleBarScript = `
      <script>
        document.addEventListener('DOMContentLoaded', function() {
          // 获取当前窗口ID（通过全局变量传递）
          const currentWindowId = window.__WINDOW_ID__;
          
          // 将原始body内容移动到content-wrapper中
          const contentWrapper = document.getElementById('content-wrapper');
          const bodyChildren = Array.from(document.body.children);
          
          bodyChildren.forEach(child => {
            if (child.id !== 'custom-title-bar' && child.id !== 'content-wrapper') {
              contentWrapper.appendChild(child);
            }
          });
          
          // 获取标题元素
          const titleElement = document.querySelector('#custom-title-bar span');
          
          // 监听标题更新事件
          if (window.electronAPI && window.electronAPI.ipcRenderer) {
            window.electronAPI.ipcRenderer.on('titlebar:updateTitle', (event, newTitle) => {
              if (titleElement) {
                titleElement.textContent = newTitle;
              }
              // 同时更新document.title
              document.title = newTitle;
            });
          }
          
          // 提供全局函数来更新标题
          window.setCustomTitle = function(title) {
            if (titleElement) {
              titleElement.textContent = title;
            }
            document.title = title;
            
            // 通知主进程更新窗口标题
            if (window.electronAPI && window.electronAPI.pluginWindow) {
              window.electronAPI.pluginWindow.setTitle(currentWindowId, title);
            }
          };
          
          // 绑定标题栏按钮事件 - 使用IPC控制当前窗口
          const minimizeBtn = document.getElementById('title-bar-minimize');
          const maximizeBtn = document.getElementById('title-bar-maximize');
          const closeBtn = document.getElementById('title-bar-close');
          
          if (minimizeBtn) {
            minimizeBtn.addEventListener('click', () => {
              if (window.electronAPI && window.electronAPI.pluginWindow) {
                window.electronAPI.pluginWindow.minimize(currentWindowId);
              }
            });
          }
          
          if (maximizeBtn) {
            maximizeBtn.addEventListener('click', () => {
              if (window.electronAPI && window.electronAPI.pluginWindow) {
                window.electronAPI.pluginWindow.toggleMaximize(currentWindowId);
              }
            });
          }
          
          if (closeBtn) {
            closeBtn.addEventListener('click', () => {
              if (window.electronAPI && window.electronAPI.pluginWindow) {
                window.electronAPI.pluginWindow.close(currentWindowId);
              } else {
                window.close();
              }
            });
          }
        });
      </script>
    `;

    // 在head标签中插入样式
    let modifiedHtml = htmlContent.replace(/<head([^>]*)>/i, `<head$1>${globalStyles}`);
    
    // 在body开始标签后插入标题栏
    modifiedHtml = modifiedHtml.replace(/<body([^>]*)>/i, `<body$1>${titleBarHtml}`);
    
    // 在</body>前插入脚本
    modifiedHtml = modifiedHtml.replace(/<\/body>/i, `${titleBarScript}</body>`);
    
    return modifiedHtml;
  }

  setupIPC() {
    // 窗口间通信
    ipcMain.handle('window:sendMessage', async (event, targetWindowId, message) => {
      const targetWindow = this.getWindow(targetWindowId);
      if (targetWindow) {
        targetWindow.webContents.send('window:message', message);
        return { success: true };
      }
      return { success: false, error: '目标窗口不存在' };
    });

    // 获取窗口列表
    ipcMain.handle('window:list', () => {
      return this.getAllWindows();
    });

    // 获取插件窗口列表
    ipcMain.handle('window:listByPlugin', (event, pluginId) => {
      return this.getPluginWindows(pluginId);
    });

    // 更新窗口选项
    ipcMain.handle('window:update', (event, windowId, options) => {
      return this.updateWindowOptions(windowId, options);
    });

    // 窗口控制
    ipcMain.handle('window:show', (event, windowId) => {
      const window = this.getWindow(windowId);
      if (window) {
        window.show();
        return { success: true };
      }
      return { success: false, error: '窗口不存在' };
    });

    ipcMain.handle('window:hide', (event, windowId) => {
      const window = this.getWindow(windowId);
      if (window) {
        window.hide();
        return { success: true };
      }
      return { success: false, error: '窗口不存在' };
    });

    ipcMain.handle('window:focus', (event, windowId) => {
      const window = this.getWindow(windowId);
      if (window) {
        window.focus();
        return { success: true };
      }
      return { success: false, error: '窗口不存在' };
    });

    // 设置窗口标题（包括自定义标题栏）
    ipcMain.handle('window:setTitle', (event, windowId, title) => {
      const window = this.getWindow(windowId);
      if (window) {
        // 设置系统窗口标题
        window.setTitle(title);
        
        // 如果窗口有自定义标题栏，也更新自定义标题栏的标题
        window.webContents.send('titlebar:updateTitle', title);
        
        return { success: true };
      }
      return { success: false, error: '窗口不存在' };
    });

    // 获取窗口标题
    ipcMain.handle('window:getTitle', (event, windowId) => {
      const window = this.getWindow(windowId);
      if (window) {
        return { success: true, title: window.getTitle() };
      }
      return { success: false, error: '窗口不存在' };
    });
  }
}

module.exports = WindowManager;