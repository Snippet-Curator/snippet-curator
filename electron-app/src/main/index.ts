import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import path from 'path'
import { existsSync, cpSync, readFileSync, rmSync, writeFileSync } from 'fs';
import os from 'os'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { spawn } from 'child_process'

let pocketBaseProcess
const userDataPath = app.getPath('userData')
const resourcePath = path.join(process.resourcesPath, 'db')
const pbDataPath = path.join(userDataPath, 'pb_data')
const currentVersion = app.getVersion()
const versionFile = path.join(userDataPath, '.pb_version')
const pocketbaseDevPath = join(__dirname, '..', '..', 'db', 'pocketbase')
const pocketbaseProdPath = join(process.resourcesPath, 'db', 'pocketbase')

function getIconPath() {
  const platform = os.platform();

  if (platform === 'win32') {
    return path.join(__dirname, 'resources', 'icon.ico');
  } else if (platform === 'darwin') {
    return path.join(__dirname, 'resources', 'icon.icns');
  } else {
    // Linux
    return path.join(__dirname, 'resources', 'icon.png');
  }
}

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    title: 'Recollect',
    width: 1280,
    height: 720,
    show: false,
    autoHideMenuBar: true,
    icon: getIconPath(),
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
  //   callback({
  //     responseHeaders: {
  //       ...details.responseHeaders,
  //       'Content-Security-Policy': ["default-src 'self' data: http://127.0.0.1:8090 ws://127.0.0.1:8090; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"]
  //     }
  //   });
  // });

  mainWindow.on('close', () => {
    if (pocketBaseProcess) {
      console.log('Stopping PocketBase...')
      pocketBaseProcess.kill('SIGINT')

      pocketBaseProcess.on('close', () => {
        app.quit()
      })
    }
  })

  if (is.dev) {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
    mainWindow.webContents.openDevTools()
  }
}

function copyPbFolder(requiredFolders: string[]) {
  for (const folder of requiredFolders) {
    const from = path.join(resourcePath, folder);
    const to = path.join(userDataPath, folder);
    console.log('copying: ', from, to)

    if (existsSync(from)) {
      rmSync(to, { recursive: true, force: true })
      cpSync(from, to, { recursive: true });
    }
  }
}

function checkPbVersion() {
  let storedVersion: string = '';
  const requiredFolders = ['pb_migrations', 'pb_hooks']

  const needsCopy = requiredFolders.some(folder => {
    console.log('path exists: ', path.join(userDataPath, folder), existsSync(path.join(userDataPath, folder)))
    return !existsSync(path.join(userDataPath, folder))
  })

  if (needsCopy) {
    console.log('no pb data folder found', needsCopy)
    copyPbFolder(requiredFolders)
  }

  if (!existsSync(versionFile)) {
    console.log('version file does not exist, creating new', currentVersion)
    writeFileSync(versionFile, currentVersion)
    // copyPbFolder(requiredFolders)
    return
  }

  storedVersion = readFileSync(versionFile, 'utf-8')

  console.log('check version: ', storedVersion, currentVersion)

  if (storedVersion == currentVersion) return

  copyPbFolder(requiredFolders)
  writeFileSync(versionFile, currentVersion)
}

function runPocketbase() {
  return new Promise((resolve) => {
    if (is.dev) {
      console.log('Starting Pocketbase dev...')
      console.log('Dev path: ', pocketbaseDevPath)
      pocketBaseProcess = spawn(pocketbaseDevPath, ['serve'])
    } else {
      checkPbVersion()
      console.log('Starting Pocketbase prod...')
      console.log('Production path: ', pocketbaseProdPath)
      // pocketBaseProcess = spawn(pocketbaseProdPath, ['serve'])
      pocketBaseProcess = spawn(pocketbaseProdPath, ['serve', '--dir', pbDataPath])
    }

    pocketBaseProcess.stdout.on('data', (data) => {
      const output = data.toString()
      console.log(`Pocketbase: ${output}`)

      if (output.includes('Server started')) {
        resolve(pocketBaseProcess)
      }
    })

    pocketBaseProcess.on('close', (code) => {
      console.log(`Pocketbase exited with code ${code}`)
    })

    pocketBaseProcess.on('error', (err) => {
      console.log('Failed to start Pocketbase: ', err)
    })
  })

}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(async () => {

  // run pocketbase
  try {
    await runPocketbase()
  } catch (err) {
    console.error('Failed to start Pocketbase')
    app.quit()
  }

  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Gracefully handle quitting
app.on('before-quit', () => {
  if (pocketBaseProcess) {
    console.log('Stopping PocketBase...');
    pocketBaseProcess.kill('SIGINT');
    pocketBaseProcess = null;
  }
});

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
