import Image from "next/image";
import { BiSolidQuoteAltLeft } from "react-icons/bi";

import Header from "../component/Header";

export default function TentangKamiPage() {
  return (
    <div className="min-h-screen bg-[#f7f6ff]">
      <Header />

      <main className="pt-[80px]">
        <section className="w-full bg-gradient-to-r from-[#f9e8de] to-[#dce6ff] px-4 pb-24 pt-16 sm:px-7 lg:px-10">
          <div className="mx-auto max-w-6xl">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-[#7054dc] sm:text-5xl">Tentang Kami</h1>
              <p className="mx-auto mt-6 max-w-4xl text-lg leading-relaxed text-[#444c5f]">
                Sebuah platform manajemen modul yang dirancang untuk membantu pengajar mengelola
                materi dan memantau perkembangan siswa secara lebih efisien dan terukur.
              </p>
            </div>

            <article className="mt-14 rounded-[28px] bg-white p-8 shadow-[0_1px_0_rgba(255,255,255,0.8)] sm:p-10 lg:p-12">
              <div className="flex items-start gap-3 text-[#7054dc]">
                <BiSolidQuoteAltLeft aria-hidden="true" className="mt-1 text-4xl" />
                <h2 className="text-3xl font-bold leading-tight text-[#202532] sm:text-4xl">
                  Membangun Ekosistem Belajar yang Lebih Baik
                </h2>
              </div>

              <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">
                <div className="w-full lg:w-[36%]">
                  <Image
                    src="/assets/images/about-us/illustration.png"
                    alt="Ilustrasi tentang kami"
                    width={420}
                    height={382}
                    className="h-auto w-full rounded-2xl"
                    priority
                  />
                </div>

                <div className="w-full space-y-5 lg:w-[64%]">
                  <p className="text-lg leading-relaxed text-[#4a5160]">
                    Platform ini berawal dari kebutuhan akan sistem manajemen pembelajaran yang
                    praktis dan mudah dipahami. Kami melihat tantangan besar bagi pengajar dalam
                    memantau progres individu siswa di tengah padatnya kurikulum.
                  </p>
                  <p className="text-lg leading-relaxed text-[#4a5160]">
                    Melalui pengembangan ini, kami fokus menciptakan tools yang tidak hanya
                    berfungsi sebagai penyimpanan materi, tetapi juga sebagai alat analisis untuk
                    memberikan dukungan belajar (intervensi) yang tepat bagi setiap siswa.
                  </p>
                </div>
              </div>
            </article>
          </div>
        </section>

        <footer className="w-full bg-[#2f2941] py-6 text-center text-sm font-medium text-white/80">
          Copyright NAMA WEB 2026
        </footer>
      </main>
    </div>
  );
}
