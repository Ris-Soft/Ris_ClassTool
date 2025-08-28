const fs = require('fs-extra');
const path = require('path');
const { app } = require('electron');
const semver = require('semver');
const AdmZip = require('adm-zip');
const chokidar = require('chokidar');
const AntDesignProvider = require('./antd-provider');

class PluginManager {
  constructor(store) {
    this.store = store;
    // 改为运行目录下的plugins文件夹
    this.pluginsDir = path.join(process.cwd(), 'plugins');
    this.loadedPlugins = new Map();
    this.pluginProjects = new Map();
    this.eventHandlers = new Map();
    this.windowManager = null;
    this.showMainWindow = null;
    this.shortcutManager = null;
    this.fileWatchers = new Map(); // 存储文件监听器
    this.hotReloadEnabled = this.store.get('settings.hotReloadEnabled', true); // 默认启用热重载
    this.interfaceManager = null; // 插件接口管理器
    
    this.ensurePluginsDirectory();
    this.loadPlugins();
  }

  async ensurePluginsDirectory() {
    await fs.ensureDir(this.pluginsDir);
  }

  async loadPlugins() {
    try {
      const pluginDirs = await fs.readdir(this.pluginsDir);
      
      for (const dir of pluginDirs) {
        const pluginPath = path.join(this.pluginsDir, dir);
        const manifestPath = path.join(pluginPath, 'manifest.json');
        
        if (await fs.pathExists(manifestPath)) {
          try {
            const manifest = await fs.readJson(manifestPath);
            if (this.validateManifest(manifest)) {
              this.loadedPlugins.set(manifest.id, {
                manifest,
                path: pluginPath,
                enabled: this.store.get(`plugins.${manifest.id}.enabled`, true)
              });
            }
          } catch (error) {
            console.error(`加载插件 ${dir} 失败:`, error);
          }
        }
      }

      // 加载插件项目
      this.loadPluginProjects();
      
      // 如果热重载功能已启用，为所有已启用的插件设置文件监听
      if (this.hotReloadEnabled) {
        this.setupFileWatchers();
      }
    } catch (error) {
      console.error('加载插件失败:', error);
    }
  }

  validateManifest(manifest) {
    const required = ['id', 'name', 'version', 'main'];
    return required.every(field => manifest[field]);
  }

  async installPlugin(pluginPath) {
    try {
      let tempDir = null;
      let sourcePath = pluginPath;

      // 检查是否为zip文件
      if (path.extname(pluginPath).toLowerCase() === '.zip') {
        tempDir = path.join(require('os').tmpdir(), `plugin-${Date.now()}`);
        await fs.ensureDir(tempDir);
        
        try {
          const zip = new AdmZip(pluginPath);
          zip.extractAllTo(tempDir, true);
          
          // 查找manifest.json文件
          const entries = zip.getEntries();
          let manifestEntry = null;
          
          for (const entry of entries) {
            if (entry.entryName.endsWith('manifest.json') && !entry.entryName.includes('/')) {
              manifestEntry = entry;
              break;
            }
          }
          
          if (!manifestEntry) {
            // 检查是否在子文件夹中
            for (const entry of entries) {
              if (entry.entryName.endsWith('manifest.json')) {
                const parts = entry.entryName.split('/');
                if (parts.length === 2) {
                  sourcePath = path.join(tempDir, parts[0]);
                  break;
                }
              }
            }
            
            if (!await fs.pathExists(path.join(sourcePath, 'manifest.json'))) {
              throw new Error('zip文件中未找到有效的插件清单文件');
            }
          } else {
            sourcePath = tempDir;
          }
        } catch (zipError) {
          throw new Error(`解压zip文件失败: ${zipError.message}`);
        }
      }

      const manifestPath = path.join(sourcePath, 'manifest.json');
      if (!await fs.pathExists(manifestPath)) {
        throw new Error('插件清单文件不存在');
      }

      const manifest = await fs.readJson(manifestPath);
      if (!this.validateManifest(manifest)) {
        throw new Error('插件清单文件格式无效');
      }

      // 检查依赖
      if (manifest.dependencies) {
        for (const dep of manifest.dependencies) {
          if (!this.loadedPlugins.has(dep.id)) {
            throw new Error(`缺少依赖插件: ${dep.id}`);
          }
          
          const depPlugin = this.loadedPlugins.get(dep.id);
          if (dep.version && !semver.satisfies(depPlugin.manifest.version, dep.version)) {
            throw new Error(`依赖插件版本不匹配: ${dep.id}`);
          }
        }
      }

      const targetPath = path.join(this.pluginsDir, manifest.id);
      
      // 如果插件已存在，先备份
      if (await fs.pathExists(targetPath)) {
        const backupPath = `${targetPath}.backup.${Date.now()}`;
        await fs.move(targetPath, backupPath);
      }

      await fs.copy(sourcePath, targetPath);
      
      // 清理临时目录
      if (tempDir) {
        await fs.remove(tempDir);
      }
      
      this.loadedPlugins.set(manifest.id, {
        manifest,
        path: targetPath,
        enabled: true
      });

      this.store.set(`plugins.${manifest.id}.enabled`, true);
      this.loadPluginProjects();
      
      // 如果热重载功能已启用，为新安装的插件设置文件监听
      if (this.hotReloadEnabled) {
        this.setupFileWatcherForPlugin(manifest.id);
      }

      return { success: true, plugin: manifest };
    } catch (error) {
      throw new Error(`安装插件失败: ${error.message}`);
    }
  }

