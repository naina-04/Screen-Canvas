/**
 * Formatting and filename generator utility for exports and screenshots
 */

export interface ExportFilenameOptions {
  prefix?: string;
  timestamp?: number;
  width?: number;
  height?: number;
  extension?: 'png' | 'jpg' | 'svg';
}

/**
 * Formats a Date object into a filesystem-safe ISO-like timestamp: YYYY-MM-DD_HH-mm-ss
 */
export function formatExportTimestamp(timestamp: number = Date.now()): string {
  const d = new Date(timestamp);
  const pad = (n: number) => String(n).padStart(2, '0');

  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  const seconds = pad(d.getSeconds());

  return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
}

/**
 * Builds a clean, professional filename for exports
 */
export function buildExportFilename(options: ExportFilenameOptions = {}): string {
  const {
    prefix = 'screencanvas',
    timestamp = Date.now(),
    width,
    height,
    extension = 'png',
  } = options;

  const timeStr = formatExportTimestamp(timestamp);
  const dimensionStr = width && height ? `_${width}x${height}` : '';

  return `${prefix}-${timeStr}${dimensionStr}.${extension}`;
}

/**
 * Strips data URL prefix to extract raw base64 string
 */
export function extractBase64Data(dataUrl: string): string {
  return dataUrl.replace(/^data:image\/[a-zA-Z0-9+]+;base64,/, '');
}
