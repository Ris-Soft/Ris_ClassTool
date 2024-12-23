// ————「初始化变量」————————————————————————————————————————————————————————————————————————————

// 模块引用
const { app, BrowserWindow, screen, ipcMain, Tray, Menu, Notification } = require('electron'); // Electron模块
const path = require('path'); // 路径拼接模块
const fs = require('fs'); // 文件读取模块
const { spawn, exec } = require('child_process'); // 进程执行模块
const http = require('http'); // HTTP模块
const https = require('https'); // HTTPS模块
const { windowManager } = require('node-window-manager');

// 常量定义
const host = "https://app.3r60.top/webProject/Ris_ClassTool/"; // 带有/结尾
const isDev = !app.isPackaged;
const configDataPath = 'D:\\Ris_ClassToolConfig.json'; // 配置文件路径
const defaultConfig = {
    posName: "北京",
    countShow: false,
    countTime: "6.7",
    timeTable: {
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
    courseTable: {
        Monday: ["数", "英", "物", "化", "生", "历", "地", "体", "音", "美", "信", "通"],
        Tuesday: ["语", "数", "英", "物", "化", "生", "历", "地", "体", "音", "美", "信"],
        Wednesday: ["数", "英", "物", "化", "生", "历", "地", "体", "音", "美", "信", "通"],
        Thursday: ["语", "数", "英", "物", "化", "生", "历", "地", "体", "音", "美", "信"],
        Friday: ["数", "英", "物", "化", "生", "历", "地", "体", "音", "美", "信", "通"],
        Saturday: ["数", "英", "物", "化", "生", "历", "地", "体", "音", "美", "信", "通"],
        Sunday: ["自", "自", "自", "自", "自", "自", "自", "自", "自", "自", "自", "自"]
    },
    linePos: [1, 4, 9],
    insiderPreview: false,
    students: [{ name: "", activeDate: "" }],
    autoQuit: false,
    autoPowerOffB: false,
    progressColor: "",
    scheduleFontSize: "",
    infoFontSize: "",
    progressHeight: "",
    countText: "",
    sideBarBottom: ""
};  // 默认配置内容
const colorToNumber = {
    black: 1,
    red: 3,
    orange: 4,
    green: 7,
    blue: 8,
}

// 菜单定义
const contextMenu = Menu.buildFromTemplate([
    {
        label: '暂停自动任务', submenu: [
            { label: '10分钟', click: () => { autoAction_StopTime = formatTime(new Date(), false) + (10 * 60) } },
            { label: '30分钟', click: () => { autoAction_StopTime = formatTime(new Date(), false) + (30 * 60) } },
            { label: '1小时', click: () => { autoAction_StopTime = formatTime(new Date(), false) + (60 * 60) } },
            { label: '5小时', click: () => { autoAction_StopTime = formatTime(new Date(), false) + (5 * 60 * 60) } },
            { label: '12小时', click: () => { autoAction_StopTime = formatTime(new Date(), false) + (12 * 60 * 60) } }
        ]
    },
    { type: "separator" },
    {
        label: '随机点名', click: () => {
            if (config.insiderPreview) {
                checkWebsite('https://app.3r60.top/webProject/Ris_ClassTool/check.html', 'Successful', (result) => {
                    if (result) {
                        createWindow(host + 'apps/random.html', false, false, true);
                    }
                });
            } else {
                createWindow(path.join(__dirname, './src/apps/random.html'), true, false, true);
            }
        }
    },
    { label: '在线工具', click: () => createWindow('https\:\/\/edu.3r60.top/?id=tools', false) },
    { label: '程序设置', click: () => createWindow_Setting() },
    { label: '退出应用', click: () => { app.quit(); } }
]);

// 全局变量
var config = defaultConfig;
var config_Processed = changeCourseProcessing(config);
var temp1 = 0;
var autoAction = { Text: '非法操作！', ActionID: 3 };
var autoAction_StopTime = 0;
var lastActivityTime = Date.now();

// ————「程序载入函数」——————————————————————————————————————————————————————————————————————————

function init() {

    // 单实例锁
    if (!app.requestSingleInstanceLock()) app.quit();

    // 设置自启动
    if (!isDev) {
        app.setLoginItemSettings({
            openAtLogin: true,
            openAsHidden: false,
            path: process.execPath,
            args: ["--openAsHidden"],
        })
    };

    // 配置读取
    try {
        var configData = fs.readFileSync(configDataPath, 'utf-8');
        config = JSON.parse(configData);
    } catch (error) {
        if (error.code === 'ENOENT') {
            fs.writeFileSync(configDataPath, JSON.stringify(defaultConfig, null, 2), 'utf-8');
        } else {
            alert("配置载入失败，即将打开设置");
            createSetWindow();
            return;
        }
    }

    if (config.cloudUrl) {
        https.get(config.cloudUrl, (resp) => {
            let data = '';
            resp.on('data', (chunk) => {
                data += chunk;
            });

            resp.on('end', () => {
                try {
                    let cloudConfig = JSON.parse(data);
                    config = cloudConfig;
                    fs.writeFileSync(configDataPath, JSON.stringify(config, null, 2), 'utf-8');
                } catch (error) {
                    alert("云配置解析失败");
                }
            });

        }).on("error", (err) => {
            console.log("请求云配置失败: " + err.message);
        });
    }

    config['version'] = app.getVersion(); // 动态写入程序版本
    config_Processed = changeCourseProcessing(config);


    delete defaultConfig; // 释放变量

    // 创建托盘
    var iconPath = path.join(__dirname, 'logo.png');
    var tray = new Tray(iconPath);
    tray.setToolTip('瑞思课堂工具');
    tray.setContextMenu(contextMenu);


    // 载入窗口
    createWindow_DesktopLayer();
    createWindow_TopLayer();
    createWindow_SideBar();

    // 处理参数
    handleCommand(process.argv.slice(2));
} // 载入函数
function handleCommand(commandLine) {
    if (commandLine && commandLine.length > 1) {
        if (commandLine[0] === "setting") {
            createWindow_Setting(commandLine[1]);
        }
    }
} // 命令行处理

// ————「窗口创建」——————————————————————————————————————————————————————————————————
let settingsWindow = null;
var settingsWindow_targetPage = null;
let scheduleWindow = null;
let PptHelper = null;
let IntervalId_PPTH = null;
let processWindow = null;
let sidebarWindow_isExpanded = null;

function createWindow(url, local, fullScreen = false, StMode = false) {
    url = url.replaceAll("\\", "/");
    BrowserWindow.getAllWindows().forEach(win => {
        if (win.webContents.getURL() == url || win.webContents.getURL() == 'file:///' + path.join(__dirname, url).replaceAll("\\", "/")) {
            win.webContents.focus();
            temp1 = 1;
        }
    });
    if (temp1 == 1) {
        temp1 = 0
        return;
    }
    Menu.setApplicationMenu(null);
    const targetWindow = new BrowserWindow({
        width: StMode ? 420 : 1366,
        height: StMode ? 400 : 768,
        frame: !fullScreen,
        titleBarOverlay: !fullScreen ? {
            color: "#fff",
            symbolColor: "black"
        } : 'hidden',
        useContentSize: true,
        titleBarStyle: 'hidden',
        resizable: true,
        transparent: fullScreen,
        movable: !fullScreen,
        alwaysOnTop: fullScreen || local,
        skipTaskbar: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    });

    targetWindow.setFullScreen(fullScreen);
    targetWindow.setAlwaysOnTop(fullScreen || StMode, 'screen-saver');

    if (local) {
        targetWindow.loadFile(url);
    } else {
        targetWindow.loadURL(url);
    }
    targetWindow.show();

    // targetWindow.webContents.openDevTools({mode:'detach'})

} // 自由窗口
function createWindow_Setting(targetPage) {
    if (settingsWindow && !settingsWindow.isDestroyed()) {
        settingsWindow.focus();
        return;
    }

    settingsWindow = new BrowserWindow({
        width: 980,
        height: 611,
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
        type: 'desktop',
        skipTaskbar: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    });

    settingsWindow_targetPage = targetPage;

    if (config.insiderPreview) {
        checkWebsite('https://app.3r60.top/webProject/Ris_ClassTool/check.html', 'Successful', (result) => {
            if (result) {
                settingsWindow.loadURL(host + 'set.html');
            }
        });
    } else {
        settingsWindow.loadFile(path.join(__dirname, './src/set.html'));
    }

    //settingsWindow.loadFile(path.join(__dirname, './src/set.html'));

    settingsWindow.on('closed', () => {
        settingsWindow = null;
    });
}// 设置
function createWindow_DesktopLayer() {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;
    const winHeight = height;
    //const winY = Math.round(height * 0.01);

    scheduleWindow = new BrowserWindow({
        x: 0,
        y: 0,
        width: width,
        height: winHeight,
        frame: false,
        resizable: false,
        movable: false,
        skipTaskbar: true,
        transparent: true,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    });

    scheduleWindow.setIgnoreMouseEvents(true); // 全局穿透
    if (config.insiderPreview) {
        checkWebsite('https://app.3r60.top/webProject/Ris_ClassTool/check.html', 'Successful', (result) => {
            if (result) {
                scheduleWindow.loadURL(host + 'index.html');
            }
        });
    } else {
        scheduleWindow.loadFile(path.join(__dirname, './src/index.html'));
    }

    if (config.desktopLayer ?? true) {
        scheduleWindow.show();
    } else {
        scheduleWindow.hide();
    }

    scheduleWindow.setVisibleOnAllWorkspaces(true);

    scheduleWindow.webContents.openDevTools({mode:'detach'})
}// 桌面层
function createWindow_TopLayer() {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;
    const winHeight = 100;

    processWindow = new BrowserWindow({
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
        focusable: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    });

    processWindow.setIgnoreMouseEvents(true); // 全局穿透
    if (config.insiderPreview) {
        checkWebsite('https://app.3r60.top/webProject/Ris_ClassTool/check.html', 'Successful', (result) => {
            if (result) {
                processWindow.loadURL(host + 'process.html');
            }
        });
    } else {
        processWindow.loadFile(path.join(__dirname, './src/process.html'));
    }

    //processWindow.loadFile('./src/process.html');
    processWindow.show();

    processWindow.setAlwaysOnTop(true, 'dock')

    processWindow.setVisibleOnAllWorkspaces(true);

    let currentPeriod = null;
    let currentCourse = null;
    let startTime = null;
    let endTime = null;
    let intervalId = null;

    function updateProgress() {

        // 执行功能函数
        autoAction_Basic();

        const now = new Date();
        const currentTime = formatTime(now, false);
        if (autoAction_StopTime && autoAction_StopTime > currentTime) return;

        // 检查当前是否在上课时间
        let inClass = false;
        let nextPeriodStart = null;
        let nextPeriod = 0;

        for (let period in config.timeTable) {
            const [startStr, endStr] = config.timeTable[period].split('-');
            const start = parseInt(startStr.split(':')[0]) * 3600 + parseInt(startStr.split(':')[1]) * 60;
            const end = parseInt(endStr.split(':')[0]) * 3600 + parseInt(endStr.split(':')[1]) * 60;

            if (currentTime >= start && currentTime < end) {
                inClass = true;
                currentPeriod = period;
                currentCourse = config.courseTable[new Date().toLocaleDateString('en-US', { weekday: 'long' }).slice(0, 1).toUpperCase() + new Date().toLocaleDateString('en-US', { weekday: 'long' }).slice(1).toLowerCase()][parseInt(period) - 1];
                startTime = start;
                endTime = end;
                nextPeriod = parseInt(period) + 1;
                break;
            } else if (currentTime < start) {
                if (!nextPeriodStart || start < nextPeriodStart) {
                    nextPeriodStart = start;
                    nextPeriod = period;
                    if (endTime === null) {
                        endTime = currentTime;
                    }
                }
            }
        }

        // 更新状态窗口
        if (inClass) {
            // 下课前1秒
            const timeToClassEnd = endTime - currentTime;
            const minutesToEnd = Math.floor(timeToClassEnd / 60);
            const secondsToEnd = timeToClassEnd % 60;
            if (minutesToEnd == 0 && secondsToEnd == 1) {
                const nextClass = config.courseTable[new Date().toLocaleDateString('en-US', { weekday: 'long' }).slice(0, 1).toUpperCase() + new Date().toLocaleDateString('en-US', { weekday: 'long' }).slice(1).toLowerCase()][parseInt(nextPeriod) - 1];
                if (nextClass === "-") {
                    autoActionFunction(6);
                }
            }
        } else {
            if (nextPeriodStart) {
                const timeToNextClass = nextPeriodStart - currentTime;
                const minutes = Math.floor(timeToNextClass / 60);
                const seconds = timeToNextClass % 60;
                const lastClass = config.courseTable[new Date().toLocaleDateString('en-US', { weekday: 'long' }).slice(0, 1).toUpperCase() + new Date().toLocaleDateString('en-US', { weekday: 'long' }).slice(1).toLowerCase()][parseInt(nextPeriod) - 2];
                const nextClass = config.courseTable[new Date().toLocaleDateString('en-US', { weekday: 'long' }).slice(0, 1).toUpperCase() + new Date().toLocaleDateString('en-US', { weekday: 'long' }).slice(1).toLowerCase()][parseInt(nextPeriod) - 1];
                if (minutes == 5 && seconds == 0 && lastClass !== nextClass) { // 300秒
                    autoActionFunction(1);
                }
                if (minutes == 0 && seconds == 1 && nextClass == "自") {
                    autoActionFunction(5);
                }
                if (minutes == 0 && seconds == 1 && nextClass == "体") {
                    autoActionFunction(5);
                }
            } else {
                autoActionFunction(2);
                //clearInterval(intervalId);
            }
        }
    }

    // 初始更新
    updateProgress();

    // 每 1 秒更新一次进度
    if (intervalId) {
        clearInterval(intervalId);
    }
    intervalId = setInterval(updateProgress, 1000);

     //processWindow.webContents.openDevTools({ mode: 'detach' })
}// 置顶层
function createWindow_SideBar() {
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

    sidebarWindow.setAlwaysOnTop(true, 'tool');

    if (config.insiderPreview) {
        checkWebsite('https://app.3r60.top/webProject/Ris_ClassTool/check.html', 'Successful', (result) => {
            if (result) {
                sidebarWindow.loadURL(host + 'sidebar.html');
            }
        });
    } else {
        sidebarWindow.loadFile(path.join(__dirname, './src/sidebar.html'));
    }

    //sidebarWindow.loadFile('./src/sidebar.html');

    sidebarWindow.setVisibleOnAllWorkspaces(true)

    ipcMain.on('toggle-expand', (event, arg) => {
        if (sidebarWindow_isExpanded) {
            sidebarWindow.setContentSize(initialWidth, initialHeight);
            sidebarWindow.setPosition(x, y);
            sidebarWindow.setAlwaysOnTop(true, "tool");
        } else {
            sidebarWindow.setContentSize(expandedWidth, expandedHeight);
            sidebarWindow.setPosition(width - expandedWidth, height - (expandedHeight / 2) - (config.sideBarBottom || 200));
            sidebarWindow.setAlwaysOnTop(true, "tool");
        }
        sidebarWindow_isExpanded = !sidebarWindow_isExpanded;
    });

    //sidebarWindow.webContents.openDevTools({ mode: 'detach' })

}// 侧边栏
function createWindow_PptHelper() {
    if (PptHelper && !PptHelper.isDestroyed()) {
        return;
    }

    const { width, height } = screen.getPrimaryDisplay().workAreaSize;

    PptHelper = new BrowserWindow({
        x: 0,
        y: 0,
        width: width,
        height: height,
        frame: false,
        resizable: false,
        movable: false,
        skipTaskbar: true,
        transparent: true,
        focusable: false,
        fullscreen: true,
        backgroundThrottling: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    });

    PptHelper.setAlwaysOnTop(true, "pop-up-menu");
    PptHelper.setIgnoreMouseEvents(true, { forward: true })
    PptHelper.loadFile(path.join(__dirname, './src/apps/pptHelper.html'));

    PptHelper.show();

    PptHelper.setVisibleOnAllWorkspaces(true);


    processWindow.show = false;
    PptHelper.on("close", () => {
        processWindow.show = true;
    });
}


// ————「功能函数」——————————————————————————————————————————————————————————————————

let pptWindow = null;
let pptWindow_Save = null;

function checkWebsite(url, expectedContent, callback) { // 连通性检查
    const protocol = url.startsWith('https') ? https : http;
    const options = {
        hostname: new URL(url).hostname,
        path: new URL(url).pathname,
        method: 'GET',
    };

    protocol.get(options, (res) => {
        let data = '';

        // 监听数据事件，收集响应数据
        res.on('data', (chunk) => {
            data += chunk;
        });

        // 监听结束事件，处理响应数据
        res.on('end', () => {
            const statusCode = res.statusCode;
            const contentType = res.headers['contents-type'];
            const containsExpectedContent = data.includes(expectedContent);

            // 检查状态码和内容
            if (statusCode === 200 && containsExpectedContent) {
                callback(true);
            } else {
                callback(false);
            }
        });
    }).on('error', (err) => {
        callback(false);
    });
}
function changeCourseProcessing(targetConfig) { // 换课调整
    //return targetConfig;
    let tempConfig = targetConfig;
    let today = new Date();
    let tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    function formatDate(date) {
        return [date.getMonth() + 1, date.getDate()].join('.');
    }
    function getWeekday(date) {
        return date.toLocaleDateString('en-US', { weekday: 'long' }).charAt(0).toUpperCase() +
            date.toLocaleDateString('en-US', { weekday: 'long' }).slice(1).toLowerCase();
    }
    if (tempConfig.plans) {
        for (let key in tempConfig.plans) {
            let switchConfig = tempConfig.plans[key];
            if (switchConfig.date === formatDate(today)) {
                tempConfig.courseTable[getWeekday(today)] = switchConfig.courses;
            } else if (switchConfig.date === formatDate(tomorrow)) {
                tempConfig.courseTable[getWeekday(tomorrow)] = switchConfig.courses;
            }
        }
    }

    return tempConfig;
}
function saveConfig(event, newConfig) { // 配置保存
    config = {
        ...config,
        ...newConfig
    };
    config_Processed = changeCourseProcessing(config);
    fs.writeFile(configDataPath, JSON.stringify(config), err => {
        if (err) throw err;
        const windows = BrowserWindow.getAllWindows();
        windows.forEach(win => {
            if (win.webContents.getURL().endsWith('index.html')) {
                win.webContents.send('config_deliver', config_Processed);
                if (config.desktopLayer ?? true) {
                    scheduleWindow.show();
                } else {
                    scheduleWindow.hide();
                }
            } else if (win.webContents.getURL().endsWith('process.html')) {
                win.webContents.send('config_deliver', config_Processed);
            } else if (win.webContents.getURL().endsWith('pptHelper.html')) {
                win.webContents.send('config_deliver', config_Processed);
                if (config.pptHelper ?? true) {
                    PptHelper.show();
                } else {
                    PptHelper.close();
                }
            }

            if (!sidebarWindow.isDestroyed()) {
                if (config.sideBarShow ?? true) {
                    sidebarWindow.show();
                } else {
                    sidebarWindow.hide();
                }
            } else if (config.sideBarShow ?? true) {
                createWindow_SideBar()
            }
        });
    });
}
function internalFunction(functionCategory, functionName, args1, args2) {
    console.log(functionCategory, functionName, args1, args2);
    if (functionName == "desktop") scheduleWindow.setAlwaysOnTop(true, "screen-saver");
    const args = [functionCategory, functionName, args1, args2];
    const appPath = isDev ? './' : process.resourcesPath;
    const exePath = path.join(appPath, 'scripts', 'RisClassTool_Function.exe');
    spawn(exePath, args);
    if (functionName == "desktop") setTimeout(() => {
        scheduleWindow.setAlwaysOnTop(false);
    }, 5000);
}
function autoActionGUI(args) {
    autoAction = args;
    if (config.insiderPreview) {
        checkWebsite('https://app.3r60.top/webProject/Ris_ClassTool/check.html', 'Successful', (result) => {
            if (result) {
                createWindow(host + 'apps/autoQuit.html', false, true);
            }
        });
    } else {
        createWindow(path.join(__dirname, './src/apps/autoQuit.html'), true, true);
    }
    const windows = BrowserWindow.getAllWindows();
    windows.forEach(win => {
        if (win.webContents.getURL().endsWith('examMode.html')) {
            win.close();
        }
    });
}
function autoActionFunction(args) {
    // 1->还有5min上课  2->最后一节课放学时间到 3->返回桌面 4->关机
    if (args == 1 && (config.autoQuit ?? false)) {
        autoActionGUI({ Text: '剩余5分钟上课，即将自动返回到桌面', ActionID: 3 });
    } else if (args == 2 && (config.autoPowerOff ?? false)) {
        autoActionGUI({ Text: '放学时间到，即将关闭计算机', ActionID: 4 });
    } else if (args == 3) {
        internalFunction("keydown", "plugin", "27", "0");
        internalFunction("keydown", "desktop");
    } else if (args == 4) {
        // 关机
        spawn('shutdown', ['/s', '/t', '0']);
    } else if (args == 5 && (config.autoFocusMode ?? false)) {
        // 专注模式
        if (config.insiderPreview) {
            checkWebsite('https://app.3r60.top/webProject/Ris_ClassTool/check.html', 'Successful', (result) => {
                if (result) {
                    createWindow(host + 'apps/examMode.html', false, true);
                }
            });
        } else {
            createWindow(path.join(__dirname, './src/apps/examMode.html'), true, true);
        }
    } else if (args == 6 && (config.autoPowerOffB ?? false)) {
        autoActionGUI({ Text: '提示：即将关闭计算机', ActionID: 4 });
    }
    console.log(args);
}
function formatTime(dateTarget, doNotUseOffset) {
    const response = dateTarget.getHours() * 3600 + dateTarget.getMinutes() * 60 + dateTarget.getSeconds() + (doNotUseOffset ? 0 : (config.timeOffset || 0));
    return response;// 加入偏移量
}
function autoAction_Basic() {
    if (config.pptHelper ?? true) {
        const activeWindow = windowManager.getActiveWindow();
        //processWindow.webContents.send('debug_deliver', activeWindow.getTitle());
        if (activeWindow && activeWindow.getTitle().includes('PowerPoint 幻灯片放映')) {
            pptWindow = activeWindow;
            createWindow_PptHelper();
        } else if (PptHelper && !PptHelper.isDestroyed() && activeWindow && activeWindow.getTitle() !== "") {
            PptHelper.close();
        }

        if (activeWindow && activeWindow.getTitle().includes('Microsoft PowerPoint') && pptWindow.isWindow()) {
            pptWindow = activeWindow;
            activeWindow.bringToTop();
            internalFunction("keydown", "plugin", "13", "0");
        }
    }


}

let activeTimeouts = [];

function delayExecution(func, delay) {
    const timeoutId = setTimeout(func, delay);
    activeTimeouts.push(timeoutId);
    return timeoutId;
}

function clearActiveTimeouts() {
    activeTimeouts.forEach(id => clearTimeout(id));
    activeTimeouts = [];
}

var status = null;

function PPTHelper(functionName, args) {
    if (!PPTHelper) return;
    if (functionName !== "exit") clearActiveTimeouts();
    pptWindow.bringToTop();
    switch (functionName) {
        case 'FOCUS':
            PptHelper.setIgnoreMouseEvents(false);
            processWindow.focus();
            break;
        case 'UNFOCUS':
            PptHelper.setIgnoreMouseEvents(true, { forward: true });
            processWindow.focus();
            break;
        case 'changeColor':
            const times = colorToNumber[args];
            if (times) {
                const executeKeyPress = (keyCode) => {
                    internalFunction("keydown", "plugin", keyCode, "0");
                };

                executeKeyPress("93");
                delayExecution(() => executeKeyPress("79"), 25) // 'O' key for opening menu
                delayExecution(() => executeKeyPress("67"), 50); // 'C' key for color

                for (let i = 0; i < times; i++) {
                    delayExecution(() => executeKeyPress("39"), 75 + i * 30); // Right arrow key
                }

                delayExecution(() => internalFunction("keydown", "plugin", "13", "0"), 75 + times * 30 + 20); // Enter key
            } else {
                console.log(`颜色不存在："${args}"`);
            }
            break;
        case 'prev':
            internalFunction("keydown", "plugin", "33", "0"); // Left arrow
            break;
        case 'next':
            internalFunction("keydown", "plugin", "34", "0"); // Right arrow
            break;
        case 'grid':
            status = functionName;
            internalFunction("keydown", "plugin", "93", "0");
            delayExecution(() => internalFunction("keydown", "plugin", "65", "0"), 50);
            break;
        case 'exit':
            internalFunction("keydown", "plugin", "27", "0"); // Esc key
            if (status != "annotate" || status != null) delayExecution(() => internalFunction("keydown", "plugin", "27", "0"), 50);
            break;
        case 'select':
            status = functionName;
            internalFunction("keydown", "plugin", "17", "65"); // Ctrl + A
            internalFunction("keydown", "plugin", "17", "65"); // Ctrl + A
            break;
        case 'annotate':
            status = functionName;
            internalFunction("keydown", "plugin", "17", "65"); // Ctrl + A
            delayExecution(() => internalFunction("keydown", "plugin", "17", "80"), 50); // Ctrl + P
            delayExecution(() => internalFunction("keydown", "plugin", "17", "65"), 70); // Ctrl + A
            delayExecution(() => internalFunction("keydown", "plugin", "17", "80"), 80); // Ctrl + P
            break;
        case 'erase':
            status = functionName;
            internalFunction("keydown", "plugin", "17", "65"); // Ctrl + A
            delayExecution(() => internalFunction("keydown", "plugin", "17", "69"), 50); // Ctrl + E
            delayExecution(() => internalFunction("keydown", "plugin", "17", "65"), 70); // Ctrl + A
            delayExecution(() => internalFunction("keydown", "plugin", "17", "69"), 80); // Ctrl + P
            break;
        default:
            console.log('未知功能');
    }
}



// ————「事件定义」——————————————————————————————————————————————————————————————————
ipcMain.handle('getConfig', (event, process) => { // 主动获取配置
    let tempConfig = JSON.parse(JSON.stringify(config)); // 创建config的深拷贝
    if (process === true) {
        tempConfig = config_Processed;
    }
    return tempConfig;
}); // 获取配置
ipcMain.handle('temp_autoAction', (event) => { // 主动获取配置
    return autoAction;
}); // 自动任务配置获取
ipcMain.handle('settingPage', (event) => { // 主动获取配置
    return settingsWindow_targetPage;
}); // 设置默认页面设定
ipcMain.on('function_Keydown', (event, functionName, args1, args2) => { // 执行ahk->exe脚本
    internalFunction("keydown", functionName, args1, args2);
}); // 键盘事件请求
ipcMain.on('function_autoAction', (event, args) => { // 自动执行
    autoActionFunction(args);
}); // 自动任务请求
ipcMain.on('function_showExplorer', (event, args) => { // 打开资源管理器
    spawn('explorer.exe');
}); // 打开文件管理器请求
ipcMain.on('createLink', (event, linkName) => { // 创建快捷方式
    spawn('explorer.exe');
}); // 创建快捷方式请求
ipcMain.on('webview_create', (event, url, local, fullScreen, StMode) => { // 创建灵活窗口
    createWindow(url, local, fullScreen, StMode);
}); // 创建窗口请求
ipcMain.on('config_save', saveConfig); // 配置保存请求
ipcMain.on('function_PPTHelper', (event, functionName, args) => {
    PPTHelper(functionName, args);
});
app.on('second-instance', (event, commandLine, workingDirectory) => {
    handleCommand(commandLine)
}); // 二次启动事件
app.on('ready', init); // 载入事件 