  async uninstallPlugin(pluginId) {
    try {
      const plugin = this.loadedPlugins.get(pluginId);
      if (!plugin) {
        throw new Error('插件不存在');
      }

      // 检查是否有其他插件依赖此插件
      for (const [id, p] of this.loadedPlugins) {
        if (id !== pluginId && p.manifest.dependencies) {
          const hasDependency = p.manifest.dependencies.some(dep => dep.id === pluginId);
          if (hasDependency) {
            throw new Error(`插件 ${p.manifest.name} 依赖此插件，无法卸载`);
          }
        }
      }

      // 移除文件监听器
      this.removeFileWatcher(pluginId);

      await fs.remove(plugin.path);
      this.loadedPlugins.delete(pluginId);
      this.pluginProjects.delete(pluginId);
      this.store.delete(`plugins.${pluginId}`);

      return { success: true };
    } catch (error) {
      throw new Error(`卸载插件失败: ${error.message}`);
    }
  }

  enablePlugin(pluginId) {
    const plugin = this.loadedPlugins.get(pluginId);
    if (plugin) {
      plugin.enabled = true;
      this.store.set(`plugins.${pluginId}.enabled`, true);
      this.loadPluginProjects();
      this.initializePlugin(plugin);
      
      // 如果热重载功能已启用，为启用的插件设置文件监听
      if (this.hotReloadEnabled) {
        this.setupFileWatcherForPlugin(pluginId);
      }
      
      return { success: true };
    }
    return { success: false, error: '插件不存在' };
  }

  disablePlugin(pluginId) {
    const plugin = this.loadedPlugins.get(pluginId);
    if (plugin) {
      plugin.enabled = false;
      this.store.set(`plugins.${pluginId}.enabled`, false);
      this.pluginProjects.delete(pluginId);
      this.cleanupPlugin(pluginId);
      
      // 移除文件监听器
      this.removeFileWatcher(pluginId);
      
      return { success: true };
    }
    return { success: false, error: '插件不存在' };
  }

  getInstalledPlugins() {
    const plugins = [];
    for (const [id, plugin] of this.loadedPlugins) {
      plugins.push({
        id,
        name: plugin.manifest.name,
        version: plugin.manifest.version,
        description: plugin.manifest.description,
        author: plugin.manifest.author,
        enabled: plugin.enabled,
        permissions: plugin.manifest.permissions || [],
        dependencies: plugin.manifest.dependencies || [],
        icon: plugin.manifest.icon || null
      });
    }
    return plugins;
  }

