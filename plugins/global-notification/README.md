# 全局通知插件

全局通知插件为整个应用提供统一的通知服务，支持系统通知和自定义通知两种形式。

## 功能特性

### 系统通知
- 支持AntDesign图标
- 支持主标题和副标题
- 可配置显示位置（左、中、右）
- 支持点击回调
- 自动消失时间可配置

### 自定义通知
- 支持HTML内容
- 三个显示区域（左、中、右）
- 队列管理（内侧/外侧添加）
- 支持JavaScript和CSS
- 内容隔离和安全沙盒

### 通知管理
- 通知历史记录
- 实时内容更新
- 批量管理
- 样式配置

## API 接口

### 创建系统通知
```javascript
const notificationId = await globalNotification.createSystemNotification({
  pluginId: 'your-plugin-id',
  iconName: 'NotificationOutlined',
  title: '通知标题',
  subtitle: '副标题（可选）',
  duration: 5000, // 毫秒，0表示不自动消失
  onClick: () => {
    // 点击回调函数
  }
});
```

### 创建自定义通知
```javascript
const notificationId = await globalNotification.createCustomNotification({
  pluginId: 'your-plugin-id',
  notificationId: 'unique-id',
  position: 'center', // left, center, right
  insertMode: 'append', // append, prepend, left, right
  content: '<div>HTML内容</div>',
  duration: 0 // 0表示不自动消失
});
```

### 更新通知内容
```javascript
await globalNotification.updateNotification(notificationId, newContent);
```

### 移除通知
```javascript
await globalNotification.removeNotification(notificationId);
```

### 获取通知历史
```javascript
const history = globalNotification.getNotificationHistory(pluginId);
```

## 设置配置

### 外观设置
- 背景颜色和透明度
- 边框颜色和透明度
- 默认字体大小

### 系统通知设置
- 显示位置配置
- 默认持续时间

### 通知历史
- 历史记录查看
- 按插件分组显示
- 清空历史功能

## 使用示例

### 基础用法
```javascript
// 在插件中使用全局通知
class YourPlugin {
  async initialize(context) {
    // 获取全局通知插件
    this.globalNotification = await context.api.getPlugin('global-notification');
    
    // 创建欢迎通知
    await this.globalNotification.createSystemNotification({
      pluginId: 'your-plugin',
      iconName: 'CheckCircleOutlined',
      title: '插件已启动',
      subtitle: '所有功能正常',
      duration: 3000
    });
  }
}
```

### 进度通知
```javascript
async function showProgress() {
  const steps = ['初始化', '加载数据', '处理中', '完成'];
  
  for (let i = 0; i < steps.length; i++) {
    const progress = Math.round((i + 1) / steps.length * 100);
    
    if (i === steps.length - 1) {
      await globalNotification.createSystemNotification({
        pluginId: 'progress-demo',
        iconName: 'CheckCircleOutlined',
        title: steps[i],
        subtitle: `进度: ${progress}%`,
        duration: 3000
      });
    } else {
      await globalNotification.createSystemNotification({
        pluginId: 'progress-demo',
        iconName: 'LoadingOutlined',
        title: steps[i],
        subtitle: `进度: ${progress}%`,
        duration: 1000
      });
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}
```

### 自定义横幅
```javascript
// 创建状态横幅
await globalNotification.createCustomNotification({
  pluginId: 'status-banner',
  notificationId: 'system-status',
  position: 'center',
  insertMode: 'append',
  content: `
    <div style="padding: 8px 16px; background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%); 
                color: white; border-radius: 6px; text-align: center;">
      <strong>✅ 系统运行正常</strong>
      <div style="font-size: 12px; opacity: 0.9;">所有服务正常运行</div>
    </div>
  `,
  duration: 0 // 持续显示
});
```

## 依赖要求

- 需要在插件清单中声明对全局通知插件的依赖：

```json
{
  "dependencies": [
    {
      "id": "global-notification",
      "version": "^1.0.0"
    }
  ]
}
```

## 权限要求

全局通知插件需要以下权限：
- `window` - 创建通知窗口
- `storage` - 保存设置和历史
- `notification` - 通知功能
- `ui` - 界面交互
- `system` - 系统级操作

## 注意事项

1. **性能考虑**：避免创建过多的活动通知，建议同时显示的通知数量不超过10个
2. **内容安全**：自定义通知的HTML内容会在沙盒环境中运行，但仍需注意内容安全
3. **样式兼容**：自定义通知的CSS样式应避免影响全局样式
4. **通知ID**：自定义通知的ID必须在插件内唯一，建议使用插件前缀
5. **资源清理**：插件卸载时应清理相关通知

## 故障排除

### 通知不显示
1. 检查全局通知插件是否已启用
2. 确认插件依赖配置正确
3. 查看控制台错误信息

### 样式异常
1. 检查HTML内容格式
2. 确认CSS样式语法正确
3. 避免使用全局样式选择器

### 性能问题
1. 减少同时显示的通知数量
2. 设置合适的自动消失时间
3. 定期清理历史记录