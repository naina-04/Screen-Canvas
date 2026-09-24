import { Point } from '../types';

export interface ArrowHeadGeometry {
  left: Point;
  tip: Point;
  right: Point;
}

export function computeArrowHead(start: Point, end: Point, headLength = 16, angleRad = Math.PI / 6): ArrowHeadGeometry {
  const angle = Math.atan2(end.y - start.y, end.x - start.x);

  return {
    tip: end,
    left: {
      x: end.x - headLength * Math.cos(angle - angleRad),
      y: end.y - headLength * Math.sin(angle - angleRad),
    },
    right: {
      x: end.x - headLength * Math.cos(angle + angleRad),
      y: end.y - headLength * Math.sin(angle + angleRad),
    },
  };
}

export function computeCurvedControlPoint(start: Point, end: Point, curvature = 0.2): Point {
  const midX = (start.x + end.x) / 2;
  const midY = (start.y + end.y) / 2;
  const dx = end.x - start.x;
  const dy = end.y - start.y;

  return {
    x: midX - dy * curvature,
    y: midY + dx * curvature,
  };
}
