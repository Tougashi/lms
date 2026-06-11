"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import {
  FaChevronDown,
  FaChevronUp,
  FaFileAlt,
  FaCheck,
  FaBullseye,
} from "react-icons/fa";
import { MdPlayCircleFilled } from "react-icons/md";
import { AnimatePresence, motion } from "framer-motion";
import type { TopikDetail, MateriDetail, QuizDetail } from "../../lib/types/siswa";

type OrderedItem =
  | { type: "ARTICLE"; data: MateriDetail }
  | { type: "QUIZ"; data: QuizDetail };

interface AccordionMateriProps {
  topiks: TopikDetail[];
  completedSubmateri?: string[];
  completedContentItems?: string[];
  modulId: string;
}

function buildOrderedItems(topik: TopikDetail): OrderedItem[] {
  const sorted = [...topik.topikItems].sort((a, b) => a.orderNumber - b.orderNumber);
  const items: OrderedItem[] = [];
  for (const ti of sorted) {
    if (ti.itemType === "ARTICLE") {
      const materi = topik.materis.find((m) => m.id === ti.itemId);
      if (materi) items.push({ type: "ARTICLE", data: materi });
    } else if (ti.itemType === "QUIZ") {
      const quiz = topik.materis.flatMap((m) => m.quizzes).find((q) => q?.id === ti.itemId);
      if (quiz) items.push({ type: "QUIZ", data: quiz });
    }
  }
  const usedItemIds = new Set(sorted.map((ti) => ti.itemId));
  for (const materi of topik.materis) {
    if (!usedItemIds.has(materi.id)) {
      items.push({ type: "ARTICLE", data: materi });
    }
  }
  return items;
}

export default function AccordionMateri({
  topiks,
  completedSubmateri = [],
  completedContentItems = [],
  modulId,
}: AccordionMateriProps) {
  const [openSection, setOpenSection] = useState<string>(
    topiks.length > 0 ? topiks[0].id : "",
  );

  const orderedMap = useMemo(() => {
    const map = new Map<string, OrderedItem[]>();
    for (const t of topiks) {
      map.set(t.id, buildOrderedItems(t));
    }
    return map;
  }, [topiks]);

  const isSubCompleted = (subId: string) => completedSubmateri.includes(subId);
  const isQuizCompleted = (quizId: string) => completedContentItems.includes(quizId);

  return (
    <div className="space-y-3">
      {topiks.map((topik) => {
        const isOpen = openSection === topik.id;
        const items = orderedMap.get(topik.id) ?? [];
        return (
          <article
            key={topik.id}
            className="overflow-hidden rounded-xl border border-[#dcdae6] bg-white"
          >
            <button
              type="button"
              onClick={() => setOpenSection(isOpen ? "" : topik.id)}
              className={`flex w-full items-center justify-between px-4 py-4 text-left text-sm font-semibold ${
                isOpen ? "bg-[#efebff] text-[#7054dc]" : "text-[#202126]"
              }`}
            >
              {topik.nama}
              {isOpen ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  key="content"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="space-y-3 border-t border-[#e7e4f2] px-4 py-3">
                    {items.length === 0 && (
                      <p className="py-2 text-sm text-[#8a8a96]">
                        Belum ada materi untuk topik ini.
                      </p>
                    )}

                    {items.map((item) => {
                      if (item.type === "ARTICLE") {
                        const materi = item.data;
                        return (
                          <div key={materi.id}>
                            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-[#202126]">
                              {materi.isVideo ? (
                                <MdPlayCircleFilled
                                  size={16}
                                  className="shrink-0 text-[#f39b39]"
                                />
                              ) : (
                                <FaFileAlt
                                  size={14}
                                  className="shrink-0 text-[#7054dc]"
                                />
                              )}
                              {materi.isVideo ? "Video" : "Artikel"}
                            </div>

                            {materi.submateris.length > 0 && (
                              <div className="ml-6 space-y-2">
                                {materi.submateris.map((sub) => (
                                  <Link
                                    key={sub.id}
                                    href={`/modul/${modulId}/materi`}
                                    className="group flex items-center gap-2 text-sm text-[#3f4454] transition-colors hover:text-[#7054dc]"
                                  >
                                    <span className="flex-1">{sub.judul}</span>
                                    {isSubCompleted(sub.id) && (
                                      <FaCheck
                                        size={12}
                                        className="shrink-0 text-[#37b66a]"
                                      />
                                    )}
                                  </Link>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      }

                      const quiz = item.data;
                      return (
                        <Link
                          key={quiz.id}
                          href={`/modul/${modulId}/materi`}
                          className="group flex items-center gap-2 text-sm text-[#3f4454] transition-colors hover:text-[#7054dc]"
                        >
                          <FaBullseye
                            size={14}
                            className="shrink-0 text-[#37b66a]"
                          />
                          <span className="flex-1">
                            Quiz:{" "}
                            {quiz.question.length > 60
                              ? quiz.question.slice(0, 60) + "..."
                              : quiz.question}
                          </span>
                          {isQuizCompleted(quiz.id) && (
                            <FaCheck
                              size={12}
                              className="shrink-0 text-[#37b66a]"
                            />
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </article>
        );
      })}
    </div>
  );
}
