import { Point } from '../types';

export function chaikinSmooth(points: Point[], iterations = 2): Point[] {
  if (points.length < 3) return points;

  let current = [...points];

  for (let it = 0; it < iterations; it++) {
    const smoothed: Point[] = [];
    smoothed.push(current[0]);

    for (let i = 0; i < current.length - 1; i++) {
      const p0 = current[i];
      const p1 = current[i + 1];

      const q: Point = {
        x: 0.75 * p0.x + 0.25 * p1.x,
        y: 0.75 * p0.y + 0.25 * p1.y,
      };

      const r: Point = {
        x: 0.25 * p0.x + 0.75 * p1.x,
        y: 0.25 * p0.y + 0.75 * p1.y,
      };

      smoothed.push(q, r);
    }

    smoothed.push(current[current.length - 1]);
    current = smoothed;
  }

  return current;
}
