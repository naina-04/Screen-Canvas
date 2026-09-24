import { DrawingElement, Point } from '../types';

export interface BoundingBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
}

export function computePointsBoundingBox(points: Point[]): BoundingBox | null {
  if (points.length === 0) return null;

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const pt of points) {
    if (pt.x < minX) minX = pt.x;
    if (pt.y < minY) minY = pt.y;
    if (pt.x > maxX) maxX = pt.x;
    if (pt.y > maxY) maxY = pt.y;
  }

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

export function computeElementBoundingBox(element: DrawingElement): BoundingBox | null {
  if ('points' in element && Array.isArray((element as any).points)) {
    return computePointsBoundingBox((element as any).points);
  }
  if ('startPoint' in element && 'endPoint' in element) {
    const el = element as any;
    return computePointsBoundingBox([el.startPoint, el.endPoint]);
  }
  if ('point' in element) {
    const el = element as any;
    const padding = 20;
    return {
      minX: el.point.x - padding,
      minY: el.point.y - padding,
      maxX: el.point.x + padding,
      maxY: el.point.y + padding,
      width: padding * 2,
      height: padding * 2,
    };
  }
  return null;
}
