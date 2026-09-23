export type ToolType =
  | 'pen'
  | 'highlighter'
  | 'marker'
  | 'eraser'
  | 'line'
  | 'arrow'
  | 'rectangle'
  | 'circle'
  | 'text';

export type BrushStyle = 'solid' | 'dashed' | 'dotted' | 'marker';

export type EraserMode = 'stroke' | 'pixel';

export interface Point {
  x: number;
  y: number;
  pressure?: number;
}

export interface BaseElement {
  id: string;
  type: ToolType;
  color: string;
  strokeWidth: number;
  opacity: number;
  brushStyle: BrushStyle;
}

export interface PathElement extends BaseElement {
  type: 'pen' | 'highlighter' | 'marker' | 'eraser';
  points: Point[];
  eraserMode?: EraserMode;
}

export interface ShapeElement extends BaseElement {
  type: 'line' | 'rectangle' | 'circle';
  startPoint: Point;
  endPoint: Point;
  filled?: boolean;
  fillColor?: string;
}

export interface ArrowElement extends BaseElement {
  type: 'arrow';
  startPoint: Point;
  endPoint: Point;
  arrowHeadSize?: number;
}

export interface TextElement extends BaseElement {
  type: 'text';
  point: Point;
  text: string;
  fontSize: number;
  fontFamily?: string;
}

export type DrawingElement = PathElement | ShapeElement | ArrowElement | TextElement;

export interface DisplayInfo {
  id: number;
  name: string;
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  scaleFactor: number;
  isPrimary: boolean;
}

export interface DrawingSettings {
  activeTool: ToolType;
  strokeColor: string;
  fillColor: string;
  strokeWidth: number;
  brushStyle: BrushStyle;
  opacity: number;
  eraserSize: number;
  eraserMode: EraserMode;
  fontSize: number;
  isDrawingMode: boolean; // true = draw on screen, false = pass-through clicks to desktop
  isOverlayVisible: boolean;
  selectedDisplayId?: number;
}

export interface IPCChannels {
  // Toolbar -> Main -> Overlay
  UPDATE_SETTINGS: 'update-settings';
  SET_DRAWING_MODE: 'set-drawing-mode';
  CLEAR_ALL: 'clear-all';
  UNDO: 'undo';
  REDO: 'redo';
  TOGGLE_OVERLAY: 'toggle-overlay';
  SET_DISPLAY: 'set-display';
  GET_DISPLAYS: 'get-displays';
  EXPORT_PNG: 'export-png';
  SCREENSHOT_CAPTURE: 'screenshot-capture';
  QUIT_APP: 'quit-app';
  MINIMIZE_TOOLBAR: 'minimize-toolbar';
  SYNC_HISTORY_STATE: 'sync-history-state';
}

export interface HistoryState {
  canUndo: boolean;
  canRedo: boolean;
  elementCount: number;
}

// Window Electron API exposed by preload
export interface ElectronAPI {
  // Settings sync
  updateSettings: (settings: Partial<DrawingSettings>) => void;
  onSettingsUpdated: (callback: (settings: DrawingSettings) => void) => () => void;

  // Drawing Mode
  setDrawingMode: (enabled: boolean) => void;
  onDrawingModeChanged: (callback: (enabled: boolean) => void) => () => void;

  // History Commands
  undo: () => void;
  redo: () => void;
  clearAll: () => void;
  onUndo: (callback: () => void) => () => void;
  onRedo: (callback: () => void) => () => void;
  onClearAll: (callback: () => void) => () => void;
  updateHistoryState: (state: HistoryState) => void;
  onHistoryStateChanged: (callback: (state: HistoryState) => void) => () => void;

  // Overlay Visibility
  toggleOverlay: () => void;
  onToggleOverlay: (callback: () => void) => () => void;

  // Displays
  getDisplays: () => Promise<DisplayInfo[]>;
  setDisplay: (displayId: number) => Promise<boolean>;

  // Export
  exportPNG: (dataUrl: string) => Promise<{ success: boolean; filePath?: string; error?: string }>;
  captureScreenWithAnnotations: (dataUrl: string) => Promise<{ success: boolean; filePath?: string; error?: string }>;

  // Window Controls
  quitApp: () => void;
  minimizeToolbar: () => void;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}
