import { BrowserWindow, Display } from 'electron';
import path from 'path';
import { ToolType, isNeutralTool } from '../../shared/types';

export class OverlayWindowManager {
  private window: BrowserWindow | null = null;
  private isDrawingMode: boolean = true;
  private activeTool: ToolType = 'pen';
  private isVisible: boolean = true;
  private isAppActive: boolean = true;
  private onCloseCallback?: () => void;

  constructor(private preloadPath: string, private devUrl?: string) {}

  public setOnClose(callback: () => void): void {
    this.onCloseCallback = callback;
  }

  public create(display: Display): BrowserWindow {
    const { bounds } = display;

    this.window = new BrowserWindow({
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: bounds.height,
      transparent: true,
      frame: false,
      hasShadow: false,
      resizable: false,
      movable: false,
      alwaysOnTop: true,
      skipTaskbar: true,
      enableLargerThanScreen: true,
      focusable: true,
      show: false,
      backgroundColor: '#00000000',
      webPreferences: {
        preload: this.preloadPath,
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: false,
      },
    });

    this.window.setAlwaysOnTop(true, 'floating');
    this.window.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });

    this.window.once('ready-to-show', () => {
      this.window?.show();
      this.applyDrawingMode();
    });

    if (this.devUrl) {
      this.window.loadURL(`${this.devUrl}/overlay.html`);
    } else {
      this.window.loadFile(path.join(__dirname, '../../dist/overlay.html'));
    }

    this.window.on('closed', () => {
      this.window = null;
      if (this.onCloseCallback) {
        this.onCloseCallback();
      }
    });

    this.applyDrawingMode();

    return this.window;
  }

  public getWindow(): BrowserWindow | null {
    return this.window;
  }

  public setDisplay(display: Display): void {
    if (!this.window) return;
    this.window.setBounds(display.bounds);
  }

  public setDrawingMode(enabled: boolean): void {
    this.isDrawingMode = enabled;
    this.applyDrawingMode();
  }

  public setActiveTool(tool: ToolType): void {
    this.activeTool = tool;
    this.applyDrawingMode();
  }

  public updateInteractionState(isDrawingMode?: boolean, activeTool?: ToolType): void {
    if (isDrawingMode !== undefined) this.isDrawingMode = isDrawingMode;
    if (activeTool !== undefined) this.activeTool = activeTool;
    this.applyDrawingMode();
  }

  public setAppActive(active: boolean): void {
    if (this.isAppActive === active) return;
    this.isAppActive = active;
    this.applyDrawingMode();
    if (this.window && !this.window.isDestroyed()) {
      this.window.webContents.send('app-active-changed', active);
    }
  }

  public getIsAppActive(): boolean {
    return this.isAppActive;
  }

  public toggleDrawingMode(): boolean {
    this.isDrawingMode = !this.isDrawingMode;
    this.applyDrawingMode();
    return this.isDrawingMode;
  }

  public toggleVisibility(): boolean {
    if (!this.window) return false;
    this.isVisible = !this.isVisible;
    if (this.isVisible) {
      this.window.show();
      this.applyDrawingMode();
    } else {
      this.window.hide();
    }
    return this.isVisible;
  }

  public destroy(): void {
    if (!this.window) return;
    try {
      this.window.setIgnoreMouseEvents(true);
      this.window.hide();
      if (!this.window.isDestroyed()) {
        this.window.destroy();
      }
    } catch (err) {
      console.error('Error destroying overlay window:', err);
    }
    this.window = null;
  }

  private applyDrawingMode(): void {
    if (!this.window || this.window.isDestroyed()) return;

    const shouldIntercept =
      this.isVisible &&
      this.isAppActive &&
      this.isDrawingMode &&
      !isNeutralTool(this.activeTool);

    if (shouldIntercept) {
      // Drawing Mode & App Active: overlay intercepts mouse events
      this.window.setIgnoreMouseEvents(false);
    } else {
      // Neutral mode, Inactive (switched to another app), or Pass-through Mode:
      // clicks pass straight through overlay to desktop apps
      this.window.setIgnoreMouseEvents(true, { forward: true });
    }
  }
}

