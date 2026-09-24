import { describe, it, expect } from 'vitest';
import { parseShortcutString, areShortcutsConflicting } from '../../src/shared/utils/shortcutValidator';

describe('Shortcut Validator Utility', () => {
  it('parses accelerator string to key components', () => {
    const parsed = parseShortcutString('Control+Shift+D');
    expect(parsed.key).toBe('D');
    expect(parsed.ctrl).toBe(true);
    expect(parsed.shift).toBe(true);
    expect(parsed.alt).toBe(false);
  });

  it('detects conflicting shortcuts accurately', () => {
    expect(areShortcutsConflicting('Control+Shift+D', 'Ctrl+Shift+d')).toBe(true);
    expect(areShortcutsConflicting('Control+Shift+D', 'Control+Shift+C')).toBe(false);
    expect(areShortcutsConflicting('P', 'Shift+P')).toBe(false);
  });
});
