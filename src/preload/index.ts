import { contextBridge, ipcRenderer } from 'electron';
import { DrawingSettings, HistoryState, DisplayInfo, ElectronAPI } from '../shared/types';

const api: ElectronAPI = {
  // Settings sync
  updateSettings: (settings: Partial<DrawingSettings>) => {
    ipcRenderer.send('update-settings', settings);
  },
  onSettingsUpdated: (callback: (settings: DrawingSettings) => void) => {
    const handler = (_event: any, settings: DrawingSettings) => callback(settings);
    ipcRenderer.on('update-settings', handler);
    return () => ipcRenderer.removeListener('update-settings', handler);
  },

  // Drawing Mode
  setDrawingMode: (enabled: boolean) => {
    ipcRenderer.send('set-drawing-mode', enabled);
  },
  onDrawingModeChanged: (callback: (enabled: boolean) => void) => {
    const handler = (_event: any, enabled: boolean) => callback(enabled);
    ipcRenderer.on('drawing-mode-changed', handler);
    return () => ipcRenderer.removeListener('drawing-mode-changed', handler);
  },

  // History Commands
  undo: () => {
    ipcRenderer.send('undo');
  },
  redo: () => {
    ipcRenderer.send('redo');
  },
  clearAll: () => {
    ipcRenderer.send('clear-all');
  },
  onUndo: (callback: () => void) => {
    const handler = () => callback();
    ipcRenderer.on('undo', handler);
    return () => ipcRenderer.removeListener('undo', handler);
  },
  onRedo: (callback: () => void) => {
    const handler = () => callback();
    ipcRenderer.on('redo', handler);
    return () => ipcRenderer.removeListener('redo', handler);
  },
  onClearAll: (callback: () => void) => {
    const handler = () => callback();
    ipcRenderer.on('clear-all', handler);
    return () => ipcRenderer.removeListener('clear-all', handler);
  },
  updateHistoryState: (state: HistoryState) => {
    ipcRenderer.send('sync-history-state', state);
  },
  onHistoryStateChanged: (callback: (state: HistoryState) => void) => {
    const handler = (_event: any, state: HistoryState) => callback(state);
    ipcRenderer.on('sync-history-state', handler);
    return () => ipcRenderer.removeListener('sync-history-state', handler);
  },

  // Overlay Visibility
  toggleOverlay: () => {
    ipcRenderer.send('toggle-overlay');
  },
  onToggleOverlay: (callback: () => void) => {
    const handler = () => callback();
    ipcRenderer.on('toggle-overlay', handler);
    return () => ipcRenderer.removeListener('toggle-overlay', handler);
  },

  // Displays
  getDisplays: () => ipcRenderer.invoke('get-displays'),
  setDisplay: (displayId: number) => ipcRenderer.invoke('set-display', displayId),

  // Export
  exportPNG: (dataUrl: string) => ipcRenderer.invoke('export-png', dataUrl),
  captureScreenWithAnnotations: (dataUrl: string) =>
    ipcRenderer.invoke('screenshot-capture', dataUrl),

  // Window Controls
  quitApp: () => {
    ipcRenderer.send('quit-app');
  },
  minimizeToolbar: () => {
    ipcRenderer.send('minimize-toolbar');
  },
};

contextBridge.exposeInMainWorld('electronAPI', api);
