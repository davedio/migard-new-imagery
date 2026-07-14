export const JOURNEY_STAGE_BOUNDS = [
  0,
  0.18,
  0.36,
  0.52,
  0.68,
  0.86,
  1.0001,
] as const;

export const JOURNEY_STAGE_COUNT = JOURNEY_STAGE_BOUNDS.length - 1;

export function journeyStageIndex(progress: number): number {
  for (let index = JOURNEY_STAGE_COUNT - 1; index >= 0; index -= 1) {
    if (progress >= JOURNEY_STAGE_BOUNDS[index]) return index;
  }
  return 0;
}

export function journeyStageCenter(index: number): number {
  const safeIndex = Math.max(0, Math.min(JOURNEY_STAGE_COUNT - 1, index));
  const end = Math.min(1, JOURNEY_STAGE_BOUNDS[safeIndex + 1]);
  return (JOURNEY_STAGE_BOUNDS[safeIndex] + end) / 2;
}
