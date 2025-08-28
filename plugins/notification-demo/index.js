const path = require('path');
const fs = require('fs').promises;

module.exports = {
    async init(ctx) {
        console.log('通知示例插件初始化');
    },

    async createSuccessNotification() {
        try {
            const globalNotification = require('../global-notification/index.js');
            const id = await globalNotification.createSystemNotification({
                iconName: 'CheckCircleOutlined',
                title: '操作成功',
                subtitle: '数据已保存',
                pluginId: 'notification-demo'
            });
            console.log('创建成功通知:', id);
            return { success: true, id };
        } catch (error) {
            console.error('创建成功通知失败:', error);
            return { success: false, error: error.message };
        }
    },

    async createInfoNotification() {
        try {
            const globalNotification = require('../global-notification/index.js');
            const id = await globalNotification.createSystemNotification({
                iconName: 'InfoCircleOutlined',
                title: '信息提示',
                subtitle: '这是一条信息通知',
                pluginId: 'notification-demo'
            });
            console.log('创建信息通知:', id);
            return { success: true, id };
        } catch (error) {
            console.error('创建信息通知失败:', error);
            return { success: false, error: error.message };
        }
    },

    async createWarningNotification() {
        try {
            const globalNotification = require('../global-notification/index.js');
            const id = await globalNotification.createSystemNotification({
                iconName: 'ExclamationCircleOutlined',
                title: '警告',
                subtitle: '请检查输入内容',
                pluginId: 'notification-demo'
            });
            console.log('创建警告通知:', id);
            return { success: true, id };
        } catch (error) {
            console.error('创建警告通知失败:', error);
            return { success: false, error: error.message };
        }
    },

    async createErrorNotification() {
        try {
            const globalNotification = require('../global-notification/index.js');
            const id = await globalNotification.createSystemNotification({
                iconName: 'CloseCircleOutlined',
                title: '错误',
                pluginId: 'notification-demo'
            });
            console.log('创建错误通知:', id);
            return { success: true, id };
        } catch (error) {
            console.error('创建错误通知失败:', error);
            return { success: false, error: error.message };
        }
    },

    async createCustomNotification() {
        try {
            const globalNotification = require('../global-notification/index.js');
            const notificationId = `custom_${Date.now()}`;
            
            const content = `
                <div style="
                    background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 8px 16px;
                    border-radius: 6px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 12px;
                    animation: bounce-in 0.5s ease-out;
                ">
                    <span>🎉</span>
                    <span>自定义通知内容</span>
                    <button onclick="this.parentElement.parentElement.remove()" style="
                        background: rgba(255,255,255,0.2);
                        border: none;
                        color: white;
                        padding: 2px 6px;
                        border-radius: 3px;
                        cursor: pointer;
                        font-size: 10px;
                    ">×</button>
                </div>
            `;
            
            await globalNotification.createCustomNotification({
                notificationId,
                position: 'center',
                insertMode: 'append',
                content,
                pluginId: 'notification-demo'
            });
            
            console.log('创建自定义通知:', notificationId);
            return { success: true, id: notificationId };
        } catch (error) {
            console.error('创建自定义通知失败:', error);
            return { success: false, error: error.message };
        }
    },

    async createCustomBanner(params) {
        try {
            const { position = 'center', content = '横幅内容', insertMode = 'append' } = params || {};
            const globalNotification = require('../global-notification/index.js');
            const notificationId = `banner_${position}_${Date.now()}`;
            
            // 使用简洁的内容，让通知窗口的统一样式生效
            const bannerContent = `
                <div style="
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 12px;
                    width: 100%;
                ">
                    <span>📢</span>
                    <span>${content}</span>
                </div>
            `;
            
            await globalNotification.createCustomNotification({
                notificationId,
                position,
                insertMode,
                content: bannerContent,
                pluginId: 'notification-demo'
            });
            
            console.log(`创建${position}横幅:`, notificationId);
            return { success: true, id: notificationId };
        } catch (error) {
            console.error('创建横幅失败:', error);
            return { success: false, error: error.message };
        }
    },

    async clearDemoNotifications() {
        try {
            const globalNotification = require('../global-notification/index.js');
            const activeNotifications = await globalNotification.getActiveNotifications();
            
            let cleared = 0;
            
            // 清除系统通知
            for (const notification of activeNotifications.system) {
                if (notification.pluginId === 'notification-demo') {
                    await globalNotification.removeNotification({ notificationId: notification.id });
                    cleared++;
                }
            }
            
            // 清除自定义通知
            for (const position of ['left', 'center', 'right']) {
                for (const notification of activeNotifications.custom[position]) {
                    if (notification.pluginId === 'notification-demo') {
                        await globalNotification.removeNotification({ notificationId: notification.id });
                        cleared++;
                    }
                }
            }
            
            console.log(`清除了 ${cleared} 个演示通知`);
            return { success: true, cleared };
        } catch (error) {
            console.error('清除演示通知失败:', error);
            return { success: false, error: error.message };
        }
    },

    async renderDemo() {
        const demoHtmlPath = path.join(__dirname, 'demo.html');
        try {
            const content = await fs.readFile(demoHtmlPath, 'utf8');
            return content;
        } catch (error) {
            console.error('读取演示页面失败:', error);
            return '<div>加载失败</div>';
        }
    },

    async renderProject() {
        const demoHtmlPath = path.join(__dirname, 'demo.html');
        try {
            const content = await fs.readFile(demoHtmlPath, 'utf8');
            return content;
        } catch (error) {
            console.error('读取项目页面失败:', error);
            return '<div>加载失败</div>';
        }
    }
};