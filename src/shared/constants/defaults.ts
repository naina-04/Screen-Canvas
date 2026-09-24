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

export const PRESENTATION_NEON_COLORS = [
  '#ff3366', // Neon Crimson
  '#ff9f1c', // Bright Amber
  '#2ec4b6', // Electric Teal
  '#00f5d4', // Cyan Pulse
  '#7000ff', // Hyper Violet
  '#ff007f', // Cyber Pink
  '#ffffff', // Pure White
  '#1e1e24', // Deep Charcoal
];

export const PRESENTATION_PASTEL_COLORS = [
  '#ffccd5', // Soft Rose
  '#ffe5d9', // Warm Peach
  '#fefae0', // Buttercream
  '#d8f3dc', // Soft Mint
  '#caf0f8', // Ice Blue
  '#e2eafc', // Lavender
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
  backdropType: 'transparent',
  spotlightRadius: 150,
  currentStampNumber: 1,
  autoSaveSession: true,
};

export const SHORTCUTS = {
  TOGGLE_DRAWING_MODE: 'Control+Shift+D',
  TOGGLE_OVERLAY: 'Control+Shift+A',
  CLEAR_ALL: 'Control+Shift+C',
  UNDO: 'Control+Z',
  REDO: 'Control+Y',
  REDO_ALT: 'Control+Shift+Z',
  SELECT: 'V',
  PEN: 'P',
  HIGHLIGHTER: 'H',
  MARKER: 'M',
  ERASER: 'E',
  LASER: 'K',
  SPOTLIGHT: 'F',
  BACKDROP: 'B',
  LINE: 'L',
  ARROW: 'A',
  RECTANGLE: 'R',
  CIRCLE: 'C',
  TEXT: 'T',
  STAMP: 'N',
  INCREASE_SIZE: ']',
  DECREASE_SIZE: '[',
  ESCAPE: 'Escape',
};
