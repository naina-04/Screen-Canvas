import { DrawingElement, BrushStyle, PathElement, ShapeElement, ArrowElement, TextElement, StampElement } from '../types';
import { calculateArrowhead } from './geometry';

/**
 * Configure context stroke styling based on brush style
 */
export function applyBrushStyle(ctx: CanvasRenderingContext2D, style: BrushStyle, strokeWidth: number) {
  switch (style) {
    case 'dashed':
      ctx.setLineDash([strokeWidth * 3, strokeWidth * 2]);
      break;
    case 'dotted':
      ctx.setLineDash([strokeWidth, strokeWidth * 1.5]);
      break;
    case 'marker':
      ctx.setLineDash([]);
      ctx.lineCap = 'square';
      ctx.lineJoin = 'miter';
      break;
    case 'solid':
    default:
      ctx.setLineDash([]);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      break;
  }
}

/**
 * Render a single path element (pen, highlighter, marker)
 */
export function renderPath(ctx: CanvasRenderingContext2D, element: PathElement) {
  const { points, color, strokeWidth, opacity, type, brushStyle } = element;
  if (!points || points.length === 0) return;

  ctx.save();
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = strokeWidth;

  if (type === 'highlighter') {
    ctx.globalAlpha = opacity ?? 0.35;
    ctx.lineCap = 'square';
    ctx.lineJoin = 'bevel';
    ctx.setLineDash([]);
  } else if (type === 'marker') {
    ctx.globalAlpha = opacity ?? 0.8;
    applyBrushStyle(ctx, 'marker', strokeWidth);
  } else {
    ctx.globalAlpha = opacity ?? 1;
    applyBrushStyle(ctx, brushStyle ?? 'solid', strokeWidth);
  }

  if (points.length === 1) {
    ctx.fillStyle = color;
    ctx.arc(points[0].x, points[0].y, strokeWidth / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }

  // Smooth path using quadratic curves between midpoints
  ctx.moveTo(points[0].x, points[0].y);

  for (let i = 1; i < points.length - 1; i++) {
    const xc = (points[i].x + points[i + 1].x) / 2;
    const yc = (points[i].y + points[i + 1].y) / 2;
    ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
  }

  // Last segment
  if (points.length > 1) {
    const last = points[points.length - 1];
    ctx.lineTo(last.x, last.y);
  }

  ctx.stroke();
  ctx.restore();
}

/**
 * Render a shape element (line, rectangle, circle)
 */
export function renderShape(ctx: CanvasRenderingContext2D, element: ShapeElement) {
  const { type, startPoint, endPoint, color, strokeWidth, opacity, brushStyle, filled, fillColor } = element;

  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = strokeWidth;
  ctx.globalAlpha = opacity ?? 1;
  applyBrushStyle(ctx, brushStyle ?? 'solid', strokeWidth);

  ctx.beginPath();

  if (type === 'line') {
    ctx.moveTo(startPoint.x, startPoint.y);
    ctx.lineTo(endPoint.x, endPoint.y);
    ctx.stroke();
  } else if (type === 'rectangle') {
    const x = Math.min(startPoint.x, endPoint.x);
    const y = Math.min(startPoint.y, endPoint.y);
    const w = Math.abs(endPoint.x - startPoint.x);
    const h = Math.abs(endPoint.y - startPoint.y);

    if (filled && fillColor && fillColor !== 'transparent') {
      ctx.fillStyle = fillColor;
      ctx.fillRect(x, y, w, h);
    }
    ctx.strokeRect(x, y, w, h);
  } else if (type === 'circle') {
    const cx = (startPoint.x + endPoint.x) / 2;
    const cy = (startPoint.y + endPoint.y) / 2;
    const rx = Math.abs(endPoint.x - startPoint.x) / 2;
    const ry = Math.abs(endPoint.y - startPoint.y) / 2;

    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    if (filled && fillColor && fillColor !== 'transparent') {
      ctx.fillStyle = fillColor;
      ctx.fill();
    }
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * Render an arrow element with arrowhead
 */
export function renderArrow(ctx: CanvasRenderingContext2D, element: ArrowElement) {
  const { startPoint, endPoint, color, strokeWidth, opacity, brushStyle, arrowHeadSize = 20 } = element;

  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = strokeWidth;
  ctx.globalAlpha = opacity ?? 1;
  applyBrushStyle(ctx, brushStyle ?? 'solid', strokeWidth);

  // Draw main shaft
  ctx.beginPath();
  ctx.moveTo(startPoint.x, startPoint.y);
  ctx.lineTo(endPoint.x, endPoint.y);
  ctx.stroke();

  // Calculate and draw arrowhead
  const { left, right } = calculateArrowhead(startPoint, endPoint, Math.max(arrowHeadSize, strokeWidth * 3));
  ctx.beginPath();
  ctx.moveTo(endPoint.x, endPoint.y);
  ctx.lineTo(left.x, left.y);
  ctx.lineTo(right.x, right.y);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

/**
 * Render a text annotation
 */
export function renderText(ctx: CanvasRenderingContext2D, element: TextElement) {
  const { point, text, color, fontSize = 20, fontFamily = 'sans-serif', opacity = 1 } = element;
  if (!text) return;

  ctx.save();
  ctx.fillStyle = color;
  ctx.font = `${fontSize}px ${fontFamily}`;
  ctx.globalAlpha = opacity;
  ctx.textBaseline = 'top';

  const lines = text.split('\n');
  const lineHeight = fontSize * 1.25;

  lines.forEach((line, index) => {
    ctx.fillText(line, point.x, point.y + index * lineHeight);
  });

  ctx.restore();
}

/**
 * Render a sequential numbering stamp badge (e.g. ①, ②, ③)
 */
export function renderStamp(ctx: CanvasRenderingContext2D, element: StampElement) {
  const { point, number, radius = 16, color, opacity = 1 } = element;
  ctx.save();
  ctx.globalAlpha = opacity;

  // Soft drop shadow
  ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
  ctx.shadowBlur = 6;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 2;

  // Outer circular badge
  ctx.beginPath();
  ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();

  // Reset shadow for crisp border and text
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  // White rim border
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#ffffff';
  ctx.stroke();

  // Number text inside badge
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${Math.round(radius * 1.05)}px system-ui, -apple-system, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(number), point.x, point.y);

  ctx.restore();
}

/**
 * Render any drawing element
 */
export function renderElement(ctx: CanvasRenderingContext2D, element: DrawingElement) {
  switch (element.type) {
    case 'pen':
    case 'highlighter':
    case 'marker':
      renderPath(ctx, element as PathElement);
      break;
    case 'line':
    case 'rectangle':
    case 'circle':
      renderShape(ctx, element as ShapeElement);
      break;
    case 'arrow':
      renderArrow(ctx, element as ArrowElement);
      break;
    case 'text':
      renderText(ctx, element as TextElement);
      break;
    case 'stamp':
      renderStamp(ctx, element as StampElement);
      break;
  }
}

/**
 * Render all elements onto a canvas
 */
export function renderAllElements(
  ctx: CanvasRenderingContext2D,
  elements: DrawingElement[],
  width: number,
  height: number
) {
  ctx.clearRect(0, 0, width, height);
  for (const el of elements) {
    renderElement(ctx, el);
  }
}
