class PluginManager {
  constructor() {
    this.plugins = new Map()
    this.superimposedComponents = [] // 超级置顶窗口组件
    this.desktopComponents = [] // 桌面层窗口组件
    this.settingItems = [] // 设置页面左栏项目
  }

  /**
   * 注册插件
   * @param {string} id - 插件ID
   * @param {Object} plugin - 插件对象
   */
  registerPlugin(id, plugin) {
    if (this.plugins.has(id)) {
      console.warn(`Plugin with id ${id} is already registered.`)
      return
    }

    // 验证插件结构
    if (!plugin.name || !plugin.version) {
      throw new Error('Plugin must have name and version')
    }

    this.plugins.set(id, plugin)
    console.log('注册插件:', id, plugin)
    
    // 注册超级置顶窗口组件
    if (plugin.superimposedComponent) {
      // 创建正确的Vue组件对象
      const component = {
        template: plugin.superimposedComponent.template,
        ...(plugin.superimposedComponent.data ? { data: plugin.superimposedComponent.data } : {}),
        ...(plugin.superimposedComponent.methods ? { methods: plugin.superimposedComponent.methods } : {}),
        ...(plugin.superimposedComponent.props ? { props: plugin.superimposedComponent.props } : {})
      };
      
      this.superimposedComponents.push({
        id,
        name: plugin.name,
        component: component
      })
      console.log('注册超级置顶组件:', component)
    }

    // 注册桌面层窗口组件
    if (plugin.desktopComponent) {
      // 创建正确的Vue组件对象
      const component = {
        template: plugin.desktopComponent.template,
        ...(plugin.desktopComponent.data ? { data: plugin.desktopComponent.data } : {}),
        ...(plugin.desktopComponent.methods ? { methods: plugin.desktopComponent.methods } : {}),
        ...(plugin.desktopComponent.props ? { props: plugin.desktopComponent.props } : {})
      };
      
      this.desktopComponents.push({
        id,
        name: plugin.name,
        component: component
      })
      console.log('注册桌面层组件:', component)
    }

    // 注册设置项
    if (plugin.settingItem) {
      // 创建正确的Vue组件对象
      let component = null
      if (plugin.settingItem.component) {
        component = {
          template: plugin.settingItem.component.template,
          ...(plugin.settingItem.component.data ? { data: plugin.settingItem.component.data } : {}),
          ...(plugin.settingItem.component.methods ? { methods: plugin.settingItem.component.methods } : {}),
          ...(plugin.settingItem.component.props ? { props: plugin.settingItem.component.props } : {})
        };
      }
      
      this.settingItems.push({
        id,
        name: plugin.name,
        title: plugin.settingItem.title,
        component: component
      })
      console.log('注册设置项:', component)
    }
  }

  /**
   * 获取所有超级置顶窗口组件
   */
  getSuperimposedComponents() {
    console.log('获取超级置顶组件:', this.superimposedComponents)
    return this.superimposedComponents
  }

  /**
   * 获取所有桌面层窗口组件
   */
  getDesktopComponents() {
    console.log('获取桌面层组件:', this.desktopComponents)
    return this.desktopComponents
  }

  /**
   * 获取所有设置项
   */
  getSettingItems() {
    console.log('获取设置项:', this.settingItems)
    return this.settingItems
  }

  /**
   * 获取特定插件
   * @param {string} id - 插件ID
   */
  getPlugin(id) {
    return this.plugins.get(id)
  }

  /**
   * 移除插件
   * @param {string} id - 插件ID
   */
  unregisterPlugin(id) {
    this.plugins.delete(id)
    
    // 从各个区域移除插件相关组件
    this.superimposedComponents = this.superimposedComponents.filter(item => item.id !== id)
    this.desktopComponents = this.desktopComponents.filter(item => item.id !== id)
    this.settingItems = this.settingItems.filter(item => item.id !== id)
  }
}

// 创建单例实例
const pluginManager = new PluginManager()

export default pluginManager