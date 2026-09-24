export interface KeyCombination {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
}

export function parseShortcutString(accelerator: string): KeyCombination {
  const parts = accelerator.split('+').map((p) => p.trim());
  const key = parts[parts.length - 1];
  const ctrl = parts.includes('CommandOrControl') || parts.includes('Control') || parts.includes('Ctrl');
  const shift = parts.includes('Shift');
  const alt = parts.includes('Alt');
  const meta = parts.includes('Command') || parts.includes('Cmd') || parts.includes('Meta');

  return { key, ctrl, shift, alt, meta };
}

export function areShortcutsConflicting(acc1: string, acc2: string): boolean {
  const k1 = parseShortcutString(acc1);
  const k2 = parseShortcutString(acc2);

  return (
    k1.key.toLowerCase() === k2.key.toLowerCase() &&
    Boolean(k1.ctrl) === Boolean(k2.ctrl) &&
    Boolean(k1.shift) === Boolean(k2.shift) &&
    Boolean(k1.alt) === Boolean(k2.alt) &&
    Boolean(k1.meta) === Boolean(k2.meta)
  );
}
