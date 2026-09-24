import { describe, it, expect } from 'vitest';
import { exportElementsToSvg } from '../../src/shared/utils/svgExporter';
import { DrawingElement } from '../../src/shared/types';

describe('SVG Exporter Engine', () => {
  it('generates valid SVG container tags with dimensions', () => {
    const svg = exportElementsToSvg([], 800, 600);
    expect(svg).toContain('<svg xmlns="http://www.w3.org/2000/svg"');
    expect(svg).toContain('viewBox="0 0 800 600"');
    expect(svg).toContain('</svg>');
  });

  it('serializes path and rectangle elements to SVG tags', () => {
    const elements: DrawingElement[] = [
      {
        id: 'p-1',
        type: 'pen',
        color: '#ff0000',
        strokeWidth: 4,
        opacity: 1,
        brushStyle: 'solid',
        points: [{ x: 10, y: 20 }, { x: 30, y: 40 }],
      },
      {
        id: 'r-1',
        type: 'rectangle',
        color: '#00ff00',
        strokeWidth: 2,
        opacity: 0.8,
        brushStyle: 'solid',
        startPoint: { x: 50, y: 50 },
        endPoint: { x: 150, y: 150 },
      },
    ];

    const svg = exportElementsToSvg(elements);
    expect(svg).toContain('<path d="M 10 20 L 30 40"');
    expect(svg).toContain('<rect x="50" y="50" width="100" height="100"');
  });
});
