const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    // 通用配置传递
    onScheduleData: (callback) => {
        ipcRenderer.on('schedule-data', (event, data) => callback(data));
    },

    // 设置界面保存
    saveConfig: (newConfig) => {
        ipcRenderer.send('save-config', newConfig);
    },

    // WebView
    loadWebView : (url, local)=> {
        ipcRenderer.send('set-webview-url', url, local);
    },

    // 侧边栏
    toggleExpand: () => ipcRenderer.send('toggle-expand'),
    onStateChange: (callback) => ipcRenderer.on('update-state', (event, isExpanded) => callback(isExpanded)),
    getInitialState: (callback) => ipcRenderer.on('initial-state', (event, isExpanded) => callback(isExpanded))
});