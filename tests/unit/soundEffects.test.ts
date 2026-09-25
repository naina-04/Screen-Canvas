import { describe, it, expect, beforeEach } from 'vitest';
import { SoundEffectEngine } from '../../src/shared/utils/soundEffects';

describe('Sound Effect Engine', () => {
  let engine: SoundEffectEngine;

  beforeEach(() => {
    engine = new SoundEffectEngine();
  });

  it('assigns distinctive musical frequencies to actions', () => {
    expect(engine.getNoteFrequency('tool_switch')).toBeCloseTo(523.25, 1);
    expect(engine.getNoteFrequency('stamp_drop')).toBeCloseTo(659.25, 1);
    expect(engine.getNoteFrequency('clear_all')).toBeCloseTo(261.63, 1);
  });

  it('respects volume bounds and mute toggle', () => {
    engine.setMuted(true);
    expect(engine.isMuted()).toBe(true);
    expect(engine.play('tool_switch')).toBe(false);

    engine.setMuted(false);
    expect(engine.isMuted()).toBe(false);
    expect(engine.play('tool_switch')).toBe(true);
  });
});
