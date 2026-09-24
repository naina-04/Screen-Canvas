import { describe, it, expect } from 'vitest';
import { computePointsBoundingBox, computeElementBoundingBox } from '../../src/shared/utils/boundingBox';

describe('Bounding Box Utility', () => {
  it('computes accurate bounds for point arrays', () => {
    const pts = [
      { x: 10, y: 20 },
      { x: 50, y: 5 },
      { x: 30, y: 80 },
    ];
    const bbox = computePointsBoundingBox(pts);
    expect(bbox).toEqual({
      minX: 10,
      minY: 5,
      maxX: 50,
      maxY: 80,
      width: 40,
      height: 75,
    });
  });

  it('handles empty points gracefully', () => {
    expect(computePointsBoundingBox([])).toBeNull();
  });

  it('computes bounding box for shape elements', () => {
    const shape: any = {
      id: 'sh-1',
      type: 'rectangle',
      startPoint: { x: 100, y: 50 },
      endPoint: { x: 200, y: 150 },
    };
    const bbox = computeElementBoundingBox(shape);
    expect(bbox).not.toBeNull();
    expect(bbox?.width).toBe(100);
    expect(bbox?.height).toBe(100);
  });
});
