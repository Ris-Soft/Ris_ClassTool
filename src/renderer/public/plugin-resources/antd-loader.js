// Ant Design 加载器
// 此脚本用于在插件中加载 Ant Design 组件和图标

(function() {
  // 全局变量，用于存储组件和图标
  window.AntDesign = {};
  window.AntIcons = {};
  
  // 检查是否已经加载了React和ReactDOM
  if (!window.React || !window.ReactDOM) {
    console.error('Ant Design 加载失败: React 或 ReactDOM 未加载');
    return;
  }
  
  // 从主进程获取可用的图标列表
  async function loadIconList() {
    try {
      if (window.electronAPI && window.electronAPI.antd) {
        const iconNames = await window.electronAPI.antd.getIconNames();
        window.AntIcons.availableIcons = iconNames;
        console.log(`已加载 ${iconNames.length} 个图标名称`);
        
        // 触发图标列表加载完成事件
        const event = new CustomEvent('anticons-loaded', { detail: { iconNames } });
        document.dispatchEvent(event);
      }
    } catch (error) {
      console.error('加载图标列表失败:', error);
    }
  }
  
  // 创建图标组件
  function createIconComponent(iconName) {
    // 这里我们创建一个简单的span元素来模拟图标
    // 在实际应用中，你可能需要使用SVG或其他方式来显示图标
    return function IconComponent(props) {
      const { style = {}, className = '', ...restProps } = props;
      
      const iconStyle = {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...style
      };
      
      return React.createElement(
        'span',
        {
          className: `anticon anticon-${iconName.toLowerCase()} ${className}`,
          style: iconStyle,
          ...restProps
        },
        iconName.replace(/([A-Z])/g, ' $1').trim()
      );
    };
  }
  
  // 初始化Ant Design组件
  function initAntDesign() {
    // 基本组件
    window.AntDesign.Button = function Button(props) {
      const { children, type = 'default', onClick, style = {}, className = '', ...restProps } = props;
      
      // 根据类型确定样式
      let buttonStyle = { ...style };
      let buttonClass = 'ant-btn';
      
      switch (type) {
        case 'primary':
          buttonClass += ' ant-btn-primary';
          break;
        case 'dashed':
          buttonClass += ' ant-btn-dashed';
          break;
        case 'link':
          buttonClass += ' ant-btn-link';
          break;
        case 'text':
          buttonClass += ' ant-btn-text';
          break;
        default:
          buttonClass += ' ant-btn-default';
      }
      
      if (className) {
        buttonClass += ` ${className}`;
      }
      
      return React.createElement(
        'button',
        {
          className: buttonClass,
          style: buttonStyle,
          onClick: onClick,
          ...restProps
        },
        children
      );
    };
    
    // 更多组件可以在这里添加...
    
    console.log('Ant Design 基本组件已初始化');
  }
  
  // 初始化图标
  function initAntIcons() {
    // 创建一个代理对象，当访问不存在的图标时自动创建
    window.AntIcons = new Proxy({}, {
      get: function(target, prop) {
        // 如果属性已经存在，直接返回
        if (prop in target) {
          return target[prop];
        }
        
        // 对于特殊属性，返回undefined
        if (prop === 'then' || prop === 'catch' || prop === 'finally') {
          return undefined;
        }
        
        // 创建图标组件
        const iconComponent = createIconComponent(prop);
        target[prop] = iconComponent;
        return iconComponent;
      }
    });
    
    console.log('Ant Icons 代理已初始化');
  }
  
  // 主函数
  function init() {
    // 初始化组件和图标
    initAntDesign();
    initAntIcons();
    
    // 加载图标列表
    loadIconList();
    
    // 触发加载完成事件
    const event = new CustomEvent('antd-ready');
    document.dispatchEvent(event);
    
    console.log('Ant Design 加载器初始化完成');
  }
  
  // 执行初始化
  init();
})();