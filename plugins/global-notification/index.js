const path = require('path');
const fs = require('fs').promises;
const { BrowserWindow, screen } = require('electron');

let notificationWindow = null;
let isInitialized = false;
let settings = {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
    fontSize: 14,
    systemNotificationPosition: 'right'
};
let notificationHistory = [];
let activeNotifications = {
    system: [],
    custom: {
        left: [],
        center: [],
        right: []
    }
};

async function createNotificationWindow() {
    if (notificationWindow) {
        return;
    }

    try {
        const { width } = screen.getPrimaryDisplay().workAreaSize;
        
        notificationWindow = new BrowserWindow({
            width: width,
            height: 60,
            x: 0,
            y: 0,
            frame: false,
            transparent: true,
            alwaysOnTop: true,
            skipTaskbar: true,
            resizable: false,
            movable: false,
            minimizable: false,
            maximizable: false,
            closable: false,
            focusable: false,
            show: false,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
                enableRemoteModule: true,
                webSecurity: false
            }
        });

        const htmlPath = path.join(__dirname, 'components', 'notification-bar.html');
        await notificationWindow.loadFile(htmlPath);

        notificationWindow.setAlwaysOnTop(true, 'screen-saver');
        notificationWindow.setVisibleOnAllWorkspaces(true);
        notificationWindow.setIgnoreMouseEvents(true, { forward: true });
        
        // 监听通知点击和关闭事件
        const { ipcMain } = require('electron');
        ipcMain.on('notification-clicked', (event, notificationId) => {
            handleNotificationClick(notificationId);
        });
        
        ipcMain.on('notification-closed', (event, notificationId) => {
            handleNotificationClose(notificationId);
        });
        
        notificationWindow.show();
        console.log('通知窗口已创建并显示');
        
        // 发送初始数据
        updateNotificationWindow();
    } catch (error) {
        console.error('创建通知窗口失败:', error);
    }
}

function updateNotificationWindow() {
    if (notificationWindow && notificationWindow.webContents) {
        notificationWindow.webContents.send('update-notifications', {
            notifications: activeNotifications,
            settings: settings
        });
    }
}

function handleNotificationClick(notificationId) {
    console.log(`通知被点击: ${notificationId}`);
    // 可以在这里添加点击处理逻辑
}

function handleNotificationClose(notificationId) {
    // 从活动通知中移除
    activeNotifications.system = activeNotifications.system.filter(n => n.id !== notificationId);
    
    Object.keys(activeNotifications.custom).forEach(position => {
        activeNotifications.custom[position] = activeNotifications.custom[position].filter(n => n.id !== notificationId);
    });
    
    updateNotificationWindow();
    console.log(`通知已关闭: ${notificationId}`);
}

async function loadSettings() {
    try {
        const settingsPath = path.join(__dirname, 'settings.json');
        const data = await fs.readFile(settingsPath, 'utf8');
        settings = { ...settings, ...JSON.parse(data) };
    } catch (error) {
        console.log('使用默认设置');
    }
}

async function saveSettings() {
    try {
        const settingsPath = path.join(__dirname, 'settings.json');
        await fs.writeFile(settingsPath, JSON.stringify(settings, null, 2));
    } catch (error) {
        console.error('保存设置失败:', error);
    }
}

async function loadHistory() {
    try {
        const historyPath = path.join(__dirname, 'history.json');
        const data = await fs.readFile(historyPath, 'utf8');
        notificationHistory = JSON.parse(data);
    } catch (error) {
        notificationHistory = [];
    }
}

async function saveHistory() {
    try {
        const historyPath = path.join(__dirname, 'history.json');
        await fs.writeFile(historyPath, JSON.stringify(notificationHistory, null, 2));
    } catch (error) {
        console.error('保存历史记录失败:', error);
    }
}

function addToHistory(notification) {
    const historyItem = {
        id: notification.id,
        type: notification.type,
        pluginId: notification.pluginId,
        timestamp: Date.now(),
        title: notification.title || '',
        content: notification.content || ''
    };
    
    notificationHistory.unshift(historyItem);
    
    // 限制历史记录数量
    if (notificationHistory.length > 1000) {
        notificationHistory = notificationHistory.slice(0, 1000);
    }
    
    saveHistory();
}

