// 项目页面JavaScript功能

function openCalculator(titleBarStyle = 'system') {
  console.log('openCalculator 被调用，titleBarStyle:', titleBarStyle);
  if (window.pluginActions && window.pluginActions.openCalculator) {
    console.log('使用 pluginActions 调用，参数:', { titleBarStyle: titleBarStyle });
    window.pluginActions.openCalculator({ titleBarStyle: titleBarStyle });
  } else {
    try {
      console.log('发送参数到插件:', { titleBarStyle: titleBarStyle });
      window.electronAPI.plugin.executeAction('example-calculator', 'openProject', {
        titleBarStyle: titleBarStyle
      });
    } catch (error) {
      showNotification('打开计算器失败: ' + (error.message || '未知错误'), 'error');
    }
  }
}

function showAbout(titleBarStyle = 'system') {
  console.log('showAbout 被调用，titleBarStyle:', titleBarStyle);
  if (window.pluginActions && window.pluginActions.showAbout) {
    console.log('使用 pluginActions 调用，参数:', { titleBarStyle: titleBarStyle });
    window.pluginActions.showAbout({ titleBarStyle: titleBarStyle });
  } else {
    try {
      window.electronAPI.plugin.executeAction('example-calculator', 'showAbout', {
        titleBarStyle: titleBarStyle
      });
    } catch (error) {
      showNotification('显示关于信息失败: ' + (error.message || '未知错误'), 'error');
    }
  }
}

// 新增：不同标题栏样式的演示函数
function openCalculatorWithSystemTitleBar() {
  openCalculator('system');
  showNotification('使用系统标题栏打开计算器', 'info');
}

function openCalculatorWithCustomTitleBar() {
  openCalculator('custom');
  showNotification('使用自定义标题栏打开计算器', 'info');
}

function openCalculatorWithoutTitleBar() {
  openCalculator('none');
  showNotification('无标题栏模式打开计算器', 'info');
}

function showAboutWithCustomTitleBar() {
  showAbout('custom');
  showNotification('使用自定义标题栏显示关于页面', 'info');
}

async function createShortcut() {
  try {
    if (window.electronAPI && window.electronAPI.shortcut) {
      const result = await window.electronAPI.shortcut.create({
        name: '计算器',
        pluginId: 'example-calculator',
        action: 'openProject',
        params: {},
        icon: 'calculator'
      });
      
      if (result.success) {
        showNotification('桌面快捷方式创建成功！', 'success');
      } else {
        showNotification('创建失败：' + (result.error || '未知错误'), 'error');
      }
    } else {
      showNotification('快捷方式功能不可用', 'warning');
    }
  } catch (error) {
    showNotification('创建失败：' + error.message, 'error');
  }
}

// 显示通知 - 统一的Ant Design风格
function showNotification(message, type = 'info') {
  // 检查是否已存在通知容器
  let container = document.getElementById('ant-message-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'ant-message-container';
    container.style.cssText = `
      position: fixed;
      top: 24px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 1010;
      pointer-events: none;
      display: flex;
      flex-direction: column;
      align-items: center;
    `;
    document.body.appendChild(container);
  }
  
  // 创建通知元素 - 模仿Ant Design message样式
  const notification = document.createElement('div');
  notification.style.cssText = `
    background: #1f1f1f;
    border: 1px solid #333333;
    border-radius: 6px;
    padding: 10px 16px;
    margin-bottom: 8px;
    color: #ffffff;
    font-size: 14px;
    line-height: 1.5715;
    box-shadow: 0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05);
    transform: translateY(-100%);
    opacity: 0;
    transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
    pointer-events: auto;
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 200px;
    max-width: 400px;
    word-wrap: break-word;
  `;
  
  // 添加图标和设置颜色
  let icon = '';
  let iconColor = '';
  switch (type) {
    case 'success':
      icon = '✓';
      iconColor = '#52c41a';
      break;
    case 'error':
      icon = '✕';
      iconColor = '#ff4d4f';
      break;
    case 'warning':
      icon = '⚠';
      iconColor = '#faad14';
      break;
    default:
      icon = 'ℹ';
      iconColor = '#1890ff';
  }
  
  notification.innerHTML = `
    <span style="
      color: ${iconColor}; 
      font-weight: bold; 
      font-size: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 16px;
      height: 16px;
    ">${icon}</span>
    <span style="flex: 1;">${message}</span>
  `;
  
  // 添加到容器
  container.appendChild(notification);
  
  // 显示动画
  setTimeout(() => {
    notification.style.transform = 'translateY(0)';
    notification.style.opacity = '1';
  }, 50);
  
  // 自动隐藏
  setTimeout(() => {
    notification.style.transform = 'translateY(-100%)';
    notification.style.opacity = '0';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
      // 如果容器为空，移除容器
      if (container.children.length === 0) {
        container.remove();
      }
    }, 300);
  }, 3000);
}

// 页面加载完成后的初始化
document.addEventListener('DOMContentLoaded', function() {
  // 添加按钮点击效果
  const buttons = document.querySelectorAll('.action-btn');
  buttons.forEach(button => {
    button.addEventListener('mousedown', function() {
      this.style.transform = 'translateY(-1px) scale(0.98)';
    });
    
    button.addEventListener('mouseup', function() {
      this.style.transform = 'translateY(-2px) scale(1)';
    });
    
    button.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0) scale(1)';
    });
  });
  
  // 添加功能项悬停效果
  const featureItems = document.querySelectorAll('.feature-item');
  featureItems.forEach(item => {
    item.addEventListener('mouseenter', function() {
      this.style.background = '#262626';
    });
    
    item.addEventListener('mouseleave', function() {
      this.style.background = '#1f1f1f';
    });
  });
  
  console.log('计算器项目页面已加载');
});

// 键盘快捷键支持
document.addEventListener('keydown', function(event) {
  // Ctrl/Cmd + O 打开计算器
  if ((event.ctrlKey || event.metaKey) && event.key === 'o') {
    event.preventDefault();
    openCalculator();
  }
  
  // Ctrl/Cmd + I 显示关于
  if ((event.ctrlKey || event.metaKey) && event.key === 'i') {
    event.preventDefault();
    showAbout();
  }
  
  // Ctrl/Cmd + S 创建快捷方式
  if ((event.ctrlKey || event.metaKey) && event.key === 's') {
    event.preventDefault();
    createShortcut();
  }
});