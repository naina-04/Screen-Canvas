import { Point } from './index';

export type StickerType = 'checkmark' | 'cross' | 'star' | 'warning' | 'heart' | 'question';

export interface PresentationSticker {
  id: string;
  type: StickerType;
  point: Point;
  size: number;
  color: string;
}
