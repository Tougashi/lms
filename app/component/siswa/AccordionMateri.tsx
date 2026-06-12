"use client";

import { useState, useMemo } from "react";
import {
    FaChevronDown,
    FaChevronUp,
    FaFileAlt,
    FaCheck,
    FaLock,
} from "react-icons/fa";
import { MdPlayCircleFilled } from "react-icons/md";
import { PiMedalFill } from "react-icons/pi";
import { AnimatePresence, motion } from "framer-motion";
import type {
    TopikDetail,
    MateriDetail,
    QuizDetail,
} from "../../lib/types/siswa";

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
    const sorted = [...topik.topikItems].sort(
        (a, b) => a.orderNumber - b.orderNumber,
    );
    const items: OrderedItem[] = [];
    for (const ti of sorted) {
        if (ti.itemType === "ARTICLE") {
            const materi = topik.materis.find((m) => m.id === ti.itemId);
            if (materi) items.push({ type: "ARTICLE", data: materi });
        } else if (ti.itemType === "QUIZ") {
            const quiz = topik.materis
                .flatMap((m) => m.quizzes)
                .find((q) => q?.id === ti.itemId);
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

function truncate(text: string, max: number): string {
    if (text.length <= max) return text;
    return text.slice(0, max) + "...";
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

    const isItemCompleted = (itemId: string) =>
        completedContentItems.includes(itemId);

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
                            onClick={() =>
                                setOpenSection(isOpen ? "" : topik.id)
                            }
                            className={`flex w-full items-center justify-between px-4 py-4 text-left text-sm font-semibold ${
                                isOpen
                                    ? "bg-[#efebff] text-[#7054dc]"
                                    : "text-[#202126]"
                            }`}
                        >
                            {topik.nama}
                            {isOpen ? (
                                <FaChevronUp size={12} />
                            ) : (
                                <FaChevronDown size={12} />
                            )}
                        </button>

                        <AnimatePresence initial={false}>
                            {isOpen && (
                                <motion.div
                                    key="content"
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{
                                        duration: 0.2,
                                        ease: "easeInOut",
                                    }}
                                    className="overflow-hidden"
                                >
                                    <div className="space-y-1 border-t border-[#e7e4f2] px-4 py-3">
                                        {items.length === 0 && (
                                            <p className="py-2 text-sm text-[#8a8a96]">
                                                Belum ada materi untuk topik
                                                ini.
                                            </p>
                                        )}

                                        {items.map((item) => {
                                            if (item.type === "ARTICLE") {
                                                const materi = item.data;
                                                const isCompleted =
                                                    isItemCompleted(materi.id);
                                                return (
                                                    <div
                                                        key={materi.id}
                                                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-[#3f4454]"
                                                    >
                                                        {isCompleted ? (
                                                            <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#7054dc]">
                                                                <FaCheck
                                                                    size={9}
                                                                    className="text-white"
                                                                />
                                                            </span>
                                                        ) : (
                                                            <FaLock
                                                                size={10}
                                                                className="shrink-0 text-[#b8b6c4]"
                                                            />
                                                        )}
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
                                                        <span className="flex-1">
                                                            {materi.isVideo
                                                                ? "Materi Video"
                                                                : "Materi Teks"}
                                                            {materi.judul &&
                                                                ` - ${materi.judul}`}
                                                        </span>
                                                    </div>
                                                );
                                            }

                                            const quiz = item.data;
                                            const isCompleted =
                                                isItemCompleted(quiz.id);
                                            return (
                                                <div
                                                    key={quiz.id}
                                                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-[#3f4454]"
                                                >
                                                    {isCompleted ? (
                                                        <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#7054dc]">
                                                            <FaCheck
                                                                size={9}
                                                                className="text-white"
                                                            />
                                                        </span>
                                                    ) : (
                                                        <FaLock
                                                            size={10}
                                                            className="shrink-0 text-[#b8b6c4]"
                                                        />
                                                    )}
                                                    <PiMedalFill
                                                        size={16}
                                                        className="shrink-0 text-[#37b66a]"
                                                    />
                                                    <span className="flex-1">
                                                        Kuis Reguler -{" "}
                                                        {truncate(
                                                            quiz.question,
                                                            50,
                                                        )}
                                                    </span>
                                                </div>
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
