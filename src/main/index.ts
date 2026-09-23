import { app, screen } from 'electron';
import path from 'path';
import { OverlayWindowManager } from './windows/overlayWindow';
import { ToolbarWindowManager } from './windows/toolbarWindow';
import { DisplayManager } from './displays/displayManager';
import { ShortcutManager } from './shortcuts/shortcutManager';
import { registerIPCHandlers } from './ipc/ipcHandlers';

// Single instance lock
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
}

let overlayManager: OverlayWindowManager;
let toolbarManager: ToolbarWindowManager;
let displayManager: DisplayManager;
let shortcutManager: ShortcutManager;

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
const devUrl = process.env.VITE_DEV_SERVER_URL;

function getPreloadPath(): string {
  if (isDev) {
    return path.join(__dirname, '../preload/index.js');
  }
  return path.join(__dirname, '../preload/index.js');
}

async function initializeApp() {
  displayManager = new DisplayManager();
  const preloadPath = getPreloadPath();

  overlayManager = new OverlayWindowManager(preloadPath, devUrl);
  toolbarManager = new ToolbarWindowManager(preloadPath, devUrl);

  const primaryDisplay = screen.getPrimaryDisplay();

  // Create windows
  overlayManager.create(primaryDisplay);
  toolbarManager.create(primaryDisplay);

  // Register IPC
  registerIPCHandlers(overlayManager, toolbarManager, displayManager);

  // Register Global Shortcuts
  shortcutManager = new ShortcutManager({
    onToggleDrawingMode: () => {
      const newMode = overlayManager.toggleDrawingMode();
      const toolbarWin = toolbarManager.getWindow();
      const overlayWin = overlayManager.getWindow();
      if (toolbarWin && !toolbarWin.isDestroyed()) {
        toolbarWin.webContents.send('drawing-mode-changed', newMode);
      }
      if (overlayWin && !overlayWin.isDestroyed()) {
        overlayWin.webContents.send('drawing-mode-changed', newMode);
      }
    },
    onToggleOverlay: () => {
      overlayManager.toggleVisibility();
    },
    onClearAll: () => {
      const overlayWin = overlayManager.getWindow();
      if (overlayWin && !overlayWin.isDestroyed()) {
        overlayWin.webContents.send('clear-all');
      }
    },
  });

  shortcutManager.registerAll();

  // Listen to display changes
  screen.on('display-metrics-changed', () => {
    const selected = displayManager.getSelectedDisplay();
    overlayManager.setDisplay(selected);
  });
}

app.whenReady().then(initializeApp);

app.on('will-quit', () => {
  if (shortcutManager) {
    shortcutManager.unregisterAll();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
