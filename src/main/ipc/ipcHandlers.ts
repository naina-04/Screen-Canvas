import { ipcMain, dialog, desktopCapturer, app } from 'electron';
import fs from 'fs';
import { OverlayWindowManager } from '../windows/overlayWindow';
import { ToolbarWindowManager } from '../windows/toolbarWindow';
import { DisplayManager } from '../displays/displayManager';
import { DrawingSettings, HistoryState } from '../../shared/types';

export function registerIPCHandlers(
  overlayManager: OverlayWindowManager,
  toolbarManager: ToolbarWindowManager,
  displayManager: DisplayManager
) {
  // Sync drawing settings between toolbar and overlay
  ipcMain.on('update-settings', (_event, settings: Partial<DrawingSettings>) => {
    const overlayWin = overlayManager.getWindow();
    if (overlayWin && !overlayWin.isDestroyed()) {
      overlayWin.webContents.send('update-settings', settings);
    }
  });

  // Set drawing mode (drawing vs pass-through)
  ipcMain.on('set-drawing-mode', (_event, enabled: boolean) => {
    overlayManager.setDrawingMode(enabled);

    const toolbarWin = toolbarManager.getWindow();
    const overlayWin = overlayManager.getWindow();

    if (toolbarWin && !toolbarWin.isDestroyed()) {
      toolbarWin.webContents.send('drawing-mode-changed', enabled);
    }
    if (overlayWin && !overlayWin.isDestroyed()) {
      overlayWin.webContents.send('drawing-mode-changed', enabled);
    }
  });

  // History controls
  ipcMain.on('undo', () => {
    const overlayWin = overlayManager.getWindow();
    if (overlayWin && !overlayWin.isDestroyed()) {
      overlayWin.webContents.send('undo');
    }
  });

  ipcMain.on('redo', () => {
    const overlayWin = overlayManager.getWindow();
    if (overlayWin && !overlayWin.isDestroyed()) {
      overlayWin.webContents.send('redo');
    }
  });

  ipcMain.on('clear-all', () => {
    const overlayWin = overlayManager.getWindow();
    if (overlayWin && !overlayWin.isDestroyed()) {
      overlayWin.webContents.send('clear-all');
    }
  });

  // History state sync (from overlay back to toolbar)
  ipcMain.on('sync-history-state', (_event, state: HistoryState) => {
    const toolbarWin = toolbarManager.getWindow();
    if (toolbarWin && !toolbarWin.isDestroyed()) {
      toolbarWin.webContents.send('sync-history-state', state);
    }
  });

  // Toggle overlay visibility
  ipcMain.on('toggle-overlay', () => {
    overlayManager.toggleVisibility();
    const overlayWin = overlayManager.getWindow();
    if (overlayWin && !overlayWin.isDestroyed()) {
      overlayWin.webContents.send('toggle-overlay');
    }
  });

  // Displays management
  ipcMain.handle('get-displays', () => {
    return displayManager.getDisplays();
  });

  ipcMain.handle('set-display', (_event, displayId: number) => {
    const success = displayManager.setSelectedDisplayId(displayId);
    if (success) {
      const selected = displayManager.getSelectedDisplay();
      overlayManager.setDisplay(selected);
    }
    return success;
  });

  // Export transparent PNG
  ipcMain.handle('export-png', async (_event, dataUrl: string) => {
    try {
      const { canceled, filePath } = await dialog.showSaveDialog({
        title: 'Export Annotation',
        defaultPath: `screencanvas-annotation-${Date.now()}.png`,
        filters: [{ name: 'PNG Image', extensions: ['png'] }],
      });

      if (canceled || !filePath) {
        return { success: false, error: 'Cancelled' };
      }

      const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');
      await fs.promises.writeFile(filePath, Buffer.from(base64Data, 'base64'));

      return { success: true, filePath };
    } catch (err: any) {
      console.error('Failed to export PNG:', err);
      return { success: false, error: err.message };
    }
  });

  // Screenshot capture with annotations
  ipcMain.handle('screenshot-capture', async (_event, annotationDataUrl: string) => {
    try {
      const selectedDisplay = displayManager.getSelectedDisplay();
      const sources = await desktopCapturer.getSources({
        types: ['screen'],
        thumbnailSize: {
          width: selectedDisplay.bounds.width * selectedDisplay.scaleFactor,
          height: selectedDisplay.bounds.height * selectedDisplay.scaleFactor,
        },
      });

      if (!sources || sources.length === 0) {
        throw new Error('No screen capture source available');
      }

      // Pick screen source corresponding to selected display
      const source = sources.find((s) => s.display_id === String(selectedDisplay.id)) || sources[0];
      const screenThumbnail = source.thumbnail;

      const { canceled, filePath } = await dialog.showSaveDialog({
        title: 'Save Annotated Screenshot',
        defaultPath: `screencanvas-screenshot-${Date.now()}.png`,
        filters: [{ name: 'PNG Image', extensions: ['png'] }],
      });

      if (canceled || !filePath) {
        return { success: false, error: 'Cancelled' };
      }

      // If annotation is empty or not provided, write screen capture directly
      if (!annotationDataUrl || annotationDataUrl.length < 50) {
        await fs.promises.writeFile(filePath, screenThumbnail.toPNG());
        return { success: true, filePath };
      }

      // Otherwise we return the composite signal
      // We can write the base64 or pass it to save
      const base64Data = annotationDataUrl.replace(/^data:image\/png;base64,/, '');
      await fs.promises.writeFile(filePath, Buffer.from(base64Data, 'base64'));

      return { success: true, filePath };
    } catch (err: any) {
      console.error('Failed to capture screenshot:', err);
      return { success: false, error: err.message };
    }
  });

  // App controls
  ipcMain.on('quit-app', () => {
    app.quit();
  });

  ipcMain.on('minimize-toolbar', () => {
    const toolbarWin = toolbarManager.getWindow();
    if (toolbarWin) toolbarWin.minimize();
  });
}
