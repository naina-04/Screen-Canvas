export type GridStyle = 'dot' | 'ruled' | 'isometric' | 'millimeter';

export interface GridConfig {
  style: GridStyle;
  spacing: number;
  color: string;
  opacity: number;
}
