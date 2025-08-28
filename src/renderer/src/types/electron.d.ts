export interface Plugin {
  id: string;
  name: string;
  version: string;
  description?: string;
  author?: string;
  enabled: boolean;
  permissions: string[];
  dependencies: Array<{id: string; version?: string}>;
  icon?: string;
}

export interface Project {
  id: string;
  name: string;
  icon?: string;
  pluginId: string;
  pluginName: string;
  component?: string;
  description?: string;
}

export interface ElectronAPI {
  plugin: {
    list: () => Promise<Plugin[]>;
    install: (pluginPath: string) => Promise<{success: boolean; plugin?: any; error?: string}>;
    installFromBuffer: (buffer: Uint8Array, filename: string) => Promise<{success: boolean; plugin?: any; error?: string}>;
    uninstall: (pluginId: string) => Promise<{success: boolean; error?: string}>;
    enable: (pluginId: string) => Promise<{success: boolean; error?: string}>;
    disable: (pluginId: string) => Promise<{success: boolean; error?: string}>;
    getProjects: () => Promise<Project[]>;
    executeAction: (pluginId: string, action: string, params: any) => Promise<any>;
    setHotReloadEnabled: (enabled: boolean) => Promise<{success: boolean; enabled: boolean}>;
    getHotReloadEnabled: () => Promise<boolean>;
    reloadPlugin: (pluginId: string) => Promise<boolean>;
  };
  antd: {
    getComponents: () => Promise<{available: boolean; message: string}>;
    getIcons: () => Promise<{available: boolean; message: string}>;
    getIconNames: () => Promise<string[]>;
    hasIcon: (iconName: string) => Promise<boolean>;
  };
  window: {
    create: (options: any) => Promise<{ windowId: string; success: boolean }>;
    close: (windowId: string) => Promise<{ success: boolean; error?: string }>;
    minimize: () => Promise<void>;
    maximize: () => Promise<void>;
    unmaximize: () => Promise<void>;
    closeApp: () => Promise<void>;
    isMaximized: () => Promise<boolean>;
  };
  fs: {
    selectFolder: () => Promise<string>;
    selectFile: (filters?: any[]) => Promise<string>;
  };
  system: {
    openExternal: (url: string) => Promise<void>;
    openDataFolder: () => Promise<void>;
  };
  shortcut: {
    create: (options: {
      name: string;
      pluginId: string;
      action: string;
      params?: any;
      icon?: string;
    }) => Promise<{success: boolean; path?: string; error?: string}>;
    remove: (name: string) => Promise<{success: boolean; error?: string}>;
    list: () => Promise<{success: boolean; shortcuts?: Array<{name: string; path: string; created: Date}>; error?: string}>;
  };
  on: (channel: string, callback: (...args: any[]) => void) => void;
  removeListener: (channel: string, callback: (...args: any[]) => void) => void;
}

// 插件上下文接口定义
export interface PluginContext {
  pluginPath: string;
  dataPath: string;
  permissions: string[];
  getPlugin: (id: string) => Plugin | undefined;
  executeAction: (pluginId: string, action: string, params: any) => Promise<any>;
  createWindow: (options: any) => any;
  on: (event: string, handler: (data: any) => void) => void;
  emit: (event: string, data: any) => void;
  showMainWindow: (page?: string) => void;
  createShortcut: (options: any) => Promise<any>;
  removeShortcut: (name: string) => Promise<any>;
  listShortcuts: () => Promise<any>;
  // UI 消息接口
  ui: {
    message: {
      success: (content: string, duration?: number) => void;
      error: (content: string, duration?: number) => void;
      info: (content: string, duration?: number) => void;
      warning: (content: string, duration?: number) => void;
      loading: (content: string, duration?: number) => void;
    }
  };
  // Ant Design组件和图标访问
  antd: {
    getComponents: () => {available: boolean; message: string};
    getIcons: () => {available: boolean; message: string};
    getIconNames: () => string[];
    hasIcon: (iconName: string) => boolean;
  };
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};