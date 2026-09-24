import { SequentialStampElement, StampConfig, StampStyle } from '../types/stamp';
import { Point } from '../types';

export class StampManager {
  private currentNumber: number;
  private defaultRadius: number;
  private defaultColor: string;
  private defaultStyle: StampStyle;

  constructor(config: StampConfig = {}) {
    this.currentNumber = config.startNumber ?? 1;
    this.defaultRadius = config.radius ?? 16;
    this.defaultColor = config.color ?? '#3b82f6';
    this.defaultStyle = config.style ?? 'circle';
  }

  public getNextNumber(): number {
    return this.currentNumber;
  }

  public createStamp(point: Point, color?: string, radius?: number): SequentialStampElement {
    const stamp: SequentialStampElement = {
      id: `stamp-${Date.now()}-${this.currentNumber}`,
      type: 'stamp',
      number: this.currentNumber,
      point,
      color: color || this.defaultColor,
      radius: radius || this.defaultRadius,
      style: this.defaultStyle,
    };
    this.currentNumber++;
    return stamp;
  }

  public reset(startNumber = 1): void {
    this.currentNumber = startNumber;
  }

  public setNumber(num: number): void {
    if (num > 0) {
      this.currentNumber = num;
    }
  }

  public decrement(): void {
    if (this.currentNumber > 1) {
      this.currentNumber--;
    }
  }
}
