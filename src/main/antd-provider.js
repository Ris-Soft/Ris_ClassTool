const path = require('path');
const fs = require('fs-extra');

/**
 * Ant Design资源提供模块
 * 用于向插件提供Ant Design组件和图标
 */
class AntDesignProvider {
  constructor() {
    // 渲染进程中Ant Design的路径
    this.antdPath = path.join(process.cwd(), 'src/renderer/node_modules/antd');
    this.iconsPath = path.join(process.cwd(), 'src/renderer/node_modules/@ant-design/icons');
    
    // 缓存所有图标名称
    this.iconNames = [];
    this.loadIconNames();
  }

  /**
   * 加载所有可用的图标名称
   */
  loadIconNames() {
    try {
      // 检查图标模块是否存在
      if (fs.existsSync(this.iconsPath)) {
        // 读取es/icons目录下的所有文件
        const iconsDir = path.join(this.iconsPath, 'es/icons');
        if (fs.existsSync(iconsDir)) {
          const files = fs.readdirSync(iconsDir);
          
          // 过滤出JS文件并提取图标名称
          this.iconNames = files
            .filter(file => file.endsWith('.js') && !file.includes('index'))
            .map(file => file.replace('.js', ''));
          
          console.log(`已加载 ${this.iconNames.length} 个Ant Design图标`);
        }
      }
    } catch (error) {
      console.error('加载Ant Design图标失败:', error);
    }
  }

  /**
   * 获取所有可用的图标名称
   * @returns {string[]} 图标名称数组
   */
  getIconNames() {
    return this.iconNames;
  }

  /**
   * 检查图标是否存在
   * @param {string} iconName 图标名称
   * @returns {boolean} 是否存在
   */
  hasIcon(iconName) {
    return this.iconNames.includes(iconName);
  }

  /**
   * 生成注入到插件HTML中的脚本
   * @returns {string} 注入脚本
   */
  generateInjectionScript() {
    return `
      <script>
        // 动态加载Ant Design组件和图标
        (function() {
          // 创建一个加载脚本的函数
          function loadScript(src, callback) {
            const script = document.createElement('script');
            script.src = src;
            script.onload = callback;
            script.onerror = (err) => {
              console.error('加载脚本失败:', src, err);
            };
            document.head.appendChild(script);
          }
          
          // 加载React和ReactDOM
          loadScript('antd://js/react.production.min.js', function() {
            loadScript('antd://js/react-dom.production.min.js', function() {
              // 加载Ant Design
              loadScript('antd://js/antd.min.js', function() {
                // 加载图标
                loadScript('antd://js/icons.min.js', function() {
                  // 设置全局变量
                  window.antd = window.antd || {};
                  window.icons = window.icons || {};
                  
                  console.log('Ant Design组件和图标已成功加载');
                  
                  // 触发自定义事件，通知应用Ant Design已加载完成
                  const event = new CustomEvent('antd-loaded');
                  document.dispatchEvent(event);
                });
              });
            });
          });
        })();
      </script>
    `;
  }

  /**
   * 生成Ant Design样式链接
   * @returns {string} 样式链接HTML
   */
  generateStyleLink() {
    return `
      <link rel="stylesheet" href="antd://css/antd.min.css">
      <style>
        /* 确保图标正确显示的基础样式 */
        .anticon {
          display: inline-block;
          color: inherit;
          font-style: normal;
          line-height: 0;
          text-align: center;
          text-transform: none;
          vertical-align: -0.125em;
          text-rendering: optimizeLegibility;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        
        .anticon svg {
          display: inline-block;
        }
      </style>
    `;
  }
}

module.exports = new AntDesignProvider();