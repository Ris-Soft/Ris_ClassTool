import pluginManager from '../plugins/pluginManager'

class WindowManager {
  constructor() {
    this.windows = new Map()
  }

  /**
   * 创建超级置顶窗口
   */
  createSuperimposedWindow() {
    const components = pluginManager.getSuperimposedComponents()
    return {
      type: 'superimposed',
      components: components
    }
  }

  /**
   * 创建桌面层窗口
   */
  createDesktopWindow() {
    const components = pluginManager.getDesktopComponents()
    return {
      type: 'desktop',
      components: components
    }
  }

  /**
   * 创建普通窗口
   */
  createNormalWindow() {
    return {
      type: 'normal',
      components: []
    }
  }

  /**
   * 创建设置窗口
   */
  createSettingsWindow() {
    const settingItems = pluginManager.getSettingItems()
    // 默认设置项
    const defaultSettings = [
      { 
        id: 'market', 
        title: '功能市场', 
        component: null 
      },
      { 
        id: 'management', 
        title: '功能管理', 
        component: null 
      },
      { 
        id: 'separator', 
        title: '分隔符', 
        component: null,
        separator: true
      }
    ]

    // 合并插件提供的设置项
    const allSettingItems = [...defaultSettings, ...settingItems]
    
    return {
      type: 'settings',
      settingItems: allSettingItems
    }
  }
}

const windowManager = new WindowManager()

export default windowManager