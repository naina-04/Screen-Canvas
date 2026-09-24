import { describe, it, expect, vi } from 'vitest';
import { StampElement } from '../../src/shared/types';
import { HistoryManager } from '../../src/shared/utils/HistoryManager';
import { renderStamp, renderElement } from '../../src/shared/utils/renderEngine';

describe('StampElement & Stamp Rendering', () => {
  it('correctly manages sequential stamps in HistoryManager', () => {
    const history = new HistoryManager(50);

    const stamp1: StampElement = {
      id: 'stamp-1',
      type: 'stamp',
      color: '#ef4444',
      strokeWidth: 2,
      opacity: 1,
      brushStyle: 'solid',
      point: { x: 100, y: 150 },
      number: 1,
      radius: 18,
    };

    const stamp2: StampElement = {
      id: 'stamp-2',
      type: 'stamp',
      color: '#3b82f6',
      strokeWidth: 2,
      opacity: 1,
      brushStyle: 'solid',
      point: { x: 250, y: 300 },
      number: 2,
      radius: 18,
    };

    history.addElement(stamp1);
    history.addElement(stamp2);

    expect(history.currentElements.length).toBe(2);
    expect((history.currentElements[0] as StampElement).number).toBe(1);
    expect((history.currentElements[1] as StampElement).number).toBe(2);

    // Undo stamp 2
    history.undo();
    expect(history.currentElements.length).toBe(1);
    expect((history.currentElements[0] as StampElement).number).toBe(1);

    // Redo stamp 2
    history.redo();
    expect(history.currentElements.length).toBe(2);
    expect((history.currentElements[1] as StampElement).number).toBe(2);
  });

  it('invokes canvas rendering methods for stamp badges', () => {
    const mockCtx = {
      save: vi.fn(),
      restore: vi.fn(),
      beginPath: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      fillText: vi.fn(),
      setLineDash: vi.fn(),
      globalAlpha: 1,
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 1,
      font: '',
      textAlign: '',
      textBaseline: '',
      shadowColor: '',
      shadowBlur: 0,
      shadowOffsetX: 0,
      shadowOffsetY: 0,
    } as unknown as CanvasRenderingContext2D;

    const stamp: StampElement = {
      id: 'stamp-test',
      type: 'stamp',
      color: '#22c55e',
      strokeWidth: 2,
      opacity: 0.9,
      brushStyle: 'solid',
      point: { x: 50, y: 50 },
      number: 3,
      radius: 16,
    };

    renderStamp(mockCtx, stamp);

    expect(mockCtx.save).toHaveBeenCalled();
    expect(mockCtx.beginPath).toHaveBeenCalled();
    expect(mockCtx.arc).toHaveBeenCalledWith(50, 50, 16, 0, Math.PI * 2);
    expect(mockCtx.fill).toHaveBeenCalled();
    expect(mockCtx.stroke).toHaveBeenCalled();
    expect(mockCtx.fillText).toHaveBeenCalledWith('3', 50, 50);
    expect(mockCtx.restore).toHaveBeenCalled();

    // Verify renderElement forwards to renderStamp
    renderElement(mockCtx, stamp);
    expect(mockCtx.fillText).toHaveBeenCalledTimes(2);
  });
});
