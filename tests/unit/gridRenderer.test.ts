import { describe, it, expect } from 'vitest';
import { calculateGridLineCount } from '../../src/shared/utils/gridRenderer';

describe('Grid Rendering Calculator', () => {
  it('calculates correct line counts for 1920x1080 screen with 24px grid', () => {
    const lines = calculateGridLineCount(1920, 1080, 24);
    expect(lines.xLines).toBe(80);
    expect(lines.yLines).toBe(45);
  });

  it('safely clamps grid spacing to prevent infinite loops', () => {
    const lines = calculateGridLineCount(100, 100, 1);
    expect(lines.xLines).toBe(12); // clamped to 8
  });
});
