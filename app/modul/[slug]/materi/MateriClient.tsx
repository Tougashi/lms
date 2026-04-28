"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { FaBookOpen, FaCheck, FaChevronDown, FaFileAlt, FaLock, FaPlay, FaRegClock, FaStar, FaTimes } from "react-icons/fa";
import { MdArrowBack, MdArrowBackIosNew, MdArrowForward } from "react-icons/md";
import { PiMedalFill } from "react-icons/pi";
import SiswaHeader from "../../../component/siswa/SiswaHeader";
import { ModuleDetail } from "../../dummy";
import { ContentItem, getMateriConfigBySlug, PRETEST_DURATION_SECONDS } from "./dummy";

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
  const [currentView, setCurrentView] = useState<"pretest-intro" | "pretest-quiz" | "pretest-result" | "materi">(
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

  useEffect(() => {
    if (!isPretestStarted) return;
    if (isPretestFinished) return;
    if (remainingSeconds <= 0) return;

    const timer = setInterval(() => {
      setRemainingSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [isPretestFinished, isPretestStarted, remainingSeconds]);

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
  const isPretestView = currentView !== "materi";
  const isPretestActive = isPretestView && assessmentType === "pretest";
  const isPosttestActive = isPretestView && assessmentType === "posttest";
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

      <main className="grid h-[calc(100vh-76px)] min-h-[calc(100vh-76px)] grid-cols-1 lg:grid-cols-[320px_1fr]">
        <aside className="flex h-full flex-col overflow-hidden border-r border-[#e1e0e7] bg-white px-5 py-6">
          <h1 className="text-2xl font-bold text-[#202126]">Konten Kelas</h1>

          <div className="mt-5 min-h-0 space-y-2 overflow-y-auto pr-1">
            <button
              type="button"
              onClick={() => {
                setAssessmentType("pretest");
                setActiveQuizItemId(null);
                setIsMaterialMode(false);
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
                  disabled={!sectionUnlocked}
                  onClick={() =>
                    setExpandedSections((prev) => ({
                      ...prev,
                      [section.id]: !prev[section.id],
                    }))
                  }
                  className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm ${
                    sectionUnlocked ? "text-[#202126]" : "cursor-not-allowed text-[#8f95a3]"
                  }`}
                >
                  <span className="inline-flex items-center gap-2">
                    {!sectionUnlocked && <FaLock size={10} className="text-[#8f95a3]" />}
                    {sectionUnlocked && isSectionCompleted && (
                      <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#7054dc]">
                        <FaCheck size={9} className="text-white" />
                      </span>
                    )}
                    {section.title}
                  </span>
                  {sectionUnlocked ? (
                    <FaChevronDown
                      size={11}
                      className={`text-[#8f95a3] transition-transform ${expandedSections[section.id] ? "rotate-180" : ""}`}
                    />
                  ) : (
                    <FaLock size={11} className="text-[#8f95a3]" />
                  )}
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
                            if (item.type === "quiz") {
                              setAssessmentType("kuis");
                              setActiveQuizItemId(item.id);
                              setCurrentView("pretest-intro");
                              setIsMaterialMode(false);
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
                              <FaLock size={10} className="text-[#8f95a3]" />
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
              className={`flex w-full items-center gap-2 rounded-lg border border-[#dcdae3] bg-white px-3 py-2 text-sm ${
                hasUnlockedUntilSummary || materiConfig.summaryUnlocked ? "text-[#313643]" : "cursor-not-allowed text-[#8f95a3]"
              }`}
            >
              {hasUnlockedUntilSummary || materiConfig.summaryUnlocked ? (
                <FaBookOpen size={11} className="text-[#202126]" />
              ) : (
                <FaLock size={11} className="text-[#8f95a3]" />
              )}
              Rangkuman Akhir
            </button>
            <button
              type="button"
              onClick={() => {
                setAssessmentType("posttest");
                setActiveQuizItemId(null);
                setCurrentView("pretest-intro");
                setIsMaterialMode(false);
                setActiveQuestionIndex(0);
                setSelectedAnswers({});
                setRemainingSeconds(PRETEST_DURATION_SECONDS);
              }}
              className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                isPosttestActive ? "bg-[#efe9ff] text-[#7054dc]" : "border border-[#dcdae3] bg-white text-[#313643]"
              }`}
            >
              <FaFileAlt size={11} className={isPosttestActive ? "text-[#7054dc]" : "text-[#202126]"} />
              Post-Test
            </button>
            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-lg border border-[#dcdae3] bg-white px-3 py-2 text-sm text-[#313643]"
            >
              <FaStar size={11} />
              Beri Penilaian
            </button>
            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-lg border border-[#dcdae3] bg-white px-3 py-2 text-sm text-[#313643]"
            >
              <FaFileAlt size={11} />
              Lihat Sertifikat
            </button>
          </div>
        </aside>

        <section className="flex h-[calc(100vh-76px)] min-h-[calc(100vh-76px)] flex-col overflow-hidden">
          <div className={`flex-1 p-5 ${currentView === "materi" ? "overflow-y-auto" : "overflow-hidden"}`}>
            <div className="flex h-full min-h-[520px]">
              {currentView === "pretest-intro" ? (
                <div className="m-auto flex min-h-[620px] w-full max-w-4xl flex-col justify-center rounded-2xl border border-[#e6e4ed] bg-white px-6 py-10 text-center">
                  <Image
                    src="/assets/images/beranda-siswa/modul.png"
                    alt={`Ilustrasi pre-test ${moduleData.title}`}
                    width={220}
                    height={160}
                    className="mx-auto h-auto w-[220px]"
                  />
                  <p className="mx-auto mt-4 max-w-[420px] text-base text-[#676c7b]">
                    Kerjakan kuis untuk menguji pemahaman materi yang sudah dipelajari
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setIsPretestStarted(true);
                      setCurrentView("pretest-quiz");
                    }}
                    className="mt-6 inline-flex min-w-[240px] items-center justify-center rounded-xl bg-[#7054dc] px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
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
                    {selectedContentItem?.hasVideo && (
                      <div className="overflow-hidden rounded-2xl">
                        <img
                          src={selectedContentItem.videoUrl || materiConfig.videoUrl}
                          alt={`Video materi ${selectedContentItem.title}`}
                          className="aspect-video w-full object-cover"
                        />
                      </div>
                    )}
                    <div className="mt-5 flex items-center justify-between gap-4">
                      <h2 className="text-3xl font-bold text-[#202126]">
                        {selectedContentItem?.title || materiConfig.lessonTitle}
                      </h2>
                      {selectedContentItem?.hasVideo && (
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
                      {selectedContentItem?.hasVideo ? (
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
              ) : currentView === "pretest-result" ? (
                <div className="m-auto flex min-h-[620px] w-full max-w-5xl flex-col justify-center rounded-2xl border border-[#e6e4ed] bg-white px-6 py-10 text-center">
                  <Image
                    src="/assets/images/materi/selesai.png"
                    alt={`Ringkasan hasil pre-test ${moduleData.title}`}
                    width={180}
                    height={180}
                    className="mx-auto h-auto w-[180px]"
                  />
                  <h2 className="mt-4 text-2xl font-bold text-[#202126]">Selamat Kamu Telah Menyelesaikan Pre-Test</h2>

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

                  <p className="mx-auto mt-8 max-w-[730px] text-base leading-relaxed text-[#676c7b]">
                    {finalScore >= 75
                      ? "Nilai kamu sudah memenuhi batas minimal. Pertahankan dan lanjutkan ke materi berikutnya untuk memperkuat pemahamanmu!"
                      : "Nilai awal kamu di bawah batas nilai minimal. Pelajari dan pahami materi dengan baik untuk tingkatkan pemahaman kamu!"}
                  </p>
                </div>
              ) : (
                <div className="flex min-h-[620px] w-full flex-col rounded-2xl border border-[#e6e4ed] bg-white p-5 sm:p-7">
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
                        <p className="ml-4 inline-flex items-center gap-1 text-base font-bold text-[#7054dc]">
                          <FaRegClock size={16} />
                          00:{formatRemainingTime(remainingSeconds)}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 md:hidden">
                        <button
                          type="button"
                          onClick={() => setActiveQuestionIndex((prev) => Math.max(0, prev - 1))}
                          className={`text-lg font-semibold ${
                            canGoPrev ? "text-[#7054dc]" : "text-[#b8bcc9]"
                          }`}
                        >
                          <MdArrowBackIosNew size={16} />
                        </button>
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
                        <button
                          type="button"
                          onClick={() =>
                            setActiveQuestionIndex((prev) => Math.min(pretestQuestions.length - 1, prev + 1))
                          }
                          className={`text-lg font-semibold ${
                            canGoNext ? "text-[#7054dc]" : "text-[#b8bcc9]"
                          }`}
                        >
                          <MdArrowBackIosNew size={16} className="rotate-180" />
                        </button>
                      </div>

                      <div className="grid grid-cols-5 gap-2 md:hidden">
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
                      <p className="inline-flex items-center gap-1 pt-1 text-sm font-semibold text-[#7054dc] md:hidden">
                        <FaRegClock size={14} />
                        00:{formatRemainingTime(remainingSeconds)}
                      </p>
                    </div>
                  </div>

                  <div className="mx-auto mt-6 grid max-w-4xl gap-6 border-t border-[#e6e4ed] border-b border-[#e6e4ed] pb-6 pt-6 lg:grid-cols-[220px_1fr]">
                    <img
                      src={activeQuestion.imageUrl}
                      alt={`Ilustrasi soal ${activeQuestion.id}`}
                      width={220}
                      height={150}
                      className="rounded-md object-cover"
                    />

                    <div>
                      <p className="text-base leading-relaxed text-[#202126]">{activeQuestion.prompt}</p>
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
                            className={`mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full border ${
                              isSelected ? "border-white" : "border-[#989dac]"
                            }`}
                          >
                            {isSelected && <span className="h-2.5 w-2.5 rounded-full bg-white" />}
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
                  className="inline-flex items-center gap-2 rounded-xl bg-[#7054dc] px-4 py-2 text-sm font-semibold text-white"
                >
                  Selanjutnya
                  <MdArrowForward size={16} />
                </button>
              </div>
              {currentView !== "materi" ? (
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
