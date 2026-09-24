export interface CanvasDpiScale {
  cssWidth: number;
  cssHeight: number;
  pixelWidth: number;
  pixelHeight: number;
  dpr: number;
}

export function calculateDpiScaling(width: number, height: number, customDpr?: number): CanvasDpiScale {
  const dpr = customDpr || (typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1);
  return {
    cssWidth: width,
    cssHeight: height,
    pixelWidth: Math.round(width * dpr),
    pixelHeight: Math.round(height * dpr),
    dpr,
  };
}
