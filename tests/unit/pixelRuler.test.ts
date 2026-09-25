import { describe, it, expect } from 'vitest';
import { calculatePixelMeasurement } from '../../src/shared/utils/pixelRuler';

describe('Pixel Ruler Calculator', () => {
  it('computes accurate horizontal distance and 0 angle', () => {
    const m = calculatePixelMeasurement(10, 10, 210, 10);
    expect(m.pixelDistance).toBe(200);
    expect(m.angle).toBe(0);
  });

  it('computes accurate 45 degree diagonal distance', () => {
    const m = calculatePixelMeasurement(0, 0, 100, 100);
    expect(m.pixelDistance).toBe(141);
    expect(m.angle).toBe(45);
  });
});
