"use client";

import Image from "next/image";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";
import { useRef, useState } from "react";
import AnimateInView from "./AnimateInView";

type ModuleItem = {
  title: string;
  image: string;
  teacher: string;
};

const modules: ModuleItem[] = [
  {
    title: "Kimia",
    image: "/assets/images/landing/kimia.png",
    teacher: "Dewi Kartika, S.Si., M.Pd.",
  },
  {
    title: "Informatika",
    image: "/assets/images/landing/informatika.png",
    teacher: "Rizky Ramadhan, S.Kom., M.Kom.",
  },
  {
    title: "Matematika",
    image: "/assets/images/landing/matematika.png",
    teacher: "Nur Aisyah, S.Pd., M.Pd.",
  },
  {
    title: "Sosiologi",
    image: "/assets/images/landing/sosiologi.png",
    teacher: "Bagas Pratama, S.Sos., M.Si.",
  },
];

export default function PopularModulesSection() {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragState = useRef({
    pointerDown: false,
    startX: 0,
    startScrollLeft: 0,
  });

  const updateActiveByScroll = () => {
    const slider = sliderRef.current;
    if (!slider) return;

    const maxScroll = slider.scrollWidth - slider.clientWidth;
    if (maxScroll <= 0) {
      setActiveIndex(0);
      return;
    }

    const ratio = slider.scrollLeft / maxScroll;
    const index = Math.round(ratio * (modules.length - 1));
    setActiveIndex(index);
  };

  const scrollToCard = (index: number) => {
    const slider = sliderRef.current;
    if (!slider) return;

    const maxScroll = slider.scrollWidth - slider.clientWidth;
    if (maxScroll <= 0) return;

    const targetLeft = (index / (modules.length - 1)) * maxScroll;

    slider.scrollTo({
      left: targetLeft,
      behavior: "smooth",
    });
    setActiveIndex(index);
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const slider = sliderRef.current;
    if (!slider) return;

    dragState.current.pointerDown = true;
    dragState.current.startX = event.clientX;
    dragState.current.startScrollLeft = slider.scrollLeft;
    setIsDragging(true);

    slider.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const slider = sliderRef.current;
    if (!slider || !dragState.current.pointerDown) return;

    const deltaX = event.clientX - dragState.current.startX;
    slider.scrollLeft = dragState.current.startScrollLeft - deltaX;
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    const slider = sliderRef.current;
    if (!slider) return;

    dragState.current.pointerDown = false;
    setIsDragging(false);
    if (slider.hasPointerCapture(event.pointerId)) {
      slider.releasePointerCapture(event.pointerId);
    }
    updateActiveByScroll();
  };

  return (
    <section className="w-full overflow-hidden bg-[#f7f6ff] py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 text-center sm:px-7 lg:px-10">
        <AnimateInView>
          <h2 className="text-2xl font-bold leading-tight text-[#1e2330] sm:text-3xl">Jelajahi Modul Terpopuler Hari Ini</h2>
        </AnimateInView>
        <AnimateInView delay={0.08}>
          <p className="mx-auto mt-4 max-w-3xl text-sm leading-relaxed text-[#4e5664] sm:text-base md:text-lg">
            Jangan sampai ketinggalan! Akses materi belajar yang paling banyak dicari dan jadilah
            yang terdepan di kelasmu dengan modul-modul interaktif kami.
          </p>
        </AnimateInView>
      </div>

      <div
        ref={sliderRef}
        onScroll={updateActiveByScroll}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className={`mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-[5vw] pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden ${
          isDragging ? "select-none" : ""
        } sm:mt-10 sm:gap-5 sm:px-7 lg:px-10 ${
          isDragging ? "cursor-grabbing" : "cursor-grab"
        } touch-pan-y`}
      >
        {modules.map((item, index) => (
          <AnimateInView key={item.title} delay={0.1 + index * 0.06} className="shrink-0 snap-center">
            <article className="w-[90vw] rounded-2xl border border-[#d6d3e4] bg-[#ffffff] p-4 sm:w-[430px] sm:p-5 md:w-[520px]">
              <div className="flex items-center gap-3 sm:gap-4">
                <Image
                  src={item.image}
                  alt={item.title}
                  width={90}
                  height={90}
                  className="h-20 w-20 shrink-0 rounded-lg object-cover sm:h-[88px] sm:w-[88px]"
                />

                <div className="flex-1 text-left">
                  <h3 className="text-lg font-bold text-[#1f2432] sm:text-xl">{item.title}</h3>
                  <p className="mt-1 text-xs text-[#4e5664] sm:text-sm">Kelas 11 Kurikulum Merdeka</p>
                  <p className="text-xs text-[#4e5664] sm:text-sm">4 Topik | 15 Materi | 6 Bulan</p>
                  <div className="mt-3 flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                    <p className="text-xs text-[#1f2432] sm:text-sm">{item.teacher}</p>
                    <a
                      href="#"
                      className="inline-flex shrink-0 items-center gap-0.5 text-xs font-medium text-[#f39b39] sm:text-sm"
                    >
                      Lihat Lebih Lanjut <MdOutlineKeyboardArrowRight className="text-base" />
                    </a>
                  </div>
                </div>
              </div>
            </article>
          </AnimateInView>
        ))}
      </div>

      <AnimateInView delay={0.14}>
        <div className="mt-4 flex justify-center gap-2.5 sm:gap-3">
          {modules.map((item, index) => (
            <button
              key={item.title}
              type="button"
              onClick={() => scrollToCard(index)}
              aria-label={`Lihat slide ${index + 1}`}
              className={`h-2.5 w-2.5 rounded-full transition-colors ${
                activeIndex === index ? "bg-[#f39b39]" : "bg-[#d1cedf]"
              }`}
            />
          ))}
        </div>
      </AnimateInView>

      <AnimateInView delay={0.18}>
        <div className="mt-8 flex justify-center px-4 sm:mt-10">
          <a
            href="#"
            className="inline-flex items-center rounded-xl bg-[#7054dc] px-5 py-3 text-sm font-semibold text-white sm:px-6"
          >
            Jelajahi Semua Modul
          </a>
        </div>
      </AnimateInView>
    </section>
  );
}
