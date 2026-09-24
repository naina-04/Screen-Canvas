import { DrawingElement, DrawingSettings } from './index';

export interface ScreenCanvasProject {
  formatVersion: '1.0';
  appName: 'ScreenCanvas';
  timestamp: string;
  metadata: {
    title?: string;
    screenWidth?: number;
    screenHeight?: number;
  };
  settings: Partial<DrawingSettings>;
  elements: DrawingElement[];
}
