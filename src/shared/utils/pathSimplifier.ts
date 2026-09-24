import { Point } from '../types';
import { distToSegment } from './geometry';

export function simplifyPathRDP(points: Point[], epsilon = 1.0): Point[] {
  if (points.length <= 2) return points;

  let maxDist = 0;
  let index = 0;

  const start = points[0];
  const end = points[points.length - 1];

  for (let i = 1; i < points.length - 1; i++) {
    const dist = distToSegment(points[i], start, end);
    if (dist > maxDist) {
      maxDist = dist;
      index = i;
    }
  }

  if (maxDist > epsilon) {
    const left = simplifyPathRDP(points.slice(0, index + 1), epsilon);
    const right = simplifyPathRDP(points.slice(index), epsilon);
    return left.slice(0, -1).concat(right);
  } else {
    return [start, end];
  }
}
