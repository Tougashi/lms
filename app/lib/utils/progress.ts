export interface ProgressSequenceItem {
  id: string;
  type: string;
}

/** Types excluded from progress counting: optional feedback item. */
const CLIENT_ONLY_TYPES = new Set(["rating"]);

/**
 * Compute progress percentage from local completion state.
 *
 * Mirrors backend getTotalSequenceSteps: excludes client-only items
 * (topik summaries, rangkumanAkhir). Result is capped at 100.
 */
export function calculateProgress(
  sequence: ProgressSequenceItem[],
  completedMap: Record<string, boolean>,
  status: string | null | undefined,
  isGraduated: boolean | null | undefined,
): number {
  if (status === "COMPLETED" || isGraduated) return 100;
  const countable = sequence.filter((item) => !CLIENT_ONLY_TYPES.has(item.type));
  const total = countable.length;
  if (total === 0) return 0;
  const completed = countable.filter((item) => completedMap[item.id]).length;
  return Math.min(100, Math.round((completed / total) * 100));
}
