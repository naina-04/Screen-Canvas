import React, { useRef, useEffect, useCallback, useState } from 'react';
import {
  DrawingSettings,
  DrawingElement,
  PathElement,
  ShapeElement,
  ArrowElement,
  Point,
  isNeutralTool,
} from '../../shared/types';
import { HistoryManager } from '../../shared/utils/HistoryManager';
import {
  renderElement,
  renderAllElements,
} from '../../shared/utils/renderEngine';
import {
  isPointNearPath,
  isPointInRect,
  isPointNearEllipse,
  distToSegment,
} from '../../shared/utils/geometry';
import { applyShapeConstraint } from '../../shared/utils/snapEngine';

interface DualCanvasProps {
  settings: DrawingSettings;
  isAppActive?: boolean;
  historyManager: HistoryManager;
  onHistoryChange: () => void;
  onTextPrompt?: (point: Point) => void;
}

export const DualCanvas: React.FC<DualCanvasProps> = ({
  settings,
  isAppActive = true,
  historyManager,
  onHistoryChange,
  onTextPrompt,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const committedCanvasRef = useRef<HTMLCanvasElement>(null);
  const scratchCanvasRef = useRef<HTMLCanvasElement>(null);

  const isDrawingRef = useRef(false);
  const activePointsRef = useRef<Point[]>([]);
  const startPointRef = useRef<Point | null>(null);

  // Resize and scale canvas for high-DPI
  const resizeCanvases = useCallback(() => {
    const committed = committedCanvasRef.current;
    const scratch = scratchCanvasRef.current;
    const container = containerRef.current;
    if (!committed || !scratch || !container) return;

    const dpr = window.devicePixelRatio || 1;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    committed.width = width * dpr;
    committed.height = height * dpr;
    committed.style.width = `${width}px`;
    committed.style.height = `${height}px`;

    scratch.width = width * dpr;
    scratch.height = height * dpr;
    scratch.style.width = `${width}px`;
    scratch.style.height = `${height}px`;

    const committedCtx = committed.getContext('2d');
    const scratchCtx = scratch.getContext('2d');

    if (committedCtx) {
      committedCtx.scale(dpr, dpr);
      renderAllElements(committedCtx, historyManager.currentElements, width, height);
    }
    if (scratchCtx) {
      scratchCtx.scale(dpr, dpr);
    }
  }, [historyManager]);

  // Full re-render of committed elements
  const redrawCommitted = useCallback(() => {
    const committed = committedCanvasRef.current;
    const container = containerRef.current;
    if (!committed || !container) return;

    const dpr = window.devicePixelRatio || 1;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const ctx = committed.getContext('2d');
    if (!ctx) return;

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, committed.width, committed.height);
    ctx.scale(dpr, dpr);
    renderAllElements(ctx, historyManager.currentElements, width, height);
    ctx.restore();
  }, [historyManager]);

  useEffect(() => {
    resizeCanvases();
    window.addEventListener('resize', resizeCanvases);
    return () => window.removeEventListener('resize', resizeCanvases);
  }, [resizeCanvases]);

  // Trigger redraw on history modification
  useEffect(() => {
    redrawCommitted();
  }, [redrawCommitted]);

  // Laser Pointer & Spotlight Presentation Refs
  const laserTrailRef = useRef<{ x: number; y: number; time: number }[]>([]);
  const laserCurrentPosRef = useRef<Point | null>(null);
  const spotlightPosRef = useRef<Point | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);
  const [spotlightRadius, setSpotlightRadius] = useState<number>(settings.spotlightRadius || 150);

  // Spotlight renderer
  const renderSpotlight = useCallback(
    (pos: Point, radius: number) => {
      const scratch = scratchCanvasRef.current;
      const container = containerRef.current;
      if (!scratch || !container) return;
      const ctx = scratch.getContext('2d');
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      const width = container.clientWidth || window.innerWidth;
      const height = container.clientHeight || window.innerHeight;

      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, scratch.width, scratch.height);
      ctx.scale(dpr, dpr);

      // Darken backdrop with cinematic soft shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
      ctx.fillRect(0, 0, width, height);

      // Radial cutout around cursor with soft feather
      ctx.globalCompositeOperation = 'destination-out';
      const innerRadius = Math.max(0, radius * 0.85);
      const grad = ctx.createRadialGradient(pos.x, pos.y, innerRadius, pos.x, pos.y, radius);
      grad.addColorStop(0, 'rgba(0, 0, 0, 1)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
      ctx.fill();

      // Soft rim highlight around spotlight circle
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
      ctx.stroke();

      ctx.restore();
    },
    []
  );

  // Laser Pointer 60fps decaying trail animation loop
  const startLaserAnimation = useCallback(() => {
    if (animationFrameIdRef.current !== null) return;

    const animate = () => {
      const scratch = scratchCanvasRef.current;
      if (!scratch) {
        animationFrameIdRef.current = null;
        return;
      }
      const ctx = scratch.getContext('2d');
      if (!ctx) {
        animationFrameIdRef.current = null;
        return;
      }

      const now = performance.now();
      const FADE_TIME = 1500; // 1.5 seconds trail decay
      laserTrailRef.current = laserTrailRef.current.filter((p) => now - p.time < FADE_TIME);

      const dpr = window.devicePixelRatio || 1;
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, scratch.width, scratch.height);
      ctx.scale(dpr, dpr);

      const trail = laserTrailRef.current;
      const laserColor = settings.strokeColor || '#ef4444';

      if (trail.length > 1) {
        for (let i = 0; i < trail.length - 1; i++) {
          const p1 = trail[i];
          const p2 = trail[i + 1];
          const age = now - p2.time;
          const progress = Math.max(0, Math.min(1, 1 - age / FADE_TIME));

          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = laserColor;
          ctx.lineWidth = Math.max(2, (settings.strokeWidth || 4) * progress);
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.globalAlpha = progress;
          ctx.shadowColor = laserColor;
          ctx.shadowBlur = 14 * progress;
          ctx.stroke();
        }
      }

      // Glowing laser head tip
      const head = laserCurrentPosRef.current || (trail.length > 0 ? trail[trail.length - 1] : null);
      if (head && (settings.activeTool === 'laser' || trail.length > 0)) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(head.x, head.y, Math.max(5, (settings.strokeWidth || 4) * 1.5), 0, Math.PI * 2);
        ctx.fillStyle = laserColor;
        ctx.globalAlpha = 0.6;
        ctx.shadowColor = laserColor;
        ctx.shadowBlur = 18;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(head.x, head.y, Math.max(2.5, (settings.strokeWidth || 4) * 0.75), 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = 0.95;
        ctx.fill();
        ctx.restore();
      }

      ctx.restore();

      if (trail.length > 0 || isDrawingRef.current || settings.activeTool === 'laser') {
        animationFrameIdRef.current = requestAnimationFrame(animate);
      } else {
        animationFrameIdRef.current = null;
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, scratch.width, scratch.height);
        ctx.restore();
      }
    };

    animationFrameIdRef.current = requestAnimationFrame(animate);
  }, [settings.strokeColor, settings.strokeWidth, settings.activeTool]);

  // Cancel active interaction and clean up scratch canvas preview
  const cancelActiveInteraction = useCallback((): boolean => {
    const wasActive =
      isDrawingRef.current ||
      startPointRef.current !== null ||
      activePointsRef.current.length > 0 ||
      laserTrailRef.current.length > 0;

    isDrawingRef.current = false;
    startPointRef.current = null;
    activePointsRef.current = [];
    laserTrailRef.current = [];
    laserCurrentPosRef.current = null;

    if (animationFrameIdRef.current !== null) {
      cancelAnimationFrame(animationFrameIdRef.current);
      animationFrameIdRef.current = null;
    }

    const scratch = scratchCanvasRef.current;
    if (scratch) {
      const ctx = scratch.getContext('2d');
      if (ctx) {
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, scratch.width, scratch.height);
        ctx.restore();
      }
    }
    return wasActive;
  }, []);

  // Cancel any active interaction when activeTool, drawingMode, or app active state changes
  useEffect(() => {
    cancelActiveInteraction();
  }, [isAppActive, settings.activeTool, settings.isDrawingMode, cancelActiveInteraction]);

  // Handle Escape key to cancel in-flight drawing or shape gesture
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        const cancelled = cancelActiveInteraction();
        if (cancelled) {
          e.stopPropagation();
          e.preventDefault();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [cancelActiveInteraction]);

  const getCanvasPoint = (e: React.PointerEvent<HTMLCanvasElement>): Point => {
    const rect = scratchCanvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: e.clientX, y: e.clientY, pressure: e.pressure };
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      pressure: e.pressure,
    };
  };

  // Object-level stroke erasing
  const handleStrokeErase = (point: Point) => {
    const elements = historyManager.currentElements;
    const threshold = settings.eraserSize / 2;

    for (let i = elements.length - 1; i >= 0; i--) {
      const el = elements[i];
      let hit = false;

      if (el.type === 'pen' || el.type === 'highlighter' || el.type === 'marker') {
        const pathEl = el as PathElement;
        hit = isPointNearPath(point, pathEl.points, threshold + pathEl.strokeWidth / 2);
      } else if (el.type === 'line') {
        const shapeEl = el as ShapeElement;
        hit = distToSegment(point, shapeEl.startPoint, shapeEl.endPoint) <= threshold + shapeEl.strokeWidth / 2;
      } else if (el.type === 'arrow') {
        const arrowEl = el as ArrowElement;
        hit = distToSegment(point, arrowEl.startPoint, arrowEl.endPoint) <= threshold + arrowEl.strokeWidth / 2;
      } else if (el.type === 'rectangle') {
        const shapeEl = el as ShapeElement;
        hit = isPointInRect(point, shapeEl.startPoint, shapeEl.endPoint, threshold + shapeEl.strokeWidth / 2, shapeEl.filled);
      } else if (el.type === 'circle') {
        const shapeEl = el as ShapeElement;
        hit = isPointNearEllipse(point, shapeEl.startPoint, shapeEl.endPoint, threshold + shapeEl.strokeWidth / 2, shapeEl.filled);
      }

      if (hit) {
        historyManager.removeElement(el.id);
        redrawCommitted();
        onHistoryChange();
        break; // Remove top-most matching element
      }
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isAppActive || !settings.isDrawingMode || isNeutralTool(settings.activeTool)) return;
    const scratch = scratchCanvasRef.current;
    if (!scratch) return;

    scratch.setPointerCapture(e.pointerId);
    isDrawingRef.current = true;
    const point = getCanvasPoint(e);
    startPointRef.current = point;

    // Laser pointer mode
    if (settings.activeTool === 'laser') {
      laserCurrentPosRef.current = point;
      laserTrailRef.current.push({ x: point.x, y: point.y, time: performance.now() });
      startLaserAnimation();
      return;
    }

    // Spotlight focus mode
    if (settings.activeTool === 'spotlight') {
      spotlightPosRef.current = point;
      renderSpotlight(point, spotlightRadius);
      return;
    }

    if (settings.activeTool === 'text') {
      isDrawingRef.current = false;
      onTextPrompt?.(point);
      return;
    }

    if (settings.activeTool === 'eraser') {
      handleStrokeErase(point);
      return;
    }

    if (
      settings.activeTool === 'pen' ||
      settings.activeTool === 'highlighter' ||
      settings.activeTool === 'marker'
    ) {
      activePointsRef.current = [point];
      const ctx = scratch.getContext('2d');
      if (ctx) {
        const dpr = window.devicePixelRatio || 1;
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);
        ctx.fillStyle = settings.strokeColor;
        ctx.beginPath();
        ctx.arc(point.x, point.y, settings.strokeWidth / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isAppActive || !settings.isDrawingMode || isNeutralTool(settings.activeTool)) return;
    const scratch = scratchCanvasRef.current;
    if (!scratch) return;
    const ctx = scratch.getContext('2d');
    if (!ctx) return;

    const point = getCanvasPoint(e);
    const dpr = window.devicePixelRatio || 1;

    // Laser pointer movement & live trail
    if (settings.activeTool === 'laser') {
      laserCurrentPosRef.current = point;
      if (isDrawingRef.current) {
        laserTrailRef.current.push({ x: point.x, y: point.y, time: performance.now() });
      }
      startLaserAnimation();
      return;
    }

    // Spotlight movement
    if (settings.activeTool === 'spotlight') {
      spotlightPosRef.current = point;
      renderSpotlight(point, spotlightRadius);
      return;
    }

    // Erasing while dragging
    if (isDrawingRef.current && settings.activeTool === 'eraser') {
      handleStrokeErase(point);
    }

    // Render eraser cursor indicator
    if (settings.activeTool === 'eraser') {
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, scratch.width, scratch.height);
      ctx.scale(dpr, dpr);

      ctx.beginPath();
      ctx.arc(point.x, point.y, settings.eraserSize / 2, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(point.x, point.y, settings.eraserSize / 2, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.lineWidth = 0.75;
      ctx.stroke();
      ctx.restore();
      return;
    }

    if (!isDrawingRef.current) return;

    // Freehand drawing: update scratch canvas
    if (
      settings.activeTool === 'pen' ||
      settings.activeTool === 'highlighter' ||
      settings.activeTool === 'marker'
    ) {
      activePointsRef.current.push(point);

      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, scratch.width, scratch.height);
      ctx.scale(dpr, dpr);

      const previewElement: PathElement = {
        id: 'preview',
        type: settings.activeTool,
        points: activePointsRef.current,
        color: settings.strokeColor,
        strokeWidth: settings.strokeWidth,
        opacity: settings.activeTool === 'highlighter' ? 0.35 : settings.opacity,
        brushStyle: settings.brushStyle,
      };

      renderElement(ctx, previewElement);
      ctx.restore();
      return;
    }

    // Shape drawing: live shape preview
    if (startPointRef.current) {
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, scratch.width, scratch.height);
      ctx.scale(dpr, dpr);

      const previewEndPoint = applyShapeConstraint(
        startPointRef.current,
        point,
        settings.activeTool,
        e.shiftKey
      );

      if (settings.activeTool === 'arrow') {
        const previewArrow: ArrowElement = {
          id: 'preview',
          type: 'arrow',
          startPoint: startPointRef.current,
          endPoint: previewEndPoint,
          color: settings.strokeColor,
          strokeWidth: settings.strokeWidth,
          opacity: settings.opacity,
          brushStyle: settings.brushStyle,
        };
        renderElement(ctx, previewArrow);
      } else {
        const previewShape: ShapeElement = {
          id: 'preview',
          type: settings.activeTool as 'line' | 'rectangle' | 'circle',
          startPoint: startPointRef.current,
          endPoint: previewEndPoint,
          color: settings.strokeColor,
          strokeWidth: settings.strokeWidth,
          opacity: settings.opacity,
          brushStyle: settings.brushStyle,
          filled: settings.fillColor !== 'transparent',
          fillColor: settings.fillColor,
        };
        renderElement(ctx, previewShape);
      }

      ctx.restore();
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;

    const scratch = scratchCanvasRef.current;
    if (scratch && scratch.hasPointerCapture(e.pointerId)) {
      scratch.releasePointerCapture(e.pointerId);
    }

    const endPoint = getCanvasPoint(e);

    // Special handling for laser & spotlight: do not commit to vector history
    if (settings.activeTool === 'laser' || settings.activeTool === 'spotlight') {
      startPointRef.current = null;
      return;
    }

    // Commit freehand stroke
    if (
      settings.activeTool === 'pen' ||
      settings.activeTool === 'highlighter' ||
      settings.activeTool === 'marker'
    ) {
      if (activePointsRef.current.length > 0) {
        const element: PathElement = {
          id: `path-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          type: settings.activeTool,
          points: [...activePointsRef.current],
          color: settings.strokeColor,
          strokeWidth: settings.strokeWidth,
          opacity: settings.activeTool === 'highlighter' ? 0.35 : settings.opacity,
          brushStyle: settings.brushStyle,
        };

        historyManager.addElement(element);
        activePointsRef.current = [];
        redrawCommitted();
        onHistoryChange();
      }
    } else if (
      settings.activeTool === 'line' ||
      settings.activeTool === 'rectangle' ||
      settings.activeTool === 'circle'
    ) {
      if (startPointRef.current) {
        const constrainedEndPoint = applyShapeConstraint(
          startPointRef.current,
          endPoint,
          settings.activeTool,
          e.shiftKey
        );

        const element: ShapeElement = {
          id: `shape-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          type: settings.activeTool,
          startPoint: startPointRef.current,
          endPoint: constrainedEndPoint,
          color: settings.strokeColor,
          strokeWidth: settings.strokeWidth,
          opacity: settings.opacity,
          brushStyle: settings.brushStyle,
          filled: settings.fillColor !== 'transparent',
          fillColor: settings.fillColor,
        };

        historyManager.addElement(element);
        redrawCommitted();
        onHistoryChange();
      }
    } else if (settings.activeTool === 'arrow') {
      if (startPointRef.current) {
        const constrainedEndPoint = applyShapeConstraint(
          startPointRef.current,
          endPoint,
          settings.activeTool,
          e.shiftKey
        );

        const element: ArrowElement = {
          id: `arrow-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          type: 'arrow',
          startPoint: startPointRef.current,
          endPoint: constrainedEndPoint,
          color: settings.strokeColor,
          strokeWidth: settings.strokeWidth,
          opacity: settings.opacity,
          brushStyle: settings.brushStyle,
        };

        historyManager.addElement(element);
        redrawCommitted();
        onHistoryChange();
      }
    }

    // Clear scratch canvas
    if (scratch) {
      const ctx = scratch.getContext('2d');
      if (ctx) {
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, scratch.width, scratch.height);
        ctx.restore();
      }
    }

    startPointRef.current = null;
  };

  // Adjust spotlight radius with mouse wheel
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (settings.activeTool === 'spotlight') {
      const delta = e.deltaY < 0 ? 15 : -15;
      const nextRadius = Math.max(50, Math.min(450, spotlightRadius + delta));
      setSpotlightRadius(nextRadius);
      if (spotlightPosRef.current) {
        renderSpotlight(spotlightPosRef.current, nextRadius);
      }
    }
  };

  // Auto-render spotlight when switched to spotlight tool and app is active
  useEffect(() => {
    if (isAppActive && settings.activeTool === 'spotlight') {
      const width = containerRef.current?.clientWidth || window.innerWidth;
      const height = containerRef.current?.clientHeight || window.innerHeight;
      const pos = spotlightPosRef.current || { x: width / 2, y: height / 2 };
      spotlightPosRef.current = pos;
      renderSpotlight(pos, spotlightRadius);
    }
  }, [isAppActive, settings.activeTool, spotlightRadius, renderSpotlight]);

  const getCursor = () => {
    if (!isAppActive || !settings.isDrawingMode || isNeutralTool(settings.activeTool)) return 'default';
    switch (settings.activeTool) {
      case 'laser':
      case 'eraser':
      case 'spotlight':
        return 'none'; // Custom rendered indicators
      case 'pen':
      case 'marker':
        return 'crosshair';
      case 'highlighter':
        return 'cell';
      case 'text':
        return 'text';
      case 'line':
      case 'arrow':
      case 'rectangle':
      case 'circle':
        return 'crosshair';
      default:
        return 'default';
    }
  };

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      className="relative w-full h-full select-none"
      style={{
        pointerEvents: isAppActive && settings.isDrawingMode && !isNeutralTool(settings.activeTool) ? 'auto' : 'none',
        cursor: getCursor(),
      }}
    >
      {/* Backdrop Canvas Layer: Whiteboard / Blackboard / Grid */}
      <div
        className={`absolute inset-0 transition-colors duration-200 pointer-events-none ${
          settings.backdropType === 'whiteboard'
            ? 'bg-[#fcfdfd]'
            : settings.backdropType === 'blackboard'
            ? 'bg-[#18191d]'
            : settings.backdropType === 'grid'
            ? 'bg-[#18191d]'
            : 'bg-transparent'
        }`}
        style={
          settings.backdropType === 'grid'
            ? {
                backgroundImage:
                  'radial-gradient(circle, rgba(255, 255, 255, 0.22) 1.5px, transparent 1.5px)',
                backgroundSize: '24px 24px',
              }
            : undefined
        }
      />
      <canvas
        ref={committedCanvasRef}
        className="absolute top-0 left-0 w-full h-full pointer-events-none"
      />
      <canvas
        ref={scratchCanvasRef}
        className="absolute top-0 left-0 w-full h-full"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      />
    </div>
  );
};
