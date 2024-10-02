const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    onScheduleData: (callback) => {
        ipcRenderer.on('schedule-data', (event, data) => callback(data));
    },
    saveConfig: (newConfig) => {
        ipcRenderer.send('save-config', newConfig);
    }
});