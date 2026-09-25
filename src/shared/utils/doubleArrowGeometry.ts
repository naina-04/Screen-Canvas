import { Point } from '../types';
import { DoubleArrowGeometry } from '../types/doubleArrow';
import { computeArrowHead } from './arrowGeometry';

export function computeDoubleArrow(start: Point, end: Point, headLength = 16): DoubleArrowGeometry {
  const forwardHead = computeArrowHead(start, end, headLength);
  const backwardHead = computeArrowHead(end, start, headLength);

  return {
    startTip: start,
    startLeft: backwardHead.left,
    startRight: backwardHead.right,
    endTip: end,
    endLeft: forwardHead.left,
    endRight: forwardHead.right,
  };
}
