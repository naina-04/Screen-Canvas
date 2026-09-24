import { Point } from '../types';

export interface ZoomLensBounds {
  sourceX: number;
  sourceY: number;
  sourceWidth: number;
  sourceHeight: number;
  destX: number;
  destY: number;
  destRadius: number;
}

export function calculateZoomLensBounds(center: Point, radius = 120, zoomFactor = 2.5): ZoomLensBounds {
  const sourceWidth = (radius * 2) / zoomFactor;
  const sourceHeight = (radius * 2) / zoomFactor;
  const sourceX = center.x - sourceWidth / 2;
  const sourceY = center.y - sourceHeight / 2;

  return {
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    destX: center.x,
    destY: center.y,
    destRadius: radius,
  };
}
