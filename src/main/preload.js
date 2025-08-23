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
    close: (windowId) => ipcRenderer.invoke('window:close', windowId),
    minimize: () => ipcRenderer.invoke('window:minimize'),
    maximize: () => ipcRenderer.invoke('window:maximize'),
    unmaximize: () => ipcRenderer.invoke('window:unmaximize'),
    closeApp: () => ipcRenderer.invoke('window:closeApp'),
    isMaximized: () => ipcRenderer.invoke('window:isMaximized')
  },

  // 插件窗口控制API
  pluginWindow: {
    minimize: (windowId) => ipcRenderer.invoke('plugin-window:minimize', windowId),
    maximize: (windowId) => ipcRenderer.invoke('plugin-window:maximize', windowId),
    toggleMaximize: (windowId) => ipcRenderer.invoke('plugin-window:toggleMaximize', windowId),
    close: (windowId) => ipcRenderer.invoke('plugin-window:close', windowId),
    setTitle: (windowId, title) => ipcRenderer.invoke('window:setTitle', windowId, title),
    getTitle: (windowId) => ipcRenderer.invoke('window:getTitle', windowId)
  },

  // 文件系统API
  fs: {
    selectFolder: () => ipcRenderer.invoke('fs:selectFolder'),
    selectFile: (filters) => ipcRenderer.invoke('fs:selectFile', filters)
  },

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
    const validChannels = ['plugin:updated', 'window:closed', 'window-maximized', 'window-unmaximized', 'navigate-to'];
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, callback);
    }
  },

  removeListener: (channel, callback) => {
    ipcRenderer.removeListener(channel, callback);
  },

  // IPC渲染器（用于自定义标题栏）
  ipcRenderer: {
    on: (channel, callback) => {
      const validChannels = ['titlebar:updateTitle', 'window:message'];
      if (validChannels.includes(channel)) {
        ipcRenderer.on(channel, callback);
      }
    },
    removeListener: (channel, callback) => {
      ipcRenderer.removeListener(channel, callback);
    }
  }
});