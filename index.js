const { app, BrowserWindow, screen, ipcMain, Tray, Menu } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn, exec } = require('child_process');

// 禁用硬件加速
app.disableHardwareAcceleration();

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

// 释放变量
delete defaultConfig;


// 创建托盘
function createTray() {
    const iconPath = path.join(__dirname, 'logo.png');
    const tray = new Tray(iconPath);

    const contextMenu = Menu.buildFromTemplate([
        {
            label: '随机点名',
            click: () => createWebViewWindow('./src/apps/random.html',true)
        },
        {
            label: '在线工具',
            click: () => createWebViewWindow('https\:\/\/edu.3r60.top/?id=tools',false)
        },
        {
            label: '程序设置',
            click: () => createSetWindow()
        },
        {
            label: '退出应用',
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
    if (!(config.sideBarShow ?? true)) return;
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;
    const initialWidth = 25;
    const initialHeight = 60;
    const expandedWidth = 300;
    const expandedHeight = 80;
    const x = width - initialWidth;
    const y = height - initialHeight - (config.sideBarBottom || 200);

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

    sidebarWindow.setVisibleOnAllWorkspaces(true)

    ipcMain.on('toggle-expand', (event, arg) => {
        if (sidebarWindow_isExpanded) {
            sidebarWindow.setContentSize(initialWidth, initialHeight);
            sidebarWindow.setPosition(x, y);
            sidebarWindow.setAlwaysOnTop(true, "screen-saver");
        } else {
            sidebarWindow.setContentSize(expandedWidth, expandedHeight);
            sidebarWindow.setPosition(width - expandedWidth, height - (expandedHeight / 2) - (config.sideBarBottom || 200));
            sidebarWindow.setAlwaysOnTop(true, "screen-saver");
        }
        sidebarWindow_isExpanded = !sidebarWindow_isExpanded;
    });


    ipcMain.on('function_vKeydown', (event, args) => {
        // 执行ahk->exe脚本
        const appPath = process.resourcesPath;
        const exePath = path.join(appPath, 'scripts', 'RisClassTool_KeyDown.exe');
        spawn(exePath, args);
    });

    ipcMain.on('function_showExplorer', (event, args) => {
        // 打开资源管理器
        spawn('explorer.exe');
    });
}


let settingsWindow = null;

// 创建WebView窗口
function createWebViewWindow(url, local) {
    Menu.setApplicationMenu(null);

    const targetWindow = new BrowserWindow({
        width: local ? 420 : 1366,
        height: local ? 400 : 768,
        alwaysOnTop: local,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            contextIsolation: true
        }
    });

    if (local) {
        targetWindow.loadFile(path.join(__dirname, url));
    } else {
        targetWindow.loadURL(url);
    }

    // 添加关闭监听器以确保在窗口关闭时移除事件处理程序
    targetWindow.on('closed', () => {
        // 移除事件处理程序
        ipcMain.removeListener('config_reciveGetRequest', sendConfigHandler);
    });

    // 检查并移除已存在的事件处理程序，然后添加新的
    ipcMain.removeListener('config_reciveGetRequest', sendConfigHandler);
    ipcMain.on('config_reciveGetRequest', sendConfigHandler);

    targetWindow.show();
}

// 定义事件处理函数
function sendConfigHandler(event) {
    event.sender.send('config_deliver', changeCourseProcessing(config));
}

ipcMain.on('webview_create', (event, url, local) => {
    createWebViewWindow(url, local);
});

ipcMain.on('function_autoQuit', (event) => {
    createWebViewWindow('./src/apps/autoQuit.html', true);
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
            nodeIntegration: false,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    settingsWindow.loadFile(path.join(__dirname, './src/set.html'));

    ipcMain.on('config_reciveGetRequest', (event) => {
        settingsWindow.webContents.send('config_deliver', config);
    });

    // 监听关闭事件，以便在窗口关闭时将 settingsWindow 设置为 null
    settingsWindow.on('closed', () => {
        settingsWindow = null;
    });
}

// 创建课程表窗口
function createScheduleWindow() {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;
    const winHeight = 100;
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
            nodeIntegration: false,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    scheduleWindow.setIgnoreMouseEvents(true); // 全局穿透
    scheduleWindow.loadFile(path.join(__dirname, './src/index.html'));

    scheduleWindow.show();

    scheduleWindow.setVisibleOnAllWorkspaces(true);

    scheduleWindow.on('minimize', (event) => {
        event.preventDefault(); // 阻止默认的最小化行为
        if (scheduleWindow.isMinimized()) {
            scheduleWindow.restore(); // 恢复窗口
        }
        scheduleWindow.setAlwaysOnTop(true);
    });

    ipcMain.on('config_reciveGetRequest', (event) => {
        scheduleWindow.webContents.send('config_deliver', changeCourseProcessing(config));
    });

    // scheduleWindow.webContents.openDevTools({mode:'detach'})
}

// 创建全局进度条窗口
function createProcessWindow() {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;
    // const winHeight = Math.round(height * 0.0025);
    const winHeight = 100;

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
            nodeIntegration: false,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    processWindow.setIgnoreMouseEvents(true); // 全局穿透
    processWindow.loadFile('./src/process.html');
    processWindow.show();

    processWindow.setVisibleOnAllWorkspaces(true);

    // 发送课程信息到渲染进程
    ipcMain.on('config_reciveGetRequest', (event) => {
        processWindow.webContents.send('config_deliver', changeCourseProcessing(config));
    });

    // processWindow.webContents.openDevTools({ mode: 'detach' })
}

function changeCourseProcessing(config) {
    // 获取今天的日期
    let today = new Date();
    let tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1); // 明天的日期

    function formatDate(date) {
        return [date.getMonth() + 1, date.getDate()].join('.');
    }

    function getWeekday(date) {
        // 获取星期几
        return date.toLocaleDateString('en-US', { weekday: 'long' }).charAt(0).toUpperCase() +
            date.toLocaleDateString('en-US', { weekday: 'long' }).slice(1).toLowerCase();
    }

    // 处理换课逻辑
    if (config.plans) {
        for (let key in config.plans) {
            let switchConfig = config.plans[key];
            if (switchConfig.date === formatDate(today)) {
                // 如果是今天换课
                config.courseTable[getWeekday(today)] = switchConfig.courses;
            } else if (switchConfig.date === formatDate(tomorrow)) {
                // 如果是明天换课
                config.courseTable[getWeekday(tomorrow)] = switchConfig.courses;
            }
        }
    }

    return config;
}

// 请求单实例锁
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
    app.quit();
} else {
    app.on('ready', () => {
        createTray();
        createsidebarWindow();
        createScheduleWindow();
        createProcessWindow();

        app.on('activate', () => {
            if (BrowserWindow.getAllWindows().length === 0) {
                createsidebarWindow();
                createScheduleWindow();
                createProcessWindow();
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
        ipcMain.on('config_save', (event, newConfig) => {
            // 将新配置写入文件

            config = {
                ...config,
                ...newConfig
            };

            fs.writeFile(configDataPath, JSON.stringify(config), err => {
                if (err) throw err;
                console.log('配置已保存！');

                // 刷新课程表和进度条窗口
                const windows = BrowserWindow.getAllWindows();
                windows.forEach(win => {
                    if (win.webContents.getURL().endsWith('index.html') || win.webContents.getURL().endsWith('process.html')) {
                        win.webContents.send('config_deliver', changeCourseProcessing(config));
                    }
                });
            });
        });
    });
}


// PowerPoint辅助-AI生成
// 暂未完成