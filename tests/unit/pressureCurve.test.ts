import { describe, it, expect } from 'vitest';
import { mapPressure } from '../../src/shared/utils/pressureCurve';

describe('Pressure Curve Engine', () => {
  it('maps 0 and 1 identically across all curve algorithms', () => {
    expect(mapPressure(0, 'linear')).toBe(0);
    expect(mapPressure(1, 'linear')).toBe(1);
    expect(mapPressure(0, 'ease_in')).toBe(0);
    expect(mapPressure(1, 'ease_in')).toBe(1);
    expect(mapPressure(0, 'ease_out')).toBe(0);
    expect(mapPressure(1, 'ease_out')).toBe(1);
  });

  it('maps mid pressure according to curve curve characteristics', () => {
    const easeIn = mapPressure(0.5, 'ease_in');
    const easeOut = mapPressure(0.5, 'ease_out');
    expect(easeIn).toBeLessThan(0.5);
    expect(easeOut).toBeGreaterThan(0.5);
  });
});
