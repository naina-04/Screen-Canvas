import { describe, it, expect } from 'vitest';
import { measureBetweenPoints } from '../../src/shared/utils/measurementEngine';

describe('Measurement Engine', () => {
  it('calculates euclidean distance and horizontal angle accurately', () => {
    const m = measureBetweenPoints({ x: 0, y: 0 }, { x: 300, y: 400 });
    expect(m.distancePixels).toBe(500);
    expect(m.deltaX).toBe(300);
    expect(m.deltaY).toBe(400);
  });

  it('calculates 90 degree vertical line', () => {
    const m = measureBetweenPoints({ x: 10, y: 10 }, { x: 10, y: 110 });
    expect(m.distancePixels).toBe(100);
    expect(m.angleDegrees).toBe(90);
  });
});
