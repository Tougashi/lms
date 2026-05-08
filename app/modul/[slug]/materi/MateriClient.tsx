"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { FaBookOpen, FaCheck, FaChevronDown, FaFileAlt, FaLock, FaPlay, FaRegClock, FaStar, FaTimes } from "react-icons/fa";
import { MdArrowBack, MdArrowBackIosNew, MdArrowForward } from "react-icons/md";
import { PiMedalFill } from "react-icons/pi";
import SiswaHeader from "../../../component/siswa/SiswaHeader";
import { ModuleDetail } from "../../dummy";
import { ContentItem, getMateriConfigBySlug, PRETEST_DURATION_SECONDS } from "./dummy";
import CertificateView from "./CertificateView";

function formatRemainingTime(totalSeconds: number) {
  const safeValue = Math.max(0, totalSeconds);
  const minutes = Math.floor(safeValue / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (safeValue % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function renderReadingContent(fallbackParagraphs: string[], item?: ContentItem) {
  if (!item) {
    return fallbackParagraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>);
  }

  return (
    <>
      <h3 className="text-3xl font-bold text-[#202126]">Pengantar: {item.title}</h3>
      <p>
        Materi <strong>{item.title}</strong> membahas konsep inti secara runtut dari dasar hingga penerapan.
        Pembelajaran disusun bertahap agar kamu dapat memahami hubungan antar konsep tanpa harus menghafal terpisah.
        Setiap bagian menekankan alur logika, contoh kasus, serta poin penting yang sering keluar pada evaluasi.
      </p>

      <h4 className="pt-2 text-3xl font-bold text-[#202126]">Konsep Inti yang Dipelajari</h4>
      <p>
        Pada bagian ini, kamu akan fokus pada prinsip-prinsip utama yang menjadi fondasi pemahaman bab.
        Penjelasan dibuat sederhana namun tetap akurat agar mudah dipakai saat mengerjakan soal.
      </p>
      <ol className="list-decimal space-y-1 pl-5">
        <li>
          <strong>Definisi dan Ruang Lingkup:</strong> Memahami istilah, fungsi, dan konteks konsep dalam sistem
          biologi secara menyeluruh.
        </li>
        <li>
          <strong>Mekanisme Proses:</strong> Mengikuti urutan proses dari sebab ke akibat melalui contoh nyata dan
          visualisasi sederhana.
        </li>
        <li>
          <strong>Aplikasi pada Soal:</strong> Mengaitkan teori dengan bentuk soal analisis agar lebih siap untuk
          kuis dan evaluasi.
        </li>
      </ol>

      <h4 className="pt-2 text-3xl font-bold text-[#202126]">Rangkuman Poin Penting</h4>
      <p>
        Untuk memperkuat pemahaman, berikut poin-poin yang perlu kamu kuasai sebelum lanjut ke subbab berikutnya:
      </p>
      <ol className="list-decimal space-y-1 pl-5">
        <li>
          <strong>Konsep dasar:</strong> Istilah, struktur, dan fungsi utama harus dipahami terlebih dahulu.
        </li>
        <li>
          <strong>Hubungan antar komponen:</strong> Perubahan pada satu bagian dapat memengaruhi bagian lain dalam
          satu sistem.
        </li>
        <li>
          <strong>Strategi belajar:</strong> Baca ringkasan, ulang poin inti, lalu kerjakan kuis untuk cek pemahaman.
          <ul className="list-disc pl-5 pt-1">
            <li>Fokus pada kata kunci yang sering muncul di soal.</li>
            <li>Latih analisis sebab-akibat, bukan hanya hafalan.</li>
          </ul>
        </li>
      </ol>
    </>
  );
}

export default function MateriClient({ moduleData, slug }: { moduleData: ModuleDetail; slug: string }) {
  const materiConfig = useMemo(() => getMateriConfigBySlug(slug), [slug]);
  const pretestQuestions = materiConfig.pretestQuestions;
  const [assessmentType, setAssessmentType] = useState<"pretest" | "kuis" | "posttest">("pretest");
  const [activeQuizItemId, setActiveQuizItemId] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<
    "pretest-intro" | "pretest-quiz" | "pretest-result" | "materi" | "rating" | "certificate"
  >(
    materiConfig.pretestCompletedByDefault ? "materi" : "pretest-intro"
  );
  const [isPretestStarted, setIsPretestStarted] = useState(
    materiConfig.pretestCompletedByDefault ? true : false
  );
  const [isPretestFinished, setIsPretestFinished] = useState(materiConfig.pretestCompletedByDefault);
  const [finishedElapsedSeconds, setFinishedElapsedSeconds] = useState<number | null>(null);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [remainingSeconds, setRemainingSeconds] = useState(
    materiConfig.pretestCompletedByDefault ? 0 : PRETEST_DURATION_SECONDS
  );
  const [isMaterialMode, setIsMaterialMode] = useState(materiConfig.pretestCompletedByDefault);
  const [isFinalSummaryView, setIsFinalSummaryView] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(
    Object.fromEntries(materiConfig.contentTree.map((section) => [section.id, false]))
  );
  const [selectedContentItemId, setSelectedContentItemId] = useState(
    materiConfig.contentTree[0]?.items[0]?.id ?? ""
  );
  const [completedContentItemMap, setCompletedContentItemMap] = useState<Record<string, boolean>>(
    materiConfig.pretestCompletedByDefault
      ? Object.fromEntries(materiConfig.contentTree.flatMap((section) => section.items.map((item) => [item.id, true])))
      : {}
  );
  const [selectedRating, setSelectedRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [isRatingSubmitted, setIsRatingSubmitted] = useState(false);
  const [isModuleSidebarOpen, setIsModuleSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isPretestStarted) return;
    if (isPretestFinished) return;
    if (remainingSeconds <= 0) return;

    const timer = setInterval(() => {
      setRemainingSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [isPretestFinished, isPretestStarted, remainingSeconds]);

  useEffect(() => {
    const onToggleSidebar = () => {
      setIsModuleSidebarOpen((prev) => !prev);
    };

    window.addEventListener("toggle-module-sidebar", onToggleSidebar as EventListener);
    return () => window.removeEventListener("toggle-module-sidebar", onToggleSidebar as EventListener);
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

  const activeQuestion = pretestQuestions[activeQuestionIndex];
  const isLastQuestion = activeQuestionIndex === pretestQuestions.length - 1;
  const canGoPrev = activeQuestionIndex > 0;
  const canGoNext = activeQuestionIndex < pretestQuestions.length - 1;

  const answeredCount = useMemo(
    () => Object.keys(selectedAnswers).length,
    [selectedAnswers]
  );
  const totalCorrectAnswers = useMemo(
    () =>
      pretestQuestions.reduce((accumulator, question) => {
        const selectedAnswer = selectedAnswers[question.id];
        if (selectedAnswer === question.correctAnswerIndex) {
          return accumulator + 1;
        }
        return accumulator;
      }, 0),
    [selectedAnswers]
  );
  const totalWrongAnswers = answeredCount - totalCorrectAnswers;
  const finalScore = Math.round((totalCorrectAnswers / pretestQuestions.length) * 100);
  const elapsedSeconds = PRETEST_DURATION_SECONDS - remainingSeconds;
  const displayedElapsedSeconds = finishedElapsedSeconds ?? elapsedSeconds;
  const hasUnlockedUntilSummary = isMaterialMode || isPretestFinished || materiConfig.pretestCompletedByDefault;
  const isAssessmentView =
    currentView === "pretest-intro" || currentView === "pretest-quiz" || currentView === "pretest-result";
  const isPretestView = isAssessmentView;
  const isPretestActive = isPretestView && assessmentType === "pretest";
  const isPosttestActive = isPretestView && assessmentType === "posttest";
  const showAssessmentTimer = !(slug === "biologi" && assessmentType === "kuis");
  const showQuizCategory = slug === "biologi" && assessmentType === "kuis";
  const showAssessmentImage = assessmentType !== "kuis";
  const isFinalSummaryActive = currentView === "materi" && isFinalSummaryView;
  const isRatingView = currentView === "rating";
  const isCertificateView = currentView === "certificate";
  const selectedContentItem: ContentItem | undefined = useMemo(
    () => materiConfig.contentTree.flatMap((section) => section.items).find((item) => item.id === selectedContentItemId),
    [materiConfig.contentTree, selectedContentItemId]
  );
  const flatContentItems = useMemo(
    () => materiConfig.contentTree.flatMap((section) => section.items),
    [materiConfig.contentTree]
  );
  const selectedContentItemIndex = useMemo(
    () => flatContentItems.findIndex((item) => item.id === selectedContentItemId),
    [flatContentItems, selectedContentItemId]
  );
  const summaryItems = useMemo(() => flatContentItems.filter((item) => item.type === "summary"), [flatContentItems]);
  const finalSummaryParagraphs = useMemo(
    () => summaryItems.flatMap((item) => item.readingParagraphs).filter(Boolean),
    [summaryItems]
  );
  const showSummaryHighlight = isFinalSummaryView || selectedContentItem?.type === "summary";
  const summaryHighlightText = isFinalSummaryView
    ? "Rangkuman akhir ini merangkum seluruh poin penting dari semua bab yang telah dipelajari."
    : selectedContentItem?.readingParagraphs?.[0];
  const selectedMaterialProgressPercent = useMemo(() => {
    if (selectedContentItemIndex < 0 || flatContentItems.length === 0) return 0;
    return Math.round(((selectedContentItemIndex + 1) / flatContentItems.length) * 100);
  }, [flatContentItems.length, selectedContentItemIndex]);

  const handleFinishPretest = () => {
    if (answeredCount !== pretestQuestions.length) return;
    setFinishedElapsedSeconds(elapsedSeconds);
    if (assessmentType === "pretest") {
      setIsPretestFinished(true);
    }
    setCurrentView("pretest-result");
  };

  const markContentItemAsCompleted = (itemId: string) => {
    setCompletedContentItemMap((prev) => ({ ...prev, [itemId]: true }));
  };

  const handleFooterPrevious = () => {
    if (currentView === "certificate") {
      setCurrentView("materi");
      setIsMaterialMode(true);
      setIsFinalSummaryView(false);
      return;
    }
    if (currentView === "rating") {
      setCurrentView("materi");
      setIsMaterialMode(true);
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

    setActiveQuestionIndex((prev) => Math.min(pretestQuestions.length - 1, prev + 1));
  };

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
        <aside
          className={`${
            isModuleSidebarOpen ? "fixed left-0 top-[76px] bottom-0 z-50 flex w-[320px]" : "hidden"
          } h-full flex-col overflow-hidden border-r border-[#e1e0e7] bg-white px-5 py-6 lg:static lg:flex lg:w-auto`}
        >
          <h1 className="text-2xl font-bold text-[#202126]">Konten Kelas</h1>

          <div className="mt-5 min-h-0 space-y-2 overflow-y-auto pr-1">
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
              {isPretestFinished || materiConfig.pretestCompletedByDefault ? (
                <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#7054dc]">
                  <FaCheck size={9} className="text-white" />
                </span>
              ) : null}
              <FaFileAlt size={12} className={isPretestActive ? "text-[#7054dc]" : "text-[#202126]"} />
              Pre-Test
            </button>

            {materiConfig.contentTree.map((section, sectionIndex) => (
              <div key={section.id} className="overflow-hidden rounded-lg border border-[#dcdae3] bg-white">
                {(() => {
                  const sectionUnlocked = hasUnlockedUntilSummary || (materiConfig.sidebarSections[sectionIndex]?.unlocked ?? false);
                  const isSectionCompleted = section.items.every(
                    (item) => completedContentItemMap[item.id] || materiConfig.pretestCompletedByDefault
                  );
                  return (
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
                  );
                })()}

                {expandedSections[section.id] && (
                  <div className="border-t border-[#eceaf4] bg-white">
                    {section.items.map((item) => {
                      const isSelected = selectedContentItemId === item.id;
                      const sectionUnlocked =
                        hasUnlockedUntilSummary || (materiConfig.sidebarSections[sectionIndex]?.unlocked ?? false);
                      const isItemLocked = !sectionUnlocked;
                      const isItemCompleted = completedContentItemMap[item.id] || materiConfig.pretestCompletedByDefault;
                      const isQuizActive =
                        item.type === "quiz" && isPretestView && assessmentType === "kuis" && activeQuizItemId === item.id;
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
                              <span
                                className={`inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#7054dc] ${
                                  item.type === "quiz" ? "" : "mt-1.5"
                                }`}
                              >
                                <FaCheck size={8} className="text-white" />
                              </span>
                            ) : isItemLocked ? (
                              <FaLock size={10} className="mt-2 text-[#8f95a3]" />
                            ) : (
                              <span className="inline-flex h-4 w-4" />
                            )}
                            {item.hasVideo ? (
                              <FaPlay
                                size={9}
                                className={`mt-2 ${
                                  isItemLocked
                                    ? "text-[#8f95a3]"
                                    : isSelected || isQuizActive
                                      ? "text-[#7054dc]"
                                      : "text-[#202126]"
                                }`}
                              />
                            ) : (
                              item.type === "quiz" ? (
                                <span className="inline-flex h-4 w-4" />
                              ) : (
                                <FaBookOpen
                                  size={10}
                                  className={`mt-2 ${
                                    isItemLocked
                                      ? "text-[#8f95a3]"
                                      : isSelected || isQuizActive
                                        ? "text-[#7054dc]"
                                        : "text-[#202126]"
                                  }`}
                                />
                              )
                            )}
                            <span>
                              <span className="block">{item.title}</span>
                              {item.duration && (
                                <span
                                  className={`mt-0.5 block text-[10px] ${
                                    isItemLocked
                                      ? "text-[#8f95a3]"
                                      : isSelected || isQuizActive
                                        ? "text-[#7054dc]"
                                        : "text-[#202126]"
                                  }`}
                                >
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
            ))}

            <button
              type="button"
              disabled={!hasUnlockedUntilSummary && !materiConfig.summaryUnlocked}
              onClick={() => {
                if (!hasUnlockedUntilSummary && !materiConfig.summaryUnlocked) return;
                setIsModuleSidebarOpen(false);
                setCurrentView("materi");
                setIsMaterialMode(true);
                setIsFinalSummaryView(true);
                setAssessmentType("pretest");
                setActiveQuizItemId(null);
              }}
              className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                !(hasUnlockedUntilSummary || materiConfig.summaryUnlocked)
                  ? "cursor-not-allowed border border-[#dcdae3] bg-white text-[#8f95a3]"
                  : isFinalSummaryActive
                    ? "border border-[#e0d5ff] bg-[#efe9ff] text-[#7054dc]"
                    : "border border-[#dcdae3] bg-white text-[#313643]"
              }`}
            >
              {hasUnlockedUntilSummary || materiConfig.summaryUnlocked ? (
                <FaBookOpen size={11} className={isFinalSummaryActive ? "text-[#7054dc]" : "text-[#202126]"} />
              ) : (
                <FaLock size={11} className="text-[#8f95a3]" />
              )}
              Rangkuman Akhir
            </button>
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
            </button>
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
            <button
              type="button"
              onClick={() => {
                if (!hasUnlockedUntilSummary && !materiConfig.summaryUnlocked) return;
                setCurrentView("certificate");
                setIsMaterialMode(false);
                setIsFinalSummaryView(false);
                setActiveQuizItemId(null);
              }}
              disabled={!hasUnlockedUntilSummary && !materiConfig.summaryUnlocked}
              className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                !hasUnlockedUntilSummary && !materiConfig.summaryUnlocked
                  ? "cursor-not-allowed border border-[#dcdae3] bg-white text-[#8f95a3]"
                  : isCertificateView
                    ? "border border-[#e0d5ff] bg-[#efe9ff] text-[#7054dc]"
                    : "border border-[#dcdae3] bg-white text-[#313643]"
              }`}
            >
              {hasUnlockedUntilSummary || materiConfig.summaryUnlocked ? (
                <FaFileAlt size={11} className={isCertificateView ? "text-[#7054dc]" : "text-[#202126]"} />
              ) : (
                <FaLock size={11} className="text-[#8f95a3]" />
              )}
              Lihat Sertifikat
            </button>
          </div>
        </aside>

        <section className="flex h-[calc(100vh-76px)] min-h-[calc(100vh-76px)] flex-col overflow-hidden">
          <div
            className={`flex-1 p-5 ${currentView === "materi" ? "overflow-y-auto" : "overflow-y-auto"}`}
          >
            <div className="flex min-h-[520px] w-full">
              {currentView === "pretest-intro" ? (
                <div className="m-auto flex min-h-[580px] w-full max-w-4xl flex-col justify-center rounded-2xl border border-[#e6e4ed] bg-white px-6 py-10 text-center">
                  <Image
                    src="/assets/images/materi/selesai.png"
                    alt={`Ilustrasi pre-test ${moduleData.title}`}
                    width={220}
                    height={160}
                    className="mx-auto h-auto w-[220px]"
                  />
                  <p className="mx-auto mt-4 max-w-[320px] text-base text-[#676c7b]">
                    Kerjakan kuis untuk menguji pemahaman materi yang sudah dipelajari
                  </p>
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
                </div>
              ) : currentView === "materi" ? (
                <div className="w-full p-5 sm:p-7">
                  <div className="mx-auto max-w-5xl">
                    <div className="mb-3">
                      <p className="text-sm font-semibold text-[#7054dc]">{selectedMaterialProgressPercent}% Progress</p>
                      <div className="mt-1 h-2 overflow-hidden rounded-full bg-[#e2dfee]">
                        <div
                          className="h-full rounded-full bg-[#7054dc]"
                          style={{ width: `${selectedMaterialProgressPercent}%` }}
                        />
                      </div>
                    </div>
                    {!isFinalSummaryView && selectedContentItem?.hasVideo && (
                      <div className="overflow-hidden rounded-2xl">
                        <video
                          src="/assets/video/materi.mp4"
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
                        {isFinalSummaryView ? "Rangkuman Akhir" : selectedContentItem?.title || materiConfig.lessonTitle}
                      </h2>
                      {!isFinalSummaryView && selectedContentItem?.hasVideo && (
                        <button
                          type="button"
                          onClick={() => setIsDescriptionExpanded((prev) => !prev)}
                          className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-[#7054dc]"
                        >
                          {isDescriptionExpanded ? "Sembunyikan Deskripsi" : materiConfig.readingTitle}
                          <FaChevronDown className={isDescriptionExpanded ? "rotate-180" : ""} size={11} />
                        </button>
                      )}
                    </div>
                    <div className="mt-4 flex items-center gap-4 border-b border-[#e7e4ef] pb-4">
                      <img
                        src={`https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${encodeURIComponent(
                          moduleData.teacherAvatarSeed
                        )}`}
                        alt="Foto guru"
                        className="h-10 w-10 rounded-full border border-[#e8e5f2] bg-[#f3f1ff]"
                      />
                      <div className="text-sm text-[#5e6372]">
                        <p className="font-medium text-[#202126]">{moduleData.teacher}</p>
                        <p>{moduleData.teacherRole}</p>
                      </div>
                      <div className="ml-10 text-sm text-[#5e6372]">
                        <p>{materiConfig.lessonDuration}</p>
                      </div>
                      <div className="ml-8 text-sm text-[#5e6372]">
                        <p>{materiConfig.lessonDate}</p>
                      </div>
                    </div>
                    <div className="mt-4">
                      {showSummaryHighlight && summaryHighlightText && (
                        <div className="mb-5 rounded-xl bg-[#f3dfc9] px-4 py-4 text-sm font-semibold leading-relaxed text-[#202126]">
                          {summaryHighlightText}
                        </div>
                      )}
                      {isFinalSummaryView ? (
                        <div className="mt-1 space-y-4 text-base leading-relaxed text-[#313644]">
                          {finalSummaryParagraphs.map((paragraph, index) => (
                            <p key={`final-summary-${index}`}>{paragraph}</p>
                          ))}
                        </div>
                      ) : selectedContentItem?.hasVideo ? (
                        isDescriptionExpanded && (
                          <div className="space-y-4 text-base leading-relaxed text-[#313644]">
                            {renderReadingContent(materiConfig.readingParagraphs, selectedContentItem)}
                          </div>
                        )
                      ) : (
                        <div className="mt-1 space-y-4 text-base leading-relaxed text-[#313644]">
                          {renderReadingContent(materiConfig.readingParagraphs, selectedContentItem)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : currentView === "rating" ? (
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
                          onClick={() => {
                            if (selectedRating === 0) return;
                            setIsRatingSubmitted(true);
                          }}
                          className={`mt-7 inline-flex min-w-[180px] items-center justify-center rounded-xl px-6 py-3 text-sm font-semibold text-white ${
                            selectedRating > 0 ? "bg-[#7054dc]" : "bg-[#a7acb5]"
                          }`}
                        >
                          Kirim Penilaian
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ) : currentView === "certificate" ? (
                <CertificateView moduleData={moduleData} />
              ) : currentView === "pretest-result" ? (
                <div className="m-auto flex min-h-[580px] w-full max-w-5xl flex-col justify-center rounded-2xl border border-[#e6e4ed] bg-white px-6 py-10 text-center">
                  <Image
                    src="/assets/images/materi/selesai.png"
                    alt={`Ringkasan hasil pre-test ${moduleData.title}`}
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
                      <p className="mt-2 text-2xl font-bold text-[#202126]">{totalCorrectAnswers}</p>
                    </div>
                    <div>
                      <p className="inline-flex items-center gap-1 text-lg text-[#4f5565]">
                        Salah
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-[#e35f5f]/15 text-[#e35f5f]">
                          <FaTimes size={11} />
                        </span>
                      </p>
                      <p className="mt-2 text-2xl font-bold text-[#202126]">{totalWrongAnswers}</p>
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
                          <PiMedalFill size={13} />
                        </span>
                      </p>
                      <p className="mt-2 text-2xl font-bold text-[#7054dc]">{finalScore}/100</p>
                    </div>
                  </div>

                  <p className="mx-auto mt-8 max-w-[500px] text-base leading-relaxed text-[#676c7b]">
                    {finalScore >= 75
                      ? "Nilai kamu sudah memenuhi batas minimal. Pertahankan dan lanjutkan ke materi berikutnya untuk memperkuat pemahamanmu!"
                      : "Nilai awal kamu di bawah batas nilai minimal. Pelajari dan pahami materi dengan baik untuk tingkatkan pemahaman kamu!"}
                  </p>
                </div>
              ) : (
                <div className="flex min-h-[580px] w-full flex-col rounded-2xl border border-[#e6e4ed] bg-white p-5 sm:p-7">
                  <div className="flex flex-wrap items-start justify-between gap-8">
                    <h2 className="text-2xl font-bold text-[#202126]">
                      {assessmentType === "pretest" ? "Pre-Test" : assessmentType === "kuis" ? "Kuis" : "Post-Test"}
                    </h2>
                    <div className="flex flex-col items-end gap-4">
                      <div className="hidden items-center gap-4 md:flex">
                        <button
                          type="button"
                          onClick={() => setActiveQuestionIndex((prev) => Math.max(0, prev - 1))}
                          className={`text-lg font-semibold transition-colors ${
                            canGoPrev ? "text-[#7054dc]" : "text-[#b8bcc9]"
                          }`}
                        >
                          <MdArrowBackIosNew size={16} />
                        </button>
                        {pretestQuestions.map((question, index) => {
                          const isActive = index === activeQuestionIndex;
                          const isAnswered = selectedAnswers[question.id] !== undefined;
                          return (
                            <button
                              key={question.id}
                              type="button"
                              onClick={() => setActiveQuestionIndex(index)}
                              className={`inline-flex h-7 w-7 items-center justify-center rounded-full border text-xs font-medium ${
                                isActive
                                  ? "border-[#7054dc] bg-[#7054dc] text-white"
                                  : isAnswered
                                    ? "border-[#7054dc] bg-[#f0eaff] text-[#7054dc]"
                                    : "border-[#d6d4df] bg-white text-[#747988]"
                              }`}
                            >
                              {index + 1}
                            </button>
                          );
                        })}
                        <button
                          type="button"
                          onClick={() =>
                            setActiveQuestionIndex((prev) => Math.min(pretestQuestions.length - 1, prev + 1))
                          }
                          className={`text-lg font-semibold transition-colors ${
                            canGoNext ? "text-[#7054dc]" : "text-[#b8bcc9]"
                          }`}
                        >
                          <MdArrowBackIosNew size={16} className="rotate-180" />
                        </button>
                        {showAssessmentTimer && (
                          <p className="ml-4 inline-flex items-center gap-1 text-base font-bold text-[#7054dc]">
                            <FaRegClock size={16} />
                            00:{formatRemainingTime(remainingSeconds)}
                          </p>
                        )}
                      </div>

                      <div className="flex items-start gap-2 md:hidden">
                        <button
                          type="button"
                          onClick={() => setActiveQuestionIndex((prev) => Math.max(0, prev - 1))}
                          className={`pt-1 text-lg font-semibold ${
                            canGoPrev ? "text-[#7054dc]" : "text-[#b8bcc9]"
                          }`}
                        >
                          <MdArrowBackIosNew size={16} />
                        </button>

                        <div className="flex flex-col gap-2">
                          <div className="grid grid-cols-5 gap-2">
                            {pretestQuestions.slice(0, 5).map((question, localIndex) => {
                              const index = localIndex;
                              const isActive = index === activeQuestionIndex;
                              const isAnswered = selectedAnswers[question.id] !== undefined;
                              return (
                                <button
                                  key={question.id}
                                  type="button"
                                  onClick={() => setActiveQuestionIndex(index)}
                                  className={`inline-flex h-7 w-7 items-center justify-center rounded-full border text-xs font-medium ${
                                    isActive
                                      ? "border-[#7054dc] bg-[#7054dc] text-white"
                                      : isAnswered
                                        ? "border-[#7054dc] bg-[#f0eaff] text-[#7054dc]"
                                        : "border-[#d6d4df] bg-white text-[#747988]"
                                  }`}
                                >
                                  {index + 1}
                                </button>
                              );
                            })}
                          </div>

                          <div className="grid grid-cols-5 gap-2">
                            {pretestQuestions.slice(5, 10).map((question, localIndex) => {
                              const index = localIndex + 5;
                              const isActive = index === activeQuestionIndex;
                              const isAnswered = selectedAnswers[question.id] !== undefined;
                              return (
                                <button
                                  key={question.id}
                                  type="button"
                                  onClick={() => setActiveQuestionIndex(index)}
                                  className={`inline-flex h-7 w-7 items-center justify-center rounded-full border text-xs font-medium ${
                                    isActive
                                      ? "border-[#7054dc] bg-[#7054dc] text-white"
                                      : isAnswered
                                        ? "border-[#7054dc] bg-[#f0eaff] text-[#7054dc]"
                                        : "border-[#d6d4df] bg-white text-[#747988]"
                                  }`}
                                >
                                  {index + 1}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            setActiveQuestionIndex((prev) => Math.min(pretestQuestions.length - 1, prev + 1))
                          }
                          className={`pt-[46px] text-lg font-semibold ${
                            canGoNext ? "text-[#7054dc]" : "text-[#b8bcc9]"
                          }`}
                        >
                          <MdArrowBackIosNew size={16} className="rotate-180" />
                        </button>
                      </div>
                      {showAssessmentTimer && (
                        <p className="inline-flex items-center gap-1 pt-1 text-sm font-semibold text-[#7054dc] md:hidden">
                          <FaRegClock size={14} />
                          00:{formatRemainingTime(remainingSeconds)}
                        </p>
                      )}
                    </div>
                  </div>

                  <div
                    className={`mx-auto mt-6 grid max-w-4xl gap-6 border-t border-[#e6e4ed] border-b border-[#e6e4ed] pb-6 pt-6 ${
                      showAssessmentImage ? "lg:grid-cols-[220px_1fr]" : "lg:grid-cols-1"
                    } justify-items-center lg:justify-items-stretch`}
                  >
                    {showAssessmentImage && (
                      <img
                        src={activeQuestion.imageUrl}
                        alt={`Ilustrasi soal ${activeQuestion.id}`}
                        width={220}
                        height={150}
                        className="mx-auto rounded-md object-cover"
                      />
                    )}

                    <div className="w-full">
                      <p className="text-base leading-relaxed text-[#202126] text-center lg:text-left">
                        {activeQuestion.prompt}
                      </p>
                      {showQuizCategory && (
                        <div className="mt-5 border-t border-[#e6e4ed] pt-4">
                          <p className="text-sm font-semibold text-[#f39b39]">Soal Pemecahan Masalah</p>
                          <p className="mt-1 text-sm text-[#202126]">
                            Untuk memahami penyebab keruhnya air sungai secara menyeluruh, bagian manakah yang perlu kita
                            teliti secara terpisah?
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mx-auto mt-6 max-w-4xl space-y-4">
                    {activeQuestion.options.map((option, optionIndex) => {
                      const isSelected = selectedAnswers[activeQuestion.id] === optionIndex;
                      return (
                        <button
                          key={`${activeQuestion.id}-${optionIndex}`}
                          type="button"
                          onClick={() =>
                            setSelectedAnswers((prev) => ({
                              ...prev,
                              [activeQuestion.id]: optionIndex,
                            }))
                          }
                          className={`flex w-full items-start gap-3 rounded-2xl border px-5 py-4 text-left text-base font-medium transition-colors ${
                            isSelected
                              ? "border-[#7054dc] bg-[#7054dc] text-white"
                              : "border-[#d7d5df] bg-white text-[#202126] hover:border-[#bbb4da]"
                          }`}
                        >
                          <span
                            className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border aspect-square leading-none ${
                              isSelected ? "border-white" : "border-[#989dac]"
                            }`}
                          >
                            {isSelected && (
                              <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-white aspect-square" />
                            )}
                          </span>
                          <span>{String.fromCharCode(65 + optionIndex)}. {option}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          <footer className="border-t border-[#e1e0e7] bg-white px-5 py-4">
            <div className="flex items-center justify-between">
              <div />
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleFooterPrevious}
                  className="inline-flex items-center gap-2 rounded-xl border border-[#7054dc] bg-white px-4 py-2 text-sm font-medium text-[#7054dc]"
                >
                  <MdArrowBack size={16} />
                  Sebelumnya
                </button>
                <button
                  type="button"
                  onClick={handleFooterNext}
                  disabled={isRatingView && !isRatingSubmitted}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white ${
                    isRatingView && !isRatingSubmitted ? "cursor-not-allowed bg-[#a7acb5]" : "bg-[#7054dc]"
                  }`}
                >
                  Selanjutnya
                  <MdArrowForward size={16} />
                </button>
              </div>
              {currentView === "pretest-quiz" ? (
                <button
                  type="button"
                  onClick={handleFinishPretest}
                  className={`rounded-xl px-4 py-2 text-sm font-semibold text-white ${
                    isLastQuestion && answeredCount === pretestQuestions.length
                      ? "bg-[#f39b39]"
                      : "bg-[#f39b39]/65"
                  }`}
                >
                  Selesai
                </button>
              ) : (
                <div />
              )}
            </div>
          </footer>
        </section>
      </main>
    </div>
  );
}
