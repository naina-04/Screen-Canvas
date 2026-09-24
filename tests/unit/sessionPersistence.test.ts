import { describe, it, expect, beforeEach } from 'vitest';
import {
  saveSession,
  loadSession,
  clearSession,
  hasSavedSession,
  SESSION_STORAGE_KEY,
} from '../../src/shared/utils/sessionPersistence';
import { DrawingElement, PathElement, StampElement } from '../../src/shared/types';

// Mock localStorage for node environment
const storageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(globalThis, 'localStorage', {
  value: storageMock,
  writable: true,
});

describe('Session Persistence Utility', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('saves and loads canvas drawing elements and settings', () => {
    const stroke: PathElement = {
      id: 'stroke-1',
      type: 'pen',
      color: '#ef4444',
      strokeWidth: 4,
      opacity: 1,
      brushStyle: 'solid',
      points: [{ x: 10, y: 10 }, { x: 20, y: 20 }],
    };

    const stamp: StampElement = {
      id: 'stamp-1',
      type: 'stamp',
      color: '#3b82f6',
      strokeWidth: 2,
      opacity: 1,
      brushStyle: 'solid',
      point: { x: 50, y: 50 },
      number: 1,
      radius: 18,
    };

    const elements: DrawingElement[] = [stroke, stamp];
    const success = saveSession(elements, { strokeColor: '#ef4444', strokeWidth: 4, currentStampNumber: 2 });
    expect(success).toBe(true);
    expect(hasSavedSession()).toBe(true);

    const loaded = loadSession();
    expect(loaded).not.toBeNull();
    expect(loaded?.version).toBe(1);
    expect(loaded?.elements.length).toBe(2);
    expect(loaded?.elements[0].id).toBe('stroke-1');
    expect((loaded?.elements[1] as StampElement).number).toBe(1);
    expect(loaded?.settings?.currentStampNumber).toBe(2);
  });

  it('clears session cleanly from storage', () => {
    saveSession([]);
    expect(hasSavedSession()).toBe(true);

    clearSession();
    expect(hasSavedSession()).toBe(false);
    expect(loadSession()).toBeNull();
  });

  it('gracefully handles corrupted JSON data', () => {
    localStorage.setItem(SESSION_STORAGE_KEY, 'not-valid-json{{{');
    expect(loadSession()).toBeNull();
  });

  it('rejects incompatible version formats', () => {
    localStorage.setItem(
      SESSION_STORAGE_KEY,
      JSON.stringify({ version: 99, elements: [] })
    );
    expect(loadSession()).toBeNull();
  });
});
