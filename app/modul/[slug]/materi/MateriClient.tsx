"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useCallback } from "react";
import {
    FaBookOpen,
    FaCheck,
    FaChevronDown,
    FaFileAlt,
    FaLock,
    FaPlay,
    FaRegClock,
    FaStar,
    FaTimes,
} from "react-icons/fa";
import { MdArrowBack, MdArrowForward } from "react-icons/md";
import { PiMedalFill } from "react-icons/pi";
import SiswaHeader from "../../../component/siswa/SiswaHeader";
import {
    siswaPretestApi,
    siswaPosttestApi,
    siswaProgressApi,
    siswaRatingApi,
    siswaStudyRoomApi,
    siswaCertificateApi,
    siswaKuisApi,
    siswaModulApi,
} from "../../../lib/api";
import type {
    SoalItem,
    StudyRoomResponse,
    StudyRoomProgress,
    StudyRoomCertificate,
    TestSubmitResult,
} from "../../../lib/types/siswa";
import { ApiError } from "../../../lib/types/umum";
import { calculateProgress } from "../../../lib/utils/progress";
import { useAuth } from "../../../context/AuthContext";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function getDurationForAssessment(
    modul: StudyRoomResponse | null,
    type: "pretest" | "posttest",
): number | null {
    if (type === "pretest") return modul?.curriculum.pretest?.timeLimit ?? null;
    return modul?.curriculum.posttest?.timeLimit ?? null;
}

function getDurationForQuiz(
    modul: StudyRoomResponse | null,
    quizItemId: string | null,
): number | null {
    if (!modul || !quizItemId) return null;
    for (const topik of modul.curriculum.topiks) {
        for (const item of topik.items) {
            if (item.id === quizItemId && item.timeLimit != null)
                return item.timeLimit;
        }
    }
    return null;
}

