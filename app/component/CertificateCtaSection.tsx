import Image from "next/image";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";

export default function CertificateCtaSection() {
  return (
    <section className="w-full bg-[#f7f6ff] px-4 pb-0 pt-16 sm:px-7 lg:px-10">
      <div className="mx-auto max-w-5xl">
        <div className="overflow-hidden rounded-[28px] bg-[#2f2941] px-5 sm:px-8 lg:px-14">
          <div className="flex flex-col items-center gap-8 md:flex-row md:items-center md:justify-between md:gap-8">
            <div className="max-w-xl text-center md:w-[48%] md:text-left">
              <h2 className="text-2xl font-semibold leading-tight text-white sm:text-3xl">
                Siap Jadi Juara di Kelasmu?
              </h2>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-white/85 sm:text-base lg:text-lg">
                Apapun jenjang sekolahmu, kami punya ruang belajar yang pas untukmu.
              </p>

              <a
                href="#"
                className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-[#f39b39] px-5 py-3 text-sm font-semibold text-white transition-transform hover:scale-[1.02]"
              >
                Gabung Sekarang
                <MdOutlineKeyboardArrowRight aria-hidden="true" className="text-lg" />
              </a>
            </div>

            <div className="flex w-full justify-center md:w-[52%] md:justify-end">
              <Image
                src="/assets/images/landing/certification.png"
                alt="Ilustrasi sertifikat"
                width={560}
                height={386}
                className="h-auto w-full max-w-[500px] md:max-w-[560px]"
                priority
              />
            </div>
          </div>
        </div>
      </div>

      <footer className="mt-16 -mx-4 w-[calc(100%+2rem)] bg-[#2f2941] px-4 py-6 text-center text-sm font-medium text-white/80 sm:-mx-7 sm:w-[calc(100%+3.5rem)] sm:px-7 lg:-mx-10 lg:w-[calc(100%+5rem)] lg:px-10">
        Copyright NAMA WEB 2026
      </footer>
    </section>
  );
}
