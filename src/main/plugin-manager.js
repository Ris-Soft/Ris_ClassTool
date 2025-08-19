const fs = require('fs-extra');
const path = require('path');
const { app } = require('electron');
const semver = require('semver');

class PluginManager {
  constructor(store) {
    this.store = store;
    this.pluginsDir = path.join(app.getPath('userData'), 'plugins');
    this.loadedPlugins = new Map();
    this.pluginProjects = new Map();
    this.eventHandlers = new Map();
    this.windowManager = null;
    
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
      const manifestPath = path.join(pluginPath, 'manifest.json');
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

      await fs.copy(pluginPath, targetPath);
      
      this.loadedPlugins.set(manifest.id, {
        manifest,
        path: targetPath,
        enabled: true
      });

      this.store.set(`plugins.${manifest.id}.enabled`, true);
      this.loadPluginProjects();

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
        dependencies: plugin.manifest.dependencies || []
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

  createPluginContext(plugin) {
    return {
      pluginPath: plugin.path,
      dataPath: path.join(app.getPath('userData'), 'plugins-data', plugin.manifest.id),
      permissions: plugin.manifest.permissions || [],
      getPlugin: (id) => this.loadedPlugins.get(id),
      executeAction: (pluginId, action, params) => this.executePluginAction(pluginId, action, params),
      createWindow: (options) => this.windowManager ? this.windowManager.createWindow({
        ...options,
        pluginId: plugin.manifest.id
      }) : null,
      on: (event, handler) => this.registerEventHandler(plugin.manifest.id, event, handler),
      emit: (event, data) => this.broadcastEvent(event, data),
      showMainWindow: (page) => this.showMainWindow && this.showMainWindow(page)
    };
  }

  setWindowManager(windowManager) {
    this.windowManager = windowManager;
  }

  setShowMainWindow(showMainWindow) {
    this.showMainWindow = showMainWindow;
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
      
      // 如果插件有初始化方法，调用它
      if (typeof pluginModule.initialize === 'function') {
        await pluginModule.initialize(this.createPluginContext(plugin));
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
}

module.exports = PluginManager;