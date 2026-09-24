import { describe, it, expect } from 'vitest';
import { formatClipboardHtml } from '../../src/shared/utils/clipboardMetadata';

describe('Clipboard Metadata Formatter', () => {
  it('formats HTML embed block with data attributes and dimensions', () => {
    const html = formatClipboardHtml('data:image/png;base64,sample', {
      title: 'Demo Annotation',
      timestamp: '2026-09-24T00:00:00Z',
      width: 1920,
      height: 1080,
      elementCount: 5,
    });

    expect(html).toContain('class="screencanvas-annotation"');
    expect(html).toContain('data-count="5"');
    expect(html).toContain('width="1920"');
    expect(html).toContain('src="data:image/png;base64,sample"');
  });
});
