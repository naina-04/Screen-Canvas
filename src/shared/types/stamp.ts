import { Point } from './index';

export type StampStyle = 'circle' | 'badge' | 'square';

export interface StampConfig {
  prefix?: string;
  startNumber?: number;
  color?: string;
  fontSize?: number;
  radius?: number;
  style?: StampStyle;
}

export interface SequentialStampElement {
  id: string;
  type: 'stamp';
  number: number;
  point: Point;
  color: string;
  radius: number;
  style: StampStyle;
}
