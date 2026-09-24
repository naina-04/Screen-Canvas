import { describe, it, expect } from 'vitest';
import { catmullRomSpline } from '../../src/shared/utils/splineEngine';

describe('Catmull-Rom Spline Engine', () => {
  it('returns original points if less than 3 points are provided', () => {
    const pts = [{ x: 0, y: 0 }, { x: 10, y: 10 }];
    expect(catmullRomSpline(pts)).toEqual(pts);
  });

  it('interpolates smooth intermediate curve points for path', () => {
    const pts = [
      { x: 0, y: 0 },
      { x: 50, y: 100 },
      { x: 100, y: 0 },
      { x: 150, y: 50 },
    ];
    const smoothed = catmullRomSpline(pts, 4);
    expect(smoothed.length).toBeGreaterThan(pts.length);
    expect(smoothed[0].x).toBeCloseTo(0, 0);
  });
});
