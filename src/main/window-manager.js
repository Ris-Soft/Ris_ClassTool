const { BrowserWindow, ipcMain } = require('electron');
const path = require('path');

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
      }
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
      window.loadFile(options.file);
    } else if (options.html) {
      window.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(options.html)}`);
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
  }
}

module.exports = WindowManager;