export function calculateStrokeOpacity(
  createdAt: number,
  now: number,
  durationMs = 5000,
  fadeRatio = 0.7
): number {
  const elapsed = now - createdAt;
  if (elapsed >= durationMs) return 0;

  const fadeStart = durationMs * fadeRatio;
  if (elapsed <= fadeStart) return 1;

  const fadeDuration = durationMs - fadeStart;
  const fadeProgress = (elapsed - fadeStart) / fadeDuration;
  return Math.max(0, Math.min(1, 1 - fadeProgress));
}
