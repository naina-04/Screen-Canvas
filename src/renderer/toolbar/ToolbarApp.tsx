import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  ChevronLeft,
  ChevronRight,
  Flame,
  Sun,
  Layers,
  Copy,
  HelpCircle,
  Stamp,
  Plus,
} from 'lucide-react';
import { ToolButton } from './components/ToolButton';
import { ColorPickerPopover } from './components/ColorPickerPopover';
import { SizePickerPopover } from './components/SizePickerPopover';
import { DisplaySelector } from './components/DisplaySelector';
import { ShortcutsModal } from './components/ShortcutsModal';
import {
  ToolType,
  DrawingSettings,
  HistoryState,
  isNeutralTool,
  BackdropType,
} from '../../shared/types';
import { DEFAULT_SETTINGS, SHORTCUTS } from '../../shared/constants/defaults';

type ToolCategory = 'all' | 'draw' | 'present' | 'style' | 'actions';

const TOOL_SEQUENCE: ToolType[] = [
  'select',
  'pen',
  'highlighter',
  'marker',
  'eraser',
  'line',
  'arrow',
  'rectangle',
  'circle',
  'text',
  'stamp',
  'laser',
  'spotlight',
];

export const ToolbarApp: React.FC = () => {
  const [settings, setSettings] = useState<DrawingSettings>(DEFAULT_SETTINGS);
  const [historyState, setHistoryState] = useState<HistoryState>({
    canUndo: false,
    canRedo: false,
    elementCount: 0,
  });

  const [activePopover, setActivePopover] = useState<'color' | 'size' | 'shapes' | 'display' | 'backdrop' | null>(null);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<ToolCategory>('all');
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const lastActiveDrawingToolRef = useRef<ToolType>('pen');

  // Check scroll position to dynamically toggle scroll navigation arrows
  const checkScrollState = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 6);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 6);
  }, []);

  useEffect(() => {
    checkScrollState();
    const el = scrollContainerRef.current;
    if (!el) return;

    el.addEventListener('scroll', checkScrollState, { passive: true });
    window.addEventListener('resize', checkScrollState);
    return () => {
      el.removeEventListener('scroll', checkScrollState);
      window.removeEventListener('resize', checkScrollState);
    };
  }, [checkScrollState]);

  // Smooth scroll helper
  const handleScroll = (offset: number) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  // Wheel horizontal scrolling
  const handleWheel = (e: React.WheelEvent) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: e.deltaY * 1.2, behavior: 'smooth' });
    }
  };

  // Expand toolbar window height when popovers or modal open
  useEffect(() => {
    if (showShortcuts) {
      window.electronAPI?.setToolbarExpanded?.(true, true);
    } else {
      window.electronAPI?.setToolbarExpanded?.(Boolean(activePopover), false);
    }
  }, [activePopover, showShortcuts]);

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

  // Unselect drawing tool and switch directly to desktop pass-through mode
  const unselectDrawingTool = () => {
    const updates: Partial<DrawingSettings> = {
      activeTool: 'select',
      isDrawingMode: false,
    };
    updateSettings(updates);
    if (window.electronAPI?.setDrawingMode) {
      window.electronAPI.setDrawingMode(false);
    }
  };

  // Tool Selection State Machine
  const handleToolSelect = (tool: ToolType) => {
    if (isNeutralTool(tool)) {
      unselectDrawingTool();
      return;
    }

    if (settings.activeTool === tool && settings.isDrawingMode) {
      // Clicking an already selected drawing tool unselects it to desktop mode
      unselectDrawingTool();
    } else {
      // Switching to a drawing tool: activate it and ensure drawing mode is enabled
      lastActiveDrawingToolRef.current = tool;
      const updates: Partial<DrawingSettings> = {
        activeTool: tool,
        isDrawingMode: true,
      };
      updateSettings(updates);
      if (window.electronAPI?.setDrawingMode) {
        window.electronAPI.setDrawingMode(true);
      }
    }
  };

  // Toggle drawing vs desktop pass-through mode
  const toggleDrawingMode = () => {
    const next = !settings.isDrawingMode;
    if (window.electronAPI?.setDrawingMode) {
      window.electronAPI.setDrawingMode(next);
    }
    if (next && isNeutralTool(settings.activeTool)) {
      const restored = lastActiveDrawingToolRef.current || 'pen';
      updateSettings({ isDrawingMode: next, activeTool: restored });
    } else {
      updateSettings({ isDrawingMode: next });
    }
  };

  // Navigate to category section
  const navigateToCategory = (cat: ToolCategory) => {
    setActiveCategory(cat);
    const container = scrollContainerRef.current;
    if (!container) return;

    if (cat === 'all') {
      container.scrollTo({ left: 0, behavior: 'smooth' });
      return;
    }

    const sectionId = `section-${cat}`;
    const targetEl = document.getElementById(sectionId);
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
    }
  };

  // Cycle tools with keyboard arrow keys
  const cycleTool = (direction: 'next' | 'prev') => {
    const currentTool = settings.isDrawingMode ? settings.activeTool : 'select';
    const currentIdx = TOOL_SEQUENCE.indexOf(currentTool);
    const count = TOOL_SEQUENCE.length;
    const nextIdx = direction === 'next' ? (currentIdx + 1) % count : (currentIdx - 1 + count) % count;
    handleToolSelect(TOOL_SEQUENCE[nextIdx]);
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
          e.preventDefault();
        } else if (key === 'Y') {
          window.electronAPI?.redo();
          e.preventDefault();
        } else if (key === 'C') {
          handleCopyClipboard();
          e.preventDefault();
        } else if (key === 'Q') {
          e.preventDefault();
          window.electronAPI?.quitApp();
        }
        return;
      }

      // Numerical shortcuts 1-9
      switch (e.key) {
        case '1':
          handleToolSelect('pen');
          return;
        case '2':
          handleToolSelect('highlighter');
          return;
        case '3':
          handleToolSelect('marker');
          return;
        case '4':
          handleToolSelect('eraser');
          return;
        case '5':
          handleToolSelect('line');
          return;
        case '6':
          handleToolSelect('rectangle');
          return;
        case '7':
          handleToolSelect('circle');
          return;
        case '8':
          handleToolSelect('laser');
          return;
        case '9':
          handleToolSelect('spotlight');
          return;
        case 'ArrowRight':
          cycleTool('next');
          return;
        case 'ArrowLeft':
          cycleTool('prev');
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
        case 'N':
          handleToolSelect('stamp');
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
  }, [settings.activeTool, settings.strokeWidth, settings.isDrawingMode, activePopover]);

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
    <div className="relative flex flex-col items-center select-none pt-1 animate-in fade-in slide-in-from-top-2 duration-200 w-full max-w-[900px] px-2">
      {/* Category Navigation Bar & Slide Deck Controller */}
      <div
        className="flex items-center justify-between gap-2 mb-1 px-2.5 py-0.5 rounded-full bg-[#121318]/90 border border-white/10 backdrop-blur-md shadow-lg w-full"
        style={{ WebkitAppRegion: 'no-drag' } as any}
      >
        <div className="flex items-center gap-1">
          {(
            [
              { id: 'all', label: 'All' },
              { id: 'draw', label: 'Draw' },
              { id: 'style', label: 'Styles' },
              { id: 'present', label: 'Present' },
              { id: 'actions', label: 'Actions' },
            ] as { id: ToolCategory; label: string }[]
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => navigateToCategory(tab.id)}
              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold transition-all duration-150 ${
                activeCategory === tab.id
                  ? 'bg-blue-600 text-white shadow-glow'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Slide Deck Controller */}
        <div className="flex items-center gap-1 pl-2 border-l border-white/15">
          <button
            type="button"
            onClick={() => window.electronAPI?.prevSlide?.()}
            disabled={(settings.activeSlideIndex ?? 0) <= 0}
            className="p-0.5 text-gray-400 hover:text-white disabled:opacity-30 disabled:hover:text-gray-400 rounded hover:bg-white/10 transition-colors"
            title="Previous Slide (PageUp)"
          >
            <ChevronLeft className="w-3 h-3" />
          </button>

          <span className="text-[10px] font-semibold text-gray-200 tracking-wide select-none px-0.5 whitespace-nowrap">
            Slide {(settings.activeSlideIndex ?? 0) + 1} / {settings.totalSlides ?? 1}
          </span>

          <button
            type="button"
            onClick={() => window.electronAPI?.nextSlide?.()}
            disabled={(settings.activeSlideIndex ?? 0) >= (settings.totalSlides ?? 1) - 1}
            className="p-0.5 text-gray-400 hover:text-white disabled:opacity-30 disabled:hover:text-gray-400 rounded hover:bg-white/10 transition-colors"
            title="Next Slide (PageDown)"
          >
            <ChevronRight className="w-3 h-3" />
          </button>

          <button
            type="button"
            onClick={() => window.electronAPI?.addSlide?.()}
            className="px-1.5 py-0.5 text-[9px] font-bold bg-cyan-600/80 hover:bg-cyan-500 text-white rounded-md shadow-sm transition-all flex items-center gap-0.5 ml-1"
            title="Add New Blank Slide"
          >
            <Plus className="w-2.5 h-2.5" />
            <span>Slide</span>
          </button>
        </div>
      </div>

      {/* Floating Pill Toolbar */}
      <div
        className="glass-panel rounded-2xl px-2 py-1.5 flex items-center shadow-2xl relative w-full overflow-hidden"
        style={{ WebkitAppRegion: 'no-drag' } as any}
      >
        {/* Fixed Left: Drag Handle & Master Mode Button */}
        <div className="flex items-center gap-1 shrink-0 pl-1 pr-1.5 border-r border-white/10">
          <div
            className="flex items-center justify-center cursor-grab active:cursor-grabbing text-gray-500 hover:text-gray-300 p-1 rounded hover:bg-white/5 transition-colors"
            style={{ WebkitAppRegion: 'drag' } as any}
            title="Drag to move toolbar"
          >
            <GripVertical className="w-4 h-4" />
          </div>

          {/* Mode Toggle Button */}
          <button
            type="button"
            onClick={toggleDrawingMode}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all shadow-md shrink-0 ${
              settings.isDrawingMode && !isNeutralTool(settings.activeTool)
                ? 'bg-blue-600 text-white shadow-glow hover:bg-blue-500 ring-1 ring-blue-400/50'
                : 'bg-emerald-600/90 text-emerald-100 hover:bg-emerald-500 ring-1 ring-emerald-400/50'
            }`}
            title={
              settings.isDrawingMode && !isNeutralTool(settings.activeTool)
                ? 'Drawing Active: Click to Unselect & click other apps (Ctrl+Shift+D)'
                : 'Desktop Mode: Clicks pass through to other apps (Ctrl+Shift+D)'
            }
          >
            {settings.isDrawingMode && !isNeutralTool(settings.activeTool) ? (
              <>
                <Pen className="w-3.5 h-3.5 animate-pulse" />
                <span className="font-bold text-[11px]">Draw</span>
              </>
            ) : (
              <>
                <MousePointer className="w-3.5 h-3.5" />
                <span className="font-bold text-[11px]">Desktop</span>
              </>
            )}
          </button>
        </div>

        {/* Scroll Left Chevron Navigation */}
        {canScrollLeft && (
          <button
            type="button"
            onClick={() => handleScroll(-180)}
            className="shrink-0 p-1 text-gray-400 hover:text-white bg-black/40 hover:bg-black/70 rounded-lg mx-0.5 z-10 transition-colors shadow-sm"
            title="Scroll Tools Left (or use Mouse Wheel)"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Scrollable Center Tools Strip */}
        <div
          ref={scrollContainerRef}
          onWheel={handleWheel}
          className="flex-1 flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-touch-smooth px-2 py-0.5"
        >
          {/* SECTION 1: DRAW TOOLS */}
          <div id="section-draw" className="flex items-center gap-1 shrink-0">
            {/* Dedicated Desktop Pass-through tool */}
            <ToolButton
              icon={<MousePointer2 className="w-4 h-4" />}
              label="Desktop Mode (Pass-Through)"
              shortcut="Esc / V"
              isActive={!settings.isDrawingMode || isNeutralTool(settings.activeTool)}
              onClick={unselectDrawingTool}
            />

            {/* Pen Tool */}
            <ToolButton
              icon={<Pen className="w-4 h-4" />}
              label={
                settings.activeTool === 'pen' && settings.isDrawingMode
                  ? 'Pen (Click again to Unselect)'
                  : 'Pen Tool'
              }
              shortcut={SHORTCUTS.PEN}
              isActive={settings.activeTool === 'pen' && settings.isDrawingMode}
              onClick={() => handleToolSelect('pen')}
            />

            {/* Highlighter */}
            <ToolButton
              icon={<Highlighter className="w-4 h-4" />}
              label="Highlighter"
              shortcut={SHORTCUTS.HIGHLIGHTER}
              isActive={settings.activeTool === 'highlighter'}
              onClick={() => handleToolSelect('highlighter')}
            />

            {/* Marker */}
            <ToolButton
              icon={<Brush className="w-4 h-4" />}
              label="Marker Brush"
              shortcut={SHORTCUTS.MARKER}
              isActive={settings.activeTool === 'marker'}
              onClick={() => handleToolSelect('marker')}
            />

            {/* Eraser */}
            <ToolButton
              icon={<Eraser className="w-4 h-4" />}
              label="Eraser"
              shortcut={SHORTCUTS.ERASER}
              isActive={settings.activeTool === 'eraser'}
              onClick={() => handleToolSelect('eraser')}
            />

            {/* Shapes Dropdown Menu */}
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => setActivePopover(activePopover === 'shapes' ? null : 'shapes')}
                className={`flex items-center gap-0.5 px-2 h-9 rounded-xl transition-all duration-150 text-xs font-medium ${
                  isShapeTool
                    ? 'bg-blue-600 text-white shadow-glow ring-2 ring-blue-400/50'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
                title="Geometric Shapes (Line, Arrow, Rectangle, Circle)"
              >
                {settings.activeTool === 'line' && <Minus className="w-4 h-4" />}
                {settings.activeTool === 'arrow' && <MoveUpRight className="w-4 h-4" />}
                {settings.activeTool === 'rectangle' && <Square className="w-4 h-4" />}
                {settings.activeTool === 'circle' && <Circle className="w-4 h-4" />}
                {!isShapeTool && <Square className="w-4 h-4" />}
                <ChevronDown className="w-3 h-3 opacity-70" />
              </button>

              {activePopover === 'shapes' && (
                <div className="absolute top-full mt-2 left-0 p-2 bg-[#18191d] border border-white/15 rounded-xl shadow-2xl backdrop-blur-xl z-50 flex gap-1 animate-in fade-in zoom-in-95 duration-100">
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

            {/* Text Tool */}
            <ToolButton
              icon={<Type className="w-4 h-4" />}
              label="Text Annotation"
              shortcut={SHORTCUTS.TEXT}
              isActive={settings.activeTool === 'text'}
              onClick={() => handleToolSelect('text')}
            />

            {/* Numbered Step Badge Stamp */}
            <div className="relative flex items-center shrink-0">
              <ToolButton
                icon={<Stamp className="w-4 h-4 text-emerald-400" />}
                label={`Numbered Step Badge (#${settings.currentStampNumber || 1})`}
                shortcut={SHORTCUTS.STAMP}
                isActive={settings.activeTool === 'stamp'}
                onClick={() => handleToolSelect('stamp')}
                badge={
                  <span className="bg-emerald-500 text-black text-[9px] font-extrabold px-1 rounded-full shadow-sm">
                    {settings.currentStampNumber || 1}
                  </span>
                }
              />
              {settings.activeTool === 'stamp' && (settings.currentStampNumber || 1) > 1 && (
                <button
                  type="button"
                  onClick={() => updateSettings({ currentStampNumber: 1 })}
                  className="text-[9px] bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white px-1 py-0.5 rounded ml-0.5 font-mono"
                  title="Reset counter to 1"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          <div className="w-[1px] h-6 bg-white/10 shrink-0 mx-0.5" />

          {/* SECTION 2: PRESENTATION TOOLS */}
          <div id="section-present" className="flex items-center gap-1 shrink-0">
            {/* Laser Pointer */}
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

            {/* Backdrop Switcher */}
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => setActivePopover(activePopover === 'backdrop' ? null : 'backdrop')}
                className={`flex items-center gap-1 px-2 h-9 rounded-xl transition-all duration-150 text-xs font-medium ${
                  settings.backdropType && settings.backdropType !== 'transparent'
                    ? 'bg-indigo-600 text-white shadow-glow ring-2 ring-indigo-400/50'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
                title="Canvas Backdrop: Whiteboard, Blackboard, Grid, Transparent (B)"
              >
                <Layers className="w-4 h-4" />
                <ChevronDown className="w-3 h-3 opacity-70" />
              </button>

              {activePopover === 'backdrop' && (
                <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 p-2 bg-[#18191d] border border-white/15 rounded-xl shadow-2xl backdrop-blur-xl z-50 flex flex-col gap-1 min-w-[140px] animate-in fade-in zoom-in-95 duration-100">
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
          </div>

          <div className="w-[1px] h-6 bg-white/10 shrink-0 mx-0.5" />

          {/* SECTION 3: STYLES (COLOR & SIZE) */}
          <div id="section-style" className="flex items-center gap-1.5 shrink-0">
            {/* Color Palette Trigger */}
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => setActivePopover(activePopover === 'color' ? null : 'color')}
                className="w-8 h-8 rounded-full border-2 border-white/40 shadow-inner hover:scale-110 active:scale-95 transition-transform flex items-center justify-center ring-1 ring-black/40"
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
            <div className="relative shrink-0">
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
          </div>

          <div className="w-[1px] h-6 bg-white/10 shrink-0 mx-0.5" />

          {/* SECTION 4: ACTIONS (HISTORY, EXPORT, CAPTURE, HELP) */}
          <div id="section-actions" className="flex items-center gap-1 shrink-0">
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

            {/* Toggle Overlay Visibility */}
            <ToolButton
              icon={
                settings.isOverlayVisible ? (
                  <Eye className="w-4 h-4" />
                ) : (
                  <EyeOff className="w-4 h-4 text-amber-400" />
                )
              }
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
            <div className="relative shrink-0">
              <ToolButton
                icon={<Monitor className="w-4 h-4" />}
                label="Switch Display"
                onClick={() => setActivePopover(activePopover === 'display' ? null : 'display')}
              />
              {activePopover === 'display' && (
                <DisplaySelector onClose={() => setActivePopover(null)} />
              )}
            </div>

            {/* Help & Shortcuts Guide */}
            <ToolButton
              icon={<HelpCircle className="w-4 h-4" />}
              label="Keyboard Shortcuts (?)"
              onClick={() => setShowShortcuts(true)}
            />
          </div>
        </div>

        {/* Scroll Right Chevron Navigation */}
        {canScrollRight && (
          <button
            type="button"
            onClick={() => handleScroll(180)}
            className="shrink-0 p-1 text-gray-400 hover:text-white bg-black/40 hover:bg-black/70 rounded-lg mx-0.5 z-10 transition-colors shadow-sm"
            title="Scroll Tools Right (or use Mouse Wheel)"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Fixed Right: Window Controls */}
        <div className="flex items-center gap-1 shrink-0 pl-1.5 border-l border-white/10">
          {/* Minimize Toolbar */}
          <button
            type="button"
            onClick={() => window.electronAPI?.minimizeToolbar?.()}
            className="text-gray-400 hover:text-white hover:bg-white/10 p-1.5 rounded-xl transition-colors"
            title="Minimize Toolbar"
          >
            <Minus className="w-4 h-4" />
          </button>

          {/* Close App */}
          <button
            type="button"
            onClick={() => window.electronAPI?.quitApp()}
            className="text-gray-400 hover:text-red-400 hover:bg-white/10 p-1.5 rounded-xl transition-colors"
            title="Exit ScreenCanvas (Ctrl+Q)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Floating notification badge */}
      {exportNotice && (
        <div className="mt-2 bg-blue-600/95 text-white text-xs px-3 py-1.5 rounded-full shadow-lg border border-blue-400/40 backdrop-blur-md animate-fade-in flex items-center gap-1.5">
          <span>{exportNotice}</span>
        </div>
      )}

      {/* Keyboard Shortcuts Modal */}
      {showShortcuts && <ShortcutsModal onClose={() => setShowShortcuts(false)} />}
    </div>
  );
};
