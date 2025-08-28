const { ipcMain } = require('electron');
const EventEmitter = require('events');

/**
 * 插件接口管理器
 * 负责管理插件接口和事件通信
 */
class PluginInterfaceManager extends EventEmitter {
  constructor() {
    super();
    this.interfaces = new Map();
    this.dependencies = {};
    
    // 只在 Electron 环境中设置 IPC
    if (typeof require !== 'undefined') {
      try {
        const { ipcMain } = require('electron');
        if (ipcMain) {
          this.setupIPC();
        }
      } catch (error) {
        // 非 Electron 环境，跳过 IPC 设置
        console.log('非 Electron 环境，跳过 IPC 设置');
      }
    }
  }

  /**
   * 注册插件接口
   * @param {string} name - 接口名称
   * @param {Function} handler - 接口处理函数
   */
  registerInterface(name, handler) {
    this.interfaces.set(name, handler);
  }

  /**
   * 批量注册插件接口
   * @param {Object} interfaces - 接口对象，键为接口名称，值为处理函数
   */
  registerInterfaces(interfaces) {
    for (const [name, handler] of Object.entries(interfaces)) {
      this.registerInterface(name, handler);
    }
  }

  /**
   * 调用插件接口
   * @param {string} name - 接口名称
   * @param {any} params - 接口参数
   * @param {Object} context - 插件上下文
   * @returns {Promise<any>} 接口调用结果
   */
  async callInterface(name, params, context) {
    const handler = this.interfaces.get(name);
    if (!handler) {
      throw new Error(`接口 ${name} 不存在`);
    }
    return await handler(params, context);
  }

  /**
   * 获取所有可用接口
   * @returns {Array<string>} 接口名称列表
   */
  getAvailableInterfaces() {
    return Array.from(this.interfaces.keys());
  }

  /**
   * 设置IPC通信
   */
  setupIPC() {
    // 插件接口调用
    ipcMain.handle('plugin:callInterface', async (event, interfaceName, params) => {
      try {
        // 通过事件发射器通知插件管理器处理接口调用
        const result = await new Promise((resolve, reject) => {
          this.emit('interface-call', null, interfaceName, params, (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          });
        });
        return { success: true, result };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });
  }

  /**
   * 创建插件接口代理
   * 用于在插件上下文中提供接口调用能力
   * @param {string} pluginId - 插件ID
   * @param {Object} context - 插件上下文
   * @returns {Object} 接口代理对象
   */
  createInterfaceProxy(pluginId, context) {
    const self = this;
    
    // 创建一个真实的对象，预先填充所有接口方法
    const proxyTarget = {};
    for (const interfaceName of self.interfaces.keys()) {
      proxyTarget[interfaceName] = async (params) => {
        return await self.callInterface(interfaceName, params, { ...context, pluginId });
      };
    }
    
    return new Proxy(proxyTarget, {
      get(target, prop) {
        if (typeof prop === 'string' && self.interfaces.has(prop)) {
          return target[prop];
        }
        return target[prop];
      },
      ownKeys() {
        return Array.from(self.interfaces.keys());
      },
      getOwnPropertyDescriptor(target, prop) {
        if (self.interfaces.has(prop)) {
          return {
            enumerable: true,
            configurable: true,
            writable: false,
            value: target[prop]
          };
        }
        return Object.getOwnPropertyDescriptor(target, prop);
      },
      has(target, prop) {
        return self.interfaces.has(prop);
      }
    });
  }
}

module.exports = PluginInterfaceManager;