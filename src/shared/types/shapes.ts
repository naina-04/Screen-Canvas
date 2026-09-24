export type ShapeFillMode = 'none' | 'translucent' | 'solid';

export interface FillStyle {
  mode: ShapeFillMode;
  opacity: number;
  color?: string;
}

export interface AdvancedShapeMetrics {
  width: number;
  height: number;
  area: number;
  perimeter: number;
}
