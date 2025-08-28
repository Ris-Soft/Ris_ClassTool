// 项目页面JavaScript功能

function openCalculator(titleBarStyle = 'custom') {
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

function showAbout(titleBarStyle = 'custom') {
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
  // 使用插件上下文中的 UI 消息功能
  try {
    window.electronAPI.plugin.executeAction('example-calculator', 'showMessage', {
      type,
      content: message,
      duration: 3
    });
  } catch (error) {
    console.error('调用消息组件失败:', error);
  }
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