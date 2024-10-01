const { app, BrowserWindow, screen } = require('electron');
const path = require('path');
const fs = require('fs');

// 读取课程表数据
let configDataPath = path.join(process.cwd(), './config.json');

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
            process.exit(1); // 退出程序
        }
    } else {
        process.exit(1); // 退出程序
    }
}

// 创建课程表窗口
function createScheduleWindow() {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;
    const winHeight = Math.round(height * 0.05);
    const winY = Math.round(height * 0.01);
    const winX = Math.round((width - 580) / 2);

    const scheduleWindow = new BrowserWindow({
        x: winX,
        y: winY,
        width: 580,
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
    app.on('window-all-closed', () => {
        if (process.platform !== 'darwin') app.quit();
    });

    app.on('ready', () => {
        createScheduleWindow();
        createProcessWindow();

        app.on('activate', () => {
            if (BrowserWindow.getAllWindows().length === 0) {
                createScheduleWindow();
                createProcessWindow();
            }
        });
    });
}