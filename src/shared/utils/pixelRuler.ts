import { PixelMeasurement } from '../types/measurements';

export function calculatePixelMeasurement(
  startX: number,
  startY: number,
  endX: number,
  endY: number
): PixelMeasurement {
  const dx = endX - startX;
  const dy = endY - startY;
  const pixelDistance = Math.round(Math.hypot(dx, dy));
  let angle = Math.round((Math.atan2(dy, dx) * 180) / Math.PI);
  if (angle < 0) angle += 360;

  return {
    startX,
    startY,
    endX,
    endY,
    pixelDistance,
    angle,
  };
}
