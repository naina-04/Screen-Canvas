import { describe, it, expect, beforeEach } from 'vitest';
import {
  ToolType,
  DrawingSettings,
  isNeutralTool,
  isDrawingTool,
} from '../../src/shared/types';
import { DEFAULT_SETTINGS, SHORTCUTS } from '../../src/shared/constants/defaults';

describe('Tool Selection State Machine & Neutral Mode', () => {
  let settings: DrawingSettings;
  let lastActiveDrawingTool: ToolType;

  // Emulates the tool selection state machine implemented in ToolbarApp
  const selectTool = (tool: ToolType) => {
    if (isNeutralTool(tool)) {
      settings = { ...settings, activeTool: 'select' };
      return;
    }

    if (settings.activeTool === tool) {
      // Toggle active tool to neutral select mode
      settings = { ...settings, activeTool: 'select' };
    } else {
      // Switch to new tool and ensure drawing mode is active
      lastActiveDrawingTool = tool;
      settings = {
        ...settings,
        activeTool: tool,
        isDrawingMode: true,
      };
    }
  };

  const toggleDrawingMode = () => {
    const next = !settings.isDrawingMode;
    if (next && isNeutralTool(settings.activeTool)) {
      const restored = lastActiveDrawingTool || 'pen';
      settings = { ...settings, isDrawingMode: next, activeTool: restored };
    } else {
      settings = { ...settings, isDrawingMode: next };
    }
  };

  beforeEach(() => {
    settings = { ...DEFAULT_SETTINGS, activeTool: 'select' };
    lastActiveDrawingTool = 'pen';
  });

  it('correctly identifies neutral vs drawing tools', () => {
    expect(isNeutralTool('select')).toBe(true);
    expect(isNeutralTool('none')).toBe(true);
    expect(isNeutralTool('pen')).toBe(false);
    expect(isNeutralTool('eraser')).toBe(false);
    expect(isNeutralTool('rectangle')).toBe(false);

    expect(isDrawingTool('pen')).toBe(true);
    expect(isDrawingTool('highlighter')).toBe(true);
    expect(isDrawingTool('marker')).toBe(true);
    expect(isDrawingTool('eraser')).toBe(true);
    expect(isDrawingTool('line')).toBe(true);
    expect(isDrawingTool('arrow')).toBe(true);
    expect(isDrawingTool('rectangle')).toBe(true);
    expect(isDrawingTool('circle')).toBe(true);
    expect(isDrawingTool('text')).toBe(true);
    expect(isDrawingTool('select')).toBe(false);
    expect(isDrawingTool('none')).toBe(false);
  });

  it('selects the Pen tool and keeps drawing mode enabled', () => {
    expect(settings.activeTool).toBe('select');
    selectTool('pen');
    expect(settings.activeTool).toBe('pen');
    expect(settings.isDrawingMode).toBe(true);
    expect(isNeutralTool(settings.activeTool)).toBe(false);
  });

  it('toggles Pen tool off to neutral mode when clicked again', () => {
    selectTool('pen');
    expect(settings.activeTool).toBe('pen');

    // Click Pen again -> deselects to 'select'
    selectTool('pen');
    expect(settings.activeTool).toBe('select');
    expect(isNeutralTool(settings.activeTool)).toBe(true);

    // Click Pen again -> activates Pen
    selectTool('pen');
    expect(settings.activeTool).toBe('pen');
    expect(isNeutralTool(settings.activeTool)).toBe(false);
  });

  it('allows selecting the dedicated Select / Interact tool directly', () => {
    selectTool('pen');
    expect(settings.activeTool).toBe('pen');

    selectTool('select');
    expect(settings.activeTool).toBe('select');
    expect(isNeutralTool(settings.activeTool)).toBe(true);

    // Clicking select again stays select
    selectTool('select');
    expect(settings.activeTool).toBe('select');
  });

  it('switches cleanly between drawing tools without leaving stale tool state', () => {
    selectTool('pen');
    expect(settings.activeTool).toBe('pen');

    // Switch to Eraser
    selectTool('eraser');
    expect(settings.activeTool).toBe('eraser');

    // Switch to Rectangle
    selectTool('rectangle');
    expect(settings.activeTool).toBe('rectangle');

    // Switch to Highlighter
    selectTool('highlighter');
    expect(settings.activeTool).toBe('highlighter');

    // Switch to Arrow
    selectTool('arrow');
    expect(settings.activeTool).toBe('arrow');

    // Switch to Text
    selectTool('text');
    expect(settings.activeTool).toBe('text');
  });

  it('toggles drawing mode off and on, restoring last active drawing tool from neutral', () => {
    selectTool('pen');
    expect(settings.activeTool).toBe('pen');

    // Deselect to neutral
    selectTool('pen');
    expect(settings.activeTool).toBe('select');

    // Toggle drawing mode off
    toggleDrawingMode();
    expect(settings.isDrawingMode).toBe(false);

    // Toggle drawing mode on: restores last active drawing tool ('pen')
    toggleDrawingMode();
    expect(settings.isDrawingMode).toBe(true);
    expect(settings.activeTool).toBe('pen');
  });

  it('activates drawing mode when a drawing tool is selected while pass-through was active', () => {
    // Disable drawing mode
    settings.isDrawingMode = false;

    // Selecting rectangle turns drawing mode back on
    selectTool('rectangle');
    expect(settings.activeTool).toBe('rectangle');
    expect(settings.isDrawingMode).toBe(true);
  });

  it('preserves color, size, and style settings across tool switching', () => {
    settings = {
      ...settings,
      strokeColor: '#3b82f6',
      strokeWidth: 10,
      brushStyle: 'dashed',
    };

    selectTool('rectangle');
    expect(settings.strokeColor).toBe('#3b82f6');
    expect(settings.strokeWidth).toBe(10);
    expect(settings.brushStyle).toBe('dashed');

    // Deselect
    selectTool('rectangle');
    expect(settings.activeTool).toBe('select');
    expect(settings.strokeColor).toBe('#3b82f6');
    expect(settings.strokeWidth).toBe(10);
    expect(settings.brushStyle).toBe('dashed');
  });

  it('has documented shortcuts for Select (V), Pen (P), and Eraser (E)', () => {
    expect(SHORTCUTS.SELECT).toBe('V');
    expect(SHORTCUTS.PEN).toBe('P');
    expect(SHORTCUTS.ERASER).toBe('E');
    expect(SHORTCUTS.LASER).toBe('K');
    expect(SHORTCUTS.SPOTLIGHT).toBe('F');
    expect(SHORTCUTS.BACKDROP).toBe('B');
    expect(SHORTCUTS.ESCAPE).toBe('Escape');
  });

  it('selects and toggles the Laser Pointer (disappearing ink)', () => {
    selectTool('laser');
    expect(settings.activeTool).toBe('laser');
    expect(isDrawingTool(settings.activeTool)).toBe(true);

    // Toggle laser off to neutral mode
    selectTool('laser');
    expect(settings.activeTool).toBe('select');
  });

  it('selects and toggles Spotlight focus mode', () => {
    selectTool('spotlight');
    expect(settings.activeTool).toBe('spotlight');
    expect(isDrawingTool(settings.activeTool)).toBe(true);

    // Toggle spotlight off to neutral mode
    selectTool('spotlight');
    expect(settings.activeTool).toBe('select');
  });

  it('cycles through backdrop canvas modes (transparent, whiteboard, blackboard, grid)', () => {
    expect(settings.backdropType).toBe('transparent');

    const cycleBackdrop = () => {
      const modes = ['transparent', 'whiteboard', 'blackboard', 'grid'] as const;
      const currentIdx = modes.indexOf((settings.backdropType as any) || 'transparent');
      settings = { ...settings, backdropType: modes[(currentIdx + 1) % modes.length] };
    };

    cycleBackdrop();
    expect(settings.backdropType).toBe('whiteboard');

    cycleBackdrop();
    expect(settings.backdropType).toBe('blackboard');

    cycleBackdrop();
    expect(settings.backdropType).toBe('grid');

    cycleBackdrop();
    expect(settings.backdropType).toBe('transparent');
  });
});
