import { Point } from '../types';
import { AngleSweep } from '../types/protractor';

export function calculateAngleSweep(vertex: Point, pointA: Point, pointB: Point): AngleSweep {
  const angleA = Math.atan2(pointA.y - vertex.y, pointA.x - vertex.x);
  const angleB = Math.atan2(pointB.y - vertex.y, pointB.x - vertex.x);

  let diff = (angleB - angleA) * (180 / Math.PI);
  if (diff < 0) diff += 360;

  return {
    vertex,
    pointA,
    pointB,
    angleDegrees: Math.round(diff * 10) / 10,
  };
}
