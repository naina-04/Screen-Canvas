export type SoundEffectType =
  | 'tool_switch'
  | 'pen_draw'
  | 'undo'
  | 'redo'
  | 'clear_all'
  | 'stamp_drop'
  | 'slide_flip'
  | 'screenshot';

export interface SoundConfig {
  enabled: boolean;
  volume: number; // 0.0 to 1.0
  muted: boolean;
}
