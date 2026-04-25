"use client";

import Image from "next/image";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";
import { useRef, useState } from "react";

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
    <section className="w-full overflow-hidden bg-[#f7f6ff] py-20">
      <div className="mx-auto max-w-6xl px-4 text-center sm:px-7 lg:px-10">
        <h2 className="text-2xl font-bold text-[#1e2330] sm:text-3xl">Jelajahi Modul Terpopuler Hari Ini</h2>
        <p className="mx-auto mt-4 max-w-3xl text-base leading-relaxed text-[#4e5664] md:text-lg">
          Jangan sampai ketinggalan! Akses materi belajar yang paling banyak dicari dan jadilah
          yang terdepan di kelasmu dengan modul-modul interaktif kami.
        </p>
      </div>

      <div
        ref={sliderRef}
        onScroll={updateActiveByScroll}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className={`mt-10 flex gap-5 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden ${
          isDragging ? "select-none" : ""
        } sm:px-7 lg:px-10 ${
          isDragging ? "cursor-grabbing" : "cursor-grab"
        }`}
      >
        {modules.map((item) => (
          <article
            key={item.title}
            className="min-w-[350px] rounded-2xl border border-[#d6d3e4] bg-[#ffffff] p-4 sm:min-w-[430px] sm:p-5 md:min-w-[520px]"
          >
            <div className="flex items-center gap-4">
              <Image
                src={item.image}
                alt={item.title}
                width={90}
                height={90}
                className="h-20 w-20 rounded-lg object-cover sm:h-[88px] sm:w-[88px]"
              />

              <div className="flex-1 text-left">
                <h3 className="text-xl font-bold text-[#1f2432]">{item.title}</h3>
                <p className="mt-1 text-sm text-[#4e5664]">Kelas 11 Kurikulum Merdeka</p>
                <p className="text-sm text-[#4e5664]">4 Topik | 15 Materi | 6 Bulan</p>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <p className="text-sm text-[#1f2432]">{item.teacher}</p>
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
        ))}
      </div>

      <div className="mt-4 flex justify-center gap-3">
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

      <div className="mt-10 flex justify-center px-4">
        <a
          href="#"
          className="inline-flex items-center rounded-xl bg-[#7054dc] px-6 py-3 text-sm font-semibold text-white"
        >
          Jelajahi Semua Modul
        </a>
      </div>
    </section>
  );
}
