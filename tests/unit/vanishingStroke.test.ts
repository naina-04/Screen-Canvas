import { describe, it, expect } from 'vitest';
import { calculateStrokeOpacity } from '../../src/shared/utils/vanishingStroke';

describe('Vanishing Stroke Decay Calculator', () => {
  it('maintains full opacity during initial hold period', () => {
    const now = 1000;
    expect(calculateStrokeOpacity(now, now + 1000, 5000, 0.7)).toBe(1);
  });

  it('interpolates gradual fade during final period', () => {
    const now = 1000;
    const midFade = now + 4250; // halfway through 3500-5000
    const opacity = calculateStrokeOpacity(now, midFade, 5000, 0.7);
    expect(opacity).toBeGreaterThan(0);
    expect(opacity).toBeLessThan(1);
  });

  it('reaches 0 opacity once duration completes', () => {
    const now = 1000;
    expect(calculateStrokeOpacity(now, now + 5001, 5000)).toBe(0);
  });
});
