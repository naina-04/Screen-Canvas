import { describe, it, expect } from 'vitest';
import { getStickerSymbol, getStickerDefaultColor } from '../../src/shared/utils/stickerRenderer';

describe('Sticker Stamp Renderer Engine', () => {
  it('returns valid symbols for presentation badges', () => {
    expect(getStickerSymbol('checkmark')).toBe('✓');
    expect(getStickerSymbol('cross')).toBe('✕');
    expect(getStickerSymbol('star')).toBe('★');
  });

  it('assigns vibrant default theme colors to stickers', () => {
    expect(getStickerDefaultColor('checkmark')).toBe('#22c55e');
    expect(getStickerDefaultColor('cross')).toBe('#ef4444');
    expect(getStickerDefaultColor('star')).toBe('#f59e0b');
  });
});
