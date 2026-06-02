"use client";

import Image from "next/image";
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
  siswaTopikApi,
  siswaMateriApi,
  siswaSubmateriApi,
  siswaPretestApi,
  siswaPosttestApi,
  siswaProgressApi,
  siswaRatingApi,
  siswaCertificateApi,
  type TopikItem,
  type MateriItem as MateriItemApi,
  type SubmateriItem,
  type SoalItem,
  type TestSubmitResult,
  type CertificateItem,
  type ProgressDetail,
  ApiError,
} from "../../../lib/api";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const PRETEST_DURATION_SECONDS = 15 * 60;

function formatRemainingTime(totalSeconds: number) {
  const safeValue = Math.max(0, totalSeconds);
  const minutes = Math.floor(safeValue / 60).toString().padStart(2, "0");
  const seconds = (safeValue % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function mapAnswerIndex(index: number): "a" | "b" | "c" | "d" {
  return (["a", "b", "c", "d"] as const)[index] ?? "a";
}

// ---------------------------------------------------------------------------
// Types for internal content tree
// ---------------------------------------------------------------------------
type ContentItem = {
  id: string;
  title: string;
  duration: string;
  type: "lesson" | "summary" | "quiz";
  hasVideo: boolean;
  videoUrl?: string;
  konten?: string;
};

type ContentSection = {
  id: string; // topikId
  title: string;
  items: ContentItem[];
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function MateriClient({ modulId }: { modulId: string }) {
  // ─── Data state ───────────────────────────────────────────────────────────
  const [contentTree, setContentTree] = useState<ContentSection[]>([]);
  const [pretestSoal, setPretestSoal] = useState<SoalItem[]>([]);
  const [posttestSoal, setPosttestSoal] = useState<SoalItem[]>([]);
  const [progress, setProgress] = useState<ProgressDetail | null>(null);
  const [certificate, setCertificate] = useState<CertificateItem | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [dataError, setDataError] = useState("");

  // ─── View state ───────────────────────────────────────────────────────────
  const [assessmentType, setAssessmentType] = useState<"pretest" | "kuis" | "posttest">("pretest");
  const [activeQuizItemId, setActiveQuizItemId] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<
    "pretest-intro" | "pretest-quiz" | "pretest-result" | "materi" | "rating" | "certificate"
  >("pretest-intro");

  const [isPretestStarted, setIsPretestStarted] = useState(false);
  const [isPretestFinished, setIsPretestFinished] = useState(false);
  const [testResult, setTestResult] = useState<TestSubmitResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [remainingSeconds, setRemainingSeconds] = useState(PRETEST_DURATION_SECONDS);
  const [finishedElapsedSeconds, setFinishedElapsedSeconds] = useState<number | null>(null);

  const [isMaterialMode, setIsMaterialMode] = useState(false);
  const [isFinalSummaryView, setIsFinalSummaryView] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [selectedContentItemId, setSelectedContentItemId] = useState("");
  const [completedContentItemMap, setCompletedContentItemMap] = useState<Record<string, boolean>>({});

  const [selectedRating, setSelectedRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [isRatingSubmitted, setIsRatingSubmitted] = useState(false);
  const [isRatingSubmitting, setIsRatingSubmitting] = useState(false);

  const [isModuleSidebarOpen, setIsModuleSidebarOpen] = useState(false);

  // ─── Load data from API ──────────────────────────────────────────────────
  useEffect(() => {
    // API may return array directly OR { data: [...] } wrapper
    function extractArray<T>(res: unknown): T[] {
      if (Array.isArray(res)) return res as T[];
      if (res && typeof res === 'object') {
        const obj = res as Record<string, unknown>;
        if ('data' in obj && Array.isArray(obj.data)) return obj.data as T[];
        if ('items' in obj && Array.isArray(obj.items)) return obj.items as T[];
      }
      return [];
    }

    const load = async () => {
      setIsLoadingData(true);
      setDataError("");
      try {
        // Fetch topik + materi + submateri tree
        const topikRaw = await siswaTopikApi.getByModul(modulId);
        const materiRaw = await siswaMateriApi.getByModul(modulId);
        const topikList = extractArray<TopikItem>(topikRaw);
        const materiList = extractArray<MateriItemApi>(materiRaw);

        // Build submateri for each materi
        const submateriByMateri: Record<string, SubmateriItem[]> = {};
        await Promise.all(
          materiList.map(async (m) => {
            try {
              const subsRaw = await siswaSubmateriApi.getByMateri(m.id);
              submateriByMateri[m.id] = extractArray<SubmateriItem>(subsRaw);
            } catch {
              submateriByMateri[m.id] = [];
            }
          })
        );

        // Build content tree
        const tree: ContentSection[] = topikList.map((topik: TopikItem) => {
          const materiForTopik = materiList.filter((m) => m.topikId === topik.id);
          const items: ContentItem[] = materiForTopik.flatMap((m) => {
            const subs = submateriByMateri[m.id] ?? [];
            return subs.map((sub) => ({
              id: sub.id,
              title: sub.judul,
              duration: sub.durasi ?? "",
              type: sub.tipe === "quiz" ? "quiz" : "lesson",
              hasVideo: !!sub.video_url,
              videoUrl: sub.video_url ?? undefined,
              konten: sub.konten,
            }));
          });

          // Add summary item for each topik
          items.push({
            id: `summary-${topik.id}`,
            title: `Rangkuman ${topik.nama_topik}`,
            duration: "",
            type: "summary",
            hasVideo: false,
          });

          return {
            id: topik.id,
            title: topik.nama_topik,
            items,
          };
        });

        setContentTree(tree);

        // Initialize expanded sections
        if (tree.length > 0) {
          setExpandedSections({ [tree[0].id]: true });
          const firstItem = tree[0].items[0];
          if (firstItem) setSelectedContentItemId(firstItem.id);
        }

        // Fetch pretest soal
        try {
          const pretest = await siswaPretestApi.getByModul(modulId);
          setPretestSoal(pretest.soal ?? []);
        } catch {
          setPretestSoal([]);
        }

        // Fetch posttest soal
        try {
          const posttest = await siswaPosttestApi.getByModul(modulId);
          setPosttestSoal(posttest.soal ?? []);
        } catch {
          setPosttestSoal([]);
        }

        // Fetch progress
        try {
          const prog = await siswaProgressApi.getByModul(modulId);
          setProgress(prog);

          // If pretest already done, go directly to materi
          if (prog.pretestScore != null) {
            setIsPretestFinished(true);
            setIsMaterialMode(true);
            setCurrentView("materi");

            // Mark completed submateri
            const completedMap: Record<string, boolean> = {};
            (prog.completedSubmateri ?? []).forEach((sid) => { completedMap[sid] = true; });
            setCompletedContentItemMap(completedMap);
          }

          // Fetch certificate if graduated
          if (prog.isGraduated) {
            try {
              const certs = await siswaCertificateApi.getAll({ limit: 20 });
              const cert = certs.data.find((c) => c.modulId === modulId);
              if (cert) setCertificate(cert);
            } catch {
              // no cert yet
            }
          }
        } catch {
          // No progress yet — fresh student, show pretest
        }
      } catch (err: unknown) {
        console.error("MateriClient load error:", err);
        setDataError(err instanceof Error ? err.message : "Gagal memuat materi");
      } finally {
        setIsLoadingData(false);
      }
    };

    load();
  }, [modulId]);

  // ─── Timer ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isPretestStarted || isPretestFinished) return;
    if (remainingSeconds <= 0) return;
    const timer = setInterval(() => {
      setRemainingSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [isPretestFinished, isPretestStarted, remainingSeconds]);

  // Auto-submit when timer runs out
  useEffect(() => {
    if (isPretestStarted && !isPretestFinished && remainingSeconds === 0) {
      handleSubmitTest();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remainingSeconds]);

  // ─── Sidebar events ───────────────────────────────────────────────────────
  useEffect(() => {
    const onToggleSidebar = () => setIsModuleSidebarOpen((prev) => !prev);
    window.addEventListener("toggle-module-sidebar", onToggleSidebar as EventListener);
    return () => window.removeEventListener("toggle-module-sidebar", onToggleSidebar as EventListener);
  }, []);

  useEffect(() => {
    if (!isModuleSidebarOpen) return;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [isModuleSidebarOpen]);

  useEffect(() => {
    if (!isModuleSidebarOpen) return;
    const onKeyDown = (e: KeyboardEvent) => { if (e.key === "Escape") setIsModuleSidebarOpen(false); };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isModuleSidebarOpen]);

  // ─── Derived values ───────────────────────────────────────────────────────
  const currentSoal = assessmentType === "posttest" ? posttestSoal : pretestSoal;
  const activeQuestion = currentSoal[activeQuestionIndex];
  const answeredCount = useMemo(() => Object.keys(selectedAnswers).length, [selectedAnswers]);
  const elapsedSeconds = PRETEST_DURATION_SECONDS - remainingSeconds;
  const displayedElapsedSeconds = finishedElapsedSeconds ?? elapsedSeconds;

  const hasUnlockedUntilSummary = isMaterialMode || isPretestFinished;
  const isAssessmentView = currentView === "pretest-intro" || currentView === "pretest-quiz" || currentView === "pretest-result";
  const isPretestActive = isAssessmentView && assessmentType === "pretest";
  const isPosttestActive = isAssessmentView && assessmentType === "posttest";
  const isFinalSummaryActive = currentView === "materi" && isFinalSummaryView;
  const isRatingView = currentView === "rating";
  const isCertificateView = currentView === "certificate";

  const flatContentItems = useMemo(
    () => contentTree.flatMap((section) => section.items),
    [contentTree]
  );
  const selectedContentItem = useMemo(
    () => flatContentItems.find((item) => item.id === selectedContentItemId),
    [flatContentItems, selectedContentItemId]
  );
  const selectedContentItemIndex = useMemo(
    () => flatContentItems.findIndex((item) => item.id === selectedContentItemId),
    [flatContentItems, selectedContentItemId]
  );
  const selectedMaterialProgressPercent = useMemo(() => {
    if (selectedContentItemIndex < 0 || flatContentItems.length === 0) return 0;
    return Math.round(((selectedContentItemIndex + 1) / flatContentItems.length) * 100);
  }, [flatContentItems.length, selectedContentItemIndex]);

  const summaryHighlightText = selectedContentItem?.type === "summary"
    ? "Rangkuman ini merangkum poin-poin penting dari topik yang telah dipelajari."
    : undefined;

  // ─── Handlers ─────────────────────────────────────────────────────────────
  const markContentItemAsCompleted = useCallback(async (itemId: string) => {
    setCompletedContentItemMap((prev) => ({ ...prev, [itemId]: true }));
    // Don't mark summary items to the server
    if (itemId.startsWith("summary-")) return;
    try {
      await siswaProgressApi.completeSubmateri(itemId);
    } catch (err) {
      console.error("Failed to mark submateri complete:", err);
    }
  }, []);

  const handleSubmitTest = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    const elapsed = PRETEST_DURATION_SECONDS - remainingSeconds;
    setFinishedElapsedSeconds(elapsed);

    const answers = currentSoal.map((soal, idx) => ({
      questionId: soal.id,
      answer: mapAnswerIndex(selectedAnswers[idx] ?? 0),
    }));

    try {
      let result: TestSubmitResult;
      if (assessmentType === "posttest") {
        result = await siswaPosttestApi.submit(modulId, { answers });
      } else {
        result = await siswaPretestApi.submit(modulId, { answers });
        setIsPretestFinished(true);
      }
      setTestResult(result);
    } catch (err: unknown) {
      console.error("Test submit error:", err);
      // Fallback: calculate locally
      const correct = currentSoal.reduce((acc, soal, idx) => {
        // We don't know correct answer from API (no kunci_jawaban returned)
        return acc;
      }, 0);
      setTestResult({ score: 0, totalBenar: 0, totalSalah: answeredCount });
      if (assessmentType !== "posttest") setIsPretestFinished(true);
    } finally {
      setCurrentView("pretest-result");
      setIsSubmitting(false);
    }
  };

  const handleFooterPrevious = () => {
    if (currentView === "certificate" || currentView === "rating") {
      setCurrentView("materi");
      setIsMaterialMode(true);
      setIsFinalSummaryView(false);
      return;
    }
    if (currentView === "materi") {
      if (selectedContentItemIndex > 0) {
        const previousItem = flatContentItems[selectedContentItemIndex - 1];
        setSelectedContentItemId(previousItem.id);
        markContentItemAsCompleted(previousItem.id);
      }
      return;
    }
    setActiveQuestionIndex((prev) => Math.max(0, prev - 1));
  };

  const handleFooterNext = () => {
    if (currentView === "certificate") {
      setCurrentView("materi");
      setIsMaterialMode(true);
      setIsFinalSummaryView(false);
      return;
    }
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
      if (selectedContentItemIndex < flatContentItems.length - 1) {
        const nextItem = flatContentItems[selectedContentItemIndex + 1];
        setSelectedContentItemId(nextItem.id);
        markContentItemAsCompleted(nextItem.id);
      }
      return;
    }
    setActiveQuestionIndex((prev) => Math.min(currentSoal.length - 1, prev + 1));
  };

  const handleRatingSubmit = async () => {
    if (selectedRating === 0 || isRatingSubmitting) return;
    setIsRatingSubmitting(true);
    try {
      await siswaRatingApi.rate(modulId, { rating: selectedRating, komentar: reviewText || undefined });
      setIsRatingSubmitted(true);
    } catch (err) {
      console.error("Rating submit error:", err);
      setIsRatingSubmitted(true); // still mark as submitted on UI
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
            <p className="text-sm text-[#8a8a96]">Memuat konten kelas...</p>
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
            isModuleSidebarOpen ? "fixed left-0 top-[76px] bottom-0 z-50 flex w-[320px]" : "hidden"
          } h-full flex-col overflow-hidden border-r border-[#e1e0e7] bg-white px-5 py-6 lg:static lg:flex lg:w-auto`}
        >
          <h1 className="text-2xl font-bold text-[#202126]">Konten Kelas</h1>

          <div className="mt-5 min-h-0 space-y-2 overflow-y-auto pr-1">
            {/* Pre-Test button */}
            <button
              type="button"
              onClick={() => {
                setIsModuleSidebarOpen(false);
                setAssessmentType("pretest");
                setActiveQuizItemId(null);
                setIsMaterialMode(false);
                setIsFinalSummaryView(false);
                if (isPretestFinished) {
                  setCurrentView("pretest-result");
                } else if (isPretestStarted) {
                  setCurrentView("pretest-quiz");
                } else {
                  setCurrentView("pretest-intro");
                }
              }}
              className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${
                isPretestActive ? "bg-[#efe9ff] text-[#7054dc]" : "border border-[#dcdae3] bg-white text-[#202126]"
              }`}
            >
              {isPretestFinished && (
                <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#7054dc]">
                  <FaCheck size={9} className="text-white" />
                </span>
              )}
              <FaFileAlt size={12} className={isPretestActive ? "text-[#7054dc]" : "text-[#202126]"} />
              Pre-Test
              {pretestSoal.length === 0 && (
                <span className="ml-auto text-[10px] text-[#8a8a96]">Belum tersedia</span>
              )}
            </button>

            {/* Content tree sections */}
            {contentTree.map((section, sectionIndex) => {
              const sectionUnlocked = hasUnlockedUntilSummary;
              const isSectionCompleted = section.items.every((item) => completedContentItemMap[item.id]);

              return (
                <div key={section.id} className="overflow-hidden rounded-lg border border-[#dcdae3] bg-white">
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedSections((prev) => ({ ...prev, [section.id]: !prev[section.id] }))
                    }
                    className="flex w-full items-center justify-between px-3 py-2 text-left text-sm text-[#202126]"
                  >
                    <span className="inline-flex items-center gap-2">
                      {sectionUnlocked && isSectionCompleted && (
                        <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#7054dc]">
                          <FaCheck size={9} className="text-white" />
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
                      {section.items.map((item) => {
                        const isSelected = selectedContentItemId === item.id;
                        const isItemLocked = !sectionUnlocked;
                        const isItemCompleted = completedContentItemMap[item.id];
                        const isQuizActive =
                          item.type === "quiz" &&
                          isAssessmentView &&
                          assessmentType === "kuis" &&
                          activeQuizItemId === item.id;

                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              if (isItemLocked) return;
                              setIsModuleSidebarOpen(false);
                              if (item.type === "quiz") {
                                setAssessmentType("kuis");
                                setActiveQuizItemId(item.id);
                                setCurrentView("pretest-intro");
                                setIsMaterialMode(false);
                                setIsFinalSummaryView(false);
                                setActiveQuestionIndex(0);
                                setSelectedAnswers({});
                                setRemainingSeconds(PRETEST_DURATION_SECONDS);
                                return;
                              }
                              setSelectedContentItemId(item.id);
                              setActiveQuizItemId(null);
                              markContentItemAsCompleted(item.id);
                              setCurrentView("materi");
                              setIsMaterialMode(true);
                              setIsFinalSummaryView(false);
                            }}
                            className={`flex w-full items-start border-b border-[#f0eef7] px-3 py-2 text-left text-xs last:border-b-0 ${
                              isItemLocked
                                ? "cursor-not-allowed text-[#8f95a3]"
                                : isSelected || isQuizActive
                                ? "bg-[#efe9ff] text-[#7054dc]"
                                : "text-[#202126]"
                            }`}
                          >
                            <span className="inline-flex items-start gap-2">
                              {isItemCompleted ? (
                                <span className={`inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#7054dc] ${item.type === "quiz" ? "" : "mt-1.5"}`}>
                                  <FaCheck size={8} className="text-white" />
                                </span>
                              ) : isItemLocked ? (
                                <FaLock size={10} className="mt-2 text-[#8f95a3]" />
                              ) : (
                                <span className="inline-flex h-4 w-4" />
                              )}
                              {item.hasVideo ? (
                                <FaPlay size={9} className={`mt-2 ${isItemLocked ? "text-[#8f95a3]" : isSelected || isQuizActive ? "text-[#7054dc]" : "text-[#202126]"}`} />
                              ) : item.type === "quiz" ? (
                                <span className="inline-flex h-4 w-4" />
                              ) : (
                                <FaBookOpen size={10} className={`mt-2 ${isItemLocked ? "text-[#8f95a3]" : isSelected || isQuizActive ? "text-[#7054dc]" : "text-[#202126]"}`} />
                              )}
                              <span>
                                <span className="block">{item.title}</span>
                                {item.duration && (
                                  <span className={`mt-0.5 block text-[10px] ${isItemLocked ? "text-[#8f95a3]" : isSelected || isQuizActive ? "text-[#7054dc]" : "text-[#202126]"}`}>
                                    {item.duration}
                                  </span>
                                )}
                              </span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Rangkuman Akhir */}
            <button
              type="button"
              disabled={!hasUnlockedUntilSummary}
              onClick={() => {
                if (!hasUnlockedUntilSummary) return;
                setIsModuleSidebarOpen(false);
                setCurrentView("materi");
                setIsMaterialMode(true);
                setIsFinalSummaryView(true);
                setAssessmentType("pretest");
                setActiveQuizItemId(null);
              }}
              className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                !hasUnlockedUntilSummary
                  ? "cursor-not-allowed border border-[#dcdae3] bg-white text-[#8f95a3]"
                  : isFinalSummaryActive
                  ? "border border-[#e0d5ff] bg-[#efe9ff] text-[#7054dc]"
                  : "border border-[#dcdae3] bg-white text-[#313643]"
              }`}
            >
              {hasUnlockedUntilSummary ? (
                <FaBookOpen size={11} className={isFinalSummaryActive ? "text-[#7054dc]" : "text-[#202126]"} />
              ) : (
                <FaLock size={11} className="text-[#8f95a3]" />
              )}
              Rangkuman Akhir
            </button>

            {/* Post-Test */}
            <button
              type="button"
              disabled={!hasUnlockedUntilSummary}
              onClick={() => {
                if (!hasUnlockedUntilSummary) return;
                setIsModuleSidebarOpen(false);
                setAssessmentType("posttest");
                setActiveQuizItemId(null);
                setCurrentView("pretest-intro");
                setIsMaterialMode(false);
                setIsFinalSummaryView(false);
                setActiveQuestionIndex(0);
                setSelectedAnswers({});
                setRemainingSeconds(PRETEST_DURATION_SECONDS);
                setTestResult(null);
              }}
              className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                !hasUnlockedUntilSummary
                  ? "cursor-not-allowed border border-[#dcdae3] bg-white text-[#8f95a3]"
                  : isPosttestActive
                  ? "border border-[#e0d5ff] bg-[#efe9ff] text-[#7054dc]"
                  : "border border-[#dcdae3] bg-white text-[#313643]"
              }`}
            >
              {hasUnlockedUntilSummary ? (
                <FaFileAlt size={11} className={isPosttestActive ? "text-[#7054dc]" : "text-[#202126]"} />
              ) : (
                <FaLock size={11} className="text-[#8f95a3]" />
              )}
              Post-Test
              {posttestSoal.length === 0 && hasUnlockedUntilSummary && (
                <span className="ml-auto text-[10px] text-[#8a8a96]">Belum tersedia</span>
              )}
            </button>

            {/* Beri Penilaian */}
            <button
              type="button"
              onClick={() => {
                setCurrentView("rating");
                setIsMaterialMode(false);
                setIsFinalSummaryView(false);
                setActiveQuizItemId(null);
                setIsRatingSubmitted(false);
              }}
              className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                isRatingView ? "border border-[#e0d5ff] bg-[#efe9ff] text-[#7054dc]" : "border border-[#dcdae3] bg-white text-[#313643]"
              }`}
            >
              <FaStar size={11} className={isRatingView ? "text-[#7054dc]" : "text-[#202126]"} />
              Beri Penilaian
            </button>

            {/* Lihat Sertifikat */}
            <button
              type="button"
              disabled={!hasUnlockedUntilSummary}
              onClick={() => {
                if (!hasUnlockedUntilSummary) return;
                setCurrentView("certificate");
                setIsMaterialMode(false);
                setIsFinalSummaryView(false);
                setActiveQuizItemId(null);
              }}
              className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                !hasUnlockedUntilSummary
                  ? "cursor-not-allowed border border-[#dcdae3] bg-white text-[#8f95a3]"
                  : isCertificateView
                  ? "border border-[#e0d5ff] bg-[#efe9ff] text-[#7054dc]"
                  : "border border-[#dcdae3] bg-white text-[#313643]"
              }`}
            >
              {hasUnlockedUntilSummary ? (
                <FaFileAlt size={11} className={isCertificateView ? "text-[#7054dc]" : "text-[#202126]"} />
              ) : (
                <FaLock size={11} className="text-[#8f95a3]" />
              )}
              Lihat Sertifikat
            </button>
          </div>
        </aside>

        {/* ── Main content ── */}
        <section className="flex h-[calc(100vh-76px)] min-h-[calc(100vh-76px)] flex-col overflow-hidden">
          <div className={`flex-1 p-5 ${currentView === "materi" ? "overflow-y-auto" : "overflow-y-auto"}`}>
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
                  {(assessmentType === "pretest" ? pretestSoal : posttestSoal).length === 0 ? (
                    <p className="mx-auto mt-6 text-sm text-[#8a8a96]">Soal belum tersedia saat ini.</p>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setIsPretestStarted(true);
                        setCurrentView("pretest-quiz");
                      }}
                      className="mx-auto mt-6 inline-flex w-fit min-w-[170px] shrink-0 items-center justify-center rounded-xl bg-[#7054dc] px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                    >
                      {assessmentType === "pretest" ? "Mulai Pre-Test" : assessmentType === "kuis" ? "Mulai Kuis" : "Mulai Post-Test"}
                    </button>
                  )}
                </div>
              )}

              {/* Quiz / Test Questions */}
              {currentView === "pretest-quiz" && activeQuestion && (
                <div className="m-auto w-full max-w-4xl">
                  <div className="mb-6 flex items-center justify-between rounded-2xl border border-[#e6e4ed] bg-white px-6 py-4">
                    <span className="text-sm font-semibold text-[#202126]">
                      Soal {activeQuestionIndex + 1} dari {currentSoal.length}
                    </span>
                    <div className="flex items-center gap-2 text-sm font-semibold text-[#7054dc]">
                      <FaRegClock size={14} />
                      {formatRemainingTime(remainingSeconds)}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-[#e6e4ed] bg-white px-6 py-8">
                    {activeQuestion.gambar_url && (
                      <div className="mb-6 overflow-hidden rounded-xl">
                        <Image
                          src={activeQuestion.gambar_url}
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
                            setSelectedAnswers((prev) => ({ ...prev, [activeQuestionIndex]: optIdx }))
                          }
                          className={`flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-colors ${
                            selectedAnswers[activeQuestionIndex] === optIdx
                              ? "border-[#7054dc] bg-[#efe9ff] text-[#7054dc]"
                              : "border-[#e0dfe6] bg-white text-[#202126] hover:border-[#b6a8f0]"
                          }`}
                        >
                          <span className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-xs font-semibold ${
                            selectedAnswers[activeQuestionIndex] === optIdx
                              ? "border-[#7054dc] bg-[#7054dc] text-white"
                              : "border-[#d0cde0] text-[#8f95a3]"
                          }`}>
                            {["A", "B", "C", "D"][optIdx]}
                          </span>
                          {option}
                        </button>
                      ))}
                    </div>

                    <div className="mt-6 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setActiveQuestionIndex((p) => Math.max(0, p - 1))}
                        disabled={activeQuestionIndex === 0}
                        className="inline-flex items-center gap-2 rounded-lg border border-[#e0dfe6] px-4 py-2 text-sm font-medium text-[#202126] hover:bg-[#f7f6ff] disabled:opacity-40"
                      >
                        <MdArrowBack size={16} /> Sebelumnya
                      </button>

                      <span className="text-xs text-[#8a8a96]">{answeredCount}/{currentSoal.length} terjawab</span>

                      {activeQuestionIndex < currentSoal.length - 1 ? (
                        <button
                          type="button"
                          onClick={() => setActiveQuestionIndex((p) => Math.min(currentSoal.length - 1, p + 1))}
                          className="inline-flex items-center gap-2 rounded-lg bg-[#7054dc] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
                        >
                          Selanjutnya <MdArrowForward size={16} />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleSubmitTest}
                          disabled={answeredCount < currentSoal.length || isSubmitting}
                          className="inline-flex items-center gap-2 rounded-lg bg-[#7054dc] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
                        >
                          {isSubmitting ? "Mengirim..." : "Selesai"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Test Result */}
              {currentView === "pretest-result" && (
                <div className="m-auto flex min-h-[580px] w-full max-w-5xl flex-col justify-center rounded-2xl border border-[#e6e4ed] bg-white px-6 py-10 text-center">
                  <Image
                    src="/assets/images/materi/selesai.png"
                    alt="Hasil test"
                    width={180}
                    height={180}
                    className="mx-auto h-auto w-[180px]"
                  />
                  <h2 className="mt-4 text-2xl font-bold text-[#202126]">
                    Selamat Kamu Telah Menyelesaikan{" "}
                    {assessmentType === "pretest" ? "Pre-Test" : assessmentType === "kuis" ? "Kuis" : "Post-Test"}
                  </h2>

                  <div className="mx-auto mt-8 grid max-w-[540px] grid-cols-4 gap-4">
                    <div>
                      <p className="inline-flex items-center gap-1 text-lg text-[#4f5565]">
                        Benar
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-[#37b66a]/15 text-[#37b66a]">
                          <FaCheck size={11} />
                        </span>
                      </p>
                      <p className="mt-2 text-2xl font-bold text-[#202126]">{testResult?.totalBenar ?? "-"}</p>
                    </div>
                    <div>
                      <p className="inline-flex items-center gap-1 text-lg text-[#4f5565]">
                        Salah
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-[#e35f5f]/15 text-[#e35f5f]">
                          <FaTimes size={11} />
                        </span>
                      </p>
                      <p className="mt-2 text-2xl font-bold text-[#202126]">{testResult?.totalSalah ?? "-"}</p>
                    </div>
                    <div>
                      <p className="inline-flex items-center gap-1 text-lg text-[#4f5565]">
                        Waktu
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-[#f39b39]/15 text-[#f39b39]">
                          <FaRegClock size={12} />
                        </span>
                      </p>
                      <p className="mt-2 text-2xl font-bold text-[#202126]">{formatRemainingTime(displayedElapsedSeconds)}</p>
                    </div>
                    <div>
                      <p className="inline-flex items-center gap-1 text-lg text-[#4f5565]">
                        Nilai
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-[#7054dc]/15 text-[#7054dc]">
                          <PiMedalFill size={12} />
                        </span>
                      </p>
                      <p className="mt-2 text-2xl font-bold text-[#202126]">{testResult?.score ?? "-"}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setCurrentView("materi");
                      setIsMaterialMode(true);
                    }}
                    className="mx-auto mt-8 inline-flex min-w-[180px] items-center justify-center rounded-xl bg-[#7054dc] px-6 py-3 text-sm font-semibold text-white hover:opacity-90"
                  >
                    {assessmentType === "pretest" ? "Mulai Belajar" : "Kembali ke Materi"}
                  </button>
                </div>
              )}

              {/* Materi content */}
              {currentView === "materi" && (
                <div className="w-full p-5 sm:p-7">
                  <div className="mx-auto max-w-5xl">
                    <div className="mb-3">
                      <p className="text-sm font-semibold text-[#7054dc]">{selectedMaterialProgressPercent}% Progress</p>
                      <div className="mt-1 h-2 overflow-hidden rounded-full bg-[#e2dfee]">
                        <div
                          className="h-full rounded-full bg-[#7054dc] transition-all"
                          style={{ width: `${selectedMaterialProgressPercent}%` }}
                        />
                      </div>
                    </div>

                    {!isFinalSummaryView && selectedContentItem?.hasVideo && selectedContentItem.videoUrl && (
                      <div className="overflow-hidden rounded-2xl">
                        <video
                          src={selectedContentItem.videoUrl}
                          controls
                          playsInline
                          preload="metadata"
                          controlsList="nodownload noremoteplayback"
                          disablePictureInPicture
                          className="aspect-video w-full bg-black object-cover"
                        >
                          Browser kamu tidak mendukung video.
                        </video>
                      </div>
                    )}

                    <div className="mt-5 flex items-center justify-between gap-4">
                      <h2 className="text-3xl font-bold text-[#202126]">
                        {isFinalSummaryView ? "Rangkuman Akhir" : selectedContentItem?.title ?? "Materi"}
                      </h2>
                      {!isFinalSummaryView && selectedContentItem?.hasVideo && (
                        <button
                          type="button"
                          onClick={() => setIsDescriptionExpanded((prev) => !prev)}
                          className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-[#7054dc]"
                        >
                          {isDescriptionExpanded ? "Sembunyikan Deskripsi" : "Lihat Bahan Bacaan"}
                          <FaChevronDown className={isDescriptionExpanded ? "rotate-180" : ""} size={11} />
                        </button>
                      )}
                    </div>

                    <div className="mt-4">
                      {selectedContentItem?.type === "summary" && summaryHighlightText && (
                        <div className="mb-5 rounded-xl bg-[#f3dfc9] px-4 py-4 text-sm font-semibold leading-relaxed text-[#202126]">
                          {summaryHighlightText}
                        </div>
                      )}

                      {isFinalSummaryView ? (
                        <div className="mt-1 space-y-4 text-base leading-relaxed text-[#313644]">
                          <p>Rangkuman akhir dari seluruh materi yang telah kamu pelajari. Kamu telah menyelesaikan semua topik dalam modul ini. Selamat!</p>
                          {progress?.pretestScore != null && (
                            <p>Nilai Pre-Test kamu: <strong>{progress.pretestScore}/100</strong></p>
                          )}
                          {progress?.posttestScore != null && (
                            <p>Nilai Post-Test kamu: <strong>{progress.posttestScore}/100</strong></p>
                          )}
                        </div>
                      ) : selectedContentItem?.konten ? (
                        <div
                          className="mt-1 space-y-4 text-base leading-relaxed text-[#313644]"
                          dangerouslySetInnerHTML={{ __html: selectedContentItem.konten }}
                        />
                      ) : selectedContentItem?.type === "summary" ? (
                        <div className="mt-1 space-y-4 text-base leading-relaxed text-[#313644]">
                          <p>Rangkuman untuk topik ini merangkum konsep-konsep penting yang telah dipelajari.</p>
                        </div>
                      ) : (
                        <div className="mt-1 space-y-4 text-base leading-relaxed text-[#313644]">
                          <p>Konten materi akan ditampilkan di sini. Pilih submateri dari sidebar untuk memulai belajar.</p>
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
                        <p className="mt-4 text-2xl font-semibold text-[#8c92a0]">Penilaian berhasil dikirim!</p>
                      </div>
                    ) : (
                      <>
                        <h3 className="text-[34px] font-bold text-[#202126]">Gimana Pengalaman Belajarmu?</h3>
                        <p className="mt-2 text-sm text-[#5f6472]">
                          Berikan rating untuk modul ini agar kami bisa terus meningkatkan kualitas belajarmu.
                        </p>
                        <div className="mt-8 flex items-center justify-center gap-2">
                          {[1, 2, 3, 4, 5].map((value) => (
                            <button key={value} type="button" onClick={() => setSelectedRating(value)} className="p-1">
                              <FaStar size={34} className={value <= selectedRating ? "text-[#7054dc]" : "text-[#d1d4db]"} />
                            </button>
                          ))}
                        </div>
                        <div className="mt-8 text-left">
                          <p className="text-sm font-semibold text-[#202126]">Berikan Ulasan (Opsional)</p>
                          <textarea
                            value={reviewText}
                            onChange={(event) => setReviewText(event.target.value.slice(0, 200))}
                            placeholder="Bagikan kesanmu tentang materi ini ..."
                            className="mt-2 h-[150px] w-full resize-none rounded-xl border border-[#d8dbe3] px-4 py-3 text-sm text-[#202126] placeholder:text-[#a2a7b3] focus:border-[#7054dc] focus:outline-none"
                          />
                          <p className="mt-2 text-right text-xs text-[#8c92a0]">{reviewText.length}/200</p>
                        </div>
                        <button
                          type="button"
                          onClick={handleRatingSubmit}
                          disabled={selectedRating === 0 || isRatingSubmitting}
                          className={`mt-7 inline-flex min-w-[180px] items-center justify-center rounded-xl px-6 py-3 text-sm font-semibold text-white ${
                            selectedRating > 0 ? "bg-[#7054dc]" : "bg-[#a7acb5]"
                          }`}
                        >
                          {isRatingSubmitting ? "Mengirim..." : "Kirim Penilaian"}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Certificate */}
              {currentView === "certificate" && (
                <div className="m-auto w-full max-w-5xl">
                  {certificate ? (
                    <div className="rounded-2xl border border-[#e6e4ed] bg-white px-8 py-12 text-center">
                      <PiMedalFill size={80} className="mx-auto text-[#f39b39]" />
                      <h2 className="mt-4 text-2xl font-bold text-[#202126]">Sertifikat Kelulusan</h2>
                      <p className="mt-2 text-sm text-[#8a8a96]">
                        Kode: <span className="font-semibold text-[#7054dc]">{certificate.kode_sertif}</span>
                      </p>
                      <p className="text-sm text-[#8a8a96]">
                        Diterbitkan:{" "}
                        {new Date(certificate.issued_at).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                      {certificate.certificateUrl && (
                        <a
                          href={certificate.certificateUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#7054dc] px-6 py-3 text-sm font-semibold text-white hover:opacity-90"
                        >
                          Unduh Sertifikat
                        </a>
                      )}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-[#e6e4ed] bg-white px-8 py-12 text-center">
                      <PiMedalFill size={80} className="mx-auto text-[#d1d4db]" />
                      <h2 className="mt-4 text-2xl font-bold text-[#202126]">Sertifikat Belum Tersedia</h2>
                      <p className="mt-2 text-sm text-[#8a8a96]">
                        Selesaikan semua materi dan post-test untuk mendapatkan sertifikat.
                      </p>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>

          {/* Footer navigation */}
          {(currentView === "materi" || currentView === "pretest-quiz" || currentView === "pretest-result" || currentView === "rating" || currentView === "certificate") && (
            <div className="border-t border-[#e1e0e7] bg-white px-6 py-4">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleFooterPrevious}
                  disabled={
                    (currentView === "materi" && !isFinalSummaryView && selectedContentItemIndex === 0) ||
                    (currentView === "pretest-quiz" && activeQuestionIndex === 0)
                  }
                  className="inline-flex items-center gap-2 rounded-lg border border-[#e0dfe6] px-4 py-2 text-sm font-medium text-[#202126] hover:bg-[#f7f6ff] disabled:opacity-40"
                >
                  <MdArrowBack size={16} /> Sebelumnya
                </button>

                {currentView === "materi" && !isFinalSummaryView && (
                  <p className="text-xs text-[#8a8a96]">
                    {selectedContentItemIndex + 1} / {flatContentItems.length} materi
                  </p>
                )}

                <button
                  type="button"
                  onClick={handleFooterNext}
                  disabled={
                    currentView === "materi" &&
                    !isFinalSummaryView &&
                    selectedContentItemIndex === flatContentItems.length - 1
                  }
                  className="inline-flex items-center gap-2 rounded-lg bg-[#7054dc] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-40"
                >
                  Selanjutnya <MdArrowForward size={16} />
                </button>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
