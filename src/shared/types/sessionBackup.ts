import { DrawingElement } from './index';

export interface SessionBackupSnapshot {
  id: string;
  createdAt: number;
  elementCount: number;
  elements: DrawingElement[];
}
