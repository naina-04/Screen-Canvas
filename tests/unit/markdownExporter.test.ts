import { describe, it, expect } from 'vitest';
import { generateSlideDeckMarkdown } from '../../src/shared/utils/markdownExporter';

describe('Markdown Exporter Engine', () => {
  it('generates valid markdown document with summary data', () => {
    const md = generateSlideDeckMarkdown({
      title: 'Q3 Product Demo',
      totalSlides: 4,
      totalElements: 28,
      timestamp: '2026-09-25T11:00:00Z',
    });

    expect(md).toContain('# 📊 Presentation Deck Summary: Q3 Product Demo');
    expect(md).toContain('**Total Slides**: 4');
    expect(md).toContain('**Total Annotations & Drawings**: 28');
  });
});
