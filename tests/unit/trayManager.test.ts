import { describe, it, expect, vi } from 'vitest';

// Mock electron native modules
vi.mock('electron', () => {
  return {
    app: {
      quit: vi.fn(),
      exit: vi.fn(),
    },
    Tray: vi.fn().mockImplementation(() => ({
      setToolTip: vi.fn(),
      setContextMenu: vi.fn(),
      on: vi.fn(),
      destroy: vi.fn(),
      isDestroyed: vi.fn().mockReturnValue(false),
    })),
    Menu: {
      buildFromTemplate: vi.fn().mockImplementation((template) => template),
    },
    nativeImage: {
      createFromBitmap: vi.fn().mockImplementation((buf, size) => ({
        toBitmap: () => buf,
        getSize: () => size,
      })),
    },
  };
});

import { generateTrayIcon, TrayManager } from '../../src/main/tray/trayManager';
import { Menu, Tray, nativeImage } from 'electron';
import { beforeEach } from 'vitest';

describe('TrayManager and Icon Generation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('generates a valid 16x16 bitmap icon buffer', () => {
    const icon = generateTrayIcon();
    expect(nativeImage.createFromBitmap).toHaveBeenCalled();
    expect(icon.getSize()).toEqual({ width: 16, height: 16 });
  });

  it('initializes Tray with tooltip, event listeners, and context menu', () => {
    const manager = new TrayManager();
    const onToggleToolbar = vi.fn();
    const onToggleDrawingMode = vi.fn();
    const onClearScreen = vi.fn();
    const onQuit = vi.fn();

    manager.create({
      onToggleToolbar,
      onToggleDrawingMode,
      onClearScreen,
      onQuit,
      isToolbarVisible: () => true,
      isDrawingMode: () => false,
    });

    expect(Tray).toHaveBeenCalled();
    expect(Menu.buildFromTemplate).toHaveBeenCalled();

    // Verify context menu items
    const templateCall = vi.mocked(Menu.buildFromTemplate).mock.calls[0][0];
    const labels = (templateCall as any[]).map((item) => item.label);
    expect(labels).toContain('Hide Toolbar');
    expect(labels).toContain('Switch to Drawing Mode');
    expect(labels).toContain('Clear Screen');
    expect(labels).toContain('Exit ScreenCanvas');

    manager.destroy();
  });

  it('updates context menu dynamically based on toolbar visibility and drawing mode', () => {
    const manager = new TrayManager();
    let isVisible = false;
    let isDrawing = true;

    manager.create({
      onToggleToolbar: vi.fn(),
      onToggleDrawingMode: vi.fn(),
      onClearScreen: vi.fn(),
      onQuit: vi.fn(),
      isToolbarVisible: () => isVisible,
      isDrawingMode: () => isDrawing,
    });

    const templateCall = vi.mocked(Menu.buildFromTemplate).mock.calls[0][0];
    const labels = (templateCall as any[]).map((item) => item.label);
    expect(labels).toContain('Show Toolbar');
    expect(labels).toContain('Switch to Desktop Mode');

    manager.destroy();
  });
});
