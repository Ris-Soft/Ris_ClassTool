const { app, BrowserWindow, screen, ipcMain, Tray, Menu } = require('electron');
const path = require('path');
const fs = require('fs');

// 默认配置数据
const defaultConfig = {
    "posName": "北京",
    "countShow": false,
    "countTime": "6.7",
    "timeTable": {
        "1": "06:40-07:45",
        "2": "08:00-08:45",
        "3": "08:55-09:40",
        "4": "10:10-10:55",
        "5": "11:05-11:50",
        "6": "14:00-14:45",
        "7": "14:55-15:40",
        "8": "15:55-16:40",
        "9": "16:50-17:30",
        "10": "18:40-19:50",
        "11": "20:00-20:50",
        "12": "21:00-21:40"
    },
    "courseTable": {
        "Monday": ["数", "英", "物", "化", "生", "历", "地", "体", "音", "美", "信", "通"],
        "Tuesday": ["语", "数", "英", "物", "化", "生", "历", "地", "体", "音", "美", "信"],
        "Wednesday": ["数", "英", "物", "化", "生", "历", "地", "体", "音", "美", "信", "通"],
        "Thursday": ["语", "数", "英", "物", "化", "生", "历", "地", "体", "音", "美", "信"],
        "Friday": ["数", "英", "物", "化", "生", "历", "地", "体", "音", "美", "信", "通"],
        "Saturday": ["数", "英", "物", "化", "生", "历", "地", "体", "音", "美", "信", "通"],
        "Sunday": ["自", "自", "自", "自", "自", "自", "自", "自", "自", "自", "自", "自"]
    },
    "linePos": [1, 4, 9]
};

// 配置文件路径
let configDataPath = 'D:\\Ris_ClassToolConfig.json';

// 读取课程表数据
try {
    // 尝试读取指定路径下的 config.json
    const configData = fs.readFileSync(configDataPath, 'utf-8');
    var config = JSON.parse(configData);
} catch (error) {
    if (error.code === 'ENOENT') {
        // 如果文件不存在，写入默认配置
        fs.writeFileSync(configDataPath, JSON.stringify(defaultConfig, null, 2), 'utf-8');
        var config = defaultConfig;
    } else {
        alert("配置读取失败，即将打开设置");
        createSetWindow();
        return;
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
            label: '退出程序',
            click: () => {
                app.quit();
            }
        }
    ]);

    tray.setToolTip('瑞思课堂工具');
    tray.setContextMenu(contextMenu);
}

let sidebarWindow;
let sidebarWindow_isExpanded = false;

function createsidebarWindow() {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;
    const initialWidth = 25;
    const initialHeight = 60;
    const expandedWidth = 300;
    const expandedHeight = 60;
    const x = width - initialWidth;
    const y = height - initialHeight - 200;

    sidebarWindow = new BrowserWindow({
        width: initialWidth,
        height: initialHeight,
        x,
        y,
        frame: false,
        alwaysOnTop: true,
        transparent: true,
        skipTaskbar: true,
        resizable: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
        }
    });

    sidebarWindow.loadFile('./src/sidebar.html');

    sidebarWindow.webContents.on('did-finish-load', () => {
        sidebarWindow.webContents.send('initial-state', sidebarWindow_isExpanded);
    });

    ipcMain.on('toggle-expand', (event, arg) => {
        if (sidebarWindow_isExpanded) {
            sidebarWindow.setContentSize(initialWidth, initialHeight);
            sidebarWindow.setPosition(x, y);
        } else {
            sidebarWindow.setContentSize(expandedWidth, expandedHeight);
            sidebarWindow.setPosition(width - expandedWidth, height - expandedHeight - 200);
        }
        sidebarWindow_isExpanded = !sidebarWindow_isExpanded;
        sidebarWindow.webContents.send('update-state', sidebarWindow_isExpanded);
    });
}


let settingsWindow = null;

// 创建WebView窗口
function createWebViewWindow(url, local) {
    Menu.setApplicationMenu(null)
    const targetWindow = new BrowserWindow({
      width: local ? 400 : 1366,
      height: local ? 400 :768,
      alwaysOnTop : local,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        nodeIntegration: true,
        contextIsolation: true
      }
    });
  
    if (local) {
      targetWindow.loadFile(path.join(__dirname, url)).then(() => {
        targetWindow.webContents.send('schedule-data', config);
      });
    } else {
      targetWindow.loadURL(url);
    }
  
    targetWindow.show();
  }
  
ipcMain.on('set-webview-url', (event, url, local) => {
    createWebViewWindow(url, local);
});


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
            createsidebarWindow();
            createScheduleWindow();
            createProcessWindow();
        }, 2000);

        app.on('activate', () => {
            if (BrowserWindow.getAllWindows().length === 0) {
                setTimeout(() => {
                    createsidebarWindow();
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

                config = newConfig;

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