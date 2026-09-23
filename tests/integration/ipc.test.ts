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
});
