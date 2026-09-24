import { app, screen } from 'electron';
import path from 'path';
import { OverlayWindowManager } from './windows/overlayWindow';
import { ToolbarWindowManager } from './windows/toolbarWindow';
import { DisplayManager } from './displays/displayManager';
import { ShortcutManager } from './shortcuts/shortcutManager';
import { registerIPCHandlers } from './ipc/ipcHandlers';
import { TrayManager } from './tray/trayManager';

// Single instance lock
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
}

let overlayManager: OverlayWindowManager;
let toolbarManager: ToolbarWindowManager;
let displayManager: DisplayManager;
let shortcutManager: ShortcutManager;
let trayManager: TrayManager;

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

  // Link toolbar close to complete application teardown
  toolbarManager.setOnClose(() => {
    trayManager?.destroy();
    overlayManager?.destroy();
    app.quit();
    setTimeout(() => {
      app.exit(0);
    }, 50);
  });

  // Link overlay close to complete application teardown
  overlayManager.setOnClose(() => {
    trayManager?.destroy();
    toolbarManager?.destroy();
    app.quit();
    setTimeout(() => {
      app.exit(0);
    }, 50);
  });

  // Restore and focus on second instance
  app.on('second-instance', () => {
    const tWin = toolbarManager?.getWindow();
    if (tWin && !tWin.isDestroyed()) {
      if (tWin.isMinimized()) tWin.restore();
      tWin.show();
      tWin.focus();
    }
    overlayManager?.setAppActive(true);
  });

  // Track application focus state between Toolbar and Overlay windows
  let blurTimeout: NodeJS.Timeout | null = null;

  const checkActiveState = () => {
    const tWin = toolbarManager.getWindow();
    const oWin = overlayManager.getWindow();

    const toolbarFocused = tWin && !tWin.isDestroyed() && tWin.isFocused();
    const overlayFocused = oWin && !oWin.isDestroyed() && oWin.isFocused();

    if (toolbarFocused || overlayFocused) {
      overlayManager.setAppActive(true);
    } else {
      overlayManager.setAppActive(false);
    }
  };

  const handleFocus = () => {
    if (blurTimeout) {
      clearTimeout(blurTimeout);
      blurTimeout = null;
    }
    overlayManager.setAppActive(true);
  };

  const handleBlur = () => {
    if (blurTimeout) {
      clearTimeout(blurTimeout);
    }
    blurTimeout = setTimeout(checkActiveState, 120);
  };

  const toolbarWin = toolbarManager.getWindow();
  const overlayWin = overlayManager.getWindow();

  if (toolbarWin) {
    toolbarWin.on('focus', handleFocus);
    toolbarWin.on('blur', handleBlur);
    toolbarWin.on('minimize', () => {
      overlayManager.setAppActive(false);
      const oWin = overlayManager.getWindow();
      if (oWin && !oWin.isDestroyed()) {
        oWin.hide();
      }
      trayManager?.updateContextMenu();
    });
    toolbarWin.on('restore', () => {
      const oWin = overlayManager.getWindow();
      if (oWin && !oWin.isDestroyed()) {
        oWin.show();
      }
      handleFocus();
      trayManager?.updateContextMenu();
    });
  }

  if (overlayWin) {
    overlayWin.on('focus', handleFocus);
    overlayWin.on('blur', handleBlur);
  }

  // Register IPC
  registerIPCHandlers(overlayManager, toolbarManager, displayManager);

  // Register Global Shortcuts
  shortcutManager = new ShortcutManager({
    onToggleDrawingMode: () => {
      const newMode = overlayManager.toggleDrawingMode();
      const tWin = toolbarManager.getWindow();
      const oWin = overlayManager.getWindow();
      if (tWin && !tWin.isDestroyed()) {
        tWin.webContents.send('drawing-mode-changed', newMode);
      }
      if (oWin && !oWin.isDestroyed()) {
        oWin.webContents.send('drawing-mode-changed', newMode);
      }
      trayManager?.updateContextMenu();
    },
    onToggleOverlay: () => {
      overlayManager.toggleVisibility();
    },
    onClearAll: () => {
      const oWin = overlayManager.getWindow();
      if (oWin && !oWin.isDestroyed()) {
        oWin.webContents.send('clear-all');
      }
    },
  });

  shortcutManager.registerAll();

  // Initialize System Tray
  trayManager = new TrayManager();
  trayManager.create({
    onToggleToolbar: () => {
      const tWin = toolbarManager.getWindow();
      const oWin = overlayManager.getWindow();
      if (!tWin || tWin.isDestroyed()) return;

      if (tWin.isMinimized() || !tWin.isVisible()) {
        if (tWin.isMinimized()) tWin.restore();
        tWin.show();
        tWin.focus();
        if (oWin && !oWin.isDestroyed()) oWin.show();
        overlayManager.setAppActive(true);
      } else {
        tWin.hide();
        if (oWin && !oWin.isDestroyed()) oWin.hide();
        overlayManager.setAppActive(false);
      }
      trayManager.updateContextMenu();
    },
    onToggleDrawingMode: () => {
      const newMode = overlayManager.toggleDrawingMode();
      const tWin = toolbarManager.getWindow();
      const oWin = overlayManager.getWindow();
      if (tWin && !tWin.isDestroyed()) {
        tWin.webContents.send('drawing-mode-changed', newMode);
      }
      if (oWin && !oWin.isDestroyed()) {
        oWin.webContents.send('drawing-mode-changed', newMode);
      }
      trayManager.updateContextMenu();
    },
    onClearScreen: () => {
      const oWin = overlayManager.getWindow();
      if (oWin && !oWin.isDestroyed()) {
        oWin.webContents.send('clear-all');
      }
    },
    onQuit: () => {
      trayManager?.destroy();
      overlayManager?.destroy();
      toolbarManager?.destroy();
      app.quit();
      setTimeout(() => {
        app.exit(0);
      }, 50);
    },
    isToolbarVisible: () => {
      const tWin = toolbarManager.getWindow();
      return Boolean(tWin && !tWin.isDestroyed() && tWin.isVisible() && !tWin.isMinimized());
    },
    isDrawingMode: () => {
      return overlayManager.getIsDrawingMode();
    },
  });

  // Listen to display changes
  screen.on('display-metrics-changed', () => {
    const selected = displayManager.getSelectedDisplay();
    overlayManager.setDisplay(selected);
  });
}

app.whenReady().then(initializeApp);

app.on('before-quit', () => {
  trayManager?.destroy();
  overlayManager?.destroy();
  toolbarManager?.destroy();
});

app.on('will-quit', () => {
  if (shortcutManager) {
    shortcutManager.unregisterAll();
  }
  trayManager?.destroy();
  overlayManager?.destroy();
  toolbarManager?.destroy();
  setTimeout(() => {
    app.exit(0);
  }, 50);
});

app.on('window-all-closed', () => {
  trayManager?.destroy();
  overlayManager?.destroy();
  toolbarManager?.destroy();
  app.quit();
  setTimeout(() => {
    app.exit(0);
  }, 50);
});
