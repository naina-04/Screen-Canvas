import { Point } from '../types';

/**
 * Calculate Euclidean distance between two points
 */
export function distance(p1: Point, p2: Point): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculate shortest distance from a point to a line segment AB
 */
export function distToSegment(p: Point, a: Point, b: Point): number {
  const l2 = (b.x - a.x) ** 2 + (b.y - a.y) ** 2;
  if (l2 === 0) return distance(p, a);

  // Consider the line extending the segment, parameterized as a + t (b - a).
  // We find projection of point p onto the line.
  // It falls where t = [(p-a) . (b-a)] / |b-a|^2
  let t = ((p.x - a.x) * (b.x - a.x) + (p.y - a.y) * (b.y - a.y)) / l2;
  t = Math.max(0, Math.min(1, t));

  const projX = a.x + t * (b.x - a.x);
  const projY = a.y + t * (b.y - a.y);

  return distance(p, { x: projX, y: projY });
}

/**
 * Check if a point hits a polyline path within a given threshold
 */
export function isPointNearPath(point: Point, path: Point[], threshold: number): boolean {
  if (path.length === 0) return false;
  if (path.length === 1) return distance(point, path[0]) <= threshold;

  for (let i = 0; i < path.length - 1; i++) {
    if (distToSegment(point, path[i], path[i + 1]) <= threshold) {
      return true;
    }
  }
  return false;
}

/**
 * Check if a point hits a rectangle boundary or interior
 */
export function isPointInRect(
  p: Point,
  start: Point,
  end: Point,
  threshold: number,
  filled: boolean = false
): boolean {
  const minX = Math.min(start.x, end.x);
  const maxX = Math.max(start.x, end.x);
  const minY = Math.min(start.y, end.y);
  const maxY = Math.max(start.y, end.y);

  if (filled) {
    return p.x >= minX - threshold && p.x <= maxX + threshold && p.y >= minY - threshold && p.y <= maxY + threshold;
  }

  // Outline: check distance to each of the 4 borders
  const corners: Point[] = [
    { x: minX, y: minY },
    { x: maxX, y: minY },
    { x: maxX, y: maxY },
    { x: minX, y: maxY },
  ];

  return isPointNearPath(p, [...corners, corners[0]], threshold);
}

/**
 * Check if a point hits an ellipse boundary or interior
 */
export function isPointNearEllipse(
  p: Point,
  start: Point,
  end: Point,
  threshold: number,
  filled: boolean = false
): boolean {
  const cx = (start.x + end.x) / 2;
  const cy = (start.y + end.y) / 2;
  const rx = Math.abs(end.x - start.x) / 2;
  const ry = Math.abs(end.y - start.y) / 2;

  if (rx === 0 || ry === 0) return false;

  const normalizedDist = Math.pow((p.x - cx) / rx, 2) + Math.pow((p.y - cy) / ry, 2);

  if (filled) {
    return normalizedDist <= 1.1; // small tolerance
  }

  // For outline, estimate distance from boundary
  const distFromCenter = Math.sqrt(Math.pow(p.x - cx, 2) + Math.pow(p.y - cy, 2));
  const angle = Math.atan2(p.y - cy, p.x - cx);
  const radiusAtAngle = (rx * ry) / Math.sqrt(Math.pow(ry * Math.cos(angle), 2) + Math.pow(rx * Math.sin(angle), 2));

  return Math.abs(distFromCenter - radiusAtAngle) <= threshold;
}

/**
 * Compute the points for an arrowhead at endPoint
 */
export function calculateArrowhead(
  start: Point,
  end: Point,
  size: number = 20,
  angle: number = Math.PI / 6
): { left: Point; right: Point } {
  const lineAngle = Math.atan2(end.y - start.y, end.x - start.x);

  const leftX = end.x - size * Math.cos(lineAngle - angle);
  const leftY = end.y - size * Math.sin(lineAngle - angle);

  const rightX = end.x - size * Math.cos(lineAngle + angle);
  const rightY = end.y - size * Math.sin(lineAngle + angle);

  return {
    left: { x: leftX, y: leftY },
    right: { x: rightX, y: rightY },
  };
}
