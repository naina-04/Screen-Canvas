import { Point } from '../types';

export interface DistanceMeasurement {
  distancePixels: number;
  angleDegrees: number;
  deltaX: number;
  deltaY: number;
}

export function measureBetweenPoints(p1: Point, p2: Point): DistanceMeasurement {
  const deltaX = p2.x - p1.x;
  const deltaY = p2.y - p1.y;
  const distancePixels = Math.hypot(deltaX, deltaY);
  let angleDegrees = (Math.atan2(deltaY, deltaX) * 180) / Math.PI;
  if (angleDegrees < 0) angleDegrees += 360;

  return {
    distancePixels,
    angleDegrees,
    deltaX,
    deltaY,
  };
}