  loadPluginProjects() {
    this.pluginProjects.clear();
    
    for (const [id, plugin] of this.loadedPlugins) {
      if (plugin.enabled && plugin.manifest.projects) {
        this.pluginProjects.set(id, plugin.manifest.projects);
      }
    }
  }

  getPluginProjects() {
    const projects = [];
    for (const [pluginId, pluginProjects] of this.pluginProjects) {
      const plugin = this.loadedPlugins.get(pluginId);
      for (const project of pluginProjects) {
        projects.push({
          ...project,
          pluginId,
          pluginName: plugin.manifest.name
        });
      }
    }
    return projects;
  }

  async executePluginAction(pluginId, action, params) {
    const plugin = this.loadedPlugins.get(pluginId);
    if (!plugin || !plugin.enabled) {
      throw new Error('插件不存在或未启用');
    }

    try {
      const mainPath = path.join(plugin.path, plugin.manifest.main);
      const pluginModule = require(mainPath);
      
      if (typeof pluginModule[action] === 'function') {
        return await pluginModule[action](params, this.createPluginContext(plugin));
      } else {
        throw new Error(`插件方法 ${action} 不存在`);
      }
    } catch (error) {
      throw new Error(`执行插件操作失败: ${error.message}`);
    }
  }

  createPluginContext(plugin, showLog = false) {
    // 基础上下文
    const baseContext = {
      pluginId: plugin.manifest.id,
      pluginPath: plugin.path,
      dataPath: path.join(app.getPath('userData'), 'plugins-data', plugin.manifest.id),
      permissions: plugin.manifest.permissions || [],
      windowManager: this.windowManager,
      shortcutManager: this.shortcutManager,
      showMainWindow: this.showMainWindow,
      
      // 事件系统
      on: (event, handler) => this.registerEventHandler(plugin.manifest.id, event, handler),
      emit: (event, data) => this.broadcastEvent(event, data),
      
      // UI消息通知功能
      ui: {
        message: {
          success: (content, duration) => this.sendUIMessage('success', content, duration),
          error: (content, duration) => this.sendUIMessage('error', content, duration),
          info: (content, duration) => this.sendUIMessage('info', content, duration),
          warning: (content, duration) => this.sendUIMessage('warning', content, duration),
          loading: (content, duration) => this.sendUIMessage('loading', content, duration)
        }
      },
      
      // Ant Design组件和图标访问
      antd: {
        getComponents: () => ({ available: true, message: '通过window.antd访问组件' }),
        getIcons: () => ({ available: true, message: '通过window.antdIcons访问图标' }),
        getIconNames: () => AntDesignProvider.getIconNames(),
        hasIcon: (iconName) => AntDesignProvider.hasIcon(iconName)
      }
    };
    
    // 创建接口代理
    let interfaceProxy = {};
    if (this.interfaceManager) {
      interfaceProxy = this.interfaceManager.createInterfaceProxy(plugin.manifest.id, baseContext);
    }
    
    // 合并上下文和接口代理
    const context = {
      ...baseContext,
      api: interfaceProxy
    };
    
    // 只在需要时显示日志（通常是插件初始化时）
    if (showLog) {
      console.log(`为插件 ${plugin.manifest.id} 创建上下文，可用接口:`, Object.keys(interfaceProxy));
    }
    
    return context;
  }

  setWindowManager(windowManager) {
    this.windowManager = windowManager;
  }

  setShowMainWindow(showMainWindow) {
    this.showMainWindow = showMainWindow;
  }

  setShortcutManager(shortcutManager) {
    this.shortcutManager = shortcutManager;
  }
  
  /**
   * 设置插件接口管理器
   * @param {PluginInterfaceManager} interfaceManager - 插件接口管理器实例
   */
  setInterfaceManager(interfaceManager) {
    this.interfaceManager = interfaceManager;
    
    // 监听接口调用事件
    this.interfaceManager.on('interface-call', async (pluginId, interfaceName, params, callback) => {
      try {
        const result = await this.handleInterfaceCall(pluginId, interfaceName, params);
        callback(null, result);
      } catch (error) {
        callback(error);
      }
    });
  }
  
