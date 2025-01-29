const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    // 窗口管理
    reportVisibility: (timestamp) => ipcRenderer.send('desktoplayer-report', timestamp),
    get_reportVisibility: (callback) => {
        ipcRenderer.on('get_reportVisibility', (event, data) => callback(data));
    },
    toplayer_reportInfo: (info) => ipcRenderer.send('toplayer-report', info),
    get_toplayerInfo: (callback) => {
        ipcRenderer.on('get_toplayerInfo', (event, data) => callback(data));
    },

    // 配置传递
    config_onRecive: (callback) => {
        ipcRenderer.on('config_deliver', (event, data) => callback(data));
    },
    config_onReciveDebugInfo: (callback) => {
        ipcRenderer.on('debug_deliver', (event, data) => callback(data));
    },
    config_Get: (process) => {
        return new Promise((resolve, reject) => {
            ipcRenderer.invoke('getConfig', process).then(resolve).catch(reject);
        });
    },
    config_autoAction: () => {
        return new Promise((resolve, reject) => {
            ipcRenderer.invoke('temp_autoAction').then(resolve).catch(reject);
        });
    },

    // 设置界面
    config_settingPage: (status) => {
        ipcRenderer.send('settingPage', status);
    },
    config_save: (config) => {
        ipcRenderer.send('config_save', config);
    },
    createLink: (linkName) => {
        ipcRenderer.send('createLink', linkName);
    },

    // 侧边栏
    sideBar_expand: () => ipcRenderer.send('toggle-expand'),

    // PPT助手
    function_PPTHelper: (functionName, args) => ipcRenderer.send('function_PPTHelper', functionName, args),

    // 功能区
    function_Keydown: (functionName, args1, args2) => ipcRenderer.send('function_Keydown', functionName, args1, args2),
    function_showExplorer: () => ipcRenderer.send('function_showExplorer'),
    function_autoAction: (args) => ipcRenderer.send('function_autoAction', args),
    function_desktopIcon: () => ipcRenderer.send('function_desktopIcon'),

    // WebView
    webview_create: (url, local, fullScreen, StMode) => {
        ipcRenderer.send('webview_create', url, local, fullScreen, StMode);
    },

    openFile: (filePath, mode) => ipcRenderer.send('open-file', filePath, mode)
});

contextBridge.exposeInMainWorld('node_Api', {
    titleBarOverlay: (args) => {
        ipcRenderer.send('titleBarOverlay', args);
    }
});