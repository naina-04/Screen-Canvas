import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DEFAULT_SETTINGS, SHORTCUTS } from '../../src/shared/constants/defaults';
import { HistoryManager } from '../../src/shared/utils/HistoryManager';
import { DrawingElement, DrawingSettings } from '../../src/shared/types';

describe('ScreenCanvas Integration & State Sync', () => {
  let historyManager: HistoryManager;

  beforeEach(() => {
    historyManager = new HistoryManager(50);
  });

  it('verifies default drawing settings schema', () => {
    expect(DEFAULT_SETTINGS.activeTool).toBe('pen');
    expect(DEFAULT_SETTINGS.strokeColor).toBe('#ef4444');
    expect(DEFAULT_SETTINGS.strokeWidth).toBe(4);
    expect(DEFAULT_SETTINGS.brushStyle).toBe('solid');
    expect(DEFAULT_SETTINGS.isDrawingMode).toBe(true);
    expect(DEFAULT_SETTINGS.isOverlayVisible).toBe(true);
  });

  it('verifies critical shortcuts configuration', () => {
    expect(SHORTCUTS.TOGGLE_DRAWING_MODE).toBe('Control+Shift+D');
    expect(SHORTCUTS.TOGGLE_OVERLAY).toBe('Control+Shift+A');
    expect(SHORTCUTS.CLEAR_ALL).toBe('Control+Shift+C');
    expect(SHORTCUTS.SELECT).toBe('V');
    expect(SHORTCUTS.PEN).toBe('P');
    expect(SHORTCUTS.ERASER).toBe('E');
    expect(SHORTCUTS.HIGHLIGHTER).toBe('H');
  });

  it('synchronizes history state correctly across actions', () => {
    // Initial state
    let state = historyManager.getHistoryState();
    expect(state.canUndo).toBe(false);
    expect(state.canRedo).toBe(false);
    expect(state.elementCount).toBe(0);

    // Add elements
    const element: DrawingElement = {
      id: 'el-1',
      type: 'pen',
      color: '#3b82f6',
      strokeWidth: 4,
      opacity: 1,
      brushStyle: 'solid',
      points: [{ x: 10, y: 10 }, { x: 50, y: 50 }],
    };
    historyManager.addElement(element);

    state = historyManager.getHistoryState();
    expect(state.canUndo).toBe(true);
    expect(state.canRedo).toBe(false);
    expect(state.elementCount).toBe(1);

    // Undo
    historyManager.undo();
    state = historyManager.getHistoryState();
    expect(state.canUndo).toBe(false);
    expect(state.canRedo).toBe(true);
    expect(state.elementCount).toBe(0);

    // Redo
    historyManager.redo();
    state = historyManager.getHistoryState();
    expect(state.canUndo).toBe(true);
    expect(state.canRedo).toBe(false);
    expect(state.elementCount).toBe(1);
  });

  it('supports settings merge without mutating defaults', () => {
    const customUpdate: Partial<DrawingSettings> = {
      activeTool: 'highlighter',
      strokeWidth: 16,
    };
    const merged = { ...DEFAULT_SETTINGS, ...customUpdate };

    expect(merged.activeTool).toBe('highlighter');
    expect(merged.strokeWidth).toBe(16);
    expect(merged.strokeColor).toBe(DEFAULT_SETTINGS.strokeColor);
    expect(DEFAULT_SETTINGS.activeTool).toBe('pen');
  });

  it('supports updating settings with neutral select tool', () => {
    const customUpdate: Partial<DrawingSettings> = {
      activeTool: 'select',
    };
    const merged = { ...DEFAULT_SETTINGS, ...customUpdate };

    expect(merged.activeTool).toBe('select');
    expect(merged.isDrawingMode).toBe(true);
    expect(DEFAULT_SETTINGS.activeTool).toBe('pen');
  });

  it('determines cursor correctly based on app active state and drawing tool', () => {
    const getCursorHelper = (isAppActive: boolean, settings: DrawingSettings): string => {
      if (!isAppActive || !settings.isDrawingMode) return 'default';
      switch (settings.activeTool) {
        case 'laser':
        case 'eraser':
        case 'spotlight':
          return 'none';
        case 'pen':
        case 'marker':
          return 'crosshair';
        case 'highlighter':
          return 'cell';
        case 'text':
          return 'text';
        case 'line':
        case 'arrow':
        case 'rectangle':
        case 'circle':
          return 'crosshair';
        default:
          return 'default';
      }
    };

    // When app is active and Pen is selected -> crosshair (pen cursor)
    const penSettings: DrawingSettings = { ...DEFAULT_SETTINGS, activeTool: 'pen', isDrawingMode: true };
    expect(getCursorHelper(true, penSettings)).toBe('crosshair');

    // When app is switched to another application (isAppActive = false) -> MUST revert to 'default'
    expect(getCursorHelper(false, penSettings)).toBe('default');

    // When user brings app back to top (isAppActive = true) -> restores 'crosshair'
    expect(getCursorHelper(true, penSettings)).toBe('crosshair');

    // When neutral/select tool is active -> default cursor even if app is active
    const selectSettings: DrawingSettings = { ...DEFAULT_SETTINGS, activeTool: 'select', isDrawingMode: true };
    expect(getCursorHelper(true, selectSettings)).toBe('default');

    // When pass-through mode is active (isDrawingMode = false) -> default cursor
    const passThroughSettings: DrawingSettings = { ...DEFAULT_SETTINGS, activeTool: 'pen', isDrawingMode: false };
    expect(getCursorHelper(true, passThroughSettings)).toBe('default');
  });

  it('calculates whether overlay intercepts mouse events based on active state', () => {
    const shouldInterceptHelper = (
      isVisible: boolean,
      isAppActive: boolean,
      isDrawingMode: boolean,
      tool: string
    ): boolean => {
      return isVisible && isAppActive && isDrawingMode && tool !== 'select' && tool !== 'none';
    };

    // Open & active with pen -> intercepts mouse for drawing
    expect(shouldInterceptHelper(true, true, true, 'pen')).toBe(true);

    // Switched to another application (isAppActive = false) -> STOP drawing, clicks pass through
    expect(shouldInterceptHelper(true, false, true, 'pen')).toBe(false);

    // App brought back to the top (isAppActive = true) -> resumes drawing
    expect(shouldInterceptHelper(true, true, true, 'pen')).toBe(true);

    // App hidden -> does not intercept
    expect(shouldInterceptHelper(false, true, true, 'pen')).toBe(false);
  });
});
