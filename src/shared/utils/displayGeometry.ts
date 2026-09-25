import { DisplayInfo } from '../types';
import { DisplayHopTarget } from '../types/displayGeometry';

export function getNextDisplayHop(displays: DisplayInfo[], currentId: number): DisplayHopTarget | null {
  if (displays.length <= 1) return null;

  const currentIndex = displays.findIndex((d) => d.id === currentId);
  const nextIndex = (currentIndex + 1) % displays.length;

  return {
    currentIndex,
    nextIndex,
    nextDisplay: displays[nextIndex],
  };
}
