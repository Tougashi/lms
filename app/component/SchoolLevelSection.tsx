import Image from "next/image";

const levels = [
  {
    title: "SD",
    description: "Mulai langkah pertamamu dengan menyenangkan.",
    icon: "/assets/images/landing/Line.png",
    iconAlt: "Ikon SD",
    cardClass: "bg-[#f2d6b6]",
  },
  {
    title: "SMP",
    description: "Masuki dunia baru dan temukan jawaban dari rasa penasaranmu.",
    icon: "/assets/images/landing/Microscope.png",
    iconAlt: "Ikon SMP",
    cardClass: "bg-[#b8d9e4]",
  },
  {
    title: "SMA/SMK",
    description: "Akses materi mendalam untuk persiapan ujian dan jenjang kuliah.",
    icon: "/assets/images/landing/graduation.png",
    iconAlt: "Ikon SMA/SMK",
    cardClass: "bg-[#c9c0eb]",
  },
];

export default function SchoolLevelSection() {
  return (
    <section className="w-full bg-[#f7f6ff] px-4 py-16 sm:px-7 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#1e2330] sm:text-3xl md:text-4xl">Untuk Semua Jenjang Sekolah</h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-[#4e5664] sm:text-lg">
            Kami menyediakan materi yang telah disesuaikan dengan kurikulum nasional untuk
            membantumu belajar lebih efektif.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {levels.map((level) => (
            <article key={level.title} className={`rounded-2xl px-5 py-6 sm:px-6 sm:py-7 ${level.cardClass}`}>
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white ring-1 ring-[#f0a94c]">
                  <Image
                    src={level.icon}
                    alt={level.iconAlt}
                    width={28}
                    height={28}
                    className="h-7 w-7 object-contain"
                  />
                </div>
                <h3 className="text-2xl font-bold text-[#1f2432] sm:text-3xl">{level.title}</h3>
              </div>

              <p className="mt-5 text-base leading-relaxed text-[#434d5c] sm:mt-6 sm:text-lg md:text-xl">{level.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
