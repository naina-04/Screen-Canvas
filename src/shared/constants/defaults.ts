import { DrawingSettings } from '../types';

export const DEFAULT_COLORS = [
  '#ef4444', // Red
  '#f97316', // Orange
  '#eab308', // Yellow
  '#22c55e', // Green
  '#3b82f6', // Blue
  '#a855f7', // Purple
  '#ec4899', // Pink
  '#ffffff', // White
  '#000000', // Black
];

export const BRUSH_SIZES = [1, 2, 4, 6, 10, 16, 24, 32];

export const DEFAULT_SETTINGS: DrawingSettings = {
  activeTool: 'pen',
  strokeColor: '#ef4444', // Red default
  fillColor: 'transparent',
  strokeWidth: 4,
  brushStyle: 'solid',
  opacity: 1,
  eraserSize: 20,
  eraserMode: 'stroke',
  fontSize: 20,
  isDrawingMode: true,
  isOverlayVisible: true,
};

export const SHORTCUTS = {
  TOGGLE_DRAWING_MODE: 'Control+Shift+D',
  TOGGLE_OVERLAY: 'Control+Shift+A',
  CLEAR_ALL: 'Control+Shift+C',
  UNDO: 'Control+Z',
  REDO: 'Control+Y',
  REDO_ALT: 'Control+Shift+Z',
  PEN: 'P',
  HIGHLIGHTER: 'H',
  MARKER: 'M',
  ERASER: 'E',
  LINE: 'L',
  ARROW: 'A',
  RECTANGLE: 'R',
  CIRCLE: 'C',
  TEXT: 'T',
  INCREASE_SIZE: ']',
  DECREASE_SIZE: '[',
  ESCAPE: 'Escape',
};
