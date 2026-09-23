import React, { useState, useEffect, useRef } from 'react';
import {
  Pen,
  Highlighter,
  Brush,
  Eraser,
  Minus,
  MoveUpRight,
  Square,
  Circle,
  Type,
  Undo2,
  Redo2,
  Trash2,
  Eye,
  EyeOff,
  Camera,
  Download,
  Monitor,
  X,
  GripVertical,
  MousePointer,
  MousePointer2,
  ChevronDown,
  Flame,
  Sun,
  Layers,
  Copy,
} from 'lucide-react';
import { ToolButton } from './components/ToolButton';
import { ColorPickerPopover } from './components/ColorPickerPopover';
import { SizePickerPopover } from './components/SizePickerPopover';
import { DisplaySelector } from './components/DisplaySelector';
import {
  ToolType,
  DrawingSettings,
  HistoryState,
  BrushStyle,
  isNeutralTool,
  BackdropType,
} from '../../shared/types';
import { DEFAULT_SETTINGS, SHORTCUTS } from '../../shared/constants/defaults';

export const ToolbarApp: React.FC = () => {
  const [settings, setSettings] = useState<DrawingSettings>(DEFAULT_SETTINGS);
  const [historyState, setHistoryState] = useState<HistoryState>({
    canUndo: false,
    canRedo: false,
    elementCount: 0,
  });

  const [activePopover, setActivePopover] = useState<'color' | 'size' | 'shapes' | 'display' | 'backdrop' | null>(null);
  const [exportNotice, setExportNotice] = useState<string | null>(null);
  const lastActiveDrawingToolRef = useRef<ToolType>('pen');

  // Expand toolbar window height when popovers open
  useEffect(() => {
    window.electronAPI?.setToolbarExpanded?.(Boolean(activePopover));
  }, [activePopover]);

  // Sync settings with electron main and overlay
  const updateSettings = (newSettings: Partial<DrawingSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      if (newSettings.activeTool && !isNeutralTool(newSettings.activeTool)) {
        lastActiveDrawingToolRef.current = newSettings.activeTool;
      }
      if (window.electronAPI?.updateSettings) {
        window.electronAPI.updateSettings(newSettings);
      }
      return updated;
    });
  };

  // Tool Selection State Machine
  const handleToolSelect = (tool: ToolType) => {
    if (isNeutralTool(tool)) {
      updateSettings({ activeTool: 'select' });
      return;
    }

    if (settings.activeTool === tool) {
      // Clicking an already selected drawing tool toggles to neutral select mode
      updateSettings({ activeTool: 'select' });
    } else {
      // Switching to a drawing tool: activate it and ensure drawing mode is enabled
      lastActiveDrawingToolRef.current = tool;
      const updates: Partial<DrawingSettings> = {
        activeTool: tool,
        isDrawingMode: true,
      };
      updateSettings(updates);
      if (!settings.isDrawingMode && window.electronAPI?.setDrawingMode) {
        window.electronAPI.setDrawingMode(true);
      }
    }
  };

  // Toggle drawing vs pass-through mode
  const toggleDrawingMode = () => {
    const next = !settings.isDrawingMode;
    if (window.electronAPI?.setDrawingMode) {
      window.electronAPI.setDrawingMode(next);
    }
    if (next && isNeutralTool(settings.activeTool)) {
      const restored = lastActiveDrawingToolRef.current || 'pen';
      updateSettings({ isDrawingMode: next, activeTool: restored });
    } else {
      setSettings((prev) => ({ ...prev, isDrawingMode: next }));
    }
  };

  // Listen to IPC updates
  useEffect(() => {
    const api = window.electronAPI;
    if (!api) return;

    const unsubSettings = api.onSettingsUpdated((newSettings) => {
      setSettings((prev) => {
        if (newSettings.activeTool && !isNeutralTool(newSettings.activeTool)) {
          lastActiveDrawingToolRef.current = newSettings.activeTool;
        }
        return { ...prev, ...newSettings };
      });
    });

    const unsubMode = api.onDrawingModeChanged((enabled) => {
      setSettings((prev) => ({ ...prev, isDrawingMode: enabled }));
    });

    const unsubHistory = api.onHistoryStateChanged((state) => {
      setHistoryState(state);
    });

    const unsubNotification = api.onNotification?.((msg) => {
      showNotice(msg);
    });

    return () => {
      unsubSettings();
      unsubMode();
      unsubHistory();
      unsubNotification?.();
    };
  }, []);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      const key = e.key.toUpperCase();

      if (e.ctrlKey || e.metaKey) {
        if (key === 'Z') {
          if (e.shiftKey) window.electronAPI?.redo();
          else window.electronAPI?.undo();
        } else if (key === 'Y') {
          window.electronAPI?.redo();
        } else if (key === 'C') {
          handleCopyClipboard();
        }
        return;
      }

      switch (key) {
        case 'V':
        case 'S':
          handleToolSelect('select');
          break;
        case 'P':
          handleToolSelect('pen');
          break;
        case 'H':
          handleToolSelect('highlighter');
          break;
        case 'M':
          handleToolSelect('marker');
          break;
        case 'E':
          handleToolSelect('eraser');
          break;
        case 'K':
          handleToolSelect('laser');
          break;
        case 'F':
          handleToolSelect('spotlight');
          break;
        case 'B': {
          const modes: BackdropType[] = ['transparent', 'whiteboard', 'blackboard', 'grid'];
          const currentIdx = modes.indexOf(settings.backdropType || 'transparent');
          const nextBackdrop = modes[(currentIdx + 1) % modes.length];
          updateSettings({ backdropType: nextBackdrop });
          break;
        }
        case 'L':
          handleToolSelect('line');
          break;
        case 'A':
          handleToolSelect('arrow');
          break;
        case 'R':
          handleToolSelect('rectangle');
          break;
        case 'C':
          handleToolSelect('circle');
          break;
        case 'T':
          handleToolSelect('text');
          break;
        case ']':
          updateSettings({ strokeWidth: Math.min(50, settings.strokeWidth + 2) });
          break;
        case '[':
          updateSettings({ strokeWidth: Math.max(1, settings.strokeWidth - 2) });
          break;
        case 'ESCAPE':
          if (activePopover) {
            setActivePopover(null);
          } else if (!isNeutralTool(settings.activeTool)) {
            handleToolSelect('select');
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [settings.activeTool, settings.strokeWidth, activePopover]);

  // Notice timeout
  const showNotice = (msg: string) => {
    setExportNotice(msg);
    setTimeout(() => setExportNotice(null), 3500);
  };

  const handleExportPNG = () => {
    if (window.electronAPI?.requestExportPNG) {
      window.electronAPI.requestExportPNG();
    }
  };

  const handleScreenshot = () => {
    if (window.electronAPI?.requestScreenshot) {
      window.electronAPI.requestScreenshot();
    }
  };

  const handleCopyClipboard = () => {
    if (window.electronAPI?.requestCopyToClipboard) {
      window.electronAPI.requestCopyToClipboard();
    }
  };

  const isShapeTool =
    settings.activeTool === 'line' ||
    settings.activeTool === 'arrow' ||
    settings.activeTool === 'rectangle' ||
    settings.activeTool === 'circle';

  return (
    <div className="relative flex flex-col items-center select-none pt-2">
      {/* Floating Pill Toolbar */}
      <div
        className="glass-panel rounded-2xl px-3 py-2 flex items-center gap-1.5 shadow-2xl relative"
        style={{ WebkitAppRegion: 'no-drag' } as any}
      >
        {/* Drag handle */}
        <div
          className="flex items-center justify-center cursor-grab active:cursor-grabbing text-gray-500 hover:text-gray-300 px-1 py-1 rounded"
          style={{ WebkitAppRegion: 'drag' } as any}
          title="Drag to move toolbar"
        >
          <GripVertical className="w-4 h-4" />
        </div>

        {/* Mode Toggle: Draw vs Pass-Through */}
        <button
          type="button"
          onClick={toggleDrawingMode}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all shadow-md ${
            settings.isDrawingMode
              ? isNeutralTool(settings.activeTool)
                ? 'bg-slate-700/90 text-blue-200 border border-blue-400/40 hover:bg-slate-600'
                : 'bg-blue-600 text-white shadow-glow hover:bg-blue-500'
              : 'bg-emerald-600/80 text-emerald-100 hover:bg-emerald-500 ring-1 ring-emerald-400/50'
          }`}
          title={
            settings.isDrawingMode
              ? isNeutralTool(settings.activeTool)
                ? 'Neutral Mode: click desktop apps or select a drawing tool (Ctrl+Shift+D)'
                : 'Drawing Mode active (Ctrl+Shift+D to toggle)'
              : 'Pass-Through active: clicks reach desktop apps (Ctrl+Shift+D)'
          }
        >
          {settings.isDrawingMode ? (
            isNeutralTool(settings.activeTool) ? (
              <>
                <MousePointer2 className="w-3.5 h-3.5 text-blue-300" />
                <span>Neutral</span>
              </>
            ) : (
              <>
                <Pen className="w-3.5 h-3.5" />
                <span>Drawing</span>
              </>
            )
          ) : (
            <>
              <MousePointer className="w-3.5 h-3.5" />
              <span>Pass-thru</span>
            </>
          )}
        </button>

        <div className="w-[1px] h-6 bg-white/10 mx-0.5" />

        {/* Dedicated Select / Neutral Tool */}
        <ToolButton
          icon={<MousePointer2 className="w-4 h-4" />}
          label="Select / Interact"
          shortcut={SHORTCUTS.SELECT}
          isActive={isNeutralTool(settings.activeTool)}
          onClick={() => handleToolSelect('select')}
        />

        {/* Primary Tools */}
        <ToolButton
          icon={<Pen className="w-4 h-4" />}
          label="Pen"
          shortcut={SHORTCUTS.PEN}
          isActive={settings.activeTool === 'pen'}
          onClick={() => handleToolSelect('pen')}
        />

        <ToolButton
          icon={<Highlighter className="w-4 h-4" />}
          label="Highlighter"
          shortcut={SHORTCUTS.HIGHLIGHTER}
          isActive={settings.activeTool === 'highlighter'}
          onClick={() => handleToolSelect('highlighter')}
        />

        <ToolButton
          icon={<Brush className="w-4 h-4" />}
          label="Marker"
          shortcut={SHORTCUTS.MARKER}
          isActive={settings.activeTool === 'marker'}
          onClick={() => handleToolSelect('marker')}
        />

        <ToolButton
          icon={<Eraser className="w-4 h-4" />}
          label="Eraser"
          shortcut={SHORTCUTS.ERASER}
          isActive={settings.activeTool === 'eraser'}
          onClick={() => handleToolSelect('eraser')}
        />

        {/* Shapes Menu Button */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setActivePopover(activePopover === 'shapes' ? null : 'shapes')}
            className={`flex items-center gap-0.5 px-2 h-9 rounded-xl transition-all duration-200 text-xs font-medium ${
              isShapeTool
                ? 'bg-blue-600 text-white shadow-glow'
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            }`}
          >
            {settings.activeTool === 'line' && <Minus className="w-4 h-4" />}
            {settings.activeTool === 'arrow' && <MoveUpRight className="w-4 h-4" />}
            {settings.activeTool === 'rectangle' && <Square className="w-4 h-4" />}
            {settings.activeTool === 'circle' && <Circle className="w-4 h-4" />}
            {!isShapeTool && <Square className="w-4 h-4" />}
            <ChevronDown className="w-3 h-3 opacity-70" />
          </button>

          {/* Shapes Dropdown */}
          {activePopover === 'shapes' && (
            <div className="absolute top-full mt-2 left-0 p-2 bg-[#18191d] border border-white/15 rounded-xl shadow-2xl backdrop-blur-xl z-50 flex gap-1">
              <ToolButton
                icon={<Minus className="w-4 h-4" />}
                label="Line"
                shortcut={SHORTCUTS.LINE}
                isActive={settings.activeTool === 'line'}
                onClick={() => {
                  handleToolSelect('line');
                  setActivePopover(null);
                }}
              />
              <ToolButton
                icon={<MoveUpRight className="w-4 h-4" />}
                label="Arrow"
                shortcut={SHORTCUTS.ARROW}
                isActive={settings.activeTool === 'arrow'}
                onClick={() => {
                  handleToolSelect('arrow');
                  setActivePopover(null);
                }}
              />
              <ToolButton
                icon={<Square className="w-4 h-4" />}
                label="Rectangle"
                shortcut={SHORTCUTS.RECTANGLE}
                isActive={settings.activeTool === 'rectangle'}
                onClick={() => {
                  handleToolSelect('rectangle');
                  setActivePopover(null);
                }}
              />
              <ToolButton
                icon={<Circle className="w-4 h-4" />}
                label="Circle"
                shortcut={SHORTCUTS.CIRCLE}
                isActive={settings.activeTool === 'circle'}
                onClick={() => {
                  handleToolSelect('circle');
                  setActivePopover(null);
                }}
              />
            </div>
          )}
        </div>

        {/* Text tool */}
        <ToolButton
          icon={<Type className="w-4 h-4" />}
          label="Text Annotation"
          shortcut={SHORTCUTS.TEXT}
          isActive={settings.activeTool === 'text'}
          onClick={() => handleToolSelect('text')}
        />

        <div className="w-[1px] h-6 bg-white/10 mx-0.5" />

        {/* Laser Pointer (Disappearing Ink) */}
        <ToolButton
          icon={<Flame className="w-4 h-4 text-red-400" />}
          label="Laser Pointer (Fading Trail)"
          shortcut={SHORTCUTS.LASER}
          isActive={settings.activeTool === 'laser'}
          onClick={() => handleToolSelect('laser')}
        />

        {/* Spotlight Focus Mode */}
        <ToolButton
          icon={<Sun className="w-4 h-4 text-amber-300" />}
          label="Spotlight Focus Mode"
          shortcut={SHORTCUTS.SPOTLIGHT}
          isActive={settings.activeTool === 'spotlight'}
          onClick={() => handleToolSelect('spotlight')}
        />

        {/* Backdrop Canvas Switcher */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setActivePopover(activePopover === 'backdrop' ? null : 'backdrop')}
            className={`flex items-center gap-1 px-2 h-9 rounded-xl transition-all duration-200 text-xs font-medium ${
              settings.backdropType && settings.backdropType !== 'transparent'
                ? 'bg-indigo-600 text-white shadow-glow'
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            }`}
            title="Canvas Backdrop: Whiteboard, Blackboard, Grid, Transparent (B)"
          >
            <Layers className="w-4 h-4" />
            <ChevronDown className="w-3 h-3 opacity-70" />
          </button>

          {activePopover === 'backdrop' && (
            <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 p-2 bg-[#18191d] border border-white/15 rounded-xl shadow-2xl backdrop-blur-xl z-50 flex flex-col gap-1 min-w-[140px]">
              <button
                type="button"
                onClick={() => {
                  updateSettings({ backdropType: 'transparent' });
                  setActivePopover(null);
                }}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-left transition-colors ${
                  settings.backdropType === 'transparent' || !settings.backdropType
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-white/10'
                }`}
              >
                <span className="w-3 h-3 rounded-full border border-white/40 bg-transparent" />
                <span>Transparent</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  updateSettings({ backdropType: 'whiteboard' });
                  setActivePopover(null);
                }}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-left transition-colors ${
                  settings.backdropType === 'whiteboard'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-white/10'
                }`}
              >
                <span className="w-3 h-3 rounded-full bg-white border border-gray-400" />
                <span>Whiteboard</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  updateSettings({ backdropType: 'blackboard' });
                  setActivePopover(null);
                }}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-left transition-colors ${
                  settings.backdropType === 'blackboard'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-white/10'
                }`}
              >
                <span className="w-3 h-3 rounded-full bg-[#18191d] border border-white/50" />
                <span>Blackboard</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  updateSettings({ backdropType: 'grid' });
                  setActivePopover(null);
                }}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-left transition-colors ${
                  settings.backdropType === 'grid'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-white/10'
                }`}
              >
                <span className="w-3 h-3 rounded-full bg-[#18191d] border border-dashed border-white/70" />
                <span>Dotted Grid</span>
              </button>
            </div>
          )}
        </div>

        <div className="w-[1px] h-6 bg-white/10 mx-0.5" />

        {/* Color Palette Trigger */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setActivePopover(activePopover === 'color' ? null : 'color')}
            className="w-8 h-8 rounded-full border-2 border-white/40 shadow-inner hover:scale-105 transition-transform flex items-center justify-center"
            style={{ backgroundColor: settings.strokeColor }}
            title="Choose Color"
          />

          {activePopover === 'color' && (
            <ColorPickerPopover
              currentColor={settings.strokeColor}
              onChangeColor={(color) => {
                updateSettings({ strokeColor: color });
              }}
              onClose={() => setActivePopover(null)}
            />
          )}
        </div>

        {/* Brush Size / Style Trigger */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setActivePopover(activePopover === 'size' ? null : 'size')}
            className="flex items-center gap-1 px-2 h-8 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-gray-200 transition-colors"
            title="Brush Size & Style ([ and ])"
          >
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{
                backgroundColor: settings.strokeColor,
                transform: `scale(${Math.min(1.5, Math.max(0.6, settings.strokeWidth / 8))})`,
              }}
            />
            <span>{settings.strokeWidth}px</span>
          </button>

          {activePopover === 'size' && (
            <SizePickerPopover
              currentSize={settings.strokeWidth}
              currentStyle={settings.brushStyle}
              onChangeSize={(size) => updateSettings({ strokeWidth: size })}
              onChangeStyle={(style) => updateSettings({ brushStyle: style })}
              onClose={() => setActivePopover(null)}
            />
          )}
        </div>

        <div className="w-[1px] h-6 bg-white/10 mx-0.5" />

        {/* Undo / Redo */}
        <ToolButton
          icon={<Undo2 className="w-4 h-4" />}
          label="Undo"
          shortcut={SHORTCUTS.UNDO}
          disabled={!historyState.canUndo}
          onClick={() => window.electronAPI?.undo()}
        />

        <ToolButton
          icon={<Redo2 className="w-4 h-4" />}
          label="Redo"
          shortcut={SHORTCUTS.REDO}
          disabled={!historyState.canRedo}
          onClick={() => window.electronAPI?.redo()}
        />

        {/* Clear All */}
        <ToolButton
          icon={<Trash2 className="w-4 h-4" />}
          label="Clear All"
          shortcut={SHORTCUTS.CLEAR_ALL}
          disabled={historyState.elementCount === 0}
          onClick={() => window.electronAPI?.clearAll()}
        />

        <div className="w-[1px] h-6 bg-white/10 mx-0.5" />

        {/* Toggle Overlay Visibility */}
        <ToolButton
          icon={settings.isOverlayVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4 text-amber-400" />}
          label={settings.isOverlayVisible ? 'Hide Annotations' : 'Show Annotations'}
          shortcut={SHORTCUTS.TOGGLE_OVERLAY}
          onClick={() => {
            window.electronAPI?.toggleOverlay();
            setSettings((p) => ({ ...p, isOverlayVisible: !p.isOverlayVisible }));
          }}
        />

        {/* Export Drawing */}
        <ToolButton
          icon={<Download className="w-4 h-4" />}
          label="Export Annotations (PNG)"
          onClick={handleExportPNG}
        />

        {/* Full Screenshot Capture */}
        <ToolButton
          icon={<Camera className="w-4 h-4" />}
          label="Capture Screen + Drawing"
          onClick={handleScreenshot}
        />

        {/* Copy Drawing to Clipboard */}
        <ToolButton
          icon={<Copy className="w-4 h-4" />}
          label="Copy Drawing to Clipboard (Ctrl+C)"
          shortcut="Ctrl+C"
          onClick={handleCopyClipboard}
        />

        {/* Multi-monitor Display Switcher */}
        <div className="relative">
          <ToolButton
            icon={<Monitor className="w-4 h-4" />}
            label="Switch Display"
            onClick={() => setActivePopover(activePopover === 'display' ? null : 'display')}
          />
          {activePopover === 'display' && (
            <DisplaySelector onClose={() => setActivePopover(null)} />
          )}
        </div>

        {/* Close App */}
        <button
          type="button"
          onClick={() => window.electronAPI?.quitApp()}
          className="text-gray-400 hover:text-red-400 hover:bg-white/10 p-1.5 rounded-xl transition-colors ml-1"
          title="Exit ScreenCanvas"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Floating notification badge */}
      {exportNotice && (
        <div className="mt-2 bg-blue-600/95 text-white text-xs px-3 py-1.5 rounded-full shadow-lg border border-blue-400/40 backdrop-blur-md animate-fade-in flex items-center gap-1.5">
          <span>{exportNotice}</span>
        </div>
      )}
    </div>
  );
};
