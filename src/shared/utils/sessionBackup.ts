import { DrawingElement } from '../types';
import { SessionBackupSnapshot } from '../types/sessionBackup';

export function createSessionBackupSnapshot(elements: DrawingElement[]): SessionBackupSnapshot {
  return {
    id: `backup-${Date.now()}`,
    createdAt: Date.now(),
    elementCount: elements.length,
    elements: JSON.parse(JSON.stringify(elements)),
  };
}
