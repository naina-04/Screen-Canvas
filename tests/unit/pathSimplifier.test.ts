import { describe, it, expect } from 'vitest';
import { simplifyPathRDP } from '../../src/shared/utils/pathSimplifier';

describe('Ramer-Douglas-Peucker Path Simplification', () => {
  it('simplifies collinear points down to start and end', () => {
    const collinear = [
      { x: 0, y: 0 },
      { x: 25, y: 25 },
      { x: 50, y: 50 },
      { x: 75, y: 75 },
      { x: 100, y: 100 },
    ];
    const simplified = simplifyPathRDP(collinear, 1.0);
    expect(simplified.length).toBe(2);
    expect(simplified[0]).toEqual({ x: 0, y: 0 });
    expect(simplified[1]).toEqual({ x: 100, y: 100 });
  });

  it('preserves important shape vertices with significant deviation', () => {
    const corner = [
      { x: 0, y: 0 },
      { x: 50, y: 100 },
      { x: 100, y: 0 },
    ];
    const simplified = simplifyPathRDP(corner, 2.0);
    expect(simplified.length).toBe(3);
  });
});
