import os from 'os'
import { join } from 'path'
import { existsSync, cpSync, readFileSync, rmSync, writeFileSync } from 'fs';

import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { spawn } from 'child_process'
import log from 'electron-log/main'
import { autoUpdater } from 'electron-updater';

import icon from '../../resources/icon.png?asset'

let pocketBaseProcess
const userDataPath = app.getPath('userData')
const resourcePath = join(process.resourcesPath, 'db')
const pbDataPath = join(userDataPath, 'pb_data')
const currentVersion = app.getVersion()
const versionFile = join(userDataPath, '.pb_version')
const pocketbaseDevPath = join(__dirname, '..', '..', 'db', 'pocketbase')
const pocketbaseProdPath = join(process.resourcesPath, 'db', 'pocketbase')

function getIconPath() {
    const platform = os.platform();

    if (platform === 'win32') {
        return join(__dirname, 'resources', 'icon.ico');
    } else if (platform === 'darwin') {
        return join(__dirname, 'resources', 'icon.icns');
    } else {
        // Linux
        return join(__dirname, 'resources', 'icon.png');
    }
}

function createWindow(): void {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        title: 'Snippet Curator',
        width: 1280,
        height: 720,
        show: false,
        autoHideMenuBar: true,
        icon: getIconPath(),
        ...(process.platform === 'linux' ? { icon } : {}),
        webPreferences: {
            preload: join(__dirname, '../preload/index.js'),
            sandbox: false
        },
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

// ----------------------------------------------
// For Pocketbase
//
//
// ----------------------------------------------

function copyPbFolder(requiredFolders: string[]) {
    for (const folder of requiredFolders) {
        const from = join(resourcePath, folder);
        const to = join(userDataPath, folder);
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
        console.log('path exists: ', join(userDataPath, folder), existsSync(join(userDataPath, folder)))
        return !existsSync(join(userDataPath, folder))
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

// ----------------------------------------------
// For logging
//
//
// ----------------------------------------------
log.initialize()
log.transports.file.level = 'info'
log.info('App starting...')


// ----------------------------------------------
// For autoUpdater
//
//
// ----------------------------------------------
autoUpdater.on('checking-for-update', () => {
    log.info('checking for update')
})

autoUpdater.on('update-available', () => {
    log.info('Update available')
})

autoUpdater.on('update-available', () => {
    log.info('Update available')
})

autoUpdater.on('update-not-available', () => {
    log.info('Update not available')
})

autoUpdater.on('error', (err) => {
    log.info('Error in auto-updater: ', err)
})

autoUpdater.on('update-downloaded', () => {
    log.info('Update downloaded')
})


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
    electronApp.setAppUserModelId('com.krxiang.curator')

    // Default open or close DevTools by F12 in development
    // and ignore CommandOrControl + R in production.
    // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
    app.on('browser-window-created', (_, window) => {
        optimizer.watchWindowShortcuts(window)
    })

    // IPC test
    ipcMain.on('ping', () => console.log('pong'))
    ipcMain.handle('get-app-version', () => {
        return app.getVersion()
    })

    createWindow()

    app.on('activate', function () {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })


    autoUpdater.checkForUpdatesAndNotify()
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


process.on('SIGINT', () => {
    console.log('SIGINT. Cleaning up...')
    if (pocketBaseProcess) {
        pocketBaseProcess.kill('SIGINT');
        pocketBaseProcess = null;
    }
})