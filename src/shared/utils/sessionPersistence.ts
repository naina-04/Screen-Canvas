import { DrawingElement, DrawingSettings } from '../types';

export const SESSION_STORAGE_KEY = 'screencanvas_session_v1';

export interface SerializedSession {
  version: number;
  timestamp: number;
  elements: DrawingElement[];
  settings?: Partial<DrawingSettings>;
}

/**
 * Saves the current drawing elements and relevant settings to localStorage.
 */
export function saveSession(
  elements: DrawingElement[],
  settings?: Partial<DrawingSettings>
): boolean {
  try {
    const sessionData: SerializedSession = {
      version: 1,
      timestamp: Date.now(),
      elements,
      settings: settings
        ? {
            strokeColor: settings.strokeColor,
            strokeWidth: settings.strokeWidth,
            brushStyle: settings.brushStyle,
            backdropType: settings.backdropType,
            currentStampNumber: settings.currentStampNumber,
          }
        : undefined,
    };
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionData));
    return true;
  } catch (err) {
    console.warn('Failed to save canvas session to localStorage:', err);
    return false;
  }
}

/**
 * Loads a previously saved drawing session from localStorage.
 */
export function loadSession(): SerializedSession | null {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;

    const parsed: SerializedSession = JSON.parse(raw);
    if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.elements)) {
      return null;
    }
    return parsed;
  } catch (err) {
    console.warn('Failed to load canvas session from localStorage:', err);
    return null;
  }
}

/**
 * Clears the active saved session from localStorage.
 */
export function clearSession(): void {
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch (err) {
    console.warn('Failed to clear canvas session from localStorage:', err);
  }
}

/**
 * Checks if a valid saved session exists.
 */
export function hasSavedSession(): boolean {
  try {
    return Boolean(localStorage.getItem(SESSION_STORAGE_KEY));
  } catch {
    return false;
  }
}
