/// <reference types="vite/client" />

export interface UpdateInfo {
  version: string;
  files?: any[];
  releaseDate?: string;
  releaseNotes?: string;
}

export interface UpdateProgress {
  bytesPerSecond: number;
  percent: number;
  total: number;
  transferred: number;
}

declare global {
  interface Window {
    electronAPI?: {
      platform: string;
      onUpdateAvailable: (callback: (info: UpdateInfo) => void) => void;
      onUpdateProgress: (callback: (progress: UpdateProgress) => void) => void;
      onUpdateDownloaded: (callback: (info: UpdateInfo) => void) => void;
      startDownloadUpdate: () => Promise<{ success: boolean; error?: string }>;
      installUpdate: () => Promise<void>;
    };
  }
}
