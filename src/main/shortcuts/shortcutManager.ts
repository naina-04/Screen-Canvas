import { globalShortcut } from 'electron';

export interface ShortcutCallbacks {
  onToggleDrawingMode: () => void;
  onToggleOverlay: () => void;
  onClearAll: () => void;
}

export class ShortcutManager {
  private callbacks: ShortcutCallbacks;

  constructor(callbacks: ShortcutCallbacks) {
    this.callbacks = callbacks;
  }

  public registerAll(): void {
    try {
      globalShortcut.register('CommandOrControl+Shift+D', () => {
        this.callbacks.onToggleDrawingMode();
      });

      globalShortcut.register('CommandOrControl+Shift+A', () => {
        this.callbacks.onToggleOverlay();
      });

      globalShortcut.register('CommandOrControl+Shift+C', () => {
        this.callbacks.onClearAll();
      });
    } catch (err) {
      console.error('Failed to register global shortcuts:', err);
    }
  }

  public unregisterAll(): void {
    globalShortcut.unregisterAll();
  }
}
