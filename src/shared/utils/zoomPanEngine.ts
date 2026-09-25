import { Point } from '../types';
import { ViewportTransform } from '../types/zoomPan';

export function screenToWorld(pt: Point, transform: ViewportTransform): Point {
  return {
    x: (pt.x - transform.offsetX) / transform.scale,
    y: (pt.y - transform.offsetY) / transform.scale,
  };
}

export function worldToScreen(pt: Point, transform: ViewportTransform): Point {
  return {
    x: pt.x * transform.scale + transform.offsetX,
    y: pt.y * transform.scale + transform.offsetY,
  };
}