  /**
   * 处理插件接口调用
   * @param {string} pluginId - 调用接口的插件ID
   * @param {string} interfaceName - 接口名称
   * @param {any} params - 接口参数
   * @returns {Promise<any>} 接口调用结果
   */
  async handleInterfaceCall(pluginId, interfaceName, params) {
    try {
      // 如果没有指定插件ID，创建一个通用上下文
      let context = {};
      
      if (pluginId) {
        const plugin = this.loadedPlugins.get(pluginId);
        if (!plugin || !plugin.enabled) {
          throw new Error('插件不存在或未启用');
        }
        context = this.createPluginContext(plugin);
      } else {
        // 创建通用上下文，用于系统级接口调用
        context = {
          pluginId: 'system',
          permissions: ['ui', 'system', 'storage', 'shortcut']
        };
      }
      
      // 调用接口
      return await this.interfaceManager.callInterface(interfaceName, params, context);
    } catch (error) {
      throw new Error(`调用接口 ${interfaceName} 失败: ${error.message}`);
    }
  }
  
  /**
   * 获取可用的插件接口列表
   * @returns {Array<string>} 接口名称列表
   */
  getAvailableInterfaces() {
    if (!this.interfaceManager) {
      return [];
    }
    return this.interfaceManager.getAvailableInterfaces();
  }

  initializePlugins() {
    // 初始化所有启用的插件
    for (const [id, plugin] of this.loadedPlugins) {
      if (plugin.enabled) {
        this.initializePlugin(plugin);
      }
    }
  }

  async initializePlugin(plugin) {
    try {
      const mainPath = path.join(plugin.path, plugin.manifest.main);
      
      // 清除require缓存以确保重新加载
      delete require.cache[require.resolve(mainPath)];
      
      const pluginModule = require(mainPath);
      
      // 如果插件有初始化方法，调用它（在初始化时显示上下文日志）
      if (typeof pluginModule.initialize === 'function') {
        await pluginModule.initialize(this.createPluginContext(plugin, true));
      }
    } catch (error) {
      console.error(`初始化插件 ${plugin.manifest.name} 失败:`, error);
    }
  }

  cleanupPlugin(pluginId) {
    // 清理插件的事件处理器
    for (const [event, handlers] of this.eventHandlers) {
      handlers.delete(pluginId);
    }
  }

