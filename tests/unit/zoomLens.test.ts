import { describe, it, expect } from 'vitest';
import { calculateZoomLensBounds } from '../../src/shared/utils/zoomLens';

describe('Zoom Lens Utility', () => {
  it('computes correct source crop and destination radius based on zoom factor', () => {
    const lens = calculateZoomLensBounds({ x: 500, y: 400 }, 100, 2);
    expect(lens.destRadius).toBe(100);
    expect(lens.sourceWidth).toBe(100);
    expect(lens.sourceHeight).toBe(100);
    expect(lens.sourceX).toBe(450);
    expect(lens.sourceY).toBe(350);
  });
});
