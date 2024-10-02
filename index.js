const { app, BrowserWindow, screen, ipcMain, Tray, Menu } = require('electron');
const path = require('path');
const fs = require('fs');

// 读取课程表数据
let configDataPath = 'D:\\Ris_ClassToolConfig.json';

try {
    // 尝试读取当前工作目录下的 config.json
    const configData = fs.readFileSync(configDataPath, 'utf-8');
    var config = JSON.parse(configData);
} catch (error) {
    if (error.code === 'ENOENT') {
        // 如果文件不存在，尝试从 __dirname 下读取 config.json
        configDataPath = path.join(__dirname, './config.json');
        try {
            const configData = fs.readFileSync(configDataPath, 'utf-8');
            const config = JSON.parse(configData);
        } catch (innerError) {
            alert("配置为空，即将打开设置");
            createSetWindow();
        }
    } else {
        alert("配置为空，即将打开设置");
        createSetWindow();
    }
}

// 创建托盘
function createTray() {
    const iconPath = path.join(__dirname, 'logo.png');
    const tray = new Tray(iconPath);

    const contextMenu = Menu.buildFromTemplate([
        {
            label: '打开设置',
            click: () => createSetWindow()
        },
        {
            label: '退出',
            click: () => {
                app.quit();
            }
        }
    ]);

    tray.setToolTip('瑞思课堂工具');
    tray.setContextMenu(contextMenu);
}

let settingsWindow = null;

// 创建设置窗口
function createSetWindow() {
    if (settingsWindow && !settingsWindow.isDestroyed()) {
        // 如果设置窗口已存在且未被销毁，则将其聚焦
        settingsWindow.focus();
        return;
    }

    settingsWindow = new BrowserWindow({
        width: 1366,
        height: 768,
        frame: true,
        titleBarOverlay: {
            color: "#fff",
            symbolColor: "black"
        },
        useContentSize: true,
        titleBarStyle: 'hidden',
        resizable: true,
        movable: true,
        alwaysOnTop: false,
        skipTaskbar: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    });

    settingsWindow.loadFile(path.join(__dirname, './src/set.html')).then(() => {
        settingsWindow.webContents.send('schedule-data', config);
    });

    // 监听关闭事件，以便在窗口关闭时将 settingsWindow 设置为 null
    settingsWindow.on('closed', () => {
        settingsWindow = null;
    });
}

// 创建课程表窗口
function createScheduleWindow() {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;
    const winHeight = Math.round(height * 0.041);
    const winY = Math.round(height * 0.01);

    const scheduleWindow = new BrowserWindow({
        x: 0,
        y: winY,
        width: width,
        height: winHeight,
        frame: false,
        resizable: false,
        movable: false,
        alwaysOnTop: false,
        skipTaskbar: true,
        transparent: true,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    });

    scheduleWindow.setIgnoreMouseEvents(true); // 全局穿透
    scheduleWindow.loadFile(path.join(__dirname, './src/index.html'));
    scheduleWindow.show();

    scheduleWindow.setVisibleOnAllWorkspaces(true);

    // 发送课程信息到渲染进程
    scheduleWindow.webContents.send('schedule-data', config);
    // scheduleWindow.webContents.openDevTools({mode:'detach'})
}

// 创建全局进度条窗口
function createProcessWindow() {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;
    const winHeight = Math.round(height * 0.0025);

    const processWindow = new BrowserWindow({
        x: 0,
        y: 0,
        width: width,
        height: winHeight,
        maxHeight: winHeight,
        frame: false,
        resizable: false,
        movable: false,
        alwaysOnTop: true,
        transparent: true,
        skipTaskbar: true,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    });

    processWindow.setIgnoreMouseEvents(true); // 全局穿透
    processWindow.loadFile('./src/process.html');
    processWindow.show();

    processWindow.setVisibleOnAllWorkspaces(true);

    // 发送课程信息到渲染进程
    processWindow.webContents.send('schedule-data', config);
}

// 请求单实例锁
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
    app.quit();
} else {
    app.on('ready', () => {
        createTray();
        setTimeout(() => {
            createScheduleWindow();
            createProcessWindow();
        }, 2000);

        app.on('activate', () => {
            if (BrowserWindow.getAllWindows().length === 0) {
                setTimeout(() => {
                    createScheduleWindow();
                    createProcessWindow();
                }, 2000);
            }
        });

        if (app.isPackaged) {
            app.setLoginItemSettings({
                openAtLogin: true,
                openAsHidden: false,
                path: process.execPath,
                args: ["--openAsHidden"],
            })
        }

        // 监听保存配置的事件
        ipcMain.on('save-config', (event, newConfig) => {
            // 将新配置写入文件
            fs.writeFile(configDataPath, JSON.stringify(newConfig), err => {
                if (err) throw err;
                console.log('配置已保存！');

                // 刷新课程表和进度条窗口
                const windows = BrowserWindow.getAllWindows();
                windows.forEach(win => {
                    if (win.webContents.getURL().endsWith('index.html') || win.webContents.getURL().endsWith('process.html')) {
                        win.webContents.send('schedule-data', newConfig);
                    }
                });
            });
        });
    });
}