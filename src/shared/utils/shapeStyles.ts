import { FillStyle, AdvancedShapeMetrics } from '../types/shapes';
import { Point } from '../types';

export function resolveFillColor(baseHex: string, fill: FillStyle): string | null {
  if (fill.mode === 'none') return null;
  const color = fill.color || baseHex;
  const hex = color.replace('#', '');
  if (hex.length !== 6) return null;

  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const alpha = fill.mode === 'solid' ? 1 : Math.max(0, Math.min(1, fill.opacity));

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function computeShapeMetrics(start: Point, end: Point): AdvancedShapeMetrics {
  const width = Math.abs(end.x - start.x);
  const height = Math.abs(end.y - start.y);
  const area = width * height;
  const perimeter = 2 * (width + height);

  return { width, height, area, perimeter };
}
