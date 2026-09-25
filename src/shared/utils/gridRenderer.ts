import { GridConfig } from '../types/grid';

export function calculateGridLineCount(width: number, height: number, spacing: number): { xLines: number; yLines: number } {
  const safeSpacing = Math.max(8, spacing);
  return {
    xLines: Math.floor(width / safeSpacing),
    yLines: Math.floor(height / safeSpacing),
  };
}
