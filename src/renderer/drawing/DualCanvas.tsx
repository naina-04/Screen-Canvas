import React, { useRef, useEffect, useCallback, useState } from 'react';
import {
  DrawingSettings,
  DrawingElement,
  PathElement,
  ShapeElement,
  ArrowElement,
  Point,
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

interface DualCanvasProps {
  settings: DrawingSettings;
  historyManager: HistoryManager;
  onHistoryChange: () => void;
  onTextPrompt?: (point: Point) => void;
}

export const DualCanvas: React.FC<DualCanvasProps> = ({
  settings,
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
    if (!settings.isDrawingMode) return;
    const scratch = scratchCanvasRef.current;
    if (!scratch) return;

    scratch.setPointerCapture(e.pointerId);
    isDrawingRef.current = true;
    const point = getCanvasPoint(e);
    startPointRef.current = point;

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
    const scratch = scratchCanvasRef.current;
    if (!scratch) return;
    const ctx = scratch.getContext('2d');
    if (!ctx) return;

    const point = getCanvasPoint(e);
    const dpr = window.devicePixelRatio || 1;

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

      if (settings.activeTool === 'arrow') {
        const previewArrow: ArrowElement = {
          id: 'preview',
          type: 'arrow',
          startPoint: startPointRef.current,
          endPoint: point,
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
          endPoint: point,
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
        const element: ShapeElement = {
          id: `shape-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          type: settings.activeTool,
          startPoint: startPointRef.current,
          endPoint,
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
        const element: ArrowElement = {
          id: `arrow-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          type: 'arrow',
          startPoint: startPointRef.current,
          endPoint,
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

  const getCursor = () => {
    if (!settings.isDrawingMode) return 'default';
    switch (settings.activeTool) {
      case 'pen':
      case 'marker':
        return 'crosshair';
      case 'highlighter':
        return 'cell';
      case 'eraser':
        return 'none'; // We render our own circular eraser ring
      case 'text':
        return 'text';
      case 'line':
      case 'arrow':
      case 'rectangle':
      case 'circle':
        return 'crosshair';
      default:
        return 'crosshair';
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full select-none"
      style={{
        pointerEvents: settings.isDrawingMode ? 'auto' : 'none',
        cursor: getCursor(),
      }}
    >
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
