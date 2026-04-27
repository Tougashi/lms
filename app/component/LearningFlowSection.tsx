import AnimateInView from "./AnimateInView";

const learningSteps = [
  {
    title: "Pre-Test",
    description: "Cari tahu sejauh mana kamu sudah paham sebelum mulai belajar.",
  },
  {
    title: "Materi Interaktif",
    description: "Tonton video seru atau baca bahan bacaan yang ringkas dan padat.",
  },
  {
    title: "Kuis & Post-Test",
    description: "Uji pemahamanmu dengan hasil nilai yang langsung keluar.",
  },
  {
    title: "Klaim Sertifikat",
    description: "Dapatkan apresiasi resmi setelah kamu berhasil menamatkan modul.",
  },
];

export default function LearningFlowSection() {
  return (
    <section className="w-full bg-[#f7f6ff] px-4 py-16 sm:px-7 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <AnimateInView>
            <h2 className="text-2xl font-bold text-[#1e2330] sm:text-3xl md:text-4xl">Alur Belajar Terstruktur</h2>
          </AnimateInView>
          <AnimateInView delay={0.08}>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-[#4e5664] sm:text-lg">
              Ikuti urutan materi interaktif yang sudah kami susun.
            </p>
          </AnimateInView>
        </div>

        <div className="relative mx-auto mt-12 max-w-4xl">
          <div className="absolute bottom-0 left-4 top-0 border-l border-dashed border-[#b6b1cd] md:left-1/2 md:-translate-x-1/2" />

          <div className="space-y-8">
            {learningSteps.map((step, index) => {
              const isLeft = index % 2 === 0;

              return (
                <AnimateInView key={step.title} delay={0.12 + index * 0.06}>
                  <article className="relative md:grid md:grid-cols-2">
                    <div
                      className={`pl-14 md:pl-0 ${
                        isLeft ? "md:col-start-1 md:pr-14 md:text-right" : "md:col-start-2 md:pl-14"
                      }`}
                    >
                      <h3 className="text-2xl font-semibold text-[#404553] sm:text-3xl">{step.title}</h3>
                      <p className="mt-3 text-base leading-relaxed text-[#4e5664] sm:text-lg md:text-xl">{step.description}</p>
                    </div>

                    <div className="absolute left-4 top-1 h-8 w-8 -translate-x-1/2 rounded-full bg-[#7054dc] text-center text-sm font-bold leading-8 text-white md:left-1/2">
                      {index + 1}
                    </div>
                  </article>
                </AnimateInView>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
