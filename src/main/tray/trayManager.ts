import { app, Tray, Menu, nativeImage, NativeImage } from 'electron';

export interface TrayCallbacks {
  onToggleToolbar: () => void;
  onToggleDrawingMode: () => void;
  onClearScreen: () => void;
  onQuit: () => void;
  isToolbarVisible?: () => boolean;
  isDrawingMode?: () => boolean;
}

/**
 * Creates a crisp 16x16 RGBA bitmap icon representing ScreenCanvas (blue canvas with white pen nib).
 */
export function generateTrayIcon(): NativeImage {
  const size = 16;
  const buffer = Buffer.alloc(size * size * 4);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;

      // Rounded square boundary (corner radius ~2-3px)
      const inBounds = x >= 1 && x <= 14 && y >= 1 && y <= 14;
      const isCorner =
        (x <= 2 && y <= 2) ||
        (x >= 13 && y <= 2) ||
        (x <= 2 && y >= 13) ||
        (x >= 13 && y >= 13);

      if (inBounds && !isCorner) {
        // White diagonal pen nib icon from top-right to bottom-left
        const isPenDiagonal = Math.abs(x + y - 15) <= 1 && x >= 4 && x <= 11 && y >= 4 && y <= 11;
        const isPenTip = (x === 4 && y === 11) || (x === 5 && y === 10) || (x === 10 && y === 5);
        const isPenCap = (x === 11 && y === 4);

        if (isPenDiagonal || isPenTip || isPenCap) {
          buffer[idx] = 255;     // R
          buffer[idx + 1] = 255; // G
          buffer[idx + 2] = 255; // B
          buffer[idx + 3] = 255; // Alpha
        } else {
          // Sleek vibrant blue (#2563eb)
          buffer[idx] = 37;      // R
          buffer[idx + 1] = 99;  // G
          buffer[idx + 2] = 235; // B
          buffer[idx + 3] = 255; // Alpha
        }
      } else {
        // Transparent border
        buffer[idx] = 0;
        buffer[idx + 1] = 0;
        buffer[idx + 2] = 0;
        buffer[idx + 3] = 0;
      }
    }
  }

  return nativeImage.createFromBitmap(buffer, { width: size, height: size });
}

export class TrayManager {
  private tray: Tray | null = null;
  private callbacks: TrayCallbacks | null = null;

  public create(callbacks: TrayCallbacks): void {
    if (this.tray) return;

    this.callbacks = callbacks;
    const icon = generateTrayIcon();

    this.tray = new Tray(icon);
    this.tray.setToolTip('ScreenCanvas - Screen Drawing & Annotation');

    // Left click toggles the toolbar
    this.tray.on('click', () => {
      this.callbacks?.onToggleToolbar();
    });

    // Double click ensures window is restored and focused
    this.tray.on('double-click', () => {
      this.callbacks?.onToggleToolbar();
    });

    this.updateContextMenu();
  }

  public updateContextMenu(): void {
    if (!this.tray || !this.callbacks) return;

    const isVisible = this.callbacks.isToolbarVisible ? this.callbacks.isToolbarVisible() : true;
    const isDrawing = this.callbacks.isDrawingMode ? this.callbacks.isDrawingMode() : false;

    const contextMenu = Menu.buildFromTemplate([
      {
        label: isVisible ? 'Hide Toolbar' : 'Show Toolbar',
        click: () => {
          this.callbacks?.onToggleToolbar();
        },
      },
      {
        label: isDrawing ? 'Switch to Desktop Mode' : 'Switch to Drawing Mode',
        accelerator: 'Ctrl+Shift+D',
        click: () => {
          this.callbacks?.onToggleDrawingMode();
        },
      },
      {
        label: 'Clear Screen',
        accelerator: 'Ctrl+Shift+X',
        click: () => {
          this.callbacks?.onClearScreen();
        },
      },
      { type: 'separator' },
      {
        label: 'Exit ScreenCanvas',
        accelerator: 'Ctrl+Q',
        click: () => {
          this.callbacks?.onQuit();
        },
      },
    ]);

    this.tray.setContextMenu(contextMenu);
  }

  public destroy(): void {
    if (this.tray && !this.tray.isDestroyed()) {
      try {
        this.tray.destroy();
      } catch (e) {
        console.error('Error destroying tray:', e);
      }
    }
    this.tray = null;
    this.callbacks = null;
  }
}
