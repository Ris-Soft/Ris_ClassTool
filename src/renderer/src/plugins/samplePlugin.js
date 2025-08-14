// 示例插件，展示如何创建插件
export default {
  id: 'sample-plugin',
  name: '示例插件',
  version: '1.0.0',
  description: '这是一个示例插件，展示如何开发插件',

  // 超级置顶窗口组件
  superimposedComponent: {
    template: `
      <div class="sample-superimposed">
        <h3>示例超级置顶组件</h3>
        <p>这是示例插件在超级置顶窗口中的内容</p>
      </div>
    `
  },

  // 桌面层窗口组件
  desktopComponent: {
    template: `
      <div class="sample-desktop">
        <h3>示例桌面层组件</h3>
        <p>这是示例插件在桌面层窗口中的内容</p>
      </div>
    `
  },

  // 设置项
  settingItem: {
    title: '示例插件设置',
    component: {
      template: `
        <div class="sample-settings">
          <h3>示例插件设置</h3>
          <p>这是示例插件的设置内容</p>
          <div>
            <label>
              <input type="checkbox" v-model="enabled" />
              启用示例功能
            </label>
          </div>
          <div>
            <label>
              配置选项:
              <input type="text" v-model="option" placeholder="输入配置值" />
            </label>
          </div>
          <div style="margin-top: 10px;">
            <p>启用状态: {{ enabled }}</p>
            <p>配置值: {{ option }}</p>
          </div>
        </div>
      `,
      data() {
        return {
          enabled: true,
          option: ''
        }
      }
    }
  }
}