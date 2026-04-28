"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  FaBook,
  FaBookOpen,
  FaCalendarAlt,
  FaChartLine,
  FaCheck,
  FaClipboardCheck,
  FaChevronDown,
  FaChevronUp,
  FaFileAlt,
  FaListAlt,
  FaRegDotCircle,
  FaStar,
  FaUsers,
} from "react-icons/fa";
import { MdTimer } from "react-icons/md";
import SiswaHeader from "../../component/siswa/SiswaHeader";
import { ModuleDetail } from "../dummy";

function getAvatarUrl(seed: string) {
  return `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${encodeURIComponent(seed)}`;
}

export default function ModulDetailClient({ moduleData }: { moduleData: ModuleDetail }) {
  const [openSection, setOpenSection] = useState(moduleData.materialSections[0]?.id ?? "");
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const visibleParagraphs = isDescriptionExpanded
    ? moduleData.descriptionParagraphs
    : moduleData.descriptionParagraphs.slice(0, 1);

  return (
    <div className="min-h-screen bg-[#ffffff] text-[#202126]">
      <SiswaHeader />

      <main className="pb-12">
        <section className="rounded-b-[40px] bg-[#E7E1FE]">
          <div className="mx-auto max-w-7xl px-4 pb-24 pt-8 sm:px-6 sm:pb-28">
            <div className="flex flex-col gap-6 rounded-3xl bg-transparent lg:flex-row lg:items-start">
              <div className="mx-auto w-full max-w-[280px] shrink-0 rounded-2xl bg-white p-2 sm:p-3 lg:mx-0">
                <div className="overflow-hidden rounded-xl bg-white">
                  <div className="relative aspect-[16/10] w-full bg-white">
                    <Image
                      src={moduleData.image}
                      alt={`Ilustrasi mata pelajaran ${moduleData.title}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 280px"
                      priority
                    />
                  </div>
                </div>
              </div>

              <div className="flex-1">
                <h1 className="mb-8 mt-4 text-3xl font-bold text-[#202126]">{moduleData.title}</h1>

                <div className="mt-3 flex items-center gap-2 text-sm text-[#202126]">
                  <span className="inline-flex items-center gap-1 text-[#f2b445]">
                    <FaStar size={16} />
                    <FaStar size={16} />
                    <FaStar size={16} />
                    <FaStar size={16} />
                    <FaStar size={16} />
                  </span>
                  <span className="font-medium text-[#202126]">{moduleData.rating.toFixed(1)}</span>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-[#202126]">
                  <span className="inline-flex items-center gap-2">
                    <FaBookOpen size={16} className="text-[#7054dc]" />
                    {moduleData.totalTopics} Topik
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <FaListAlt size={16} className="text-[#7054dc]" />
                    {moduleData.totalMaterials} Materi
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <MdTimer size={16} className="text-[#7054dc]" />
                    {moduleData.durationLabel}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <FaClipboardCheck size={16} className="text-[#7054dc]" />
                    {moduleData.totalQuizzes} Kuis
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <FaBook size={16} className="text-[#7054dc]" />
                    {moduleData.completionLabel}
                  </span>
                  {moduleData.hasCertificate && (
                    <span className="inline-flex items-center gap-2">
                      <FaFileAlt size={16} className="text-[#7054dc]" />
                      Sertifikat
                    </span>
                  )}
                </div>

                <p className="mt-3 text-sm font-medium text-[#202126]">{moduleData.gradeLabel}</p>
              </div>
            </div>
          </div>
        </section>

        <div className="relative z-10 mx-auto -mt-14 max-w-7xl px-4 sm:px-6 sm:-mt-16">
          <div className="rounded-2xl border border-[#b6a8f0] bg-white p-4 sm:p-6">
            <div className="grid gap-5 lg:grid-cols-[1fr_270px]">
              <div>
                <h2 className="text-sm font-semibold text-[#202126]">Deskripsi</h2>
                <div className="mt-3 space-y-3">
                  {visibleParagraphs.map((paragraph, index) => (
                    <p key={`${moduleData.slug}-desc-${index}`} className="text-xs leading-relaxed text-[#4f5261] sm:text-sm">
                      {paragraph}
                    </p>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setIsDescriptionExpanded((prev) => !prev)}
                  className="mt-4 text-xs font-medium text-[#7054dc] hover:underline"
                >
                  {isDescriptionExpanded ? "Sembunyikan" : "Selengkapnya"}{" "}
                  {isDescriptionExpanded ? (
                    <FaChevronUp className="ml-1 inline" size={10} />
                  ) : (
                    <FaChevronDown className="ml-1 inline" size={10} />
                  )}
                </button>
              </div>

              <aside className="space-y-2.5 rounded-xl border border-[#efedf7] bg-[#fcfbff] p-3 sm:p-4">
                {moduleData.priceLabel ? (
                  <p className="w-full text-center text-4xl font-bold text-[#7054dc]">{moduleData.priceLabel}</p>
                ) : (
                  <p className="text-xs text-[#72758a]">{moduleData.accessNote}</p>
                )}
                {moduleData.priceLabel ? (
                  <Link
                    href={`/pembayaran/${moduleData.slug}`}
                    className="inline-flex w-full items-center justify-center rounded-lg bg-[#7054dc] px-3 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                  >
                    {moduleData.primaryActionLabel}
                  </Link>
                ) : moduleData.primaryActionLabel === 'Lanjutkan Belajar' ? (
                  <Link
                    href={`/modul/${moduleData.slug}/materi`}
                    className="inline-flex w-full items-center justify-center rounded-lg bg-[#7054dc] px-3 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                  >
                    {moduleData.primaryActionLabel}
                  </Link>
                ) : (
                  <button
                    type="button"
                    className="w-full rounded-lg bg-[#7054dc] px-3 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                  >
                    {moduleData.primaryActionLabel}
                  </button>
                )}
                <button
                  type="button"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[#7054dc] px-3 py-2.5 text-sm font-medium text-[#7054dc] transition-colors hover:bg-[#f6f2ff]"
                >
                  <FaUsers size={12} />
                  {moduleData.secondaryActionLabel}
                </button>
              </aside>
            </div>
          </div>
        </div>

        <section className="mx-auto mt-8 grid max-w-7xl gap-8 px-4 sm:mt-10 sm:px-6 lg:grid-cols-[1fr_290px]">
          <div>
            <h3 className="text-lg font-bold text-[#202126]">Yang Akan Kamu Pelajari</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {moduleData.learningOutcomes.map((item) => (
                <div key={item} className="flex gap-2 text-sm text-[#2f3340]">
                  <FaCheck className="mt-1 shrink-0 text-[11px] text-[#21212b]" />
                  <p className="leading-relaxed">{item}</p>
                </div>
              ))}
            </div>

            <h3 className="mt-7 text-lg font-bold text-[#202126]">Materi yang Dipelajari</h3>
            <div className="mt-4 space-y-3">
              {moduleData.materialSections.map((section) => {
                const isOpen = openSection === section.id;

                return (
                  <article key={section.id} className="overflow-hidden rounded-xl border border-[#dcdae6] bg-white">
                    <button
                      type="button"
                      onClick={() => setOpenSection(isOpen ? "" : section.id)}
                      className={`flex w-full items-center justify-between px-4 py-6 text-left text-sm font-semibold ${
                        isOpen ? "bg-[#efebff] text-[#7054dc]" : "text-[#202126]"
                      }`}
                    >
                      {section.title}
                      {isOpen ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
                    </button>

                    {isOpen && section.items.length > 0 && (
                      <div className="space-y-3 border-t border-[#e7e4f2] px-4 py-3">
                        {section.items.map((item) => (
                          <p key={item} className="flex items-center gap-2 text-sm text-[#3f4454]">
                            <FaRegDotCircle size={10} className="text-[#4f5364]" />
                            {item}
                          </p>
                        ))}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </div>

          <aside className="space-y-6">
            <div>
              <h4 className="text-lg font-bold text-[#202126]">Pengajar</h4>
              <div className="mt-3 flex items-start gap-3 text-sm text-[#3f4454]">
                <img
                  src={getAvatarUrl(moduleData.teacherAvatarSeed)}
                  alt="Foto profil pengajar"
                  className="h-10 w-10 rounded-full border border-[#e7e4f2] bg-[#f3f1ff] object-cover"
                />
                <p>
                  {moduleData.teacher}
                  <br />
                  <span className="font-bold">{moduleData.teacherRole}</span>
                </p>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-bold text-[#202126]">Terakhir Update</h4>
              <p className="mt-3 inline-flex items-center gap-2 text-sm text-[#3f4454]">
                <FaCalendarAlt className="text-[#f39b39]" />
                {moduleData.updatedAt}
              </p>
            </div>

            <div>
              <h4 className="text-lg font-bold text-[#202126]">Durasi Pembelajaran</h4>
              <p className="mt-3 inline-flex items-center gap-2 text-sm text-[#3f4454]">
                <FaBook className="text-[#f39b39]" />
                {moduleData.learningDuration}
              </p>
            </div>

            <div>
              <h4 className="text-lg font-bold text-[#202126]">Tingkat Kesulitan</h4>
              <p className="mt-3 inline-flex items-center gap-2 text-sm text-[#3f4454]">
                <FaChartLine className="text-[#f39b39]" />
                {moduleData.difficulty}
              </p>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}
