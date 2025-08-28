const { app, BrowserWindow, ipcMain, dialog, shell, Tray, Menu, nativeImage, protocol } = require('electron');
const path = require('path');
const fs = require('fs-extra');
const Store = require('electron-store');
const PluginManager = require('./plugin-manager');
const PluginInterfaceManager = require('./plugin-interface-manager');
const WindowManager = require('./window-manager');
const AntDesignProvider = require('./antd-provider');
const os = require('os');

class LessonPluginApp {
  constructor() {
    this.store = new Store();
    this.interfaceManager = new PluginInterfaceManager();
    this.pluginManager = new PluginManager(this.store);
    this.windowManager = new WindowManager();
    this.mainWindow = null;
    this.tray = null;
    
    this.setupApp();
    this.setupIPC();
  }

  setupApp() {
    app.whenReady().then(() => {
      // 注册自定义协议，用于加载Ant Design资源
      this.registerProtocols();
      
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
      
      this.tray.setToolTip('LessonPlugin');
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
      frame: false, // 禁用原生标题栏
      titleBarStyle: 'hidden', // 隐藏标题栏
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        enableRemoteModule: false,
        preload: path.join(__dirname, 'preload.js')
      },
      show: false
    });

    // 开发环境加载本地服务器，生产环境加载构建文件
    // 开发环境加载本地服务器，生产环境加载构建文件
    const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
    if (isDev) {
      this.mainWindow.loadURL('http://localhost:3000');
      this.mainWindow.webContents.openDevTools();
    } else {
      this.mainWindow.loadFile(path.join(__dirname, '../renderer/build/index.html'));
    }

    // 窗口关闭时隐藏到托盘而不是退出
    // 窗口关闭时隐藏到托盘而不是退出
    this.mainWindow.on('close', (event) => {
      if (!this.isQuitting) {
        event.preventDefault();
        this.mainWindow.hide();
      }
    });

    // 监听窗口状态变化
    this.mainWindow.on('maximize', () => {
      this.mainWindow.webContents.send('window-maximized');
    });