  registerEventHandler(pluginId, event, handler) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Map());
    }
    this.eventHandlers.get(event).set(pluginId, handler);
  }

  broadcastEvent(event, data) {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      for (const [pluginId, handler] of handlers) {
        try {
          handler(data);
        } catch (error) {
          console.error(`插件 ${pluginId} 处理事件 ${event} 失败:`, error);
        }
      }
    }
  }

  // 热重载相关方法
  
  /**
   * 设置所有已启用插件的文件监听
   */
  setupFileWatchers() {
    // 先清除所有现有的监听器
    this.clearAllFileWatchers();
    
    // 为每个已启用的插件设置文件监听
    for (const [pluginId, plugin] of this.loadedPlugins) {
      if (plugin.enabled) {
        this.setupFileWatcherForPlugin(pluginId);
      }
    }
  }

  /**
   * 为指定插件设置文件监听
   * @param {string} pluginId - 插件ID
   */
  setupFileWatcherForPlugin(pluginId) {
    const plugin = this.loadedPlugins.get(pluginId);
    if (!plugin || !plugin.enabled) return;

    // 如果已经有监听器，先移除
    this.removeFileWatcher(pluginId);

    const pluginPath = plugin.path;
    console.log(`为插件 ${pluginId} 设置文件监听: ${pluginPath}`);

    // 创建文件监听器
    const watcher = chokidar.watch(pluginPath, {
      ignored: /(^|[\/\\])\../, // 忽略隐藏文件
      persistent: true,
      ignoreInitial: true,
      awaitWriteFinish: {
        stabilityThreshold: 300,
        pollInterval: 100
      }
    });

    // 监听文件变化事件
    watcher.on('change', async (filePath) => {
      // 忽略临时文件和备份文件
      if (filePath.includes('.tmp') || filePath.includes('.bak') || filePath.includes('~')) {
        return;
      }

      console.log(`检测到插件 ${pluginId} 文件变更: ${filePath}`);
      
      // 如果是主文件或manifest.json发生变化，重新加载插件
      const mainPath = path.join(pluginPath, plugin.manifest.main);
      const manifestPath = path.join(pluginPath, 'manifest.json');
      
      if (filePath === mainPath || filePath === manifestPath || path.dirname(filePath) === path.dirname(mainPath)) {
        await this.reloadPlugin(pluginId);
      }
    });

    // 存储监听器
    this.fileWatchers.set(pluginId, watcher);
  }

  /**
   * 移除指定插件的文件监听器
   * @param {string} pluginId - 插件ID
   */
  removeFileWatcher(pluginId) {
    const watcher = this.fileWatchers.get(pluginId);
    if (watcher) {
      watcher.close();
      this.fileWatchers.delete(pluginId);
      console.log(`已移除插件 ${pluginId} 的文件监听器`);
    }
  }

  /**
   * 清除所有文件监听器
   */
  clearAllFileWatchers() {
    for (const [pluginId, watcher] of this.fileWatchers) {
      watcher.close();
    }
    this.fileWatchers.clear();
    console.log('已清除所有插件文件监听器');
  }

  /**
   * 重新加载指定插件
   * @param {string} pluginId - 插件ID
   */
  async reloadPlugin(pluginId) {
    try {
      const plugin = this.loadedPlugins.get(pluginId);
      if (!plugin || !plugin.enabled) return;

      console.log(`正在重新加载插件 ${pluginId}...`);

      // 重新读取manifest.json
      const manifestPath = path.join(plugin.path, 'manifest.json');
      if (await fs.pathExists(manifestPath)) {
        try {
          const manifest = await fs.readJson(manifestPath);
          if (this.validateManifest(manifest)) {
            // 更新插件信息
            plugin.manifest = manifest;
            
            // 清理插件
            this.cleanupPlugin(pluginId);
            
            // 重新初始化插件
            await this.initializePlugin(plugin);
            
            // 重新加载插件项目
            this.loadPluginProjects();
            
            console.log(`插件 ${pluginId} 已成功重新加载`);
            
            // 广播插件重新加载事件
            this.broadcastEvent('plugin-reloaded', { pluginId });
            
            return true;
          }
        } catch (error) {
          console.error(`重新加载插件 ${pluginId} 失败:`, error);
        }
      }
    } catch (error) {
      console.error(`重新加载插件 ${pluginId} 失败:`, error);
    }
    return false;
  }

  /**
   * 启用或禁用热重载功能
   * @param {boolean} enabled - 是否启用热重载
   */
  setHotReloadEnabled(enabled) {
    this.hotReloadEnabled = enabled;
    this.store.set('settings.hotReloadEnabled', enabled);
    
    if (enabled) {
      console.log('插件热重载功能已启用');
      this.setupFileWatchers();
    } else {
      console.log('插件热重载功能已禁用');
      this.clearAllFileWatchers();
    }
    
    return { success: true, enabled };
  }

  /**
   * 获取热重载功能状态
   * @returns {boolean} 热重载功能是否启用
   */
  getHotReloadEnabled() {
    return this.hotReloadEnabled;
  }

  /**
   * 向渲染进程发送UI消息通知
   * @param {string} type - 消息类型：success, error, info, warning, loading
   * @param {string} content - 消息内容
   * @param {number} duration - 显示时长（秒）
   */
  sendUIMessage(type, content, duration = 3) {
    if (this.windowManager && this.windowManager.mainWindow) {
      this.windowManager.mainWindow.webContents.send('plugin:ui-message', {
        type,
        content,
        duration
      });
    }
  }
}

module.exports = PluginManager;