
import {FaBookReader, FaChartPie, FaPlayCircle} from "react-icons/fa";
const features = [
  {
    title: "Kurikulum Adaptif",
    description: "Materi disusun sistematis sehingga belajar jadi lebih terarah.",
    icon: FaBookReader,
  },
  {
    title: "Modul Interaktif",
    description: "Nikmati konten video seru dan bahan bacaan ringkas bikin kamu cepat paham.",
    icon: FaPlayCircle,
  },
  {
    title: "Dashboard Progres",
    description: "Lihat sejauh mana kamu melangkah melalui grafik progres aktivitas belajar.",
    icon: FaChartPie,
  },
];

export default function FeatureSection() {
  return (
    <section className="w-full bg-[#f7f6ff] px-4 py-16 sm:px-7 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#1e2330] sm:text-3xl md:text-4xl">
            Belajar Lebih Cerdas dengan Fitur Terdepan
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-base leading-relaxed text-[#4e5664] sm:text-lg">
            Nikmati ekosistem belajar yang dirancang khusus untuk membantumu memahami materi
            lebih cepat dan lebih seru!
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <article
                key={feature.title}
                className="rounded-2xl border border-[#d8d5e8] bg-transparent px-5 py-6 sm:px-6 sm:py-7"
              >
                <Icon aria-hidden="true" className="text-4xl text-[#7054dc] sm:text-5xl" />
                <h3 className="mt-4 text-2xl font-bold text-[#212634] sm:text-3xl">{feature.title}</h3>
                <p className="mt-3 text-base leading-relaxed text-[#434d5c]">{feature.description}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
