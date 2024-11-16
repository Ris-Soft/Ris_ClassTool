const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    // 配置传递
    config_onRecive: (callback) => {
        ipcRenderer.on('config_deliver', (event, data) => callback(data));
    },
    config_Get: () => {
        return new Promise((resolve, reject) => {
            ipcRenderer.invoke('getConfig').then(resolve).catch(reject);
        });
    },
    config_autoAction: () => {
        return new Promise((resolve, reject) => {
            ipcRenderer.invoke('temp_autoAction').then(resolve).catch(reject);
        });
    },

    // 设置界面保存
    config_save: (config) => {
        ipcRenderer.send('config_save', config);
    },

    // 侧边栏
    sideBar_expand: () => ipcRenderer.send('toggle-expand'),

    // 功能区
    function_vKeydown: (args) => ipcRenderer.send('function_vKeydown', args),
    function_showExplorer: () => ipcRenderer.send('function_showExplorer'),
    function_autoAction: (args) => ipcRenderer.send('function_autoAction', args),

    // WebView
    webview_create: (url, local, fullScreen) => {
        ipcRenderer.send('webview_create', url, local, fullScreen);
    },

    openFile: (filePath, mode) => ipcRenderer.send('open-file', filePath, mode)
});