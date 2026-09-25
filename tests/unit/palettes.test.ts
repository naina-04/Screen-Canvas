import { describe, it, expect } from 'vitest';
import { CURATED_PALETTES } from '../../src/shared/constants/palettes';

describe('Curated Color Palettes', () => {
  it('contains valid hexadecimal color swatches', () => {
    expect(CURATED_PALETTES.length).toBeGreaterThanOrEqual(2);
    for (const theme of CURATED_PALETTES) {
      expect(theme.colors.length).toBeGreaterThan(0);
      for (const color of theme.colors) {
        expect(color).toMatch(/^#[0-9a-fA-F]{6}$/);
      }
    }
  });
});