function formatRemainingTime(totalSeconds: number) {
    const safeValue = Math.max(0, totalSeconds);
    const minutes = Math.floor(safeValue / 60)
        .toString()
        .padStart(2, "0");
    const seconds = (safeValue % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
}

// ---------------------------------------------------------------------------
// Types for internal content tree and sequence
// ---------------------------------------------------------------------------
type SequenceItemType =
    | "pretest"
    | "materi"
    | "quiz"
    | "summary"
    | "rangkuman-akhir"
    | "posttest"
    | "rating";

type SequenceItem = {
    id: string;
    title: string;
    type: SequenceItemType;
    topikId?: string;
    topikName?: string;
    hasVideo?: boolean;
    videoUrl?: string;
    konten?: string;
    duration?: string;
};

type ContentSection = {
    id: string;
    title: string;
    items: SequenceItem[];
    rangkumanTopik: string | null;
};

// ---------------------------------------------------------------------------
// Build a flattened sequence from the module payload + soal arrays
// ---------------------------------------------------------------------------
function buildSequence(modul: StudyRoomResponse): SequenceItem[] {
    const seq: SequenceItem[] = [];

    if (modul.curriculum.pretest) {
        seq.push({
            id: "pretest",
            title: modul.curriculum.pretest.title,
            type: "pretest",
        });
    }

    for (const topik of modul.curriculum.topiks) {
        for (const item of topik.items) {
            if (item.itemType === "MATERI") {
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
                seq.push({
                    id: item.id,
                    title: item.judul || "Kuis",
                    type: "quiz",
                    topikId: topik.id,
                    topikName: topik.nama,
                });
            } else if (item.itemType === "RANGKUMAN_TOPIK") {
                seq.push({
                    id: item.id,
                    title: item.judul,
                    type: "summary",
                    topikId: topik.id,
                    topikName: topik.nama,
                    konten: item.article ?? undefined,
                });
            }
        }
    }

    if (modul.curriculum.rangkumanAkhir) {
        seq.push({
            id: "rangkuman-akhir",
            title: modul.curriculum.rangkumanAkhir.title,
            type: "rangkuman-akhir",
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

function buildContentTree(modul: StudyRoomResponse): ContentSection[] {
    const tree: ContentSection[] = [];
    for (const topik of modul.curriculum.topiks) {
        const items: SequenceItem[] = [];
        for (const item of topik.items) {
            if (item.itemType === "MATERI") {
                items.push({
                    id: item.id,
                    title: item.judul,
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
                items.push({
                    id: item.id,
                    title: item.judul || "Kuis",
                    type: "quiz",
                    topikId: topik.id,
                    topikName: topik.nama,
                });
            }
            // RANGKUMAN_TOPIK items are excluded from clickable sidebar items.
            // The text is surfaced via topik.rangkumanTopik as a non-clickable block.
        }
        tree.push({
            id: topik.id,
            title: topik.nama,
            items,
            rangkumanTopik: topik.rangkumanTopik,
        });
    }
    return tree;
}

function mapAssessmentToSoal(
    questions: Array<{
        id: string;
        text: string;
        options: Array<{ key: string; label: string }>;
    }>,
): SoalItem[] {
    return questions.map((q) => {
        const optA = q.options?.[0]?.label ?? "Pilihan A";
        const optB = q.options?.[1]?.label ?? "Pilihan B";
        const optC = q.options?.[2]?.label ?? "Pilihan C";
        const optD = q.options?.[3]?.label ?? "Pilihan D";
        return {
            id: q.id,
            pertanyaan: q.text,
            pilihan_a: optA,
            pilihan_b: optB,
            pilihan_c: optC,
            pilihan_d: optD,
            gambar_url: null,
        };
    });
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function MateriClient({ modulId }: { modulId: string }) {
    const router = useRouter();
    const { user } = useAuth();

    // ─── Data state ───────────────────────────────────────────────────────────
    const [modulDetail, setModulDetail] = useState<StudyRoomResponse | null>(
        null,
    );
    const [contentTree, setContentTree] = useState<ContentSection[]>([]);
    const [sequence, setSequence] = useState<SequenceItem[]>([]);
    const [currentSeqIndex, setCurrentSeqIndex] = useState(0);
    const [pretestSoal, setPretestSoal] = useState<SoalItem[]>([]);
    const [posttestSoal, setPosttestSoal] = useState<SoalItem[]>([]);
    const [progress, setProgress] = useState<StudyRoomProgress | null>(null);
    const [certificate, setCertificate] = useState<StudyRoomCertificate | null>(
        null,
    );
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [dataError, setDataError] = useState("");

    // ─── View state ───────────────────────────────────────────────────────────
    const [assessmentType, setAssessmentType] = useState<
        "pretest" | "kuis" | "posttest"
    >("pretest");
    const [activeQuizItemId, setActiveQuizItemId] = useState<string | null>(
        null,
    );
    const [currentView, setCurrentView] = useState<
        | "pretest-intro"
        | "pretest-quiz"
        | "pretest-result"
        | "materi"
        | "rating"
    >("pretest-intro");

    const [isPretestStarted, setIsPretestStarted] = useState(false);
    const [isPretestFinished, setIsPretestFinished] = useState(false);
    const [isPosttestStarted, setIsPosttestStarted] = useState(false);
    const [isPosttestFinished, setIsPosttestFinished] = useState(false);
    const [testResult, setTestResult] = useState<TestSubmitResult | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isNavigating, setIsNavigating] = useState(false);

    const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<
        Record<number, number>
    >({});
    const [remainingSeconds, setRemainingSeconds] = useState(900);
    const [testDurationSeconds, setTestDurationSeconds] = useState(900);
    const [finishedElapsedSeconds, setFinishedElapsedSeconds] = useState<
        number | null
    >(null);

    const [isMaterialMode, setIsMaterialMode] = useState(false);
    const [isFinalSummaryView, setIsFinalSummaryView] = useState(false);
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
    const [expandedSections, setExpandedSections] = useState<
        Record<string, boolean>
    >({});
    const [completedContentItemMap, setCompletedContentItemMap] = useState<
        Record<string, boolean>
    >({});

    const [selectedRating, setSelectedRating] = useState(0);
    const [reviewText, setReviewText] = useState("");
    const [isRatingSubmitted, setIsRatingSubmitted] = useState(false);
    const [isRatingSubmitting, setIsRatingSubmitting] = useState(false);
    const [wasTimeUp, setWasTimeUp] = useState(false);
    const [toastMsg, setToastMsg] = useState("");
    const [isClaiming, setIsClaiming] = useState(false);

    useEffect(() => {
        if (!toastMsg) return;
        const t = setTimeout(() => setToastMsg(""), 3000);
        return () => clearTimeout(t);
    }, [toastMsg]);

    useEffect(() => {
        if (modulId && progress?.siswaId) {
            try {
                const stored = localStorage.getItem(
                    `rating_submitted_${modulId}_${progress.siswaId}`,
                );
                if (stored === "true") {
                    setIsRatingSubmitted(true);
                }
            } catch {
                /* ignore */
            }
        }
    }, [modulId, progress?.siswaId]);

    const [isModuleSidebarOpen, setIsModuleSidebarOpen] = useState(false);

    // ─── Load data from API ──────────────────────────────────────────────────
    useEffect(() => {
        const load = async () => {
            setIsLoadingData(true);
            setDataError("");
            try {
                const res: StudyRoomResponse =
                    await siswaStudyRoomApi.getByModul(modulId);

                // The study-room endpoint does NOT include quiz data in topik.items.
                // We must fetch it from the module detail endpoint which has topiks → materis → quizzes.
                try {
                    const detail = await siswaModulApi.getById(modulId);
                    if (detail?.topiks) {
                        // Build a map: topikId → QuizDetail[] (from all materis in that topik)
                        const quizByTopik = new Map<string, any[]>();
                        for (const t of detail.topiks) {
                            const quizzes: any[] = [];
                            if (t.materis) {
                                for (const m of t.materis) {
                                    if (m.quizzes && Array.isArray(m.quizzes)) {
                                        for (const q of m.quizzes) {
                                            quizzes.push(q);
                                        }
                                    }
                                }
                            }

                            // If quizzes are directly on the topik (as created by Guru without materi)
                            const topikQuizzesRaw = (t as any).quizzes;
                            if (
                                topikQuizzesRaw &&
                                Array.isArray(topikQuizzesRaw)
                            ) {
                                for (const q of topikQuizzesRaw) {
                                    quizzes.push(q);
                                }
                            }

                            // Also check topikItems for QUIZ / ARTICLE ordering
                            if (t.topikItems) {
                                for (const ti of t.topikItems) {
                                    if (
                                        ti.itemType === "QUIZ" ||
                                        (ti.itemType as string) === "ARTICLE"
                                    ) {
                                        // topikItems might reference quiz IDs already covered above
                                    }
                                }
                            }
                            if (quizzes.length > 0) {
                                quizByTopik.set(t.id, quizzes);
                            }
                        }

                        // Inject quizzes into study-room topik items
                        res.curriculum.topiks.forEach((topik) => {
                            if (!topik.items) topik.items = [];
                            const usedIds = new Set(
                                topik.items.map((i) => i.id),
                            );
                            const quizzes = quizByTopik.get(topik.id) || [];
                            for (const q of quizzes) {
                                if (q && q.id && !usedIds.has(q.id)) {
                                    usedIds.add(q.id);
                                    topik.items.push({
                                        id: q.id,
                                        itemType: "QUIZ",
                                        judul: q.question || "Kuis",
                                        question: q.question,
                                        correctAnswer: q.correctAnswer,
                                        quizImgQuestionUrl:
                                            q.quizImgQuestionUrl || null,
                                        quizAnswerOptions:
                                            q.quizAnswerOptions || [],
                                        timeLimit:
                                            q.quizSettings?.[0]?.timeLimit ||
                                            null,
                                    });
                                }
                            }
                        });
                    }
                } catch (err) {
                    console.warn(
                        "[MateriClient] Could not fetch module detail for quiz enrichment:",
                        err,
                    );
                }

                setModulDetail(res);

                // Build content tree & sequence from curriculum topiks
                const tree = buildContentTree(res);
                const seq = buildSequence(res);

                setContentTree(tree);
                setSequence(seq);

                if (tree.length > 0) {
                    setExpandedSections({ [tree[0].id]: true });
                }
                setCurrentSeqIndex(0);

                // Map pretest questions from StudyRoomQuestion → SoalItem
                if (res.curriculum.pretest?.questions) {
                    setPretestSoal(
                        mapAssessmentToSoal(res.curriculum.pretest.questions),
                    );
                } else {
                    setPretestSoal([]);
                }

                // Map posttest questions
                if (res.curriculum.posttest?.questions) {
                    setPosttestSoal(
                        mapAssessmentToSoal(res.curriculum.posttest.questions),
                    );
                } else {
                    setPosttestSoal([]);
                }

                // Embedded progress
                const prog = res.progress;
                if (prog) {
                    console.log(
                        "[MateriClient] Progress loaded:",
                        JSON.stringify(prog, null, 2),
                    );
                    setProgress(prog);

                    // Restore completed Map REGARDLESS of pretestScore
                    const completedMap: Record<string, boolean> = {};
                    const completedIds = prog.completedContentItems ?? [];
                    completedIds.forEach((sid) => {
                        completedMap[sid] = true;
                    });

                    if (prog.pretestScore != null)
                        completedMap["pretest"] = true;
                    if (prog.posttestScore != null)
                        completedMap["posttest"] = true;

                    setCompletedContentItemMap(completedMap);

                    // If pretest is finished OR if there is NO pretest, show materi
                    const hasPretest = !!res.curriculum.pretest;
                    if (!hasPretest || prog.pretestScore != null) {
                        if (hasPretest) setIsPretestFinished(true);
                        setIsMaterialMode(true);
                        setCurrentView("materi");

                        const firstUncompletedIdx = seq.findIndex(
                            (item) =>
                                !completedMap[item.id] &&
                                item.type !== "summary" &&
                                item.type !== "rangkuman-akhir",
                        );
                        const startIdx =
                            firstUncompletedIdx >= 0 ? firstUncompletedIdx : 0;
                        setCurrentSeqIndex(startIdx);
                    }
                }

                // Embedded certificate
                if (res.hasCertificate && res.certificate) {
                    setCertificate(res.certificate);
                }
            } catch (err: unknown) {
                console.error("MateriClient load error:", err);
                setDataError(
                    err instanceof Error ? err.message : "Gagal memuat materi",
                );
            } finally {
                setIsLoadingData(false);
            }
        };

        load();
    }, [modulId]);

    // ─── Timer (works for pretest, posttest, and quiz) ──────────────────────
    const isTimerActive =
        (isPretestStarted &&
            !isPretestFinished &&
            assessmentType === "pretest") ||
        (isPosttestStarted &&
            !isPosttestFinished &&
            assessmentType === "posttest") ||
        (assessmentType === "kuis" && !isSubmitting);
    useEffect(() => {
        if (!isTimerActive) return;
        if (remainingSeconds <= 0) return;
        const timer = setInterval(() => {
            setRemainingSeconds((prev) => Math.max(0, prev - 1));
        }, 1000);
        return () => clearInterval(timer);
    }, [isTimerActive, remainingSeconds]);

    // Auto-submit when timer runs out
    useEffect(() => {
        if (remainingSeconds !== 0) return;
        setWasTimeUp(true);
        handleSubmitTest();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [remainingSeconds, isTimerActive, assessmentType]);

    // ─── Sidebar events ───────────────────────────────────────────────────────
    useEffect(() => {
        const onToggleSidebar = () => setIsModuleSidebarOpen((prev) => !prev);
        window.addEventListener(
            "toggle-module-sidebar",
            onToggleSidebar as EventListener,
        );
        return () =>
            window.removeEventListener(
                "toggle-module-sidebar",
                onToggleSidebar as EventListener,
            );
    }, []);

    useEffect(() => {
        if (!isModuleSidebarOpen) return;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "";
        };
    }, [isModuleSidebarOpen]);

    useEffect(() => {
        if (!isModuleSidebarOpen) return;
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") setIsModuleSidebarOpen(false);
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [isModuleSidebarOpen]);

    const kuisSoal = useMemo(() => {
        if (assessmentType !== "kuis" || !activeQuizItemId || !modulDetail)
            return [];
        for (const topik of modulDetail.curriculum.topiks) {
            const item = topik.items.find((i) => i.id === activeQuizItemId);
            if (
                item &&
                (item.itemType === "QUIZ" ||
                    (item.itemType as string)?.toUpperCase() === "KUIS") &&
                item.question
            ) {
                return [
                    {
                        id: item.id,
                        pertanyaan: item.question,
                        pilihan_a: item.quizAnswerOptions?.[0]?.option || "A",
                        pilihan_b: item.quizAnswerOptions?.[1]?.option || "B",
                        pilihan_c: item.quizAnswerOptions?.[2]?.option || "C",
                        pilihan_d: item.quizAnswerOptions?.[3]?.option || "D",
                        kunci_jawaban: item.correctAnswer,
                        gambar_url: item.quizImgQuestionUrl || null,
                        knowledgeComponentId: undefined,
                    },
                ] as SoalItem[];
            }
        }
        return [];
    }, [assessmentType, activeQuizItemId, modulDetail]);

    const currentSoal =
        assessmentType === "posttest"
            ? posttestSoal
            : assessmentType === "kuis"
              ? kuisSoal
              : pretestSoal;
    const activeQuestion = currentSoal[activeQuestionIndex];
    const answeredCount = Object.keys(selectedAnswers).length;
    const elapsedSeconds = testDurationSeconds - remainingSeconds;
    const displayedElapsedSeconds = finishedElapsedSeconds ?? elapsedSeconds;

    const currentSeqItem = sequence[currentSeqIndex] ?? null;
    const isFirstItem = currentSeqIndex === 0;
    const isLastItem = currentSeqIndex === sequence.length - 1;

    const isAssessmentView =
        currentView === "pretest-intro" ||
        currentView === "pretest-quiz" ||
        currentView === "pretest-result";
    const isPretestActive = isAssessmentView && assessmentType === "pretest";
    const isPosttestActive = isAssessmentView && assessmentType === "posttest";
    const isFinalSummaryActive = currentView === "materi" && isFinalSummaryView;
    const isRatingView = currentView === "rating";

    const summaryHighlightText =
        currentSeqItem?.type === "summary"
            ? "Rangkuman ini merangkum poin-poin penting dari topik yang telah dipelajari."
            : undefined;

    // ─── Sequential unlock ─────────────────────────────────────────────────
    // An item is unlocked iff it is the first item OR the previous item is completed.
    const isItemUnlockedByIndex = useCallback(
        (index: number): boolean => {
            if (index === 0) return true;
            if (index >= sequence.length) return false;
            const prevId = sequence[index - 1].id;
            return completedContentItemMap[prevId] === true;
        },
        [sequence, completedContentItemMap],
    );

    // Map all item ids to their unlock status for O(1) sidebar lookup
    const unlockedItemMap = useMemo<Record<string, boolean>>(() => {
        const map: Record<string, boolean> = {};
        for (let i = 0; i < sequence.length; i++) {
            map[sequence[i].id] = isItemUnlockedByIndex(i);
        }
        return map;
    }, [sequence, isItemUnlockedByIndex]);

    // ─── Progress calculation ──────────────────────────────────────────────
    // Single source of truth: count non‑summary items from the local map,
    // matching the backend's methodology (summaries are never persisted).
    const totalSteps = useMemo(
        () =>
            sequence.filter(
                (item) =>
                    item.type !== "summary" &&
                    item.type !== "rangkuman-akhir" &&
                    item.type !== "rating",
            ).length,
        [sequence],
    );
    const completedSteps = useMemo(
        () =>
            sequence.filter(
                (item) =>
                    completedContentItemMap[item.id] &&
                    item.type !== "summary" &&
                    item.type !== "rangkuman-akhir" &&
                    item.type !== "rating",
            ).length,
        [sequence, completedContentItemMap],
    );
    const progressPercent = calculateProgress(
        sequence,
        completedContentItemMap,
        progress?.status,
        progress?.isGraduated,
    );

    const markContentItemAsCompleted = useCallback(
        async (itemId: string, itemType?: string) => {
            // Skip API call if it's a summary item
            if (itemId.startsWith("summary-") || itemId === "rangkuman-akhir") {
                setCompletedContentItemMap((prev) => {
                    if (prev[itemId]) return prev;
                    return { ...prev, [itemId]: true };
                });
                return;
            }

            // Optimistic update: mark completed immediately in local state
            setCompletedContentItemMap((prev) => {
                if (prev[itemId]) return prev;
                return { ...prev, [itemId]: true };
            });

            const type =
                itemType?.toUpperCase() ??
                (itemId === "pretest"
                    ? "PRETEST"
                    : itemId === "posttest"
                      ? "POSTTEST"
                      : itemId === "rating"
                        ? "RATING"
                        : "MATERI");

            try {
                await siswaProgressApi.completeItem(itemId, type, modulId);
                const updated = await siswaStudyRoomApi.getByModul(modulId);
                if (updated.progress) setProgress(updated.progress);
            } catch (err) {
                console.error(
                    `[MateriClient] Failed to persist completion (${itemId}):`,
                    err,
                );
            }
        },
        [modulId],
    );

    const handleSubmitTest = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        const elapsed = testDurationSeconds - remainingSeconds;
        setFinishedElapsedSeconds(elapsed);

        const answers = currentSoal.map((soal, idx) => {
            const selectedIdx = selectedAnswers[idx] ?? 0;
            const answerText =
                [
                    soal.pilihan_a,
                    soal.pilihan_b,
                    soal.pilihan_c,
                    soal.pilihan_d,
                ][selectedIdx] || "";
            return {
                questionId: soal.id,
                answer: answerText,
            };
        });

        try {
            let result: TestSubmitResult | null = null;
            if (assessmentType === "posttest") {
                result = await siswaPosttestApi.submit(modulId, {
                    answers,
                    timeSpent: elapsed,
                });
                setIsPosttestFinished(true);
                // Optimistic: mark posttest as completed immediately
                setCompletedContentItemMap((prev) => ({
                    ...prev,
                    posttest: true,
                }));
                // Reflect graduation in local progress so certificate pill unlocks
                if (result?.isGraduated) {
                    setProgress((prev) =>
                        prev
                            ? { ...prev, isGraduated: true, status: "COMPLETED" }
                            : prev,
                    );
                }
                // Save certificate from posttest response if returned
                if (result?.certificate) {
                    setCertificate(result.certificate);
                }
            } else if (assessmentType === "pretest") {
                result = await siswaPretestApi.submit(modulId, {
                    answers,
                    timeSpent: elapsed,
                });
                setIsPretestFinished(true);
                // Optimistic: mark pretest as completed immediately
                setCompletedContentItemMap((prev) => ({
                    ...prev,
                    pretest: true,
                }));
                if (result?.unlocked_count != null) {
                    try {
                        localStorage.setItem(
                            `unlocked_count_${modulId}`,
                            String(result.unlocked_count),
                        );
                    } catch {
                        /* ignore */
                    }
                }
            } else if (assessmentType === "kuis") {
                // Submit kuis answers
                await Promise.all(
                    currentSoal.map(async (soal, idx) => {
                        const selectedIdx = selectedAnswers[idx] ?? 0;
                        const answerText =
                            [
                                soal.pilihan_a,
                                soal.pilihan_b,
                                soal.pilihan_c,
                                soal.pilihan_d,
                            ][selectedIdx] || "";
                        try {
                            await siswaKuisApi.submit({
                                quizId: soal.id,
                                answer: answerText,
                                knowledgeComponentId:
                                    soal.knowledgeComponentId ?? "unknown",
                                timeSpent: elapsed,
                            });
                        } catch (e) {
                            console.error("Failed to submit kuis answer", e);
                        }
                    }),
                );
                if (activeQuizItemId) {
                    await markContentItemAsCompleted(activeQuizItemId, "quiz");
                }
                result = { score: 100, message: "Kuis selesai" };
            }

            // Refetch study room to get updated progress & certificate
            try {
                const updated = await siswaStudyRoomApi.getByModul(modulId);
                if (updated.progress) setProgress(updated.progress);
                if (updated.certificate) setCertificate(updated.certificate);
            } catch {
                /* study-room refetch failed, non-critical */
            }

            const totalBenar =
                result?.totalBenar ??
                currentSoal.reduce((acc, soal, idx) => {
                    const selectedIdx = selectedAnswers[idx] ?? -1;
                    if (selectedIdx === -1) return acc;
                    return acc;
                }, 0);
            const totalSalah =
                result?.totalSalah ?? currentSoal.length - totalBenar;

            setTestResult({
                score: result?.score ?? 0,
                unlocked_count: result?.unlocked_count,
                total_submodules: result?.total_submodules,
                message: result?.message,
                certificate: result?.certificate,
                totalBenar,
                totalSalah,
            });
        } catch (err: unknown) {
            console.error("Test submit error:", err);
            const correct = currentSoal.reduce((acc, soal, idx) => {
                const selectedIdx = selectedAnswers[idx] ?? -1;
                if (selectedIdx === -1) return acc;
                const answerText =
                    [
                        soal.pilihan_a,
                        soal.pilihan_b,
                        soal.pilihan_c,
                        soal.pilihan_d,
                    ][selectedIdx] || "";
                return answerText === soal.kunci_jawaban ? acc + 1 : acc;
            }, 0);
            const totalSalah = currentSoal.length - correct;
            setTestResult({
                score: 0,
                totalBenar: correct,
                totalSalah: totalSalah,
            });
            if (assessmentType === "pretest") setIsPretestFinished(true);
            if (assessmentType === "posttest") setIsPosttestFinished(true);
        } finally {
            setCurrentView("pretest-result");
            setIsSubmitting(false);
        }
    };

    const handleFooterPrevious = async () => {
        if (currentView === "rating") {
            setCurrentView("materi");
            setIsMaterialMode(true);
            setIsFinalSummaryView(false);
            return;
        }
        if (currentView === "materi") {
            if (!isFirstItem) {
                setCurrentSeqIndex((prev) => prev - 1);
            }
            return;
        }
        setActiveQuestionIndex((prev) => Math.max(0, prev - 1));
    };

    const handleFooterNext = async () => {
        if (currentView === "rating") {
            if (isRatingSubmitted) {
                setCurrentView("materi");
                setIsMaterialMode(true);
            }
            return;
        }
        if (currentView === "pretest-result") {
            setCurrentView("materi");
            setIsMaterialMode(true);
            return;
        }
        if (currentView === "materi") {
            if (currentSeqIndex >= 0 && currentSeqIndex < sequence.length) {
                const item = sequence[currentSeqIndex];
                await markContentItemAsCompleted(item.id, item.type);
            }
            if (isLastItem) {
                // All items completed — navigate back to module detail page
                router.push(`/modul/${modulId}`);
            } else {
                const nextIdx = currentSeqIndex + 1;
                const nextItem = sequence[nextIdx];
                setCurrentSeqIndex(nextIdx);
                if (nextItem?.type === "posttest") {
                    const duration =
                        getDurationForAssessment(modulDetail, "posttest") ??
                        900;
                    setAssessmentType("posttest");
                    setCurrentView("pretest-intro");
                    setIsMaterialMode(false);
                    setIsFinalSummaryView(false);
                    setActiveQuestionIndex(0);
                    setSelectedAnswers({});
                    setRemainingSeconds(duration);
                    setTestDurationSeconds(duration);
                    setTestResult(null);
                    setIsPosttestStarted(false);
                    setIsPosttestFinished(false);
                }
            }
            return;
        }
        setActiveQuestionIndex((prev) =>
            Math.min(currentSoal.length - 1, prev + 1),
        );
    };

    const handleRatingSubmit = async () => {
        if (selectedRating === 0 || isRatingSubmitting) return;
        setIsRatingSubmitting(true);
        try {
            await siswaRatingApi.rate(modulId, {
                rating: selectedRating,
                komentar: reviewText || undefined,
            });
            setIsRatingSubmitted(true);
            // Optimistic: mark rating as completed immediately
            setCompletedContentItemMap((prev) => ({ ...prev, rating: true }));
            if (progress?.siswaId) {
                localStorage.setItem(
                    `rating_submitted_${modulId}_${progress.siswaId}`,
                    "true",
                );
            }
        } catch (err) {
            console.error("Rating submit error:", err);
            // If backend returns 400 (already rated), mark as submitted
            setIsRatingSubmitted(true);
            if (progress?.siswaId) {
                localStorage.setItem(
                    `rating_submitted_${modulId}_${progress.siswaId}`,
                    "true",
                );
            }
        } finally {
            setIsRatingSubmitting(false);
        }
    };

    // ─── Loading / Error states ───────────────────────────────────────────────
    if (isLoadingData) {
        return (
            <div className="min-h-screen bg-[#f6f6f8]">
                <SiswaHeader />
                <div className="flex items-center justify-center py-32">
                    <div className="flex flex-col items-center gap-4">
                        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#7054dc] border-t-transparent" />
                        <p className="text-sm text-[#8a8a96]">
                            Memuat konten kelas...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (dataError) {
        return (
            <div className="min-h-screen bg-[#f6f6f8]">
                <SiswaHeader />
                <div className="flex items-center justify-center py-32">
                    <div className="text-center">
                        <p className="text-red-500">{dataError}</p>
                        <button
                            onClick={() => window.history.back()}
                            className="mt-4 inline-block text-sm text-[#7054dc] hover:underline"
                        >
                            ← Kembali
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ─── Render ───────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-[#f6f6f8]">
            <SiswaHeader />

            {isModuleSidebarOpen && (
                <div
                    className="fixed left-0 right-0 top-[76px] bottom-0 z-40 bg-black/20 lg:hidden"
                    onClick={() => setIsModuleSidebarOpen(false)}
                />
            )}

            <main className="grid h-[calc(100vh-76px)] min-h-[calc(100vh-76px)] grid-cols-1 lg:grid-cols-[320px_1fr]">
                {/* ── Sidebar ── */}
                <aside
                    className={`${
                        isModuleSidebarOpen
                            ? "fixed left-0 top-[76px] bottom-0 z-50 flex w-[320px]"
                            : "hidden"
                    } h-full flex-col overflow-hidden border-r border-[#e1e0e7] bg-white px-5 py-6 lg:static lg:flex lg:w-auto`}
                >
                    <h1 className="text-2xl font-bold text-[#202126]">
                        Konten Kelas
                    </h1>

                    <div className="mt-5 min-h-0 space-y-2 overflow-y-auto pr-1">
                        {/* ─── Pre-Test ─── */}
                        {(() => {
                            const itemId = "pretest";
                            const seqIndex = sequence.findIndex(
                                (s) => s.id === itemId,
                            );
                            const isLocked =
                                seqIndex > 0 &&
                                !isItemUnlockedByIndex(seqIndex);
                            const isCompleted =
                                completedContentItemMap[itemId] ||
                                progress?.pretestScore != null;
                            const isActive = isPretestActive;
                            return (
                                <button
                                    type="button"
                                    aria-current={isActive ? true : undefined}
                                    disabled={isLocked && !isCompleted}
                                    onClick={() => {
                                        if (isLocked && !isCompleted) return;
                                        if (seqIndex >= 0)
                                            setCurrentSeqIndex(seqIndex);
                                        setIsModuleSidebarOpen(false);
                                        setAssessmentType("pretest");
                                        setActiveQuizItemId(null);
                                        setIsMaterialMode(false);
                                        setIsFinalSummaryView(false);
                                        setWasTimeUp(false);
                                        if (isCompleted) {
                                            setTestResult(null);
                                            setCurrentView("pretest-result");
                                        } else if (isPretestStarted) {
                                            setCurrentView("pretest-quiz");
                                        } else {
                                            setCurrentView("pretest-intro");
                                        }
                                    }}
                                    className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${
                                        isLocked && !isCompleted
                                            ? "cursor-not-allowed border border-[#dcdae3] bg-white text-[#8f95a3]"
                                            : isActive
                                              ? "bg-[#efe9ff] text-[#7054dc]"
                                              : "border border-[#dcdae3] bg-white text-[#202126]"
                                    }`}
                                >
                                    {isCompleted ? (
                                        <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#7054dc]">
                                            <FaCheck
                                                size={9}
                                                className="text-white"
                                            />
                                        </span>
                                    ) : isLocked ? (
                                        <FaLock
                                            size={11}
                                            className="text-[#8f95a3]"
                                        />
                                    ) : (
                                        <FaFileAlt
                                            size={12}
                                            className={
                                                isActive
                                                    ? "text-[#7054dc]"
                                                    : "text-[#202126]"
                                            }
                                        />
                                    )}
                                    Pre-Test
                                    {pretestSoal.length === 0 && (
                                        <span className="ml-auto text-[10px] text-[#8a8a96]">
                                            Belum tersedia
                                        </span>
                                    )}
                                </button>
                            );
                        })()}

                        {/* ─── Content tree sections (topiks) ─── */}
                        {contentTree.map((section) => {
                            const sectionLocked = section.items.every(
                                (item) => {
                                    const idx = sequence.findIndex(
                                        (s) => s.id === item.id,
                                    );
                                    return (
                                        idx >= 0 && !isItemUnlockedByIndex(idx)
                                    );
                                },
                            );
                            const sectionCompleted = section.items.every(
                                (item) => completedContentItemMap[item.id],
                            );

                            return (
                                <div
                                    key={section.id}
                                    className="overflow-hidden rounded-lg border border-[#dcdae3] bg-white"
                                >
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setExpandedSections((prev) => ({
                                                ...prev,
                                                [section.id]: !prev[section.id],
                                            }))
                                        }
                                        className="flex w-full items-center justify-between px-3 py-2 text-left text-sm text-[#202126]"
                                    >
                                        <span className="inline-flex items-center gap-2">
                                            {!sectionLocked &&
                                                sectionCompleted && (
                                                    <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#7054dc]">
                                                        <FaCheck
                                                            size={9}
                                                            className="text-white"
                                                        />
                                                    </span>
                                                )}
                                            {section.title}
                                        </span>
                                        <FaChevronDown
                                            size={11}
                                            className={`text-[#8f95a3] transition-transform ${expandedSections[section.id] ? "rotate-180" : ""}`}
                                        />
                                    </button>

                                    {expandedSections[section.id] && (
                                        <div className="border-t border-[#eceaf4] bg-white">
                                            {section.items.length === 0 && (
                                                <p className="px-3 py-2 text-[10px] italic text-[#9ca0af]">
                                                    Belum ada konten.
                                                </p>
                                            )}
                                            {section.items.map((item) => {
                                                const seqIndex =
                                                    sequence.findIndex(
                                                        (s) => s.id === item.id,
                                                    );
                                                const isSelected =
                                                    sequence[currentSeqIndex]
                                                        ?.id === item.id;
                                                const isItemLocked =
                                                    seqIndex >= 0 &&
                                                    !isItemUnlockedByIndex(
                                                        seqIndex,
                                                    );
                                                const isItemCompleted =
                                                    completedContentItemMap[
                                                        item.id
                                                    ];
                                                const isQuizItem =
                                                    item.type === "quiz";

                                                return (
                                                    <button
                                                        key={item.id}
                                                        type="button"
                                                        aria-current={
                                                            isSelected
                                                                ? true
                                                                : undefined
                                                        }
                                                        onClick={async () => {
                                                            if (isItemLocked)
                                                                return;
                                                            if (seqIndex >= 0)
                                                                setCurrentSeqIndex(
                                                                    seqIndex,
                                                                );
                                                            setIsModuleSidebarOpen(
                                                                false,
                                                            );
                                                            if (isQuizItem) {
                                                                setAssessmentType(
                                                                    "kuis",
                                                                );
                                                                setActiveQuizItemId(
                                                                    item.id,
                                                                );
                                                                setCurrentView(
                                                                    "pretest-intro",
                                                                );
                                                                setIsMaterialMode(
                                                                    false,
                                                                );
                                                                setIsFinalSummaryView(
                                                                    false,
                                                                );
                                                                setActiveQuestionIndex(
                                                                    0,
                                                                );
                                                                setSelectedAnswers(
                                                                    {},
                                                                );
                                                                setWasTimeUp(
                                                                    false,
                                                                );
                                                                setRemainingSeconds(
                                                                    900,
                                                                );
                                                                return;
                                                            }
                                                            setActiveQuizItemId(
                                                                null,
                                                            );
                                                            setCurrentView(
                                                                "materi",
                                                            );
                                                            setIsMaterialMode(
                                                                true,
                                                            );
                                                            setIsFinalSummaryView(
                                                                false,
                                                            );
                                                        }}
                                                        className={`flex w-full items-start border-b border-[#f0eef7] px-3 py-2 text-left text-xs last:border-b-0 ${
                                                            isItemLocked
                                                                ? "cursor-not-allowed text-[#8f95a3]"
                                                                : isSelected
                                                                  ? "bg-[#efe9ff] text-[#7054dc]"
                                                                  : "text-[#202126]"
                                                        }`}
                                                    >
                                                        <span className="inline-flex items-start gap-2">
                                                            {isItemCompleted ? (
                                                                <span className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#7054dc]">
                                                                    <FaCheck
                                                                        size={8}
                                                                        className="text-white"
                                                                    />
                                                                </span>
                                                            ) : isItemLocked ? (
                                                                <FaLock
                                                                    size={10}
                                                                    className="mt-1.5 text-[#8f95a3]"
                                                                />
                                                            ) : (
                                                                <span className="inline-flex h-4 w-4" />
                                                            )}
                                                            {isQuizItem ? (
                                                                <PiMedalFill
                                                                    size={14}
                                                                    className={`mt-0.5 shrink-0 ${isItemLocked ? "text-[#8f95a3]" : isSelected ? "text-[#7054dc]" : "text-[#37b66a]"}`}
                                                                />
                                                            ) : item.hasVideo ? (
                                                                <FaPlay
                                                                    size={9}
                                                                    className={`mt-1.5 ${isItemLocked ? "text-[#8f95a3]" : isSelected ? "text-[#7054dc]" : "text-[#f39b39]"}`}
                                                                />
                                                            ) : (
                                                                <FaBookOpen
                                                                    size={10}
                                                                    className={`mt-1.5 ${isItemLocked ? "text-[#8f95a3]" : isSelected ? "text-[#7054dc]" : "text-[#7054dc]"}`}
                                                                />
                                                            )}
                                                            <span>
                                                                <span className="block text-xs font-medium leading-tight">
                                                                    {isQuizItem ? (
                                                                        <>
                                                                            Kuis
                                                                            Reguler
                                                                            -{" "}
                                                                            {
                                                                                item.title
                                                                            }
                                                                        </>
                                                                    ) : item.hasVideo ? (
                                                                        <>
                                                                            Materi
                                                                            Video
                                                                            -{" "}
                                                                            {
                                                                                item.title
                                                                            }
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            Materi
                                                                            Teks
                                                                            -{" "}
                                                                            {
                                                                                item.title
                                                                            }
                                                                        </>
                                                                    )}
                                                                </span>
                                                            </span>
                                                        </span>
                                                    </button>
                                                );
                                            })}

                                            {/* Non-clickable rangkumanTopik summary block */}
                                            {section.rangkumanTopik &&
                                                section.rangkumanTopik.trim() !==
                                                    "" && (
                                                    <div className="border-t border-[#f0eef7] bg-[#faf9ff] px-3 py-2.5">
                                                        <div className="flex items-start gap-2">
                                                            <FaBookOpen
                                                                size={9}
                                                                className="mt-0.5 shrink-0 text-[#9ca0af]"
                                                            />
                                                            <p className="text-[10px] leading-relaxed italic text-[#6b6f7e]">
                                                                {
                                                                    section.rangkumanTopik
                                                                }
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {/* ─── Rangkuman Akhir ─── */}
                        {(() => {
                            const itemId = "rangkuman-akhir";
                            const seqIndex = sequence.findIndex(
                                (s) => s.id === itemId,
                            );
                            const isLocked =
                                seqIndex > 0 &&
                                !isItemUnlockedByIndex(seqIndex);
                            const isCompleted = completedContentItemMap[itemId];
                            const isActive = isFinalSummaryActive;
                            return (
                                <button
                                    type="button"
                                    aria-current={isActive ? true : undefined}
                                    disabled={isLocked}
                                    onClick={() => {
                                        if (isLocked) return;
                                        if (seqIndex >= 0)
                                            setCurrentSeqIndex(seqIndex);
                                        setIsModuleSidebarOpen(false);
                                        setCurrentView("materi");
                                        setIsMaterialMode(true);
                                        setIsFinalSummaryView(true);
                                        setActiveQuizItemId(null);
                                    }}
                                    className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                                        isLocked
                                            ? "cursor-not-allowed border border-[#dcdae3] bg-white text-[#8f95a3]"
                                            : isActive
                                              ? "border border-[#e0d5ff] bg-[#efe9ff] text-[#7054dc]"
                                              : "border border-[#dcdae3] bg-white text-[#313643]"
                                    }`}
                                >
                                    {isCompleted ? (
                                        <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#7054dc]">
                                            <FaCheck
                                                size={9}
                                                className="text-white"
                                            />
                                        </span>
                                    ) : isLocked ? (
                                        <FaLock
                                            size={11}
                                            className="text-[#8f95a3]"
                                        />
                                    ) : (
                                        <FaFileAlt
                                            size={11}
                                            className={
                                                isActive
                                                    ? "text-[#7054dc]"
                                                    : "text-[#202126]"
                                            }
                                        />
                                    )}
                                    Rangkuman Akhir
                                </button>
                            );
                        })()}

                        {/* ─── Post-Test ─── */}
                        {(() => {
                            const itemId = "posttest";
                            const seqIndex = sequence.findIndex(
                                (s) => s.id === itemId,
                            );
                            const isLocked =
                                seqIndex > 0 &&
                                !isItemUnlockedByIndex(seqIndex);
                            const isCompleted =
                                completedContentItemMap[itemId] ||
                                progress?.posttestScore != null;
                            const isActive = isPosttestActive;
                            return (
                                <button
                                    type="button"
                                    aria-current={isActive ? true : undefined}
                                    disabled={isLocked && !isCompleted}
                                    onClick={() => {
                                        if (isLocked && !isCompleted) return;
                                        if (seqIndex >= 0)
                                            setCurrentSeqIndex(seqIndex);
                                        setIsModuleSidebarOpen(false);
                                        setAssessmentType("posttest");
                                        setActiveQuizItemId(null);
                                        setWasTimeUp(false);
                                        if (isCompleted) {
                                            setTestResult(null);
                                            setCurrentView("pretest-result");
                                            setIsMaterialMode(false);
                                            setIsFinalSummaryView(false);
                                        } else {
                                            setCurrentView("pretest-intro");
                                            setIsMaterialMode(false);
                                            setIsFinalSummaryView(false);
                                            setActiveQuestionIndex(0);
                                            setSelectedAnswers({});
                                            const duration =
                                                getDurationForAssessment(
                                                    modulDetail,
                                                    "posttest",
                                                ) ?? 900;
                                            setRemainingSeconds(duration);
                                            setTestDurationSeconds(duration);
                                            setTestResult(null);
                                            setIsPosttestStarted(false);
                                            setIsPosttestFinished(false);
                                        }
                                    }}
                                    className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                                        isLocked && !isCompleted
                                            ? "cursor-not-allowed border border-[#dcdae3] bg-white text-[#8f95a3]"
                                            : isActive
                                              ? "border border-[#e0d5ff] bg-[#efe9ff] text-[#7054dc]"
                                              : "border border-[#dcdae3] bg-white text-[#313643]"
                                    }`}
                                >
                                    {isCompleted ? (
                                        <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#7054dc]">
                                            <FaCheck
                                                size={9}
                                                className="text-white"
                                            />
                                        </span>
                                    ) : isLocked ? (
                                        <FaLock
                                            size={11}
                                            className="text-[#8f95a3]"
                                        />
                                    ) : (
                                        <FaFileAlt
                                            size={11}
                                            className={
                                                isActive
                                                    ? "text-[#7054dc]"
                                                    : "text-[#202126]"
                                            }
                                        />
                                    )}
                                    Post-Test
                                    {posttestSoal.length === 0 &&
                                        !isCompleted && (
                                            <span className="ml-auto text-[10px] text-[#8a8a96]">
                                                Belum tersedia
                                            </span>
                                        )}
                                </button>
                            );
                        })()}

                        {/* ─── Beri Penilaian ─── */}
                        {(() => {
                            const itemId = "rating";
                            const seqIndex = sequence.findIndex(
                                (s) => s.id === itemId,
                            );
                            const isLocked =
                                seqIndex > 0 &&
                                !isItemUnlockedByIndex(seqIndex);
                            const isCompleted =
                                completedContentItemMap[itemId] ||
                                isRatingSubmitted;
                            const isActive = isRatingView;
                            return (
                                <button
                                    type="button"
                                    aria-current={isActive ? true : undefined}
                                    disabled={isLocked && !isCompleted}
                                    onClick={() => {
                                        if (isLocked && !isCompleted) return;
                                        if (seqIndex >= 0)
                                            setCurrentSeqIndex(seqIndex);
                                        setCurrentView("rating");
                                        setIsMaterialMode(false);
                                        setIsFinalSummaryView(false);
                                        setActiveQuizItemId(null);
                                    }}
                                    className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                                        isLocked && !isCompleted
                                            ? "cursor-not-allowed border border-[#dcdae3] bg-white text-[#8f95a3]"
                                            : isActive
                                              ? "border border-[#e0d5ff] bg-[#efe9ff] text-[#7054dc]"
                                              : "border border-[#dcdae3] bg-white text-[#313643]"
                                    }`}
                                >
                                    {isCompleted ? (
                                        <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#7054dc]">
                                            <FaCheck
                                                size={9}
                                                className="text-white"
                                            />
                                        </span>
                                    ) : isLocked ? (
                                        <FaLock
                                            size={11}
                                            className="text-[#8f95a3]"
                                        />
                                    ) : (
                                        <FaStar
                                            size={11}
                                            className={
                                                isActive
                                                    ? "text-[#7054dc]"
                                                    : "text-[#202126]"
                                            }
                                        />
                                    )}
                                    Beri Penilaian
                                </button>
                            );
                        })()}

                        {/* ─── Pills Sertifikat Kelulusan ─── */}
                        {modulDetail?.hasCertificate &&
                            (() => {
                                const isProgressComplete =
                                    progressPercent === 100;
                                const isClaimed = !!certificate;

                                const handlePillsClick = async () => {
                                    if (!isProgressComplete && !isClaimed) {
                                        setToastMsg(
                                            "Selesaikan semua materi dan kuis hingga 100% untuk membuka sertifikat ini.",
                                        );
                                        return;
                                    }
                                    if (isClaimed) {
                                        router.push(
                                            `/modul/${modulId}/sertifikat`,
                                        );
                                        return;
                                    }
                                    setIsClaiming(true);
                                    try {
                                        const cert =
                                            await siswaCertificateApi.claim(
                                                modulId,
                                            );
                                        setCertificate(cert);
                                        router.push(
                                            `/modul/${modulId}/sertifikat`,
                                        );
                                    } catch (err) {
                                        if (
                                            err instanceof ApiError &&
                                            err.status === 409
                                        ) {
                                            // Already claimed — extract cert from response data and redirect
                                            const data = err.data as {
                                                certificate?: StudyRoomCertificate;
                                            };
                                            if (data?.certificate)
                                                setCertificate(
                                                    data.certificate,
                                                );
                                            router.push(
                                                `/modul/${modulId}/sertifikat`,
                                            );
                                        } else {
                                            setToastMsg(
                                                "Gagal mengklaim sertifikat. Silakan coba lagi.",
                                            );
                                        }
                                    } finally {
                                        setIsClaiming(false);
                                    }
                                };

                                return (
                                    <div className="space-y-1">
                                        <button
                                            type="button"
                                            onClick={handlePillsClick}
                                            disabled={isClaiming}
                                            className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                                                isClaiming
                                                    ? "cursor-not-allowed border border-transparent bg-gradient-to-r from-[#7054dc] to-[#8b6fe8] text-white/60 shadow-md shadow-[#7054dc]/25"
                                                    : !isProgressComplete &&
                                                        !isClaimed
                                                      ? "border border-[#dcdae3] bg-[#f7f7fa] text-[#a2a7b3]"
                                                      : "border border-transparent bg-gradient-to-r from-[#7054dc] to-[#8b6fe8] text-white shadow-md shadow-[#7054dc]/25"
                                            }`}
                                        >
                                            <PiMedalFill
                                                size={18}
                                                className={`shrink-0 ${!isProgressComplete && !isClaimed ? "text-[#b8b6c4]" : "text-[#ffd700]"}`}
                                            />
                                            <span className="flex-1 text-left">
                                                Sertifikat Kelulusan
                                            </span>
                                            {!isProgressComplete &&
                                            !isClaimed ? (
                                                <FaLock
                                                    size={11}
                                                    className="shrink-0 text-[#b8b6c4]"
                                                />
                                            ) : isClaiming ? (
                                                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                            ) : isClaimed ? (
                                                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/20">
                                                    <FaCheck
                                                        size={9}
                                                        className="text-white"
                                                    />
                                                </span>
                                            ) : (
                                                <span className="text-[11px] font-bold uppercase tracking-wider text-white/90">
                                                    Klaim
                                                </span>
                                            )}
                                        </button>
                                    </div>
                                );
                            })()}
                    </div>
                </aside>

                {/* ── Toast Notification ── */}
                {toastMsg && (
                    <div className="fixed bottom-6 right-6 z-50 max-w-[320px] animate-fade-in rounded-xl bg-[#202126] px-4 py-3 text-sm text-white shadow-lg">
                        <div className="flex items-start gap-2">
                            <span>🔒</span>
                            <span className="flex-1">{toastMsg}</span>
                            <button
                                type="button"
                                onClick={() => setToastMsg("")}
                                className="-mr-1 -mt-1 text-white/60 hover:text-white"
                            >
                                ×
                            </button>
                        </div>
                    </div>
                )}

                {/* ── Main content ── */}
                <section className="flex h-[calc(100vh-76px)] min-h-[calc(100vh-76px)] flex-col overflow-hidden">
                    <div
                        className={`flex-1 p-5 ${currentView === "materi" ? "overflow-y-auto" : "overflow-y-auto"}`}
                    >
                        <div className="flex min-h-[520px] w-full">
                            {/* Pretest / Posttest Intro */}
                            {currentView === "pretest-intro" && (
                                <div className="m-auto flex min-h-[580px] w-full max-w-4xl flex-col justify-center rounded-2xl border border-[#e6e4ed] bg-white px-6 py-10 text-center">
                                    <Image
                                        src="/assets/images/materi/selesai.png"
                                        alt="Ilustrasi test"
                                        width={220}
                                        height={160}
                                        className="mx-auto h-auto w-[220px]"
                                    />
                                    <p className="mx-auto mt-4 max-w-[320px] text-base text-[#676c7b]">
                                        {assessmentType === "pretest"
                                            ? "Kerjakan pre-test untuk menguji pengetahuan awal kamu sebelum belajar"
                                            : assessmentType === "kuis"
                                              ? "Kerjakan kuis untuk menguji pemahaman materi yang sudah dipelajari"
                                              : "Kerjakan post-test untuk menguji pemahaman setelah menyelesaikan semua materi"}
                                    </p>
                                    {currentSoal.length === 0 ? (
                                        <p className="mx-auto mt-6 text-sm text-[#8a8a96]">
                                            Soal belum tersedia saat ini.
                                        </p>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                let duration: number;
                                                if (
                                                    assessmentType === "pretest"
                                                ) {
                                                    duration =
                                                        getDurationForAssessment(
                                                            modulDetail,
                                                            "pretest",
                                                        ) ?? 900;
                                                    setIsPretestStarted(true);
                                                } else if (
                                                    assessmentType ===
                                                    "posttest"
                                                ) {
                                                    duration =
                                                        getDurationForAssessment(
                                                            modulDetail,
                                                            "posttest",
                                                        ) ?? 900;
                                                    setIsPosttestStarted(true);
                                                } else {
                                                    duration =
                                                        getDurationForQuiz(
                                                            modulDetail,
                                                            activeQuizItemId,
                                                        ) ?? 900;
                                                }
                                                setWasTimeUp(false);
                                                setRemainingSeconds(duration);
                                                setTestDurationSeconds(
                                                    duration,
                                                );
                                                setCurrentView("pretest-quiz");
                                            }}
                                            className="mx-auto mt-6 inline-flex w-fit min-w-[170px] shrink-0 items-center justify-center rounded-xl bg-[#7054dc] px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                                        >
                                            {assessmentType === "pretest"
                                                ? "Mulai Pre-Test"
                                                : assessmentType === "kuis"
                                                  ? "Mulai Kuis"
                                                  : "Mulai Post-Test"}
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Quiz / Test Questions */}
                            {currentView === "pretest-quiz" &&
                                activeQuestion && (
                                    <div className="m-auto w-full max-w-4xl">
                                        <div className="mb-6 flex items-center justify-between rounded-2xl border border-[#e6e4ed] bg-white px-6 py-4">
                                            <span className="text-sm font-semibold text-[#202126]">
                                                Soal {activeQuestionIndex + 1}{" "}
                                                dari {currentSoal.length}
                                            </span>
                                            <div className="flex items-center gap-2 text-sm font-semibold text-[#7054dc]">
                                                <FaRegClock size={14} />
                                                {formatRemainingTime(
                                                    remainingSeconds,
                                                )}
                                            </div>
                                        </div>

                                        <div className="rounded-2xl border border-[#e6e4ed] bg-white px-6 py-8">
                                            {activeQuestion.gambar_url && (
                                                <div className="mb-6 overflow-hidden rounded-xl">
                                                    <Image
                                                        src={
                                                            activeQuestion.gambar_url
                                                        }
                                                        alt="Gambar soal"
                                                        width={600}
                                                        height={300}
                                                        className="w-full object-cover"
                                                    />
                                                </div>
                                            )}

                                            <p className="text-base font-semibold text-[#202126]">
                                                {activeQuestion.pertanyaan}
                                            </p>

                                            <div className="mt-6 space-y-3">
                                                {[
                                                    activeQuestion.pilihan_a,
                                                    activeQuestion.pilihan_b,
                                                    activeQuestion.pilihan_c,
                                                    activeQuestion.pilihan_d,
                                                ].map((option, optIdx) => (
                                                    <button
                                                        key={optIdx}
                                                        type="button"
                                                        onClick={() =>
                                                            setSelectedAnswers(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    [activeQuestionIndex]:
                                                                        optIdx,
                                                                }),
                                                            )
                                                        }
                                                        className={`flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-colors ${
                                                            selectedAnswers[
                                                                activeQuestionIndex
                                                            ] === optIdx
                                                                ? "border-[#7054dc] bg-[#efe9ff] text-[#7054dc]"
                                                                : "border-[#e0dfe6] bg-white text-[#202126] hover:border-[#b6a8f0]"
                                                        }`}
                                                    >
                                                        <span
                                                            className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-xs font-semibold ${
                                                                selectedAnswers[
                                                                    activeQuestionIndex
                                                                ] === optIdx
                                                                    ? "border-[#7054dc] bg-[#7054dc] text-white"
                                                                    : "border-[#d0cde0] text-[#8f95a3]"
                                                            }`}
                                                        >
                                                            {
                                                                [
                                                                    "A",
                                                                    "B",
                                                                    "C",
                                                                    "D",
                                                                ][optIdx]
                                                            }
                                                        </span>
                                                        {option}
                                                    </button>
                                                ))}
                                            </div>

                                            <div className="mt-6 flex items-center justify-between">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setActiveQuestionIndex(
                                                            (p) =>
                                                                Math.max(
                                                                    0,
                                                                    p - 1,
                                                                ),
                                                        )
                                                    }
                                                    disabled={
                                                        activeQuestionIndex ===
                                                        0
                                                    }
                                                    className="inline-flex items-center gap-2 rounded-lg border border-[#e0dfe6] px-4 py-2 text-sm font-medium text-[#202126] hover:bg-[#f7f6ff] disabled:opacity-40"
                                                >
                                                    <MdArrowBack size={16} />{" "}
                                                    Sebelumnya
                                                </button>

                                                <span className="text-xs text-[#8a8a96]">
                                                    {answeredCount}/
                                                    {currentSoal.length}{" "}
                                                    terjawab
                                                </span>

                                                {activeQuestionIndex <
                                                currentSoal.length - 1 ? (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setActiveQuestionIndex(
                                                                (p) =>
                                                                    Math.min(
                                                                        currentSoal.length -
                                                                            1,
                                                                        p + 1,
                                                                    ),
                                                            )
                                                        }
                                                        className="inline-flex items-center gap-2 rounded-lg bg-[#7054dc] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
                                                    >
                                                        Selanjutnya{" "}
                                                        <MdArrowForward
                                                            size={16}
                                                        />
                                                    </button>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={
                                                            handleSubmitTest
                                                        }
                                                        disabled={
                                                            answeredCount <
                                                                currentSoal.length ||
                                                            isSubmitting
                                                        }
                                                        className="inline-flex items-center gap-2 rounded-lg bg-[#7054dc] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
                                                    >
                                                        {isSubmitting
                                                            ? "Mengirim..."
                                                            : "Selesai"}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                            {/* Test Result */}
                            {currentView === "pretest-result" && (
                                <div className="m-auto flex min-h-[580px] w-full max-w-5xl flex-col justify-center rounded-2xl border border-[#e6e4ed] bg-white px-6 py-10 text-center">
                                    {wasTimeUp && (
                                        <div className="mx-auto mb-4 flex w-full max-w-[540px] items-center gap-2 rounded-xl border border-[#e35f5f]/30 bg-[#fff5f5] px-4 py-3 text-sm font-medium text-[#e35f5f]">
                                            <FaRegClock size={16} />
                                            Waktu pengerjaan telah habis,
                                            jawaban Anda telah disimpan otomatis
                                        </div>
                                    )}
                                    <Image
                                        src="/assets/images/materi/selesai.png"
                                        alt="Hasil test"
                                        width={180}
                                        height={180}
                                        className="mx-auto h-auto w-[180px]"
                                    />
                                    <h2 className="mt-4 text-2xl font-bold text-[#202126]">
                                        Selamat Kamu Telah Menyelesaikan{" "}
                                        {assessmentType === "pretest"
                                            ? "Pre-Test"
                                            : assessmentType === "kuis"
                                              ? "Kuis"
                                              : "Post-Test"}
                                    </h2>

                                    <div className="mx-auto mt-8 grid max-w-[540px] grid-cols-4 gap-4">
                                        <div>
                                            <p className="inline-flex items-center gap-1 text-lg text-[#4f5565]">
                                                Benar
                                                <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-[#37b66a]/15 text-[#37b66a]">
                                                    <FaCheck size={11} />
                                                </span>
                                            </p>
                                            <p className="mt-2 text-2xl font-bold text-[#202126]">
                                                {testResult?.totalBenar ??
                                                    (assessmentType ===
                                                    "posttest"
                                                        ? progress?.posttestCorrectCount
                                                        : progress?.pretestCorrectCount) ??
                                                    "-"}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="inline-flex items-center gap-1 text-lg text-[#4f5565]">
                                                Salah
                                                <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-[#e35f5f]/15 text-[#e35f5f]">
                                                    <FaTimes size={11} />
                                                </span>
                                            </p>
                                            <p className="mt-2 text-2xl font-bold text-[#202126]">
                                                {testResult?.totalSalah ??
                                                    (assessmentType ===
                                                    "posttest"
                                                        ? progress?.posttestWrongCount
                                                        : progress?.pretestWrongCount) ??
                                                    "-"}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="inline-flex items-center gap-1 text-lg text-[#4f5565]">
                                                Waktu
                                                <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-[#f39b39]/15 text-[#f39b39]">
                                                    <FaRegClock size={12} />
                                                </span>
                                            </p>
                                            <p className="mt-2 text-2xl font-bold text-[#202126]">
                                                {testResult
                                                    ? formatRemainingTime(
                                                          displayedElapsedSeconds,
                                                      )
                                                    : formatRemainingTime(
                                                          assessmentType ===
                                                              "posttest"
                                                              ? (progress?.posttestTimeSpent ??
                                                                    0)
                                                              : (progress?.pretestTimeSpent ??
                                                                    0),
                                                      )}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="inline-flex items-center gap-1 text-lg text-[#4f5565]">
                                                Nilai
                                                <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-[#7054dc]/15 text-[#7054dc]">
                                                    <PiMedalFill size={12} />
                                                </span>
                                            </p>
                                            <p className="mt-2 text-2xl font-bold text-[#202126]">
                                                {testResult?.score ??
                                                    (assessmentType ===
                                                    "posttest"
                                                        ? progress?.posttestScore
                                                        : progress?.pretestScore) ??
                                                    "-"}
                                            </p>
                                        </div>
                                    </div>

                                    {assessmentType === "pretest" &&
                                        testResult?.unlocked_count != null && (
                                            <div className="mx-auto mt-6 max-w-[540px] rounded-xl border border-[#e0d5ff] bg-[#f8f6ff] px-4 py-3 text-sm text-[#4f5565]">
                                                <span className="font-semibold text-[#7054dc]">
                                                    {testResult.unlocked_count}
                                                </span>{" "}
                                                dari{" "}
                                                <span className="font-semibold text-[#7054dc]">
                                                    {testResult.total_submodules ??
                                                        "-"}
                                                </span>{" "}
                                                materi telah terbuka untuk
                                                dipelajari
                                            </div>
                                        )}

                                    {assessmentType === "posttest" ? (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const ratingIdx =
                                                    sequence.findIndex(
                                                        (s) =>
                                                            s.id === "rating",
                                                    );
                                                if (ratingIdx >= 0) {
                                                    setCurrentSeqIndex(
                                                        ratingIdx,
                                                    );
                                                    setCurrentView("rating");
                                                    setIsMaterialMode(false);
                                                    setIsFinalSummaryView(
                                                        false,
                                                    );
                                                } else {
                                                    setCurrentView("materi");
                                                    setIsMaterialMode(true);
                                                }
                                            }}
                                            className="mx-auto mt-8 inline-flex min-w-[180px] items-center justify-center rounded-xl bg-[#7054dc] px-6 py-3 text-sm font-semibold text-white hover:opacity-90"
                                        >
                                            Beri Penilaian
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setCurrentView("materi");
                                                setIsMaterialMode(true);
                                                const firstUnlocked =
                                                    currentSeqIndex + 1;
                                                if (
                                                    firstUnlocked <
                                                    sequence.length
                                                ) {
                                                    setCurrentSeqIndex(
                                                        firstUnlocked,
                                                    );
                                                }
                                            }}
                                            className="mx-auto mt-8 inline-flex min-w-[180px] items-center justify-center rounded-xl bg-[#7054dc] px-6 py-3 text-sm font-semibold text-white hover:opacity-90"
                                        >
                                            {assessmentType === "pretest"
                                                ? "Mulai Belajar"
                                                : "Kembali ke Materi"}
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Materi content */}
                            {currentView === "materi" && (
                                <div className="w-full p-5 sm:p-7">
                                    <div className="mx-auto max-w-5xl">
                                        <div className="mb-3">
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm font-semibold text-[#7054dc]">
                                                    {progressPercent}% Progress
                                                </p>
                                                <p className="text-xs text-[#8a8a96]">
                                                    {completedSteps}/
                                                    {totalSteps} materi
                                                </p>
                                            </div>
                                            <div className="mt-1 h-2 overflow-hidden rounded-full bg-[#e2dfee">
                                                <div
                                                    className="h-full rounded-full bg-[#7054dc] transition-all"
                                                    style={{
                                                        width: `${progressPercent}%`,
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        {!isFinalSummaryView &&
                                            currentSeqItem?.hasVideo &&
                                            currentSeqItem.videoUrl && (
                                                <div className="overflow-hidden rounded-2xl">
                                                    <video
                                                        src={
                                                            currentSeqItem.videoUrl
                                                        }
                                                        controls
                                                        playsInline
                                                        preload="metadata"
                                                        controlsList="nodownload noremoteplayback"
                                                        disablePictureInPicture
                                                        className="aspect-video w-full bg-black object-cover"
                                                    >
                                                        Browser kamu tidak
                                                        mendukung video.
                                                    </video>
                                                </div>
                                            )}

                                        <div className="mt-5 flex items-center justify-between gap-4">
                                            <h2 className="text-3xl font-bold text-[#202126]">
                                                {isFinalSummaryView
                                                    ? "Rangkuman Akhir"
                                                    : (currentSeqItem?.title ??
                                                      "Materi")}
                                            </h2>
                                            {!isFinalSummaryView &&
                                                currentSeqItem?.hasVideo && (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setIsDescriptionExpanded(
                                                                (prev) => !prev,
                                                            )
                                                        }
                                                        className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-[#7054dc]"
                                                    >
                                                        {isDescriptionExpanded
                                                            ? "Sembunyikan Deskripsi"
                                                            : "Lihat Bahan Bacaan"}
                                                        <FaChevronDown
                                                            className={
                                                                isDescriptionExpanded
                                                                    ? "rotate-180"
                                                                    : ""
                                                            }
                                                            size={11}
                                                        />
                                                    </button>
                                                )}
                                        </div>

                                        <div className="mt-4">
                                            {currentSeqItem?.type ===
                                                "summary" &&
                                                summaryHighlightText && (
                                                    <div className="mb-5 rounded-xl bg-[#f3dfc9] px-4 py-4 text-sm font-semibold leading-relaxed text-[#202126]">
                                                        {summaryHighlightText}
                                                    </div>
                                                )}

                                            {isFinalSummaryView ? (
                                                <div className="mt-1 space-y-4 text-base leading-relaxed text-[#313644]">
                                                    <p>
                                                        Rangkuman akhir dari
                                                        seluruh materi yang
                                                        telah kamu pelajari.
                                                        Kamu telah menyelesaikan
                                                        semua topik dalam modul
                                                        ini. Selamat!
                                                    </p>
                                                    {progress?.pretestScore !=
                                                        null && (
                                                        <p>
                                                            Nilai Pre-Test kamu:{" "}
                                                            <strong>
                                                                {
                                                                    progress.pretestScore
                                                                }
                                                                /100
                                                            </strong>
                                                        </p>
                                                    )}
                                                    {progress?.posttestScore !=
                                                        null && (
                                                        <p>
                                                            Nilai Post-Test
                                                            kamu:{" "}
                                                            <strong>
                                                                {
                                                                    progress.posttestScore
                                                                }
                                                                /100
                                                            </strong>
                                                        </p>
                                                    )}
                                                </div>
                                            ) : currentSeqItem?.konten ? (
                                                <div
                                                    className="mt-1 space-y-4 text-base leading-relaxed text-[#313644]"
                                                    dangerouslySetInnerHTML={{
                                                        __html: currentSeqItem.konten,
                                                    }}
                                                />
                                            ) : currentSeqItem?.type ===
                                              "summary" ? (
                                                <div className="mt-1 space-y-4 text-base leading-relaxed text-[#313644]">
                                                    <p>
                                                        Rangkuman untuk topik
                                                        ini merangkum
                                                        konsep-konsep penting
                                                        yang telah dipelajari.
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="mt-1 space-y-4 text-base leading-relaxed text-[#313644]">
                                                    <p>
                                                        Konten materi akan
                                                        ditampilkan di sini.
                                                        Pilih submateri dari
                                                        sidebar untuk memulai
                                                        belajar.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Rating */}
                            {currentView === "rating" && (
                                <div className="m-auto w-full max-w-5xl rounded-2xl border border-[#eceaf3] bg-white px-8 py-12">
                                    <div className="mx-auto max-w-[560px] text-center">
                                        {isRatingSubmitted ? (
                                            <div className="py-10">
                                                <Image
                                                    src="/assets/images/penilaian/penilaian.png"
                                                    alt="Penilaian berhasil dikirim"
                                                    width={260}
                                                    height={220}
                                                    className="mx-auto h-auto w-[260px]"
                                                />
                                                <p className="mt-4 text-2xl font-semibold text-[#8c92a0]">
                                                    Penilaian berhasil dikirim!
                                                </p>
                                            </div>
                                        ) : (
                                            <>
                                                <h3 className="text-[34px] font-bold text-[#202126]">
                                                    Gimana Pengalaman Belajarmu?
                                                </h3>
                                                <p className="mt-2 text-sm text-[#5f6472]">
                                                    Berikan rating untuk modul
                                                    ini agar kami bisa terus
                                                    meningkatkan kualitas
                                                    belajarmu.
                                                </p>
                                                <div className="mt-8 flex items-center justify-center gap-2">
                                                    {[1, 2, 3, 4, 5].map(
                                                        (value) => (
                                                            <button
                                                                key={value}
                                                                type="button"
                                                                onClick={() =>
                                                                    setSelectedRating(
                                                                        value,
                                                                    )
                                                                }
                                                                className="p-1"
                                                            >
                                                                <FaStar
                                                                    size={34}
                                                                    className={
                                                                        value <=
                                                                        selectedRating
                                                                            ? "text-[#7054dc]"
                                                                            : "text-[#d1d4db]"
                                                                    }
                                                                />
                                                            </button>
                                                        ),
                                                    )}
                                                </div>
                                                <div className="mt-8 text-left">
                                                    <p className="text-sm font-semibold text-[#202126]">
                                                        Berikan Ulasan
                                                        (Opsional)
                                                    </p>
                                                    <textarea
                                                        value={reviewText}
                                                        onChange={(event) =>
                                                            setReviewText(
                                                                event.target.value.slice(
                                                                    0,
                                                                    200,
                                                                ),
                                                            )
                                                        }
                                                        placeholder="Bagikan kesanmu tentang materi ini ..."
                                                        className="mt-2 h-[150px] w-full resize-none rounded-xl border border-[#d8dbe3] px-4 py-3 text-sm text-[#202126] placeholder:text-[#a2a7b3] focus:border-[#7054dc] focus:outline-none"
                                                    />
                                                    <p className="mt-2 text-right text-xs text-[#8c92a0]">
                                                        {reviewText.length}/200
                                                    </p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={handleRatingSubmit}
                                                    disabled={
                                                        selectedRating === 0 ||
                                                        isRatingSubmitting
                                                    }
                                                    className={`mt-7 inline-flex min-w-[180px] items-center justify-center rounded-xl px-6 py-3 text-sm font-semibold text-white ${
                                                        selectedRating > 0
                                                            ? "bg-[#7054dc]"
                                                            : "bg-[#a7acb5]"
                                                    }`}
                                                >
                                                    {isRatingSubmitting
                                                        ? "Mengirim..."
                                                        : "Kirim Penilaian"}
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer navigation */}
                    {(currentView === "materi" ||
                        currentView === "pretest-quiz" ||
                        currentView === "pretest-result" ||
                        currentView === "rating") && (
                        <div className="border-t border-[#e1e0e7] bg-white px-6 py-4">
                            <div className="flex items-center justify-between">
                                <button
                                    type="button"
                                    onClick={handleFooterPrevious}
                                    disabled={
                                        isNavigating ||
                                        (currentView === "materi" &&
                                            isFirstItem) ||
                                        (currentView === "pretest-quiz" &&
                                            activeQuestionIndex === 0)
                                    }
                                    className="inline-flex items-center gap-2 rounded-lg border border-[#e0dfe6] px-4 py-2 text-sm font-medium text-[#202126] hover:bg-[#f7f6ff] disabled:opacity-40"
                                >
                                    {isNavigating ? (
                                        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-[#202126] border-t-transparent" />
                                    ) : (
                                        <>
                                            <MdArrowBack size={16} /> Sebelumnya
                                        </>
                                    )}
                                </button>

                                {currentView === "materi" &&
                                    !isFinalSummaryView && (
                                        <p className="text-xs text-[#8a8a96]">
                                            {completedSteps}/{totalSteps} materi
                                        </p>
                                    )}

                                <button
                                    type="button"
                                    onClick={handleFooterNext}
                                    disabled={isNavigating}
                                    className="inline-flex items-center gap-2 rounded-lg bg-[#7054dc] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-40"
                                >
                                    {isNavigating ? (
                                        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    ) : currentView === "materi" &&
                                      isLastItem ? (
                                        <>
                                            Selesai <MdArrowForward size={16} />
                                        </>
                                    ) : (
                                        <>
                                            Selanjutnya{" "}
                                            <MdArrowForward size={16} />
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}
