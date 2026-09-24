import { describe, it, expect } from 'vitest';
import { chaikinSmooth } from '../../src/shared/utils/chaikinEngine';

describe('Chaikin Smoothing Engine', () => {
  it('preserves start and end endpoints', () => {
    const points = [{ x: 0, y: 0 }, { x: 50, y: 100 }, { x: 100, y: 0 }];
    const smoothed = chaikinSmooth(points, 2);

    expect(smoothed[0]).toEqual({ x: 0, y: 0 });
    expect(smoothed[smoothed.length - 1]).toEqual({ x: 100, y: 0 });
    expect(smoothed.length).toBeGreaterThan(points.length);
  });

  it('returns unchanged list when points count is less than 3', () => {
    const points = [{ x: 10, y: 10 }, { x: 20, y: 20 }];
    expect(chaikinSmooth(points, 1)).toEqual(points);
  });
});
