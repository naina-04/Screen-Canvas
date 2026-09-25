import { describe, it, expect, beforeEach } from 'vitest';
import { RecentColorsManager } from '../../src/shared/utils/recentColors';

describe('Recent Colors Manager', () => {
  let manager: RecentColorsManager;

  beforeEach(() => {
    manager = new RecentColorsManager(4);
  });

  it('adds and prepends colors without duplicates', () => {
    manager.addColor('#ff0000');
    manager.addColor('#00ff00');
    manager.addColor('#ff0000');

    expect(manager.getColors()).toEqual(['#ff0000', '#00ff00']);
  });

  it('enforces maximum capacity limit', () => {
    manager.addColor('#111111');
    manager.addColor('#222222');
    manager.addColor('#333333');
    manager.addColor('#444444');
    manager.addColor('#555555');

    expect(manager.getColors()).toHaveLength(4);
    expect(manager.getColors()[0]).toBe('#555555');
  });
});
