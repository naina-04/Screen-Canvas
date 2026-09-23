import { BrowserWindow, Display } from 'electron';
import path from 'path';

export class ToolbarWindowManager {
  private window: BrowserWindow | null = null;

  constructor(private preloadPath: string, private devUrl?: string) {}

  public create(display: Display): BrowserWindow {
    const defaultWidth = 640;
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
      webPreferences: {
        preload: this.preloadPath,
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: false,
      },
    });

    this.window.setAlwaysOnTop(true, 'screen-saver');
    this.window.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });

    if (this.devUrl) {
      this.window.loadURL(`${this.devUrl}/toolbar.html`);
    } else {
      this.window.loadFile(path.join(__dirname, '../../dist/toolbar.html'));
    }

    this.window.on('closed', () => {
      this.window = null;
    });

    return this.window;
  }

  public getWindow(): BrowserWindow | null {
    return this.window;
  }

  public setExpanded(expanded: boolean): void {
    if (!this.window) return;
    const currentBounds = this.window.getBounds();
    const targetHeight = expanded ? 220 : 90;
    this.window.setBounds({
      ...currentBounds,
      height: targetHeight,
    });
  }
}
