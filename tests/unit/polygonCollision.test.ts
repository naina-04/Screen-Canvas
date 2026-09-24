import { describe, it, expect } from 'vitest';
import { isPointInsidePolygon } from '../../src/shared/utils/polygonCollision';

describe('Polygon Collision Engine', () => {
  const triangle = [
    { x: 0, y: 0 },
    { x: 100, y: 0 },
    { x: 50, y: 100 },
  ];

  it('detects points inside polygon correctly', () => {
    expect(isPointInsidePolygon({ x: 50, y: 30 }, triangle)).toBe(true);
  });

  it('detects points outside polygon correctly', () => {
    expect(isPointInsidePolygon({ x: 200, y: 200 }, triangle)).toBe(false);
    expect(isPointInsidePolygon({ x: -10, y: 10 }, triangle)).toBe(false);
  });

  it('returns false for degenerate polygons', () => {
    expect(isPointInsidePolygon({ x: 5, y: 5 }, [{ x: 0, y: 0 }, { x: 10, y: 10 }])).toBe(false);
  });
});
