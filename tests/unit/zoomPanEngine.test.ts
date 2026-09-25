import { describe, it, expect } from 'vitest';
import { screenToWorld, worldToScreen } from '../../src/shared/utils/zoomPanEngine';

describe('Viewport Coordinate Transform Engine', () => {
  const transform = { scale: 2, offsetX: 100, offsetY: 50 };

  it('transforms screen coordinate to world coordinate accurately', () => {
    const world = screenToWorld({ x: 300, y: 250 }, transform);
    expect(world.x).toBe(100);
    expect(world.y).toBe(100);
  });

  it('transforms world coordinate back to screen coordinate with 1:1 roundtrip', () => {
    const initial = { x: 50, y: 75 };
    const screen = worldToScreen(initial, transform);
    const roundtrip = screenToWorld(screen, transform);
    expect(roundtrip.x).toBeCloseTo(initial.x);
    expect(roundtrip.y).toBeCloseTo(initial.y);
  });
});
