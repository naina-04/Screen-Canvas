import { describe, it, expect } from 'vitest';
import { hexToRgb, getLuminance, getContrastRatio, getOptimalTextColor } from '../../src/shared/utils/colorUtils';

describe('Color Utilities', () => {
  it('converts HEX to RGB accurately', () => {
    expect(hexToRgb('#ffffff')).toEqual({ r: 255, g: 255, b: 255 });
    expect(hexToRgb('#000000')).toEqual({ r: 0, g: 0, b: 0 });
    expect(hexToRgb('#3b82f6')).toEqual({ r: 59, g: 130, b: 246 });
    expect(hexToRgb('invalid')).toBeNull();
  });

  it('calculates relative luminance and contrast ratio', () => {
    const whiteLum = getLuminance('#ffffff');
    const blackLum = getLuminance('#000000');
    expect(whiteLum).toBeCloseTo(1, 1);
    expect(blackLum).toBeCloseTo(0, 1);

    const contrast = getContrastRatio('#ffffff', '#000000');
    expect(contrast).toBeGreaterThan(20);
  });

  it('selects optimal text color for contrast', () => {
    expect(getOptimalTextColor('#ffffff')).toBe('#18191d');
    expect(getOptimalTextColor('#000000')).toBe('#ffffff');
    expect(getOptimalTextColor('#1e293b')).toBe('#ffffff');
  });
});
