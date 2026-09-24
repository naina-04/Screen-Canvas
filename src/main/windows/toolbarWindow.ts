import { BrowserWindow, Display } from 'electron';
import path from 'path';

export class ToolbarWindowManager {
  private window: BrowserWindow | null = null;
  private onCloseCallback?: () => void;

  constructor(private preloadPath: string, private devUrl?: string) {}

  public setOnClose(callback: () => void): void {
    this.onCloseCallback = callback;
  }

  public create(display: Display): BrowserWindow {
    const defaultWidth = 880;
    const defaultHeight = 90;
    const initialX = Math.round(display.bounds.x + (display.bounds.width - defaultWidth) / 2);
    const initialY = Math.round(display.bounds.y + 28);

    this.window = new BrowserWindow({
      x: initialX,
      y: initialY,
      width: defaultWidth,
      height: defaultHeight,
      transparent: true,
      frame: false,
      hasShadow: false,
      resizable: false,
      alwaysOnTop: true,
      skipTaskbar: false,
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

    this.window.setAlwaysOnTop(true, 'screen-saver', 1);
    this.window.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });

    this.window.once('ready-to-show', () => {
      this.window?.show();
    });

    if (this.devUrl) {
      this.window.loadURL(`${this.devUrl}/toolbar.html`);
    } else {
      this.window.loadFile(path.join(__dirname, '../../dist/toolbar.html'));
    }

    this.window.on('closed', () => {
      this.window = null;
      if (this.onCloseCallback) {
        this.onCloseCallback();
      }
    });

    return this.window;
  }

  public getWindow(): BrowserWindow | null {
    return this.window;
  }

  public destroy(): void {
    if (!this.window) return;
    try {
      this.window.hide();
      if (!this.window.isDestroyed()) {
        this.window.destroy();
      }
    } catch (err) {
      console.error('Error destroying toolbar window:', err);
    }
    this.window = null;
  }

  public setExpanded(expanded: boolean, isModal: boolean = false): void {
    if (!this.window) return;
    const currentBounds = this.window.getBounds();
    const targetHeight = isModal ? 580 : expanded ? 240 : 90;
    this.window.setBounds({
      ...currentBounds,
      height: targetHeight,
    });
  }
}
