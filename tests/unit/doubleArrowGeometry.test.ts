import { describe, it, expect } from 'vitest';
import { computeDoubleArrow } from '../../src/shared/utils/doubleArrowGeometry';

describe('Double Arrow Geometry Generator', () => {
  it('computes symmetric arrowheads on both ends', () => {
    const doubleArrow = computeDoubleArrow({ x: 0, y: 0 }, { x: 200, y: 0 }, 16);
    expect(doubleArrow.startTip).toEqual({ x: 0, y: 0 });
    expect(doubleArrow.endTip).toEqual({ x: 200, y: 0 });
    expect(doubleArrow.endLeft.x).toBeLessThan(200);
    expect(doubleArrow.startLeft.x).toBeGreaterThan(0);
  });
});
