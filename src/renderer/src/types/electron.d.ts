export interface Plugin {
  id: string;
  name: string;
  version: string;
  description?: string;
  author?: string;
  enabled: boolean;
  permissions: string[];
  dependencies: Array<{id: string; version?: string}>;
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
  };
  window: {
    create: (options: any) => Promise<{windowId: string; success: boolean}>;
    close: (windowId: string) => Promise<{success: boolean; error?: string}>;
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

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};