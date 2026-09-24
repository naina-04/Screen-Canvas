import { ScreenCanvasProject } from '../types/project';
import { DrawingElement, DrawingSettings } from '../types';

export class ProjectSerializer {
  public static serialize(elements: DrawingElement[], settings: Partial<DrawingSettings>, title = 'ScreenCanvas Presentation'): string {
    const project: ScreenCanvasProject = {
      formatVersion: '1.0',
      appName: 'ScreenCanvas',
      timestamp: new Date().toISOString(),
      metadata: {
        title,
        screenWidth: typeof window !== 'undefined' ? window.innerWidth : undefined,
        screenHeight: typeof window !== 'undefined' ? window.innerHeight : undefined,
      },
      settings,
      elements,
    };
    return JSON.stringify(project, null, 2);
  }

  public static deserialize(jsonStr: string): ScreenCanvasProject | null {
    try {
      const data = JSON.parse(jsonStr);
      if (data.appName !== 'ScreenCanvas' || data.formatVersion !== '1.0') {
        return null;
      }
      if (!Array.isArray(data.elements)) {
        return null;
      }
      return data as ScreenCanvasProject;
    } catch {
      return null;
    }
  }
}
