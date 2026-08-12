export interface BaseQuizRecord {
    topik: string;
    quizType: "REGULER" | "COMPUTATIONAL_THINKING" | string;
    activityType?: string;
    score: number;
    minScoreTreshold?: number | null;
    status: "tuntas" | "di-bawah" | string;
    quizGroupId?: string | null;
    ctGroupId?: string | null;
    judul?: string | null;
}

/**
 * Groups quiz subquestions (e.g. 4 CT subquestions or subquestions of the same quiz)
 * into a single aggregated row per quiz with total score and status.
 */
export function groupQuizRecords<T extends BaseQuizRecord>(records: T[]): T[] {
    if (!records || records.length === 0) return [];

    const map = new Map<
        string,
        { record: T; count: number; totalScore: number }
    >();

    for (const rec of records) {
        const raw = rec as unknown as Record<string, unknown>;
        const key =
            (raw.quizGroupId as string) ||
            (raw.ctGroupId as string) ||
            (raw.judul
                ? `${rec.topik}___${rec.quizType}___${raw.judul}`
                : `${rec.topik}___${rec.quizType}___${rec.activityType || "Kuis"}`);

        if (map.has(key)) {
            const existing = map.get(key)!;
            existing.totalScore += Number(rec.score) || 0;
            existing.count += 1;
            if (rec.status === "tuntas") {
                existing.record.status = "tuntas";
            }
        } else {
            map.set(key, {
                record: { ...rec, score: Number(rec.score) || 0 },
                count: 1,
                totalScore: Number(rec.score) || 0,
            });
        }
    }

    const result: T[] = [];
    map.forEach(({ record, totalScore }) => {
        const threshold = record.minScoreTreshold;
        const isTuntas =
            threshold != null && threshold > 0
                ? totalScore >= threshold
                : record.status === "tuntas" || totalScore > 0;

        result.push({
            ...record,
            score: totalScore,
            status: isTuntas ? "tuntas" : "di-bawah",
        });
    });

    return result;
}
