import { ipcMain, dialog, desktopCapturer, app, clipboard, nativeImage } from 'electron';
import fs from 'fs';
import { OverlayWindowManager } from '../windows/overlayWindow';
import { ToolbarWindowManager } from '../windows/toolbarWindow';
import { DisplayManager } from '../displays/displayManager';
import { DrawingSettings, HistoryState } from '../../shared/types';
import { buildExportFilename, extractBase64Data } from '../../shared/utils/exportEngine';

export function registerIPCHandlers(
  overlayManager: OverlayWindowManager,
  toolbarManager: ToolbarWindowManager,
  displayManager: DisplayManager
) {
  // Sync drawing settings between toolbar and overlay
  ipcMain.on('update-settings', (event, settings: Partial<DrawingSettings>) => {
    if (settings.activeTool !== undefined || settings.isDrawingMode !== undefined) {
      overlayManager.updateInteractionState(settings.isDrawingMode, settings.activeTool);
    }

    const overlayWin = overlayManager.getWindow();
    const toolbarWin = toolbarManager.getWindow();

    if (overlayWin && !overlayWin.isDestroyed() && event.sender !== overlayWin.webContents) {
      overlayWin.webContents.send('update-settings', settings);
    }
    if (toolbarWin && !toolbarWin.isDestroyed() && event.sender !== toolbarWin.webContents) {
      toolbarWin.webContents.send('update-settings', settings);
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
      const defaultFilename = buildExportFilename({ prefix: 'screencanvas-annotation' });
      const { canceled, filePath } = await dialog.showSaveDialog({
        title: 'Export Annotation',
        defaultPath: defaultFilename,
        filters: [{ name: 'PNG Image', extensions: ['png'] }],
      });

      if (canceled || !filePath) {
        return { success: false, error: 'Cancelled' };
      }

      const base64Data = extractBase64Data(dataUrl);
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

      const defaultFilename = buildExportFilename({
        prefix: 'screencanvas-screenshot',
        width: selectedDisplay.bounds.width,
        height: selectedDisplay.bounds.height,
      });

      const { canceled, filePath } = await dialog.showSaveDialog({
        title: 'Save Annotated Screenshot',
        defaultPath: defaultFilename,
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

      // Otherwise write composite
      const base64Data = extractBase64Data(annotationDataUrl);
      await fs.promises.writeFile(filePath, Buffer.from(base64Data, 'base64'));

      return { success: true, filePath };
    } catch (err: any) {
      console.error('Failed to capture screenshot:', err);
      return { success: false, error: err.message };
    }
  });

  // Copy image to clipboard
  ipcMain.handle('copy-to-clipboard', async (_event, dataUrl: string) => {
    try {
      if (!dataUrl) {
        return { success: false, error: 'No image data provided' };
      }
      const image = nativeImage.createFromDataURL(dataUrl);
      clipboard.writeImage(image);
      return { success: true };
    } catch (err: any) {
      console.error('Failed to copy to clipboard:', err);
      return { success: false, error: err.message };
    }
  });

  // Relay export/screenshot/clipboard requests from toolbar to overlay window
  ipcMain.on('request-export-png', () => {
    const overlayWin = overlayManager.getWindow();
    if (overlayWin && !overlayWin.isDestroyed()) {
      overlayWin.webContents.send('request-export-png');
    }
  });

  ipcMain.on('request-screenshot', () => {
    const overlayWin = overlayManager.getWindow();
    if (overlayWin && !overlayWin.isDestroyed()) {
      overlayWin.webContents.send('request-screenshot');
    }
  });

  ipcMain.on('request-copy-clipboard', () => {
    const overlayWin = overlayManager.getWindow();
    if (overlayWin && !overlayWin.isDestroyed()) {
      overlayWin.webContents.send('request-copy-clipboard');
    }
  });

  // Relay notifications to toolbar
  ipcMain.on('show-notification', (_event, message: string) => {
    const toolbarWin = toolbarManager.getWindow();
    if (toolbarWin && !toolbarWin.isDestroyed()) {
      toolbarWin.webContents.send('show-notification', message);
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

  ipcMain.on('set-toolbar-expanded', (_event, expanded: boolean) => {
    toolbarManager.setExpanded(expanded);
  });
}
