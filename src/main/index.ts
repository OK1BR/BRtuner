import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { readFileSync } from 'node:fs'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

interface TunerConfig {
  host: string
  port: number
  username: string
  password: string
}

let tunerConfig: TunerConfig | null = null

function loadTunerConfig(): TunerConfig | null {
  const path = join(app.getAppPath(), 'tuner.config.local.json')
  try {
    const raw = readFileSync(path, 'utf-8')
    const cfg = JSON.parse(raw) as Partial<TunerConfig>
    if (!cfg.host || !cfg.username || cfg.password === undefined) {
      console.error(`[config] ${path} missing host/username/password`)
      return null
    }
    return {
      host: cfg.host,
      port: cfg.port ?? 80,
      username: cfg.username,
      password: cfg.password
    }
  } catch (err) {
    console.error(`[config] cannot read ${path}: ${(err as Error).message}`)
    return null
  }
}

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1100,
    height: 720,
    minWidth: 800,
    minHeight: 600,
    show: false,
    autoHideMenuBar: true,
    title: 'BRtuner',
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      webviewTag: true
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.brtuner')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  tunerConfig = loadTunerConfig()

  // Auto-supply digest credentials whenever any webContents prompts for login
  // against the configured tuner host.
  app.on('login', (event, _webContents, _request, authInfo, callback) => {
    if (!tunerConfig) return
    if (authInfo.host === tunerConfig.host) {
      event.preventDefault()
      callback(tunerConfig.username, tunerConfig.password)
    }
  })

  ipcMain.handle('tuner:url', () => {
    if (!tunerConfig) return null
    const port = tunerConfig.port === 80 ? '' : `:${tunerConfig.port}`
    return `http://${tunerConfig.host}${port}/`
  })

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
