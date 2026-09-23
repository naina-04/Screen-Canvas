import { BrowserWindow, Display } from 'electron';
import path from 'path';
import { ToolType, isNeutralTool } from '../../shared/types';

export class OverlayWindowManager {
  private window: BrowserWindow | null = null;
  private isDrawingMode: boolean = true;
  private activeTool: ToolType = 'pen';
  private isVisible: boolean = true;

  constructor(private preloadPath: string, private devUrl?: string) {}

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
      this.window.loadURL(`${this.devUrl}/overlay.html`);
    } else {
      this.window.loadFile(path.join(__dirname, '../../dist/overlay.html'));
    }

    this.window.on('closed', () => {
      this.window = null;
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

  private applyDrawingMode(): void {
    if (!this.window) return;

    const shouldIntercept = this.isVisible && this.isDrawingMode && !isNeutralTool(this.activeTool);

    if (shouldIntercept) {
      // Drawing Mode: overlay intercepts all mouse events
      this.window.setIgnoreMouseEvents(false);
      this.window.focus();
    } else {
      // Neutral mode or Pass-through Mode: clicks pass straight through overlay to desktop apps
      this.window.setIgnoreMouseEvents(true, { forward: true });
      this.window.blur();
    }
  }
}

