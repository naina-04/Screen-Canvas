import { describe, it, expect } from 'vitest';
import { calculateDpiScaling } from '../../src/shared/utils/touchDPI';

describe('DPI Scaling Engine', () => {
  it('scales pixel dimensions proportionally to DPR', () => {
    const scaled = calculateDpiScaling(800, 600, 2);
    expect(scaled.pixelWidth).toBe(1600);
    expect(scaled.pixelHeight).toBe(1200);
    expect(scaled.dpr).toBe(2);
  });

  it('handles 1.25x and 1.5x fractional scale factors cleanly', () => {
    const scaled = calculateDpiScaling(1000, 800, 1.25);
    expect(scaled.pixelWidth).toBe(1250);
    expect(scaled.pixelHeight).toBe(1000);
  });
});
