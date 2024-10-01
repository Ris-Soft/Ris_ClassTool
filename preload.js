const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    onScheduleData: (callback) => {
        ipcRenderer.on('schedule-data', (event, data) => callback(data));
    }
});