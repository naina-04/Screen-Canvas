import { describe, it, expect } from 'vitest';
import { normalizeKey } from '../../src/shared/utils/shortcutResolver';

describe('Shortcut Key Normalizer', () => {
  it('normalizes synonym keys to standard representation', () => {
    expect(normalizeKey('Control')).toBe('ctrl');
    expect(normalizeKey('Cmd')).toBe('meta');
    expect(normalizeKey('Esc')).toBe('escape');
    expect(normalizeKey('P')).toBe('p');
  });
});
