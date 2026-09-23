import { screen } from 'electron';
import { DisplayInfo } from '../../shared/types';

export class DisplayManager {
  private selectedDisplayId: number | null = null;

  public getDisplays(): DisplayInfo[] {
    const displays = screen.getAllDisplays();
    const primary = screen.getPrimaryDisplay();

    return displays.map((disp, index) => ({
      id: disp.id,
      name: `Display ${index + 1}${disp.id === primary.id ? ' (Primary)' : ''} [${disp.bounds.width}x${disp.bounds.height}]`,
      bounds: {
        x: disp.bounds.x,
        y: disp.bounds.y,
        width: disp.bounds.width,
        height: disp.bounds.height,
      },
      scaleFactor: disp.scaleFactor,
      isPrimary: disp.id === primary.id,
    }));
  }

  public getSelectedDisplay() {
    const displays = screen.getAllDisplays();
    if (this.selectedDisplayId) {
      const match = displays.find((d) => d.id === this.selectedDisplayId);
      if (match) return match;
    }
    return screen.getPrimaryDisplay();
  }

  public setSelectedDisplayId(id: number): boolean {
    const displays = screen.getAllDisplays();
    const exists = displays.some((d) => d.id === id);
    if (exists) {
      this.selectedDisplayId = id;
      return true;
    }
    return false;
  }
}
