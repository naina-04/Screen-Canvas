import { describe, it, expect, beforeEach } from 'vitest';
import { StampManager } from '../../src/shared/utils/StampManager';

describe('StampManager Utility', () => {
  let manager: StampManager;

  beforeEach(() => {
    manager = new StampManager({ startNumber: 1, color: '#ef4444' });
  });

  it('generates sequential numbers starting from 1', () => {
    expect(manager.getNextNumber()).toBe(1);
    const stamp1 = manager.createStamp({ x: 100, y: 100 });
    expect(stamp1.number).toBe(1);
    expect(manager.getNextNumber()).toBe(2);

    const stamp2 = manager.createStamp({ x: 200, y: 200 });
    expect(stamp2.number).toBe(2);
    expect(manager.getNextNumber()).toBe(3);
  });

  it('resets numbering back to 1 or specified start', () => {
    manager.createStamp({ x: 10, y: 10 });
    manager.createStamp({ x: 20, y: 20 });
    expect(manager.getNextNumber()).toBe(3);

    manager.reset();
    expect(manager.getNextNumber()).toBe(1);

    manager.reset(10);
    expect(manager.getNextNumber()).toBe(10);
  });

  it('supports decrementing when an operation is undone', () => {
    manager.createStamp({ x: 10, y: 10 });
    manager.createStamp({ x: 20, y: 20 });
    expect(manager.getNextNumber()).toBe(3);

    manager.decrement();
    expect(manager.getNextNumber()).toBe(2);
    manager.decrement();
    expect(manager.getNextNumber()).toBe(1);
    manager.decrement(); // Does not go below 1
    expect(manager.getNextNumber()).toBe(1);
  });
});
