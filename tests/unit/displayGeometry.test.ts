import { describe, it, expect } from 'vitest';
import { getNextDisplayHop } from '../../src/shared/utils/displayGeometry';
import { DisplayInfo } from '../../src/shared/types';

describe('Display Hop Geometry Utility', () => {
  const displays: DisplayInfo[] = [
    { id: 1, name: 'Primary 4K', bounds: { x: 0, y: 0, width: 3840, height: 2160 }, scaleFactor: 1.5, isPrimary: true },
    { id: 2, name: 'Side 1080p', bounds: { x: 3840, y: 0, width: 1920, height: 1080 }, scaleFactor: 1.0, isPrimary: false },
  ];

  it('cycles from display 1 to display 2', () => {
    const hop = getNextDisplayHop(displays, 1);
    expect(hop?.nextDisplay.id).toBe(2);
  });

  it('cycles back from display 2 to display 1', () => {
    const hop = getNextDisplayHop(displays, 2);
    expect(hop?.nextDisplay.id).toBe(1);
  });

  it('returns null if only 1 display connected', () => {
    expect(getNextDisplayHop([displays[0]], 1)).toBeNull();
  });
});
