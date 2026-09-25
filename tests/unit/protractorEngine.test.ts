import { describe, it, expect } from 'vitest';
import { calculateAngleSweep } from '../../src/shared/utils/protractorEngine';

describe('Protractor Angle Sweep Engine', () => {
  it('calculates 90 degree perpendicular angle', () => {
    const sweep = calculateAngleSweep(
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 0, y: 100 }
    );
    expect(sweep.angleDegrees).toBe(90);
  });

  it('calculates 180 degree straight angle', () => {
    const sweep = calculateAngleSweep(
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: -100, y: 0 }
    );
    expect(sweep.angleDegrees).toBe(180);
  });
});