    this.mainWindow.on('unmaximize', () => {
      this.mainWindow.webContents.send('window-unmaximized');
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

  /**
   * 注册插件接口
   * 这些接口可以被所有插件通过 api.xxx 的方式调用
   */
  registerPluginInterfaces() {
    // 窗口管理接口
    this.interfaceManager.registerInterfaces({
      // 窗口操作
      createWindow: (params, context) => {
        if (!this.windowManager) {
          throw new Error('WindowManager 未设置');
        }
        
        // 默认启用外部HTML文件处理
        const processExternalFiles = params.processExternalFiles !== false;
        
        // 处理标题栏选项
        const windowOptions = {
          ...params,
          pluginId: context.pluginId,
          processExternalFiles
        };
        
        // 如果指定了自定义标题栏，需要注入标题栏组件
        if (params.titleBarStyle === 'custom') {
          windowOptions.injectTitleBar = true;
        }
        
        return this.windowManager.createWindow(windowOptions);
      },
      
      closeWindow: (params) => {
        return this.windowManager.closeWindow(params.windowId);
      },
      
      listWindows: () => {
        return this.windowManager.getAllWindows();
      },
      
      // 主窗口操作
      showMainWindow: (params) => {
        const page = params && params.page ? params.page : null;
        this.showMainWindow(page);
        return { success: true };
      },
      
      // 快捷方式管理
      createShortcut: (params) => {
        return this.createDesktopShortcut(params);
      },
      
      removeShortcut: (params) => {
        return this.removeDesktopShortcut(params.name);
      },
      
      listShortcuts: () => {
        return this.listDesktopShortcuts();
      },
      
      // 插件间通信
      callPluginMethod: async (params, context) => {
        const { pluginId, method, params: methodParams } = params;
        return await this.pluginManager.executePluginAction(pluginId, method, methodParams);
      },
      
      // 文件系统操作
      readFile: async (params) => {
        try {
          const { filePath, encoding = 'utf8' } = params;
          const content = await fs.readFile(filePath, encoding);
          return { success: true, content };
        } catch (error) {
          return { success: false, error: error.message };
        }
      },
      
      writeFile: async (params) => {
        try {
          const { filePath, content, encoding = 'utf8' } = params;
          await fs.outputFile(filePath, content, encoding);
          return { success: true };
        } catch (error) {
          return { success: false, error: error.message };
        }
      },
      
      // 系统操作
      openExternal: async (params) => {
        try {
          await shell.openExternal(params.url);
          return { success: true };
        } catch (error) {
          return { success: false, error: error.message };
        }
      }
    });
  }

  initializePlugins() {
    // 设置插件管理器的依赖
    this.pluginManager.setWindowManager(this.windowManager);
    this.pluginManager.setShowMainWindow((page) => this.showMainWindow(page));
    this.pluginManager.setShortcutManager({
      create: (options) => this.createDesktopShortcut(options),
      remove: (name) => this.removeDesktopShortcut(name),
      list: () => this.listDesktopShortcuts()
    });
    
    // 注册插件接口（在依赖设置完成后）
    this.registerPluginInterfaces();
    
    // 设置插件接口管理器
    this.pluginManager.setInterfaceManager(this.interfaceManager);
    
    // 初始化插件系统，触发插件的启动事件
    this.pluginManager.initializePlugins();
    
    // 通知所有插件应用已启动
    this.pluginManager.broadcastEvent('app-started', {
      version: app.getVersion(),
      platform: process.platform
    });
  }

  // 创建桌面快捷方式
  async createDesktopShortcut(options) {
    try {
      const { name, pluginId, action, params = {}, icon } = options;
      
      if (!name || !pluginId || !action) {
        throw new Error('缺少必要参数：name, pluginId, action');
      }

      const desktopPath = path.join(os.homedir(), 'Desktop');
      const appPath = process.execPath;
      
      if (process.platform === 'win32') {
        // Windows 快捷方式
        const shortcutPath = path.join(desktopPath, `${name}.lnk`);
        const args = `--plugin-action="${pluginId}:${action}" --plugin-params="${JSON.stringify(params).replace(/"/g, '\\"')}"`;
        
        // 使用 PowerShell 创建快捷方式
        const { exec } = require('child_process');
        const psScript = `
          $WshShell = New-Object -comObject WScript.Shell
          $Shortcut = $WshShell.CreateShortcut("${shortcutPath}")
          $Shortcut.TargetPath = "${appPath}"
          $Shortcut.Arguments = "${args}"
          $Shortcut.WorkingDirectory = "${process.cwd()}"
          $Shortcut.Description = "LessonPlugin - ${name}"
          $Shortcut.Save()
        `;
        
        return new Promise((resolve, reject) => {
          exec(`powershell -Command "${psScript}"`, (error) => {
            if (error) {
              reject(new Error(`创建快捷方式失败: ${error.message}`));
            } else {
              resolve({ success: true, path: shortcutPath });
            }
          });
        });
      } else if (process.platform === 'darwin') {
        // macOS 快捷方式 (.app bundle)
        const shortcutPath = path.join(desktopPath, `${name}.app`);
        const contentsPath = path.join(shortcutPath, 'Contents');
        const macOSPath = path.join(contentsPath, 'MacOS');
        
        await fs.ensureDir(macOSPath);
        
        // 创建 Info.plist
        const plistContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>CFBundleExecutable</key>
  <string>${name}</string>
  <key>CFBundleIdentifier</key>
  <string>com.ris.lessonplugin.${pluginId}</string>
  <key>CFBundleName</key>
  <string>${name}</string>
  <key>CFBundleVersion</key>
  <string>1.0</string>
</dict>
</plist>`;
        
        await fs.writeFile(path.join(contentsPath, 'Info.plist'), plistContent);
        
        // 创建执行脚本
        const scriptContent = `#!/bin/bash
"${appPath}" --plugin-action="${pluginId}:${action}" --plugin-params='${JSON.stringify(params)}'`;
        
        const scriptPath = path.join(macOSPath, name);
        await fs.writeFile(scriptPath, scriptContent);
        await fs.chmod(scriptPath, '755');
        
        return { success: true, path: shortcutPath };
      } else {
        // Linux 快捷方式 (.desktop)
        const shortcutPath = path.join(desktopPath, `${name}.desktop`);
        const desktopContent = `[Desktop Entry]
Version=1.0
Type=Application
Name=${name}
Comment=LessonPlugin - ${name}
Exec="${appPath}" --plugin-action="${pluginId}:${action}" --plugin-params='${JSON.stringify(params)}'
Icon=${icon || 'application-x-executable'}
Terminal=false
Categories=Utility;`;
        
        await fs.writeFile(shortcutPath, desktopContent);
        await fs.chmod(shortcutPath, '755');
        
        return { success: true, path: shortcutPath };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // 删除桌面快捷方式
  async removeDesktopShortcut(name) {
    try {
      const desktopPath = path.join(os.homedir(), 'Desktop');
      let shortcutPath;
      
      if (process.platform === 'win32') {
        shortcutPath = path.join(desktopPath, `${name}.lnk`);
      } else if (process.platform === 'darwin') {
        shortcutPath = path.join(desktopPath, `${name}.app`);
      } else {
        shortcutPath = path.join(desktopPath, `${name}.desktop`);
      }
      
      if (await fs.pathExists(shortcutPath)) {
        await fs.remove(shortcutPath);
        return { success: true };
      } else {
        return { success: false, error: '快捷方式不存在' };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // 列出桌面快捷方式
  async listDesktopShortcuts() {
    try {
      const desktopPath = path.join(os.homedir(), 'Desktop');
      const files = await fs.readdir(desktopPath);
      const shortcuts = [];
      
      for (const file of files) {
        const filePath = path.join(desktopPath, file);
        const stat = await fs.stat(filePath);
        
        let isShortcut = false;
        if (process.platform === 'win32' && file.endsWith('.lnk')) {
          isShortcut = true;
        } else if (process.platform === 'darwin' && file.endsWith('.app') && stat.isDirectory()) {
          isShortcut = true;
        } else if (process.platform === 'linux' && file.endsWith('.desktop')) {
          isShortcut = true;
        }
        
        if (isShortcut) {
          shortcuts.push({
            name: file.replace(/\.(lnk|app|desktop)$/, ''),
            path: filePath,
            created: stat.birthtime
          });
        }
      }
      
      return { success: true, shortcuts };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // 注册自定义协议
  registerProtocols() {
    // 注册antd://协议，用于加载Ant Design资源
    protocol.registerFileProtocol('antd', (request, callback) => {
      const url = request.url.substring(7); // 去掉 'antd://'
      
      // 处理CSS文件请求
      if (url.startsWith('css/')) {
        const cssPath = path.join(process.cwd(), 'src/renderer/node_modules/antd/dist', url);
        callback({ path: cssPath });
        return;
      }
      
      // 处理JavaScript文件请求
      if (url.startsWith('js/')) {
        const jsFile = url.replace('js/', '');
        
        // 根据请求的文件名确定路径
        let jsPath;
        switch (jsFile) {
          case 'react.production.min.js':
            jsPath = path.join(process.cwd(), 'src/renderer/node_modules/react/umd/react.production.min.js');
            break;
          case 'react-dom.production.min.js':
            jsPath = path.join(process.cwd(), 'src/renderer/node_modules/react-dom/umd/react-dom.production.min.js');
            break;
          case 'antd.min.js':
            jsPath = path.join(process.cwd(), 'src/renderer/node_modules/antd/dist/antd.min.js');
            break;
          case 'icons.min.js':
            jsPath = path.join(process.cwd(), 'src/renderer/node_modules/@ant-design/icons/dist/index.umd.js');
            break;
          default:
            jsPath = null;
        }
        
        if (jsPath && fs.existsSync(jsPath)) {
          callback({ path: jsPath });
          return;
        }
      }
      
      // 处理图标文件请求
      if (url.startsWith('icons/')) {
        const iconName = url.replace('icons/', '').replace('.js', '');
        const iconPath = path.join(process.cwd(), 'src/renderer/node_modules/@ant-design/icons/es/icons', `${iconName}.js`);
        if (fs.existsSync(iconPath)) {
          callback({ path: iconPath });
          return;
        }
      }
      
      console.error('资源未找到:', request.url);
      callback({ error: -2 }); // 文件不存在
    });
    
    // 注册插件资源协议
    protocol.registerFileProtocol('plugin-resources', (request, callback) => {
      const url = request.url.substring(17); // 去掉 'plugin-resources://'
      const resourcePath = path.join(process.cwd(), 'src/renderer/public/plugin-resources', url);
      
      if (fs.existsSync(resourcePath)) {
        callback({ path: resourcePath });
      } else {
        console.error('插件资源未找到:', request.url);
        callback({ error: -2 }); // 文件不存在
      }
    });
  }

  setupIPC() {
    // Ant Design相关IPC
    ipcMain.handle('antd:getComponents', () => {
      return { available: true, message: '通过window.antd访问组件' };
    });
    
    ipcMain.handle('antd:getIcons', () => {
      return { available: true, message: '通过window.antdIcons访问图标' };
    });
    
    ipcMain.handle('antd:getIconNames', () => {
      return AntDesignProvider.getIconNames();
    });
    
    ipcMain.handle('antd:hasIcon', (event, iconName) => {
      return AntDesignProvider.hasIcon(iconName);
    });
    
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

    ipcMain.handle('plugin:installFromBuffer', async (event, buffer, filename) => {
      try {
        const tempPath = path.join(require('os').tmpdir(), filename);
        await fs.writeFile(tempPath, buffer);
        const result = await this.pluginManager.installPlugin(tempPath);
        await fs.remove(tempPath);
        return result;
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

    ipcMain.handle('plugin:setHotReloadEnabled', async (event, enabled) => {
      return this.pluginManager.setHotReloadEnabled(enabled);
    });
    
    ipcMain.handle('plugin:getHotReloadEnabled', () => {
      return this.pluginManager.getHotReloadEnabled();
    });
    
    ipcMain.handle('plugin:reloadPlugin', async (event, pluginId) => {
      return this.pluginManager.reloadPlugin(pluginId);
    });

    ipcMain.handle('plugin:executeAction', async (event, pluginId, action, params) => {
      return this.pluginManager.executePluginAction(pluginId, action, params);
    });
    
    // 插件接口相关IPC
    ipcMain.handle('plugin:getAvailableInterfaces', () => {
      return this.pluginManager.getAvailableInterfaces();
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

    ipcMain.handle('system:openDataFolder', async () => {
      const dataPath = path.join(process.cwd(), 'plugins');
      await fs.ensureDir(dataPath);
      return shell.openPath(dataPath);
    });

    // 桌面快捷方式相关IPC
    // 桌面快捷方式相关IPC
    ipcMain.handle('shortcut:create', async (event, options) => {
      return this.createDesktopShortcut(options);
    });

    ipcMain.handle('shortcut:remove', async (event, name) => {
      return this.removeDesktopShortcut(name);
    });

    ipcMain.handle('shortcut:list', async () => {
      return this.listDesktopShortcuts();
    });

    // 主窗口控制相关IPC
    ipcMain.handle('window:minimize', () => {
      if (this.mainWindow) {
        this.mainWindow.minimize();
      }
    });

    ipcMain.handle('window:maximize', () => {
      if (this.mainWindow) {
        if (this.mainWindow.isMaximized()) {
          this.mainWindow.unmaximize();
        } else {
          this.mainWindow.maximize();
        }
      }
    });

    ipcMain.handle('window:unmaximize', () => {
      if (this.mainWindow) {
        this.mainWindow.unmaximize();
      }
    });

    ipcMain.handle('window:closeApp', () => {
      if (this.mainWindow) {
        this.isQuitting = true;
        this.mainWindow.close();
      }
    });

    ipcMain.handle('window:isMaximized', () => {
      return this.mainWindow ? this.mainWindow.isMaximized() : false;
    });

    // 插件窗口控制相关IPC
    ipcMain.handle('plugin-window:minimize', (event, windowId) => {
      const windowInfo = this.windowManager.windows.get(windowId);
      if (windowInfo && windowInfo.window) {
        windowInfo.window.minimize();
        return { success: true };
      }
      return { success: false, error: '窗口不存在' };
    });

    ipcMain.handle('plugin-window:maximize', (event, windowId) => {
      const windowInfo = this.windowManager.windows.get(windowId);
      if (windowInfo && windowInfo.window) {
        windowInfo.window.maximize();
        return { success: true };
      }
      return { success: false, error: '窗口不存在' };
    });

    ipcMain.handle('plugin-window:toggleMaximize', (event, windowId) => {
      const windowInfo = this.windowManager.windows.get(windowId);
      if (windowInfo && windowInfo.window) {
        if (windowInfo.window.isMaximized()) {
          windowInfo.window.unmaximize();
        } else {
          windowInfo.window.maximize();
        }
        return { success: true };
      }
      return { success: false, error: '窗口不存在' };
    });

    ipcMain.handle('plugin-window:close', (event, windowId) => {
      const windowInfo = this.windowManager.windows.get(windowId);
      if (windowInfo && windowInfo.window) {
        windowInfo.window.close();
        return { success: true };
      }
      return { success: false, error: '窗口不存在' };
    });
  }
}

new LessonPluginApp();