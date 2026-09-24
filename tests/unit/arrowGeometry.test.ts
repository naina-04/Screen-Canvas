import { describe, it, expect } from 'vitest';
import { computeArrowHead, computeCurvedControlPoint } from '../../src/shared/utils/arrowGeometry';

describe('Arrow Geometry Engine', () => {
  it('computes symmetric arrowhead wings', () => {
    const head = computeArrowHead({ x: 0, y: 0 }, { x: 100, y: 0 }, 20);
    expect(head.tip).toEqual({ x: 100, y: 0 });
    expect(head.left.x).toBeLessThan(100);
    expect(head.right.x).toBeLessThan(100);
    expect(head.left.y).toBeCloseTo(-head.right.y, 1);
  });

  it('calculates curved arrow bezier control point', () => {
    const cp = computeCurvedControlPoint({ x: 0, y: 0 }, { x: 100, y: 0 }, 0.2);
    expect(cp.x).toBe(50);
    expect(cp.y).not.toBe(0);
  });
});
