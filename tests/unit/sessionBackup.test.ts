import { describe, it, expect } from 'vitest';
import { createSessionBackupSnapshot } from '../../src/shared/utils/sessionBackup';

describe('Session Backup Utility', () => {
  it('creates clean deep-copy snapshot archive', () => {
    const elements: any = [{ id: '1', type: 'pen' }];
    const backup = createSessionBackupSnapshot(elements);

    expect(backup.elementCount).toBe(1);
    expect(backup.elements).toEqual(elements);
    expect(backup.elements).not.toBe(elements); // deep copied
  });
});
