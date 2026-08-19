/**
 * Shared utility: build a flattened sequence from a StudyRoomResponse payload.
 *
 * Extracted from MateriClient.tsx so that other pages (beranda-siswa,
 * eksplor-modul, ModulDetailClient) can also recalculate accurate progress
 * without duplicating the logic.
 */
import type { StudyRoomResponse } from "../types/siswa";

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------
export type SequenceItemType =
    | "pretest"
    | "materi"
    | "quiz"
    | "quiz-ct"
    | "summary"
    | "rangkuman-akhir"
    | "posttest"
    | "rating";

export interface SequenceItem {
    id: string;
    title: string;
    type: SequenceItemType;
    topikId?: string;
    topikName?: string;
    hasVideo?: boolean;
    videoUrl?: string;
    konten?: string;
    duration?: string;
    ctSubIds?: string[];
    allowMultipleAttempts?: boolean;
}

// ---------------------------------------------------------------------------
// buildSequence — mirrors the version inside MateriClient.tsx
// ---------------------------------------------------------------------------
export function buildSequence(modul: StudyRoomResponse): SequenceItem[] {
    const seq: SequenceItem[] = [];

    if (modul.curriculum.pretest) {
        seq.push({
            id: "pretest",
            title: modul.curriculum.pretest.title,
            type: "pretest",
        });
    }

    // Group CT quizzes by ctGroupId across all topiks
    const ctGroupMap = new Map<string, typeof modul.curriculum.topiks[0]["items"]>();

    // Group quizzes by quizGroupId (both REGULER and CT) across all topiks
    const quizGroupMap = new Map<string, typeof modul.curriculum.topiks[0]["items"]>();

    for (const topik of modul.curriculum.topiks) {
        for (const item of topik.items) {
            if (
                (item.itemType === "QUIZ" || (item.itemType as string)?.toUpperCase() === "KUIS") &&
                item.quizGroupId
            ) {
                const group = quizGroupMap.get(item.quizGroupId) || [];
                group.push(item);
                quizGroupMap.set(item.quizGroupId, group);
            }
        }
    }

    for (const topik of modul.curriculum.topiks) {
        for (const item of topik.items) {
            if (
                (item.itemType === "QUIZ" || (item.itemType as string)?.toUpperCase() === "KUIS") &&
                item.quizType === "COMPUTATIONAL_THINKING" &&
                item.ctGroupId
            ) {
                const group = ctGroupMap.get(item.ctGroupId) || [];
                group.push(item);
                ctGroupMap.set(item.ctGroupId, group);
            }
        }
    }

    for (const topik of modul.curriculum.topiks) {
        const ctJudulMap = new Map<string, typeof topik.items>();
        const handledCtIds = new Set<string>();

        const flushJudulMap = () => {
            if (ctJudulMap.size === 0) return;
            for (const [, group] of ctJudulMap.entries()) {
                seq.push({
                    id: group[0].id,
                    title: group[0]?.judul || "Kuis CT",
                    type: "quiz-ct",
                    topikId: topik.id,
                    topikName: topik.nama,
                    ctSubIds: group.map((q) => q.id),
                });
                for (const q of group) handledCtIds.add(q.id);
            }
            ctJudulMap.clear();
        };

        for (const item of topik.items) {
            if (item.itemType === "MATERI") {
                flushJudulMap();
                seq.push({
                    id: item.id,
                    title: item.judul || "Materi",
                    type: "materi",
                    topikId: topik.id,
                    topikName: topik.nama,
                    hasVideo: item.isVideo,
                    videoUrl: item.videoUrl ?? undefined,
                    konten: item.article ?? undefined,
                });
            } else if (
                item.itemType === "QUIZ" ||
                (item.itemType as string)?.toUpperCase() === "KUIS"
            ) {
                // Priority 0: Backend-grouped CT item (has ctSubIds array)
                if (item.quizType === "COMPUTATIONAL_THINKING" && item.ctSubIds && item.ctSubIds.length > 0) {
                    flushJudulMap();
                    seq.push({
                        id: item.id,
                        title: item.judul || "Kuis CT",
                        type: "quiz-ct",
                        topikId: topik.id,
                        topikName: topik.nama,
                        ctSubIds: item.ctSubIds,
                    });
                    for (const subId of item.ctSubIds) handledCtIds.add(subId);
                // Priority 0b: Backend-grouped REGULER item (has ctSubIds array)
                } else if (item.quizType === "REGULER" && item.ctSubIds && item.ctSubIds.length > 0) {
                    flushJudulMap();
                    seq.push({
                        id: item.id,
                        title: item.judul ? item.judul.replace(/<[^>]*>?/gm, "") : "Kuis",
                        type: "quiz",
                        topikId: topik.id,
                        topikName: topik.nama,
                        ctSubIds: item.ctSubIds,
                    });
                    for (const subId of item.ctSubIds) handledCtIds.add(subId);
                // Individual item already covered by a group — skip
                } else if (handledCtIds.has(item.id)) {
                    // intentionally skipped
                // Priority 1: Group by quizGroupId (REGULER only — CT falls through to Priority 2)
                } else if (item.quizGroupId && !(item.quizType === "COMPUTATIONAL_THINKING" && item.ctGroupId)) {
                    const group = quizGroupMap.get(item.quizGroupId);
                    if (group && group[0]?.id === item.id) {
                        flushJudulMap();
                        const isCt = group.some((g) => g.quizType === "COMPUTATIONAL_THINKING");
                        seq.push({
                            id: item.id,
                            title: isCt
                                ? (item.judul || "Kuis CT")
                                : (item.judul ? item.judul.replace(/<[^>]*>?/gm, "") : "Kuis"),
                            type: isCt ? "quiz-ct" : "quiz",
                            topikId: topik.id,
                            topikName: topik.nama,
                            ctSubIds: group.map((q) => q.id),
                        });
                        for (const q of group) handledCtIds.add(q.id);
                    }
                } else if (item.quizType === "COMPUTATIONAL_THINKING" && item.ctGroupId) {
                    // Priority 2: CT group by ctGroupId (backward compat)
                    const group = ctGroupMap.get(item.ctGroupId);
                    if (group && group[0]?.id === item.id) {
                        flushJudulMap();
                        seq.push({
                            id: item.id,
                            title: item.judul || "Kuis CT",
                            type: "quiz-ct",
                            topikId: topik.id,
                            topikName: topik.nama,
                            ctSubIds: group.map((q) => q.id),
                        });
                        for (const q of group) handledCtIds.add(q.id);
                    }
                } else if (item.quizType === "COMPUTATIONAL_THINKING") {
                    // Fallback: group by judul across whole topik (no ctGroupId)
                    const key = item.judul || "Kuis CT";
                    const group = ctJudulMap.get(key) || [];
                    group.push(item);
                    ctJudulMap.set(key, group);
                } else {
                    flushJudulMap();
                    seq.push({
                        id: item.id,
                        title: item.judul
                            ? item.judul.replace(/<[^>]*>?/gm, "")
                            : "Kuis",
                        type: "quiz",
                        topikId: topik.id,
                        topikName: topik.nama,
                    });
                }
            } else if (item.itemType === "RANGKUMAN_TOPIK") {
                flushJudulMap();
                seq.push({
                    id: item.id,
                    title: item.judul,
                    type: "summary",
                    topikId: topik.id,
                    topikName: topik.nama,
                    konten: item.article ?? topik.rangkumanTopik ?? undefined,
                });
            }
        }
        flushJudulMap();
    }

    if (modul.curriculum.rangkumanAkhir) {
        seq.push({
            id: "rangkuman-akhir",
            title: modul.curriculum.rangkumanAkhir.title,
            type: "rangkuman-akhir",
            konten: modul.curriculum.rangkumanAkhir.content ?? undefined,
        });
    }

    if (modul.curriculum.posttest) {
        seq.push({
            id: "posttest",
            title: modul.curriculum.posttest.title,
            type: "posttest",
        });
    }

    seq.push({ id: "rating", title: "Beri Penilaian", type: "rating" });

    return seq;
}

// ---------------------------------------------------------------------------
// Convenience: recalculate progress from a StudyRoomResponse
// ---------------------------------------------------------------------------
import { calculateProgress } from "./progress";

/**
 * Given a full StudyRoomResponse, recalculate the progress percentage
 * using the same logic as MateriClient.tsx.
 */
export function recalculateProgress(studyRoom: StudyRoomResponse): number {
    const seq = buildSequence(studyRoom);
    const completedMap: Record<string, boolean> = {};
    if (studyRoom.progress?.completedContentItems) {
        for (const id of studyRoom.progress.completedContentItems) {
            completedMap[id] = true;
        }
    }
    
    // Backend computes pretest & posttest completion by checking if score is not null.
    // Sync that behavior here so frontend progress hits 100%.
    if (studyRoom.progress?.pretestScore != null) {
        completedMap["pretest"] = true;
    }
    if (studyRoom.progress?.posttestScore != null) {
        completedMap["posttest"] = true;
    }
    return calculateProgress(
        seq,
        completedMap,
        studyRoom.progress?.status,
        studyRoom.progress?.isGraduated,
    );
}
