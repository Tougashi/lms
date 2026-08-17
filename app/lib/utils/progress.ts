export interface ProgressSequenceItem {
  id: string;
  type: string;
  ctSubIds?: string[];
}

/** Types excluded from progress counting: client-only / synthetic items (topik summaries, rangkumanAkhir, rating). */
const CLIENT_ONLY_TYPES = new Set(["rating", "summary", "rangkuman-akhir"]);

/**
 * Compute progress percentage from local completion state.
 *
 * Mirrors backend getTotalSequenceSteps: excludes client-only items
 * (topik summaries, rangkumanAkhir, rating). Result is capped at 100.
 */
export function calculateProgress(
  sequence: ProgressSequenceItem[],
  completedMap: Record<string, boolean>,
  status: string | null | undefined,
  isGraduated: boolean | null | undefined,
): number {
  if (status === "COMPLETED" || isGraduated) return 100;
  const countable = sequence.filter(
    (item) =>
      !CLIENT_ONLY_TYPES.has(item.type) &&
      !item.id.startsWith("summary-") &&
      item.id !== "rangkuman-akhir" &&
      item.id !== "rating"
  );
  const total = countable.length;
  if (total === 0) return 0;
  const completed = countable.filter((item) => {
    if (completedMap[item.id] === true) return true;
    if (item.ctSubIds && item.ctSubIds.length > 0) {
      return item.ctSubIds.some((subId) => completedMap[subId] === true);
    }
    return false;
  }).length;
  if (completed === 0) return 0;
  return Math.min(100, Math.round((completed / total) * 100));
}

