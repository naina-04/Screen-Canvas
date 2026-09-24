export interface ClipboardSnapshotMetadata {
  title: string;
  timestamp: string;
  width: number;
  height: number;
  elementCount: number;
}

export function formatClipboardHtml(dataUrl: string, meta: ClipboardSnapshotMetadata): string {
  return [
    `<div class="screencanvas-annotation" data-timestamp="${meta.timestamp}" data-count="${meta.elementCount}">`,
    `  <img src="${dataUrl}" alt="${meta.title}" width="${meta.width}" height="${meta.height}" style="max-width:100%; height:auto;" />`,
    `</div>`,
  ].join('\n');
}
