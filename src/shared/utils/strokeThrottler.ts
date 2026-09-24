import { Point } from '../types';

export class StrokeThrottler {
  private minDistanceSq: number;
  private lastPoint: Point | null = null;

  constructor(minDistance = 2) {
    this.minDistanceSq = minDistance * minDistance;
  }

  public shouldAccept(point: Point): boolean {
    if (!this.lastPoint) {
      this.lastPoint = point;
      return true;
    }

    const dx = point.x - this.lastPoint.x;
    const dy = point.y - this.lastPoint.y;
    const distSq = dx * dx + dy * dy;

    if (distSq >= this.minDistanceSq) {
      this.lastPoint = point;
      return true;
    }

    return false;
  }

  public reset(): void {
    this.lastPoint = null;
  }
}
