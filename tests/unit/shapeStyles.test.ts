import { describe, it, expect } from 'vitest';
import { resolveFillColor, computeShapeMetrics } from '../../src/shared/utils/shapeStyles';

describe('Shape Styles & Metrics Utilities', () => {
  it('resolves fill colors correctly for none, translucent, and solid modes', () => {
    expect(resolveFillColor('#ff0000', { mode: 'none', opacity: 0.5 })).toBeNull();
    expect(resolveFillColor('#ff0000', { mode: 'translucent', opacity: 0.25 })).toBe('rgba(255, 0, 0, 0.25)');
    expect(resolveFillColor('#00ff00', { mode: 'solid', opacity: 0.5 })).toBe('rgba(0, 255, 0, 1)');
  });

  it('computes shape metrics accurately', () => {
    const metrics = computeShapeMetrics({ x: 10, y: 10 }, { x: 60, y: 40 });
    expect(metrics.width).toBe(50);
    expect(metrics.height).toBe(30);
    expect(metrics.area).toBe(1500);
    expect(metrics.perimeter).toBe(160);
  });
});
