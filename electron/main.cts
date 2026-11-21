import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { autoUpdater } from 'electron-updater';

// Initialize context menu (using dynamic import because electron-context-menu is pure ESM)
import('electron-context-menu').then(({ default: contextMenu }) => {
  contextMenu({
    showSearchWithGoogle: false,
    showInspectElement: true
  });
});

let mainWindow: BrowserWindow | null = null;

// Configure autoUpdater: do NOT auto download or install silently
autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = false;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 840,
    minWidth: 900,
    minHeight: 600,
    title: 'MindFlow - Diary, Tasks & Gemini AI Copilot',
    icon: path.join(__dirname, '../public/icon.png'),
    backgroundColor: '#090d16',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  const devUrl = 'http://localhost:3000';
  if (process.env.NODE_ENV === 'development' || !app.isPackaged) {
    mainWindow.loadURL(devUrl);
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// IPC Handlers for Updater
ipcMain.handle('updater:start-download', async () => {
  try {
    await autoUpdater.downloadUpdate();
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
});

ipcMain.handle('updater:install', () => {
  autoUpdater.quitAndInstall(false, true);
});

autoUpdater.on('update-available', (info) => {
  mainWindow?.webContents.send('updater:available', info);
});

autoUpdater.on('download-progress', (progress) => {
  mainWindow?.webContents.send('updater:progress', progress);
});

autoUpdater.on('update-downloaded', (info) => {
  mainWindow?.webContents.send('updater:downloaded', info);
});

app.whenReady().then(() => {
  createWindow();

  // Check for updates if running packaged app
  if (app.isPackaged) {
    autoUpdater.checkForUpdates().catch(() => {});
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
