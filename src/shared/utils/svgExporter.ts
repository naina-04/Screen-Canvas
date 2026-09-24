import { DrawingElement, PathElement, ShapeElement } from '../types';

export function exportElementsToSvg(elements: DrawingElement[], width = 1920, height = 1080): string {
  const svgParts: string[] = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">`,
  ];

  for (const el of elements) {
    if (el.type === 'pen' || el.type === 'highlighter' || el.type === 'marker') {
      const p = el as PathElement;
      if (p.points.length > 1) {
        const d = p.points.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`).join(' ');
        svgParts.push(
          `  <path d="${d}" fill="none" stroke="${p.color}" stroke-width="${p.strokeWidth}" stroke-linecap="round" stroke-linejoin="round" opacity="${p.opacity}" />`
        );
      }
    } else if (el.type === 'rectangle') {
      const s = el as ShapeElement;
      const x = Math.min(s.startPoint.x, s.endPoint.x);
      const y = Math.min(s.startPoint.y, s.endPoint.y);
      const w = Math.abs(s.endPoint.x - s.startPoint.x);
      const h = Math.abs(s.endPoint.y - s.startPoint.y);
      svgParts.push(
        `  <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="${s.color}" stroke-width="${s.strokeWidth}" opacity="${s.opacity}" />`
      );
    }
  }

  svgParts.push('</svg>');
  return svgParts.join('\n');
}
