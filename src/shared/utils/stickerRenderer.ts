import { StickerType } from '../types/stickers';

export function getStickerSymbol(type: StickerType): string {
  switch (type) {
    case 'checkmark': return '✓';
    case 'cross': return '✕';
    case 'star': return '★';
    case 'warning': return '⚠';
    case 'heart': return '❤';
    case 'question': return '?';
    default: return '•';
  }
}

export function getStickerDefaultColor(type: StickerType): string {
  switch (type) {
    case 'checkmark': return '#22c55e';
    case 'cross': return '#ef4444';
    case 'star': return '#f59e0b';
    case 'warning': return '#f97316';
    case 'heart': return '#ec4899';
    case 'question': return '#3b82f6';
    default: return '#ffffff';
  }
}
