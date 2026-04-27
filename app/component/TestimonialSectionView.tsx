import { BiSolidQuoteAltLeft } from "react-icons/bi";
import { FaStar } from "react-icons/fa6";
import AnimateInView from "./AnimateInView";

type Testimonial = {
  name: string;
  quote: string;
  avatarSeed: string;
};

const testimonials: Testimonial[] = [
  {
    name: "Rodrigo",
    quote:
      "Videonya gampang banget aku ngerti, jadi aku lebih semangat buat belajar karena tampilannya visual!",
    avatarSeed: "rodrigo",
  },
  {
    name: "Jonathan Putra",
    quote:
      "Gak nyangka belajar materi SMA juga bisa sesimpel ini. Bahasanya mengalir banget dan nggak kaku.",
    avatarSeed: "jonathan-putra",
  },
  {
    name: "Anisa Putri",
    quote:
      "Awalnya aku iseng nyoba, eh malah ketagihan. Belajar di sini kerasa ringan karena aku bisa atur waktu sendiri.",
    avatarSeed: "anisa-putri",
  },
  {
    name: "Raka Pratama",
    quote:
      "Materinya padat tapi tetap nyaman diikuti. Aku jadi lebih paham alurnya dan tidak bingung saat belajar mandiri.",
    avatarSeed: "raka-pratama",
  },
  {
    name: "Nica Jesselyn",
    quote:
      "Aku ngerasa progres belajarku jadi lebih teratur semenjak pakai modul ini. Dari yang awalnya bingung, sekarang lebih paham urutannya.",
    avatarSeed: "nica-jesselyn",
  },
  {
    name: "Daffa Thomas",
    quote:
      "Aku paling terbantu sama fitur kuis otomatisnya, jadi aku nggak perlu nunggu lama buat tahu salahnya di mana.",
    avatarSeed: "daffa-thomas",
  },
];

function getAvatarUrl(seed: string) {
  return `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${encodeURIComponent(seed)}`;
}

function MarqueeRow({
  items,
  direction,
}: {
  items: Testimonial[];
  direction: "left" | "right";
}) {
  const duplicatedItems = [...items, ...items];

  return (
    <div className="overflow-hidden">
      <div
        className={`flex w-max gap-5 ${direction === "left" ? "animate-marquee-left" : "animate-marquee-right"}`}
      >
        {duplicatedItems.map((testimonial, index) => (
          <AnimateInView key={`${testimonial.name}-${index}`} delay={0.04 * (index % items.length)}>
            <article className="flex h-[248px] w-[340px] shrink-0 flex-col rounded-2xl border border-[#ddd8ea] bg-white px-6 py-6 shadow-[0_1px_0_rgba(255,255,255,0.8)] sm:h-[252px] sm:w-[400px] lg:h-[260px] lg:w-[440px]">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="flex flex-col items-center gap-2">
                    <img
                      src={getAvatarUrl(testimonial.avatarSeed)}
                      alt={testimonial.name}
                      className="h-12 w-12 rounded-full bg-[#f3f1ff] object-cover"
                    />
                    <div className="flex items-center gap-0.5 text-[#f3b43d]">
                      <FaStar className="text-base sm:text-lg" aria-hidden="true" />
                      <FaStar className="text-base sm:text-lg" aria-hidden="true" />
                      <FaStar className="text-base sm:text-lg" aria-hidden="true" />
                      <FaStar className="text-base sm:text-lg" aria-hidden="true" />
                      <FaStar className="text-base sm:text-lg" aria-hidden="true" />
                    </div>
                  </div>

                  <h3 className="pt-1 text-base font-bold text-[#1f2432] sm:text-lg">
                    {testimonial.name}
                  </h3>
                </div>

                <BiSolidQuoteAltLeft className="text-3xl text-[#7054dc]" aria-hidden="true" />
              </div>

              <p className="mt-5 flex-1 text-sm leading-relaxed text-[#434d5c] sm:text-base">
                “{testimonial.quote}”
              </p>
            </article>
          </AnimateInView>
        ))}
      </div>
    </div>
  );
}

export default function TestimonialSectionView() {
  return (
    <section className="w-full overflow-hidden bg-[#f7f6ff] px-4 py-20 sm:px-7 lg:px-10">
      <div className="mx-auto max-w-6xl text-center">
        <AnimateInView>
          <h2 className="text-2xl font-bold text-[#1e2330] sm:text-3xl">
            Cerita Seru dari Teman-Teman Belajarmu
          </h2>
        </AnimateInView>
        <AnimateInView delay={0.08}>
          <p className="mx-auto mt-4 max-w-3xl text-base leading-relaxed text-[#4e5664] md:text-lg">
            Dari SD sampai SMA, mereka sudah menemukan cara belajar mandiri yang paling pas. Yuk,
            dengar langsung kesan mereka!
          </p>
        </AnimateInView>
      </div>

      <div className="mx-auto mt-10 space-y-6">
        <AnimateInView delay={0.12}>
          <MarqueeRow items={testimonials.slice(0, 3)} direction="right" />
        </AnimateInView>
        <AnimateInView delay={0.18}>
          <MarqueeRow items={testimonials.slice(3)} direction="left" />
        </AnimateInView>
      </div>
    </section>
  );
}
