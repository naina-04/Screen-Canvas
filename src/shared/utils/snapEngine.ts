import { Point } from '../types';

/**
 * Snaps a directional vector (dx, dy) to the nearest angle increment (e.g. 45 degrees / PI/4)
 */
export function snapToNearestAngle(
  dx: number,
  dy: number,
  stepRadians: number = Math.PI / 4
): { cos: number; sin: number; angle: number; distance: number } {
  const angle = Math.atan2(dy, dx);
  const snapAngle = Math.round(angle / stepRadians) * stepRadians;
  const distance = Math.hypot(dx, dy);

  return {
    cos: Math.cos(snapAngle),
    sin: Math.sin(snapAngle),
    angle: snapAngle,
    distance,
  };
}

/**
 * Constrains a bounding box to a 1:1 square/circle aspect ratio preserving drag direction
 */
export function constrainAspectRatio(start: Point, current: Point): Point {
  const dx = current.x - start.x;
  const dy = current.y - start.y;
  const size = Math.max(Math.abs(dx), Math.abs(dy));

  return {
    x: start.x + (dx >= 0 ? size : -size),
    y: start.y + (dy >= 0 ? size : -size),
  };
}

/**
 * Applies Shift-key constraints according to the active drawing tool
 */
export function applyShapeConstraint(
  start: Point,
  current: Point,
  tool: string,
  isShift: boolean
): Point {
  if (!isShift) return current;

  if (tool === 'line' || tool === 'arrow') {
    const dx = current.x - start.x;
    const dy = current.y - start.y;
    const { cos, sin, distance } = snapToNearestAngle(dx, dy, Math.PI / 4);

    return {
      x: start.x + cos * distance,
      y: start.y + sin * distance,
    };
  }

  if (tool === 'rectangle' || tool === 'circle') {
    return constrainAspectRatio(start, current);
  }

  return current;
}
