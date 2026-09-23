import { describe, it, expect } from 'vitest';
import {
  distance,
  distToSegment,
  isPointNearPath,
  isPointInRect,
  calculateArrowhead,
} from '../../src/shared/utils/geometry';

describe('Geometry Utilities', () => {
  it('calculates Euclidean distance between two points', () => {
    expect(distance({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5);
    expect(distance({ x: 10, y: 10 }, { x: 10, y: 10 })).toBe(0);
  });

  it('calculates shortest distance from a point to a line segment', () => {
    const a = { x: 0, y: 0 };
    const b = { x: 10, y: 0 };

    // Point directly above middle of segment
    expect(distToSegment({ x: 5, y: 5 }, a, b)).toBe(5);

    // Point beyond segment endpoint b
    expect(distToSegment({ x: 15, y: 0 }, a, b)).toBe(5);

    // Point before segment startpoint a
    expect(distToSegment({ x: -4, y: 0 }, a, b)).toBe(4);
  });

  it('detects point hit near a multi-point path', () => {
    const path = [
      { x: 0, y: 0 },
      { x: 50, y: 50 },
      { x: 100, y: 50 },
    ];

    expect(isPointNearPath({ x: 25, y: 25 }, path, 2)).toBe(true);
    expect(isPointNearPath({ x: 75, y: 52 }, path, 3)).toBe(true);
    expect(isPointNearPath({ x: 200, y: 200 }, path, 10)).toBe(false);
  });

  it('detects point hit in and around rectangles', () => {
    const start = { x: 10, y: 10 };
    const end = { x: 100, y: 100 };

    // Hit on the border
    expect(isPointInRect({ x: 10, y: 50 }, start, end, 3, false)).toBe(true);

    // Point inside outline rect is false if filled=false
    expect(isPointInRect({ x: 50, y: 50 }, start, end, 3, false)).toBe(false);

    // Point inside filled rect is true if filled=true
    expect(isPointInRect({ x: 50, y: 50 }, start, end, 3, true)).toBe(true);
  });

  it('calculates correct arrowhead points for directional line', () => {
    const start = { x: 0, y: 0 };
    const end = { x: 100, y: 0 }; // Horizontal line to the right

    const { left, right } = calculateArrowhead(start, end, 20, Math.PI / 6);

    // End is at (100, 0), so left and right should point backwards (x < 100)
    expect(left.x).toBeLessThan(100);
    expect(right.x).toBeLessThan(100);
    // Y should be symmetrically above and below 0
    expect(left.y).toBeCloseTo(-right.y, 4);
  });
});
