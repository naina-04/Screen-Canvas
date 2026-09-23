import { describe, it, expect } from 'vitest';
import {
  snapToNearestAngle,
  constrainAspectRatio,
  applyShapeConstraint,
} from '../../src/shared/utils/snapEngine';

describe('snapEngine geometry utilities', () => {
  describe('snapToNearestAngle', () => {
    it('snaps horizontal and vertical vectors exactly', () => {
      // 0 degrees (pure right)
      const right = snapToNearestAngle(100, 0);
      expect(right.angle).toBeCloseTo(0);
      expect(right.distance).toBeCloseTo(100);

      // 90 degrees (pure down)
      const down = snapToNearestAngle(0, 100);
      expect(down.angle).toBeCloseTo(Math.PI / 2);
      expect(down.distance).toBeCloseTo(100);

      // 180 degrees (pure left)
      const left = snapToNearestAngle(-100, 0);
      expect(Math.abs(left.angle)).toBeCloseTo(Math.PI);
      expect(left.distance).toBeCloseTo(100);

      // -90 degrees (pure up)
      const up = snapToNearestAngle(0, -100);
      expect(up.angle).toBeCloseTo(-Math.PI / 2);
      expect(up.distance).toBeCloseTo(100);
    });

    it('snaps diagonal vectors to nearest 45 degree angle', () => {
      // Vector near 45 deg (e.g. dx=95, dy=105)
      const diagonal = snapToNearestAngle(95, 105);
      expect(diagonal.angle).toBeCloseTo(Math.PI / 4);
      expect(diagonal.cos).toBeCloseTo(Math.cos(Math.PI / 4));
      expect(diagonal.sin).toBeCloseTo(Math.sin(Math.PI / 4));
    });
  });

  describe('constrainAspectRatio', () => {
    it('creates 1:1 square bounding box for positive drag', () => {
      const start = { x: 10, y: 10 };
      const current = { x: 110, y: 50 }; // dx = 100, dy = 40 => max = 100
      const constrained = constrainAspectRatio(start, current);

      expect(constrained.x).toBe(110);
      expect(constrained.y).toBe(110);
      expect(Math.abs(constrained.x - start.x)).toBe(Math.abs(constrained.y - start.y));
    });

    it('creates 1:1 square bounding box preserving negative sign', () => {
      const start = { x: 200, y: 200 };
      const current = { x: 50, y: 100 }; // dx = -150, dy = -100 => max = 150
      const constrained = constrainAspectRatio(start, current);

      expect(constrained.x).toBe(50);
      expect(constrained.y).toBe(50);
      expect(constrained.x - start.x).toBe(-150);
      expect(constrained.y - start.y).toBe(-150);
    });
  });

  describe('applyShapeConstraint', () => {
    const start = { x: 100, y: 100 };
    const current = { x: 200, y: 120 };

    it('returns original point when isShift is false', () => {
      expect(applyShapeConstraint(start, current, 'line', false)).toEqual(current);
      expect(applyShapeConstraint(start, current, 'rectangle', false)).toEqual(current);
      expect(applyShapeConstraint(start, current, 'circle', false)).toEqual(current);
    });

    it('applies angle snapping for lines and arrows when isShift is true', () => {
      const linePoint = applyShapeConstraint(start, { x: 200, y: 110 }, 'line', true);
      // Angle near 0 deg
      expect(linePoint.y).toBeCloseTo(100);

      const arrowPoint = applyShapeConstraint(start, { x: 200, y: 110 }, 'arrow', true);
      expect(arrowPoint.y).toBeCloseTo(100);
    });

    it('applies 1:1 aspect ratio constraint for rectangle and circle when isShift is true', () => {
      const rectPoint = applyShapeConstraint(start, current, 'rectangle', true);
      expect(Math.abs(rectPoint.x - start.x)).toBe(Math.abs(rectPoint.y - start.y));

      const circlePoint = applyShapeConstraint(start, current, 'circle', true);
      expect(Math.abs(circlePoint.x - start.x)).toBe(Math.abs(circlePoint.y - start.y));
    });
  });
});
