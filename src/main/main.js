const { app, BrowserWindow, ipcMain, dialog, shell, Tray, Menu, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs-extra');
const Store = require('electron-store');
const PluginManager = require('./plugin-manager');
const WindowManager = require('./window-manager');

class ClassToolApp {
  constructor() {
    this.store = new Store();
    this.pluginManager = new PluginManager(this.store);
    this.windowManager = new WindowManager();
    this.mainWindow = null;
    this.tray = null;
    
    this.setupApp();
    this.setupIPC();
  }

  setupApp() {
    app.whenReady().then(() => {
      this.createTray();
      this.initializePlugins();
      
      app.on('activate', () => {
        this.showMainWindow();
      });
    });

    app.on('window-all-closed', (e) => {
      // 阻止应用退出，保持在托盘运行
      e.preventDefault();
    });

    app.on('before-quit', () => {
      this.isQuitting = true;
    });
  }

  createTray() {
    try {
      // 使用nativeImage创建一个简单的托盘图标
      const icon = nativeImage.createEmpty();
      
      // 创建一个16x16的蓝色方块图标
      const canvas = Buffer.from([
        0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
        0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x10, 0x00, 0x00, 0x00, 0x10,
        0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x91, 0x68, 0x36, 0x00, 0x00, 0x00,
        0x15, 0x49, 0x44, 0x41, 0x54, 0x28, 0x91, 0x63, 0x64, 0x00, 0x02, 0x46,
        0x46, 0x06, 0x06, 0x06, 0x06, 0x06, 0x00, 0x04, 0x00, 0x00, 0xFF, 0xFF,
        0x00, 0x0F, 0x6A, 0x3D, 0x8A, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E,
        0x44, 0xAE, 0x42, 0x60, 0x82
      ]);
      
      const trayIcon = nativeImage.createFromBuffer(canvas);
      
      // 如果创建失败，使用系统默认图标
      if (trayIcon.isEmpty()) {
        // 创建一个最简单的1x1透明图标
        const simpleIcon = nativeImage.createFromDataURL('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==');
        this.tray = new Tray(simpleIcon.resize({ width: 16, height: 16 }));
      } else {
        this.tray = new Tray(trayIcon);
      }
      
      const contextMenu = Menu.buildFromTemplate([
        {
          label: '显示主窗口',
          click: () => this.showMainWindow()
        },
        {
          label: '插件管理',
          click: () => this.showMainWindow('plugins')
        },
        { type: 'separator' },
        {
          label: '退出',
          click: () => {
            this.isQuitting = true;
            app.quit();
          }
        }
      ]);
      
      this.tray.setToolTip('课堂工具');
      this.tray.setContextMenu(contextMenu);
      
      // 双击托盘图标显示主窗口
      this.tray.on('double-click', () => {
        this.showMainWindow();
      });
      
      console.log('托盘图标创建成功');
    } catch (error) {
      console.error('创建托盘图标失败:', error);
    }
  }

  createMainWindow() {
    if (this.mainWindow) {
      return this.mainWindow;
    }

    this.mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      minWidth: 800,
      minHeight: 600,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        enableRemoteModule: false,
        preload: path.join(__dirname, 'preload.js')
      },
      titleBarStyle: 'hiddenInset',
      show: false
    });

    // 开发环境加载本地服务器，生产环境加载构建文件
    const isDev = process.env.NODE_ENV === 'development';
    if (isDev) {
      this.mainWindow.loadURL('http://localhost:3000');
      this.mainWindow.webContents.openDevTools();
    } else {
      this.mainWindow.loadFile(path.join(__dirname, '../renderer/build/index.html'));
    }

    // 窗口关闭时隐藏到托盘而不是退出
    this.mainWindow.on('close', (event) => {
      if (!this.isQuitting) {
        event.preventDefault();
        this.mainWindow.hide();
      }
    });

    this.windowManager.setMainWindow(this.mainWindow);
    return this.mainWindow;
  }

  showMainWindow(page = null) {
    if (!this.mainWindow) {
      this.createMainWindow();
    }
    
    this.mainWindow.show();
    this.mainWindow.focus();
    
    if (page) {
      // 通知渲染进程切换到指定页面
      this.mainWindow.webContents.send('navigate-to', page);
    }
  }

  initializePlugins() {
    // 设置插件管理器的依赖
    this.pluginManager.setWindowManager(this.windowManager);
    this.pluginManager.setShowMainWindow((page) => this.showMainWindow(page));
    
    // 初始化插件系统，触发插件的启动事件
    this.pluginManager.initializePlugins();
    
    // 通知所有插件应用已启动
    this.pluginManager.broadcastEvent('app-started', {
      createWindow: (options) => this.windowManager.createWindow(options),
      showMainWindow: (page) => this.showMainWindow(page)
    });
  }

  setupIPC() {
    // 插件管理相关IPC
    ipcMain.handle('plugin:list', () => {
      return this.pluginManager.getInstalledPlugins();
    });

    ipcMain.handle('plugin:install', async (event, pluginPath) => {
      try {
        return await this.pluginManager.installPlugin(pluginPath);
      } catch (error) {
        throw error;
      }
    });

    ipcMain.handle('plugin:uninstall', async (event, pluginId) => {
      try {
        return await this.pluginManager.uninstallPlugin(pluginId);
      } catch (error) {
        throw error;
      }
    });

    ipcMain.handle('plugin:enable', async (event, pluginId) => {
      return this.pluginManager.enablePlugin(pluginId);
    });

    ipcMain.handle('plugin:disable', async (event, pluginId) => {
      return this.pluginManager.disablePlugin(pluginId);
    });

    ipcMain.handle('plugin:getProjects', () => {
      return this.pluginManager.getPluginProjects();
    });

    ipcMain.handle('plugin:executeAction', async (event, pluginId, action, params) => {
      return this.pluginManager.executePluginAction(pluginId, action, params);
    });

    // 窗口管理相关IPC
    ipcMain.handle('window:create', async (event, options) => {
      return this.windowManager.createWindow(options);
    });

    ipcMain.handle('window:close', async (event, windowId) => {
      return this.windowManager.closeWindow(windowId);
    });

    // 文件系统相关IPC
    ipcMain.handle('fs:selectFolder', async () => {
      const result = await dialog.showOpenDialog(this.mainWindow, {
        properties: ['openDirectory']
      });
      return result.filePaths[0];
    });

    ipcMain.handle('fs:selectFile', async (event, filters) => {
      const result = await dialog.showOpenDialog(this.mainWindow, {
        properties: ['openFile'],
        filters: filters || []
      });
      return result.filePaths[0];
    });

    // 系统相关IPC
    ipcMain.handle('system:openExternal', async (event, url) => {
      return shell.openExternal(url);
    });
  }
}

new ClassToolApp();