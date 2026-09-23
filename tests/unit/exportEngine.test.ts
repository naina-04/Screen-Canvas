import { describe, it, expect } from 'vitest';
import {
  formatExportTimestamp,
  buildExportFilename,
  extractBase64Data,
} from '../../src/shared/utils/exportEngine';

describe('exportEngine utility functions', () => {
  it('formats timestamp into filesystem safe date string', () => {
    // 2026-09-23 12:30:45 UTC
    const date = new Date(2026, 8, 23, 12, 30, 45).getTime();
    const formatted = formatExportTimestamp(date);

    expect(formatted).toMatch(/^2026-09-23_12-30-45$/);
  });

  it('builds export filenames with default prefix and extension', () => {
    const fixedTime = new Date(2026, 0, 15, 9, 5, 0).getTime();
    const filename = buildExportFilename({ timestamp: fixedTime });

    expect(filename).toBe('screencanvas-2026-01-15_09-05-00.png');
  });

  it('builds export filenames with custom prefix, dimensions, and extension', () => {
    const fixedTime = new Date(2026, 0, 15, 9, 5, 0).getTime();
    const filename = buildExportFilename({
      prefix: 'screencanvas-screenshot',
      timestamp: fixedTime,
      width: 1920,
      height: 1080,
      extension: 'png',
    });

    expect(filename).toBe('screencanvas-screenshot-2026-01-15_09-05-00_1920x1080.png');
  });

  it('extracts raw base64 data by removing data URL headers', () => {
    const pngDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA';
    expect(extractBase64Data(pngDataUrl)).toBe('iVBORw0KGgoAAAANSUhEUgAA');

    const jpegDataUrl = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ';
    expect(extractBase64Data(jpegDataUrl)).toBe('/9j/4AAQSkZJRgABAQ');
  });
});
