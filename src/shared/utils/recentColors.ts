export class RecentColorsManager {
  private colors: string[] = [];
  private maxCapacity: number;

  constructor(maxCapacity = 6) {
    this.maxCapacity = maxCapacity;
  }

  public getColors(): string[] {
    return [...this.colors];
  }

  public addColor(hexColor: string): void {
    if (!hexColor || !hexColor.startsWith('#')) return;
    const cleanHex = hexColor.toLowerCase();
    this.colors = [cleanHex, ...this.colors.filter((c) => c !== cleanHex)].slice(0, this.maxCapacity);
  }

  public clear(): void {
    this.colors = [];
  }
}
