import { app, ipcMain, BrowserWindow, Tray, Menu, nativeImage, shell } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'

let mainWindow = null
let superimposedWindow = null
let desktopWindow = null
let settingsWindow = null
let tray = null

function createWindow() {
  // 创建主浏览器窗口
  mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    frame: false, // 隐藏默认边框
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url).then()
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']).then()
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html')).then()
  }
}

function createSuperimposedWindow() {
  // 如果窗口已存在，则显示它
  if (superimposedWindow) {
    superimposedWindow.show()
    return
  }

  // 创建超级置顶窗口
  superimposedWindow = new BrowserWindow({
    width: 400,
    height: 300,
    show: false,
    autoHideMenuBar: true,
    frame: false, // 隐藏默认边框
    alwaysOnTop: true, // 置顶显示
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  superimposedWindow.on('ready-to-show', () => {
    superimposedWindow.show()
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    superimposedWindow.loadURL(process.env['ELECTRON_RENDERER_URL'] + '#/superimposed').then()
  } else {
    superimposedWindow.loadFile(join(__dirname, '../renderer/index.html'), { hash: '#/superimposed' }).then()
  }
  
  superimposedWindow.on('closed', () => {
    superimposedWindow = null
  })
}

function createDesktopWindow() {
  // 如果窗口已存在，则显示它
  if (desktopWindow) {
    desktopWindow.show()
    return
  }

  // 创建桌面层窗口
  desktopWindow = new BrowserWindow({
    width: 400,
    height: 300,
    show: false,
    autoHideMenuBar: true,
    frame: false, // 隐藏默认边框
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  desktopWindow.on('ready-to-show', () => {
    desktopWindow.show()
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    desktopWindow.loadURL(process.env['ELECTRON_RENDERER_URL'] + '#/desktop').then()
  } else {
    desktopWindow.loadFile(join(__dirname, '../renderer/index.html'), { hash: '#/desktop' }).then()
  }
  
  desktopWindow.on('closed', () => {
    desktopWindow = null
  })
}

function createSettingsWindow() {
  // 如果窗口已存在，则显示它
  if (settingsWindow) {
    settingsWindow.show()
    return
  }

  // 创建设置窗口
  settingsWindow = new BrowserWindow({
    width: 800,
    height: 600,
    show: false,
    autoHideMenuBar: true,
    frame: false, // 隐藏默认边框
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  settingsWindow.on('ready-to-show', () => {
    settingsWindow.show()
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    settingsWindow.loadURL(process.env['ELECTRON_RENDERER_URL'] + '#/settings').then()
  } else {
    settingsWindow.loadFile(join(__dirname, '../renderer/index.html'), { hash: '#/settings' }).then()
  }
  
  settingsWindow.on('closed', () => {
    settingsWindow = null
  })
}

function createTray() {
  // 创建系统托盘
  const iconPath = join(__dirname, '../../resources/tray-icon.png') // 需要准备图标文件
  let trayIcon

  try {
    trayIcon = nativeImage.createFromPath(iconPath)
  } catch {
    // 如果图标文件不存在，创建一个简单的图标
    trayIcon = nativeImage.createEmpty()
  }

  tray = new Tray(trayIcon)
  const contextMenu = Menu.buildFromTemplate([
    {
      label: '打开主程序',
      click: () => {
        if (mainWindow) {
          mainWindow.show()
        } else {
          createWindow()
        }
      }
    },
    {
      label: '超级置顶窗口',
      click: () => {
        createSuperimposedWindow()
      }
    },
    {
      label: '桌面层窗口',
      click: () => {
        createDesktopWindow()
      }
    },
    {
      label: '程序设置',
      click: () => {
        createSettingsWindow()
      }
    },
    { type: 'separator' },
    {
      label: '退出',
      click: () => {
        app.quit()
      }
    }
  ])

  tray.setContextMenu(contextMenu)
  tray.setToolTip('课堂辅助程序')

  tray.on('click', () => {
    if (mainWindow) {
      mainWindow.show()
    } else {
      createWindow()
    }
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()
  createTray()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// 处理窗口控制的IPC消息
ipcMain.on('window-minimize', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender)
  if (win) {
    win.minimize()
  }
})

ipcMain.on('window-maximize', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender)
  if (win) {
    if (win.isMaximized()) {
      win.unmaximize()
    } else {
      win.maximize()
    }
  }
})

ipcMain.on('window-close', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender)
  if (win) {
    win.close()
  }
})

// 处理创建窗口的IPC消息
ipcMain.on('create-superimposed-window', () => {
  createSuperimposedWindow()
})

ipcMain.on('create-desktop-window', () => {
  createDesktopWindow()
})

ipcMain.on('open-settings', () => {
  createSettingsWindow()
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.