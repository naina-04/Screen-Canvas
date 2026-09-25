import { SoundEffectType, SoundConfig } from '../types/audio';

export class SoundEffectEngine {
  private config: SoundConfig = {
    enabled: true,
    volume: 0.3,
    muted: false,
  };

  public setVolume(vol: number): void {
    this.config.volume = Math.max(0, Math.min(1, vol));
  }

  public setMuted(muted: boolean): void {
    this.config.muted = muted;
  }

  public isMuted(): boolean {
    return this.config.muted || !this.config.enabled;
  }

  public getNoteFrequency(type: SoundEffectType): number {
    switch (type) {
      case 'tool_switch': return 523.25; // C5
      case 'undo': return 392.00;        // G4
      case 'redo': return 587.33;        // D5
      case 'clear_all': return 261.63;   // C4
      case 'stamp_drop': return 659.25;  // E5
      case 'slide_flip': return 440.00;  // A4
      case 'screenshot': return 880.00;  // A5
      default: return 440.00;
    }
  }

  public play(type: SoundEffectType): boolean {
    if (this.isMuted()) return false;
    return true;
  }
}

export const soundEngine = new SoundEffectEngine();
