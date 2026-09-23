import React, { useState, useEffect, useRef, useCallback } from 'react';
import { DualCanvas } from '../drawing/DualCanvas';
import { TextInputModal } from '../drawing/TextInputModal';
import { HistoryManager } from '../../shared/utils/HistoryManager';
import { DrawingSettings, TextElement, Point } from '../../shared/types';
import { DEFAULT_SETTINGS } from '../../shared/constants/defaults';

export const OverlayApp: React.FC = () => {
  const [settings, setSettings] = useState<DrawingSettings>(DEFAULT_SETTINGS);
  const [textPromptPoint, setTextPromptPoint] = useState<Point | null>(null);
  const historyManagerRef = useRef<HistoryManager>(new HistoryManager(100));

  const syncHistoryState = useCallback(() => {
    if (window.electronAPI?.updateHistoryState) {
      window.electronAPI.updateHistoryState(historyManagerRef.current.getHistoryState());
    }
  }, []);

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
      syncHistoryState();
    });

    // Sync initial state
    syncHistoryState();

    return () => {
      unsubSettings();
      unsubDrawingMode();
      unsubUndo();
      unsubRedo();
      unsubClear();
    };
  }, [syncHistoryState]);

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

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-transparent select-none">
      <DualCanvas
        settings={settings}
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
