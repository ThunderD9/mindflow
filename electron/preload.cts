import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  onUpdateAvailable: (callback: (info: any) => void) => {
    ipcRenderer.on('updater:available', (_e, info) => callback(info));
  },
  onUpdateProgress: (callback: (progress: any) => void) => {
    ipcRenderer.on('updater:progress', (_e, progress) => callback(progress));
  },
  onUpdateDownloaded: (callback: (info: any) => void) => {
    ipcRenderer.on('updater:downloaded', (_e, info) => callback(info));
  },
  startDownloadUpdate: () => ipcRenderer.invoke('updater:start-download'),
  installUpdate: () => ipcRenderer.invoke('updater:install'),
});
