import { describe, it, expect, beforeEach } from 'vitest';
import { StrokeThrottler } from '../../src/shared/utils/strokeThrottler';

describe('Stroke Throttler Utility', () => {
  let throttler: StrokeThrottler;

  beforeEach(() => {
    throttler = new StrokeThrottler(3);
  });

  it('accepts initial point', () => {
    expect(throttler.shouldAccept({ x: 0, y: 0 })).toBe(true);
  });

  it('filters out redundant high-frequency jitter within threshold', () => {
    throttler.shouldAccept({ x: 0, y: 0 });
    expect(throttler.shouldAccept({ x: 1, y: 1 })).toBe(false);
    expect(throttler.shouldAccept({ x: 1.5, y: 1.5 })).toBe(false);
    expect(throttler.shouldAccept({ x: 4, y: 0 })).toBe(true);
  });

  it('resets state between strokes', () => {
    throttler.shouldAccept({ x: 100, y: 100 });
    throttler.reset();
    expect(throttler.shouldAccept({ x: 101, y: 101 })).toBe(true);
  });
});