module.exports = {
    async initialize(ctx) {
        if (isInitialized) {
            return;
        }
        
        isInitialized = true;
        console.log('全局通知插件初始化');
        
        await loadSettings();
        await loadHistory();
        await createNotificationWindow();
    },

    async createSystemNotification(params) {
        const { iconName, title, subtitle, pluginId } = params;
        const id = `system_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const notification = {
            id,
            type: 'system',
            iconName,
            title,
            subtitle,
            pluginId,
            timestamp: Date.now()
        };
        
        activeNotifications.system.push(notification);
        addToHistory(notification);
        updateNotificationWindow();
        
        console.log(`创建系统通知: ${title}`);
        return id;
    },

    async createCustomNotification(params) {
        const { notificationId, position, insertMode, content, pluginId } = params;
        
        const notification = {
            id: notificationId,
            type: 'custom',
            position: position || 'center',
            insertMode: insertMode || 'append',
            content,
            pluginId,
            timestamp: Date.now()
        };
        
        // 移除已存在的同ID通知
        if (activeNotifications.custom[notification.position]) {
            activeNotifications.custom[notification.position] = 
                activeNotifications.custom[notification.position].filter(n => n.id !== notificationId);
        }
        
        // 根据插入模式添加通知
        const targetArray = activeNotifications.custom[notification.position];
        
        switch (notification.insertMode) {
            case 'prepend':
                // 添加到最前面
                targetArray.unshift(notification);
                break;
            case 'append':
                // 添加到最后面
                targetArray.push(notification);
                break;
            case 'left':
                // 对于左右区域，left表示内侧（靠近中间）
                // 对于中间区域，left表示左边
                if (notification.position === 'center') {
                    targetArray.unshift(notification);
                } else {
                    targetArray.push(notification);
                }
                break;
            case 'right':
                // 对于左右区域，right表示外侧（远离中间）
                // 对于中间区域，right表示右边
                if (notification.position === 'center') {
                    targetArray.push(notification);
                } else {
                    targetArray.unshift(notification);
                }
                break;
            default:
                targetArray.push(notification);
        }
        
        addToHistory(notification);
        updateNotificationWindow();
        
        console.log(`创建自定义通知: ${notificationId} 在 ${position} 位置，插入模式: ${insertMode}`);
        return notificationId;
    },

    async updateNotification(params) {
        const { notificationId, content } = params;
        
        // 查找并更新自定义通知
        let found = false;
        Object.keys(activeNotifications.custom).forEach(position => {
            const notification = activeNotifications.custom[position].find(n => n.id === notificationId);
            if (notification) {
                notification.content = content;
                found = true;
            }
        });
        
        if (found) {
            updateNotificationWindow();
            console.log(`更新通知: ${notificationId}`);
        }
        
        return found;
    },

    async removeNotification(params) {
        const { notificationId } = params;
        
        // 从系统通知中移除
        activeNotifications.system = activeNotifications.system.filter(n => n.id !== notificationId);
        
        // 从自定义通知中移除
        Object.keys(activeNotifications.custom).forEach(position => {
            activeNotifications.custom[position] = 
                activeNotifications.custom[position].filter(n => n.id !== notificationId);
        });
        
        updateNotificationWindow();
        console.log(`移除通知: ${notificationId}`);
        return true;
    },

    async getSettings() {
        return { ...settings };
    },

    async updateSettings(newSettings) {
        settings = { ...settings, ...newSettings };
        await saveSettings();
        updateNotificationWindow();
        console.log('设置已更新');
        return settings;
    },

    async getHistory() {
        return [...notificationHistory];
    },

    async clearHistory() {
        notificationHistory = [];
        await saveHistory();
        console.log('历史记录已清空');
        return true;
    },

    async getActiveNotifications() {
        return {
            system: [...activeNotifications.system],
            custom: {
                left: [...activeNotifications.custom.left],
                center: [...activeNotifications.custom.center],
                right: [...activeNotifications.custom.right]
            }
        };
    },

    async renderProject() {
        const projectHtmlPath = path.join(__dirname, 'components', 'project.html');
        try {
            const content = await fs.readFile(projectHtmlPath, 'utf8');
            return content;
        } catch (error) {
            console.error('读取项目页面失败:', error);
            return '<div>加载失败</div>';
        }
    },

    async renderSettings() {
        const settingsHtmlPath = path.join(__dirname, 'components', 'settings.html');
        try {
            const content = await fs.readFile(settingsHtmlPath, 'utf8');
            return content;
        } catch (error) {
            console.error('读取设置页面失败:', error);
            return '<div>加载失败</div>';
        }
    }
};