export function normalizeKey(key: string): string {
  const lower = key.trim().toLowerCase();
  if (lower === 'ctrl' || lower === 'control') return 'ctrl';
  if (lower === 'cmd' || lower === 'command' || lower === 'meta') return 'meta';
  if (lower === 'esc') return 'escape';
  return lower;
}
