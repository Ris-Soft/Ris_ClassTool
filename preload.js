const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    // 通用配置传递
    config_onRecive: (callback) => {
        ipcRenderer.on('config_deliver', (event, data) => callback(data));
    },
    config_sendRequest: () => {
        ipcRenderer.send('config_reciveGetRequest');
    },

    // 设置界面保存
    config_save: (config) => {
        ipcRenderer.send('config_save', config);
    },

    // WebView
    webview_create: (url, local) => {
        ipcRenderer.send('webview_create', url, local);
    },

    // 侧边栏
    sideBar_expand: () => ipcRenderer.send('toggle-expand'),

    function_vKeydown: (args) => ipcRenderer.send('function_vKeydown', args),
    function_showExplorer: () => ipcRenderer.send('function_showExplorer'),
    function_autoQuit: (backend = false) => {
        if (backend) {
            ipcRenderer.send('function_autoQuit')
        } else {
            ipcRenderer.send('function_autoQuit_backend')
        }
    },

    openFile: (filePath, mode) => ipcRenderer.send('open-file', filePath, mode)
});