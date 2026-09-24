import React, { useState, useEffect, useRef, useCallback } from 'react';
import { DualCanvas } from '../drawing/DualCanvas';
import { TextInputModal } from '../drawing/TextInputModal';
import { HistoryManager } from '../../shared/utils/HistoryManager';
import { DrawingSettings, TextElement, Point, ToolType, BackdropType, isNeutralTool } from '../../shared/types';
import { DEFAULT_SETTINGS } from '../../shared/constants/defaults';
import { renderElement } from '../../shared/utils/renderEngine';
import { saveSession, loadSession, clearSession } from '../../shared/utils/sessionPersistence';

export const OverlayApp: React.FC = () => {
  const [settings, setSettings] = useState<DrawingSettings>(DEFAULT_SETTINGS);
  const [isAppActive, setIsAppActive] = useState<boolean>(true);
  const [textPromptPoint, setTextPromptPoint] = useState<Point | null>(null);
  const historyManagerRef = useRef<HistoryManager>(new HistoryManager(100));

  const syncHistoryState = useCallback(() => {
    const state = historyManagerRef.current.getHistoryState();
    if (window.electronAPI?.updateHistoryState) {
      window.electronAPI.updateHistoryState(state);
    }
    saveSession(historyManagerRef.current.getElements(), settings);
  }, [settings]);

  // Restore session on initial load
  useEffect(() => {
    const saved = loadSession();
    if (saved && saved.elements.length > 0) {
      for (const el of saved.elements) {
        historyManagerRef.current.addElement(el);
      }
      syncHistoryState();
      if (saved.settings) {
        setSettings((prev) => ({ ...prev, ...saved.settings }));
        window.electronAPI?.updateSettings?.(saved.settings);
      }
    }
  }, [syncHistoryState]);

  // Generate canvas snapshot Data URL for exports, screenshots, and clipboard
  const generateSnapshotDataUrl = useCallback((): string => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const dpr = window.devicePixelRatio || 1;

    const canvas = document.createElement('canvas');
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    ctx.scale(dpr, dpr);

    // Draw backdrop if active
    if (settings.backdropType === 'whiteboard') {
      ctx.fillStyle = '#fcfdfd';
      ctx.fillRect(0, 0, width, height);
    } else if (settings.backdropType === 'blackboard') {
      ctx.fillStyle = '#18191d';
      ctx.fillRect(0, 0, width, height);
    } else if (settings.backdropType === 'grid') {
      ctx.fillStyle = '#18191d';
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
      const spacing = 24;
      for (let x = 12; x < width; x += spacing) {
        for (let y = 12; y < height; y += spacing) {
          ctx.beginPath();
          ctx.arc(x, y, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // Render all committed vector elements
    const elements = historyManagerRef.current.getElements();
    for (const element of elements) {
      renderElement(ctx, element);
    }

    return canvas.toDataURL('image/png');
  }, [settings.backdropType]);

  useEffect(() => {
    const api = window.electronAPI;
    if (!api) return;

    // Listen to settings update from toolbar
    const unsubSettings = api.onSettingsUpdated((newSettings) => {
      setSettings((prev) => ({ ...prev, ...newSettings }));
    });

    // Listen to drawing mode toggle
    const unsubDrawingMode = api.onDrawingModeChanged((enabled) => {
      setSettings((prev) => ({ ...prev, isDrawingMode: enabled }));
    });

    // Listen to undo command
    const unsubUndo = api.onUndo(() => {
      if (historyManagerRef.current.undo()) {
        syncHistoryState();
      }
    });

    // Listen to redo command
    const unsubRedo = api.onRedo(() => {
      if (historyManagerRef.current.redo()) {
        syncHistoryState();
      }
    });

    // Listen to clear all command
    const unsubClear = api.onClearAll(() => {
      historyManagerRef.current.clear();
      clearSession();
      syncHistoryState();
    });

    // Export transparent or backdrop PNG on toolbar request
    const unsubExportPNG = api.onRequestExportPNG(async () => {
      const dataUrl = generateSnapshotDataUrl();
      if (!dataUrl) return;
      const res = await api.exportPNG(dataUrl);
      if (res.success) {
        api.showNotification('Drawing exported successfully!');
      } else if (res.error !== 'Cancelled') {
        api.showNotification(`Export failed: ${res.error}`);
      }
    });

    // Screen capture + drawing composite on toolbar request
    const unsubScreenshot = api.onRequestScreenshot(async () => {
      const dataUrl = generateSnapshotDataUrl();
      const res = await api.captureScreenWithAnnotations(dataUrl);
      if (res.success) {
        api.showNotification('Screenshot saved!');
      } else if (res.error !== 'Cancelled') {
        api.showNotification(`Capture failed: ${res.error}`);
      }
    });

    // Copy drawing snapshot to clipboard on toolbar/shortcut request
    const unsubCopyClipboard = api.onRequestCopyToClipboard(async () => {
      const dataUrl = generateSnapshotDataUrl();
      if (!dataUrl) return;
      const res = await api.copyToClipboard(dataUrl);
      if (res.success) {
        api.showNotification('Copied drawing to clipboard!');
      } else {
        api.showNotification(`Failed to copy: ${res.error}`);
      }
    });

    // Listen to application active/focus state changes
    const unsubActive = api.onAppActiveChanged?.((active) => {
      setIsAppActive(active);
    });

    // Sync initial state
    syncHistoryState();

    return () => {
      unsubSettings();
      unsubDrawingMode();
      unsubUndo();
      unsubRedo();
      unsubClear();
      unsubExportPNG();
      unsubScreenshot();
      unsubCopyClipboard();
      unsubActive?.();
    };
  }, [syncHistoryState, generateSnapshotDataUrl]);

  // Overlay keyboard shortcuts for tool switching and Escape handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (textPromptPoint) {
        if (e.key === 'Escape') {
          setTextPromptPoint(null);
        }
        return;
      }

      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      const key = e.key.toUpperCase();

      if (e.ctrlKey || e.metaKey) {
        if (key === 'Z') {
          if (e.shiftKey) {
            if (historyManagerRef.current.redo()) syncHistoryState();
          } else {
            if (historyManagerRef.current.undo()) syncHistoryState();
          }
          e.preventDefault();
        } else if (key === 'Y') {
          if (historyManagerRef.current.redo()) syncHistoryState();
          e.preventDefault();
        } else if (key === 'C') {
          const dataUrl = generateSnapshotDataUrl();
          const api = window.electronAPI;
          if (dataUrl && api) {
            api.copyToClipboard(dataUrl).then((res) => {
              if (res.success) {
                api.showNotification('Copied drawing to clipboard!');
              }
            });
          }
          e.preventDefault();
        } else if (key === 'Q') {
          e.preventDefault();
          window.electronAPI?.quitApp();
        }
        return;
      }

      const toggleOrSelect = (tool: ToolType) => {
        const isCurrentlyActive = settings.activeTool === tool && settings.isDrawingMode;
        if (isCurrentlyActive) {
          // Unselect to desktop mode
          setSettings((prev) => ({ ...prev, activeTool: 'select', isDrawingMode: false }));
          window.electronAPI?.updateSettings({ activeTool: 'select', isDrawingMode: false });
          window.electronAPI?.setDrawingMode?.(false);
        } else {
          // Activate tool and enable drawing
          const updates: Partial<DrawingSettings> = { activeTool: tool, isDrawingMode: true };
          setSettings((prev) => ({ ...prev, ...updates }));
          window.electronAPI?.updateSettings(updates);
          window.electronAPI?.setDrawingMode?.(true);
        }
      };

      switch (key) {
        case 'ESCAPE':
        case 'V':
        case 'S':
          setSettings((prev) => ({ ...prev, activeTool: 'select', isDrawingMode: false }));
          window.electronAPI?.updateSettings({ activeTool: 'select', isDrawingMode: false });
          window.electronAPI?.setDrawingMode?.(false);
          break;
        case 'P':
          toggleOrSelect('pen');
          break;
        case 'H':
          toggleOrSelect('highlighter');
          break;
        case 'M':
          toggleOrSelect('marker');
          break;
        case 'E':
          toggleOrSelect('eraser');
          break;
        case 'K':
          toggleOrSelect('laser');
          break;
        case 'F':
          toggleOrSelect('spotlight');
          break;
        case 'B': {
          const modes: BackdropType[] = ['transparent', 'whiteboard', 'blackboard', 'grid'];
          const currentIdx = modes.indexOf(settings.backdropType || 'transparent');
          const nextBackdrop = modes[(currentIdx + 1) % modes.length];
          setSettings((prev) => ({ ...prev, backdropType: nextBackdrop }));
          window.electronAPI?.updateSettings({ backdropType: nextBackdrop });
          break;
        }
        case 'L':
          toggleOrSelect('line');
          break;
        case 'A':
          toggleOrSelect('arrow');
          break;
        case 'R':
          toggleOrSelect('rectangle');
          break;
        case 'C':
          toggleOrSelect('circle');
          break;
        case 'T':
          toggleOrSelect('text');
          break;
        case 'N':
          toggleOrSelect('stamp');
          break;
        case ']': {
          const nextWidth = Math.min(50, settings.strokeWidth + 2);
          setSettings((prev) => ({ ...prev, strokeWidth: nextWidth }));
          window.electronAPI?.updateSettings({ strokeWidth: nextWidth });
          break;
        }
        case '[': {
          const nextWidth = Math.max(1, settings.strokeWidth - 2);
          setSettings((prev) => ({ ...prev, strokeWidth: nextWidth }));
          window.electronAPI?.updateSettings({ strokeWidth: nextWidth });
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [textPromptPoint, settings.activeTool, settings.strokeWidth, syncHistoryState]);

  const handleCommitText = (text: string) => {
    if (!textPromptPoint) return;
    const textElement: TextElement = {
      id: `text-${Date.now()}`,
      type: 'text',
      point: textPromptPoint,
      text,
      color: settings.strokeColor,
      strokeWidth: 1,
      opacity: 1,
      brushStyle: 'solid',
      fontSize: settings.fontSize || 20,
    };

    historyManagerRef.current.addElement(textElement);
    setTextPromptPoint(null);
    syncHistoryState();
  };

  const isInteractive = isAppActive && settings.isDrawingMode && !isNeutralTool(settings.activeTool);

  return (
    <div
      className="relative w-screen h-screen overflow-hidden bg-transparent select-none"
      style={{ pointerEvents: isInteractive ? 'auto' : 'none' }}
    >
      <DualCanvas
        settings={settings}
        isAppActive={isAppActive}
        historyManager={historyManagerRef.current}
        onHistoryChange={syncHistoryState}
        onTextPrompt={(pt) => setTextPromptPoint(pt)}
      />

      {textPromptPoint && (
        <TextInputModal
          point={textPromptPoint}
          color={settings.strokeColor}
          fontSize={settings.fontSize || 20}
          onCommit={handleCommitText}
          onCancel={() => setTextPromptPoint(null)}
        />
      )}
    </div>
  );
};
