// 测试接口修复
const path = require('path');
const fs = require('fs');

console.log('=== 测试接口修复 ===\n');

// 模拟修复后的系统
class FixedLessonPluginApp {
  constructor() {
    this.store = { get: () => {}, set: () => {} };
    this.interfaceManager = new MockInterfaceManager();
    this.pluginManager = new MockPluginManager(this.store);
    this.windowManager = new MockWindowManager();
    this.mainWindow = null;
    
    console.log('1. 构造函数完成，接口管理器已创建');
    console.log('   接口管理器中的接口数量:', this.interfaceManager.interfaces.size);
  }
  
  initializePlugins() {
    console.log('\n2. 开始初始化插件系统...');
    
    // 设置插件管理器的依赖
    this.pluginManager.setWindowManager(this.windowManager);
    console.log('   ✓ WindowManager 已设置');
    
    // 注册插件接口（在依赖设置完成后）
    this.registerPluginInterfaces();
    console.log('   ✓ 插件接口已注册');
    console.log('   接口管理器中的接口数量:', this.interfaceManager.interfaces.size);
    console.log('   可用接口:', Array.from(this.interfaceManager.interfaces.keys()));
    
    // 设置插件接口管理器
    this.pluginManager.setInterfaceManager(this.interfaceManager);
    console.log('   ✓ 接口管理器已设置到插件管理器');
    
    // 初始化插件系统
    this.pluginManager.initializePlugins();
    console.log('   ✓ 插件系统初始化完成');
  }
  
  registerPluginInterfaces() {
    console.log('   注册插件接口...');
    
    this.interfaceManager.registerInterfaces({
      createWindow: (params, context) => {
        console.log('     createWindow 接口被调用');
        if (!this.windowManager) {
          throw new Error('WindowManager 未设置');
        }
        return this.windowManager.createWindow(params);
      },
      
      closeWindow: (params) => {
        return this.windowManager.closeWindow(params.windowId);
      },
      
      listWindows: () => {
        return this.windowManager.getAllWindows();
      },
      
      readFile: async (params) => {
        try {
          const { filePath, encoding = 'utf8' } = params;
          const content = fs.readFileSync(filePath, encoding);
          return { success: true, content };
        } catch (error) {
          return { success: false, error: error.message };
        }
      },
      
      createShortcut: (params) => {
        console.log('     createShortcut 接口被调用');
        return { success: true, message: '快捷方式创建成功' };
      }
    });
  }
}

// 模拟类
class MockInterfaceManager {
  constructor() {
    this.interfaces = new Map();
  }
  
  registerInterfaces(interfaces) {
    for (const [name, handler] of Object.entries(interfaces)) {
      this.interfaces.set(name, handler);
    }
  }
  
  createInterfaceProxy(pluginId, context) {
    const self = this;
    const proxy = new Proxy({}, {
      get(target, prop) {
        if (typeof prop === 'string' && self.interfaces.has(prop)) {
          return async (params) => {
            return await self.callInterface(prop, params, { ...context, pluginId });
          };
        }
        return undefined;
      },
      ownKeys() {
        return Array.from(self.interfaces.keys());
      }
    });
    
    console.log(`     为插件 ${pluginId} 创建接口代理，可用接口:`, Object.keys(proxy));
    return proxy;
  }
  
  async callInterface(name, params, context) {
    const handler = this.interfaces.get(name);
    if (!handler) {
      throw new Error(`接口 ${name} 不存在`);
    }
    return await handler(params, context);
  }
}

class MockPluginManager {
  constructor(store) {
    this.store = store;
    this.loadedPlugins = new Map();
    this.interfaceManager = null;
    this.windowManager = null;
    
    // 模拟加载插件
    this.loadPlugin();
  }
  
  loadPlugin() {
    const pluginPath = path.join(process.cwd(), 'plugins', 'example-calculator');
    const manifestPath = path.join(pluginPath, 'manifest.json');
    
    if (fs.existsSync(manifestPath)) {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      const plugin = {
        manifest,
        path: pluginPath,
        enabled: true
      };
      
      this.loadedPlugins.set(manifest.id, plugin);
    }
  }
  
  setWindowManager(windowManager) {
    this.windowManager = windowManager;
  }
  
  setInterfaceManager(interfaceManager) {
    this.interfaceManager = interfaceManager;
  }
  
  initializePlugins() {
    // 模拟插件初始化
  }
  
  createPluginContext(plugin) {
    const baseContext = {
      pluginId: plugin.manifest.id,
      pluginPath: plugin.path,
      permissions: plugin.manifest.permissions || []
    };
    
    // 创建接口代理
    let interfaceProxy = {};
    if (this.interfaceManager) {
      interfaceProxy = this.interfaceManager.createInterfaceProxy(plugin.manifest.id, baseContext);
    }
    
    return {
      ...baseContext,
      api: interfaceProxy
    };
  }
  
  async executePluginAction(pluginId, action, params) {
    console.log(`\n3. 执行插件动作: ${pluginId}.${action}`);
    
    const plugin = this.loadedPlugins.get(pluginId);
    if (!plugin || !plugin.enabled) {
      throw new Error('插件不存在或未启用');
    }
    
    const mainPath = path.join(plugin.path, plugin.manifest.main);
    delete require.cache[require.resolve(mainPath)];
    const pluginModule = require(mainPath);
    
    if (typeof pluginModule[action] === 'function') {
      const context = this.createPluginContext(plugin);
      console.log('   插件上下文中的可用接口:', Object.keys(context.api));
      
      const result = await pluginModule[action](params, context);
      console.log('   插件方法执行结果:', result);
      return result;
    } else {
      throw new Error(`插件方法 ${action} 不存在`);
    }
  }
}

class MockWindowManager {
  constructor() {
    this.windows = new Map();
  }
  
  createWindow(params) {
    console.log('     WindowManager.createWindow 被调用');
    console.log('     参数:', JSON.stringify(params, null, 2));
    
    const windowId = 'window-' + Date.now();
    const window = {
      show: () => console.log(`     ✓ 窗口 ${windowId} 已显示`),
      focus: () => console.log(`     ✓ 窗口 ${windowId} 已聚焦`)
    };
    
    this.windows.set(windowId, window);
    
    return {
      success: true,
      windowId,
      window
    };
  }
  
  closeWindow(windowId) {
    this.windows.delete(windowId);
    return { success: true };
  }
  
  getAllWindows() {
    return Array.from(this.windows.keys());
  }
}

// 执行测试
async function runTest() {
  try {
    console.log('创建修复后的应用实例...');
    const app = new FixedLessonPluginApp();
    
    console.log('\n初始化插件系统...');
    app.initializePlugins();
    
    console.log('\n测试插件调用...');
    const result = await app.pluginManager.executePluginAction('example-calculator', 'openProject', {
      titleBarStyle: 'custom'
    });
    
    console.log('\n=== 最终结果 ===');
    if (result.success) {
      console.log('✅ 修复成功！窗口应该能正常创建了');
      console.log('窗口ID:', result.windowId);
    } else {
      console.log('❌ 仍有问题:', result.error);
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

runTest();