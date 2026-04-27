import Image from "next/image";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";
import AnimateInView from "./AnimateInView";

export default function Hero() {
  return (
    <section className="mx-auto flex min-h-auto w-full flex-col items-center justify-between bg-[#F1EFFC] px-4 pt-14 sm:px-7 md:pt-[72px] mt-16">
      <div className="w-full max-w-[790px] text-center">
        <AnimateInView>
          <h1 className="text-2xl font-bold leading-tight tracking-tight text-[#7054dc] sm:text-3xl md:text-5xl uppercase">
            <span className="bg-gradient-to-r from-[#7a55d7] via-[#be6785] to-[#e08d37] bg-clip-text text-transparent">
              Belajar Seru, Prestasi Maju,
            </span>
            <br />
            Masa Depan di Tanganmu!
          </h1>
        </AnimateInView>

        <AnimateInView delay={0.08}>
          <p className="mx-auto mt-6 w-full max-w-[340px] text-base leading-relaxed text-[#4e4e5d] sm:max-w-[520px] md:mt-8 md:max-w-[680px] md:text-lg lg:max-w-[900px] lg:text-xl">
            Satu platform interaktif untuk mendukung pembelajaran siswa SD, SMP,
            dan SMA. <br />Pilih kurikulum, tonton videonya, dan taklukkan setiap kuis.
          </p>
        </AnimateInView>

        <AnimateInView delay={0.14}>
          <a
            href="#"
            className="mx-auto mt-7 inline-flex items-center gap-2.5 rounded-[14px] bg-[#f39b39] px-6 py-3 text-sm font-bold text-white transition-transform hover:scale-[1.02] md:mt-10 md:text-base"
          >
            Mulai Belajar Sekarang
            <MdOutlineKeyboardArrowRight aria-hidden="true" className="text-lg" />
          </a>
        </AnimateInView>
      </div>

      <AnimateInView delay={0.2} className="flex w-full justify-center">
        <Image
          src="/assets/images/landing/Ilustrasi.png"
          alt="Ilustrasi pembelajaran"
          width={978}
          height={465}
          quality={100}
          sizes="(max-width: 1024px) 95vw, 978px"
          className="h-auto w-full max-w-[978px]"
          priority
        />
      </AnimateInView>
    </section>
  );
}