const { contextBridge, ipcRenderer } = require('electron');

// 暴露安全的API给渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  // 插件管理API
  plugin: {
    list: () => ipcRenderer.invoke('plugin:list'),
    install: (pluginPath) => ipcRenderer.invoke('plugin:install', pluginPath),
    installFromBuffer: (buffer, filename) => ipcRenderer.invoke('plugin:installFromBuffer', buffer, filename),
    uninstall: (pluginId) => ipcRenderer.invoke('plugin:uninstall', pluginId),
    enable: (pluginId) => ipcRenderer.invoke('plugin:enable', pluginId),
    disable: (pluginId) => ipcRenderer.invoke('plugin:disable', pluginId),
    getProjects: () => ipcRenderer.invoke('plugin:getProjects'),
    executeAction: (pluginId, action, params) => ipcRenderer.invoke('plugin:executeAction', pluginId, action, params)
  },

  // 窗口管理API
  window: {
    create: (options) => ipcRenderer.invoke('window:create', options),
    close: (windowId) => ipcRenderer.invoke('window:close', windowId)
  },

  // 文件系统API
  fs: {
    selectFolder: () => ipcRenderer.invoke('fs:selectFolder'),
    selectFile: (filters) => ipcRenderer.invoke('fs:selectFile', filters)
  },

  // 系统API
  // 系统API
  system: {
    openExternal: (url) => ipcRenderer.invoke('system:openExternal', url),
    openDataFolder: () => ipcRenderer.invoke('system:openDataFolder')
  },

  // 桌面快捷方式API
  shortcut: {
    create: (options) => ipcRenderer.invoke('shortcut:create', options),
    remove: (name) => ipcRenderer.invoke('shortcut:remove', name),
    list: () => ipcRenderer.invoke('shortcut:list')
  },

  // 事件监听
  on: (channel, callback) => {
    const validChannels = ['plugin:updated', 'window:closed'];
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, callback);
    }
  },

  removeListener: (channel, callback) => {
    ipcRenderer.removeListener(channel, callback);
  }
});