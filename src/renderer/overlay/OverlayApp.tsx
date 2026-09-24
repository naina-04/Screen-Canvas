import React, { useState, useEffect, useRef, useCallback } from 'react';
import { DualCanvas } from '../drawing/DualCanvas';
import { TextInputModal } from '../drawing/TextInputModal';
import { HistoryManager } from '../../shared/utils/HistoryManager';
import { DrawingSettings, TextElement, Point, ToolType, BackdropType, isNeutralTool } from '../../shared/types';
import { DEFAULT_SETTINGS } from '../../shared/constants/defaults';
import { renderElement } from '../../shared/utils/renderEngine';
import { saveSession, loadSession, clearSession } from '../../shared/utils/sessionPersistence';
import {
  createDefaultSlideDeck,
  addSlide,
  nextSlide,
  prevSlide,
  setActiveSlide,
  deleteSlide,
  updateActiveSlideElements,
  getActiveSlide,
} from '../../shared/utils/slideDeckManager';

export const OverlayApp: React.FC = () => {
  const [settings, setSettings] = useState<DrawingSettings>(DEFAULT_SETTINGS);
  const [isAppActive, setIsAppActive] = useState<boolean>(true);
  const [textPromptPoint, setTextPromptPoint] = useState<Point | null>(null);
  const [slideToast, setSlideToast] = useState<string | null>(null);
  const slideToastTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const historyManagerRef = useRef<HistoryManager>(new HistoryManager(100));
  const slideDeckRef = useRef(createDefaultSlideDeck());

  const showSlideToast = useCallback((msg: string) => {
    setSlideToast(msg);
    if (slideToastTimeoutRef.current) clearTimeout(slideToastTimeoutRef.current);
    slideToastTimeoutRef.current = setTimeout(() => {
      setSlideToast(null);
    }, 2200);
  }, []);

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

  const applySlideSwitch = useCallback((deckUpdater: () => void) => {
    // 1. Commit current strokes to current active slide
    slideDeckRef.current = updateActiveSlideElements(
      slideDeckRef.current,
      historyManagerRef.current.getElements()
    );

    // 2. Perform slide deck update
    deckUpdater();

    // 3. Load newly active slide into historyManager
    const active = getActiveSlide(slideDeckRef.current);
    historyManagerRef.current.reset(active ? active.elements : []);

    const slideNum = slideDeckRef.current.activeSlideIndex + 1;
    const total = slideDeckRef.current.slides.length;
    showSlideToast(`Slide ${slideNum} of ${total}`);

    const updates: Partial<DrawingSettings> = {
      activeSlideIndex: slideDeckRef.current.activeSlideIndex,
      totalSlides: total,
    };
    if (active?.backdropType) {
      updates.backdropType = active.backdropType;
    }
    setSettings((prev) => ({ ...prev, ...updates }));
    window.electronAPI?.updateSettings?.(updates);
    syncHistoryState();
  }, [showSlideToast, syncHistoryState]);

  const handleNextSlide = useCallback(() => {
    applySlideSwitch(() => {
      slideDeckRef.current = nextSlide(slideDeckRef.current);
    });
  }, [applySlideSwitch]);

  const handlePrevSlide = useCallback(() => {
    applySlideSwitch(() => {
      slideDeckRef.current = prevSlide(slideDeckRef.current);
    });
  }, [applySlideSwitch]);

  const handleAddSlide = useCallback(() => {
    applySlideSwitch(() => {
      slideDeckRef.current = addSlide(slideDeckRef.current);
    });
  }, [applySlideSwitch]);

  const handleDeleteSlide = useCallback((index?: number) => {
    applySlideSwitch(() => {
      const targetIdx = typeof index === 'number' ? index : slideDeckRef.current.activeSlideIndex;
      slideDeckRef.current = deleteSlide(slideDeckRef.current, targetIdx);
    });
  }, [applySlideSwitch]);

  const handleGoToSlide = useCallback((index: number) => {
    applySlideSwitch(() => {
      slideDeckRef.current = setActiveSlide(slideDeckRef.current, index);
    });
  }, [applySlideSwitch]);

  useEffect(() => {
    const api = window.electronAPI;
    if (!api) return;

    // Slide navigation listeners
    const unsubNextSlide = api.onNextSlide?.(() => handleNextSlide());
    const unsubPrevSlide = api.onPrevSlide?.(() => handlePrevSlide());
    const unsubAddSlide = api.onAddSlide?.(() => handleAddSlide());
    const unsubDeleteSlide = api.onDeleteSlide?.((idx) => handleDeleteSlide(idx));
    const unsubGoToSlide = api.onGoToSlide?.((idx) => handleGoToSlide(idx));

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
      unsubNextSlide?.();
      unsubPrevSlide?.();
      unsubAddSlide?.();
      unsubDeleteSlide?.();
      unsubGoToSlide?.();
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
  }, [
    syncHistoryState,
    generateSnapshotDataUrl,
    handleNextSlide,
    handlePrevSlide,
    handleAddSlide,
    handleDeleteSlide,
    handleGoToSlide,
  ]);

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
        } else if (key === 'S') {
          e.preventDefault();
          const committedStrokes = historyManagerRef.current.getElements();
          saveSession(committedStrokes, settings);
          window.electronAPI?.showNotification?.(`Session snapshot saved (${committedStrokes.length} elements)`);
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
        case 'PAGEUP':
          e.preventDefault();
          handlePrevSlide();
          break;
        case 'PAGEDOWN':
          e.preventDefault();
          handleNextSlide();
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
  }, [
    textPromptPoint,
    settings.activeTool,
    settings.strokeWidth,
    syncHistoryState,
    handleNextSlide,
    handlePrevSlide,
  ]);

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

      {slideToast && (
        <div className="absolute top-6 right-8 z-50 pointer-events-none px-4 py-2 bg-slate-900/90 text-white border border-cyan-500/40 rounded-full shadow-2xl backdrop-blur-md flex items-center gap-2.5 transition-all duration-300">
          <span className="text-cyan-400 font-bold text-base">📄</span>
          <span className="text-sm font-semibold tracking-wide text-slate-100">{slideToast}</span>
        </div>
      )}

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
