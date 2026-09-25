import { DisplayInfo } from './index';

export interface DisplayHopTarget {
  currentIndex: number;
  nextIndex: number;
  nextDisplay: DisplayInfo;
}
