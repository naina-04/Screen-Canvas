import { PressureCurveType } from '../types/pressureCurve';

export function mapPressure(pressure: number, type: PressureCurveType = 'linear'): number {
  const p = Math.max(0, Math.min(1, pressure));
  switch (type) {
    case 'ease_in':
      return p * p;
    case 'ease_out':
      return Math.sqrt(p);
    case 'logarithmic':
      return Math.log10(1 + 9 * p);
    case 'linear':
    default:
      return p;
  }
}
