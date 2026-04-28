export type PretestQuestion = {
  id: number;
  prompt: string;
  imageUrl: string;
  options: string[];
  correctAnswerIndex: number;
};

type PretestQuestionTemplate = Omit<PretestQuestion, "id">;

export const PRETEST_DURATION_SECONDS = 15 * 60;

const basePretestQuestionTemplates: PretestQuestionTemplate[] = [
  {
    prompt:
      "Perhatikan gambar struktur jantung di samping. Jika terjadi penyumbatan pada pembuluh darah yang ditunjukkan oleh nomor 4, manakah pernyataan yang paling tepat mengenai dampaknya terhadap bioproses tubuh?",
    imageUrl: "https://images.unsplash.com/photo-1530210124550-912dc1381cb8?auto=format&fit=crop&w=600&q=80",
    options: [
      "Darah kaya karbon dioksida tidak dapat dipompa menuju paru-paru untuk dibersihkan",
      "Darah kaya oksigen tidak dapat didistribusikan secara maksimal ke seluruh jaringan tubuh",
      "Terjadi penumpukan darah di serambi kanan karena katup jantung tidak berfungsi",
      "Proses pertukaran gas di dalam alveolus akan terhenti sepenuhnya",
    ],
    correctAnswerIndex: 1,
  },
  {
    prompt:
      "Pada proses fotosintesis, faktor manakah yang paling langsung memengaruhi pembentukan glukosa ketika semua faktor lain dianggap konstan?",
    imageUrl: "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&w=600&q=80",
    options: ["Konsentrasi karbon dioksida", "Kelembapan udara", "Kecepatan angin", "Warna tanah"],
    correctAnswerIndex: 0,
  },
  {
    prompt: "Bagian nefron yang berperan utama dalam reabsorpsi air dan ion setelah filtrasi glomerulus adalah ...",
    imageUrl: "https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=600&q=80",
    options: ["Kapsula Bowman", "Tubulus proksimal", "Arteriol aferen", "Glomerulus"],
    correctAnswerIndex: 1,
  },
  {
    prompt:
      "Jika kadar insulin dalam darah menurun drastis, maka efek biokimia yang paling mungkin terjadi pada sel tubuh adalah ...",
    imageUrl: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=600&q=80",
    options: [
      "Penyerapan glukosa meningkat cepat",
      "Produksi glikogen meningkat",
      "Penyerapan glukosa oleh sel menurun",
      "Kadar glukosa darah turun drastis",
    ],
    correctAnswerIndex: 2,
  },
  {
    prompt:
      "Dalam ekosistem, peran dekomposer sangat penting karena organisme ini membantu proses ...",
    imageUrl: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=600&q=80",
    options: [
      "Pembentukan energi cahaya menjadi energi kimia",
      "Daur ulang materi organik menjadi unsur hara",
      "Pengikatan nitrogen bebas oleh tumbuhan",
      "Perpindahan energi dari produsen ke konsumen",
    ],
    correctAnswerIndex: 1,
  },
  {
    prompt:
      "Mutasi titik pada DNA paling mungkin menimbulkan perubahan pada organisme ketika mutasi tersebut ...",
    imageUrl: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=600&q=80",
    options: [
      "Terjadi pada daerah non-koding yang tidak berperan",
      "Tidak mengubah urutan asam amino",
      "Terjadi pada gen yang diekspresikan",
      "Terjadi hanya pada sel kulit",
    ],
    correctAnswerIndex: 2,
  },
  {
    prompt:
      "Urutan jalannya impuls pada gerak refleks yang benar adalah ...",
    imageUrl: "https://images.unsplash.com/photo-1516841273335-e39b37888115?auto=format&fit=crop&w=600&q=80",
    options: [
      "Reseptor - neuron sensorik - interneuron - neuron motorik - efektor",
      "Neuron motorik - reseptor - interneuron - neuron sensorik - efektor",
      "Reseptor - neuron motorik - neuron sensorik - interneuron - efektor",
      "Interneuron - neuron sensorik - reseptor - neuron motorik - efektor",
    ],
    correctAnswerIndex: 0,
  },
  {
    prompt:
      "Ketika seseorang berolahraga intens, frekuensi napas meningkat terutama untuk ...",
    imageUrl: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=600&q=80",
    options: [
      "Menurunkan suhu tubuh secara langsung",
      "Meningkatkan asupan oksigen dan pembuangan karbon dioksida",
      "Mengurangi kerja jantung",
      "Menyimpan cadangan energi pada otot",
    ],
    correctAnswerIndex: 1,
  },
  {
    prompt:
      "Pada tahap metafase mitosis, ciri paling khas yang dapat diamati adalah ...",
    imageUrl: "https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&w=600&q=80",
    options: [
      "Kromatin mulai menebal menjadi kromosom",
      "Kromosom berjajar pada bidang ekuator",
      "Kromatid saudara berpisah ke kutub berlawanan",
      "Membran inti terbentuk kembali",
    ],
    correctAnswerIndex: 1,
  },
  {
    prompt:
      "Interaksi antara lebah dan bunga merupakan contoh simbiosis mutualisme karena ...",
    imageUrl: "https://images.unsplash.com/photo-1471943311424-646960669fbc?auto=format&fit=crop&w=600&q=80",
    options: [
      "Lebah dirugikan sementara bunga diuntungkan",
      "Keduanya sama-sama memperoleh keuntungan",
      "Bunga tidak dipengaruhi oleh keberadaan lebah",
      "Lebah hanya mengambil manfaat tanpa memberi dampak",
    ],
    correctAnswerIndex: 1,
  },
];

export type MateriConfig = {
  slug: string;
  pretestRequired: boolean;
  pretestCompletedByDefault: boolean;
  progressPercent: number;
  lessonTitle: string;
  lessonDuration: string;
  lessonDate: string;
  videoUrl: string;
  readingTitle: string;
  readingParagraphs: string[];
  sidebarSections: Array<{
    id: string;
    title: string;
    unlocked: boolean;
  }>;
  summaryUnlocked: boolean;
  contentTree: ContentSection[];
  pretestQuestions: PretestQuestion[];
};

export type ContentItem = {
  id: string;
  title: string;
  duration: string;
  type: "lesson" | "summary" | "quiz";
  hasVideo: boolean;
  videoUrl?: string;
  readingParagraphs: string[];
};

export type ContentSection = {
  id: string;
  title: string;
  items: ContentItem[];
};

const defaultReadingParagraphs = [
  "Pengantar: Lebih dari Sekadar Hijau. Pernahkah kamu bertanya-tanya bagaimana pohon di halaman rumah bisa tumbuh tinggi menjulang? Rahasianya ada pada jaringan tumbuhan yang bekerja sama mengatur pertumbuhan, distribusi air, dan penyimpanan cadangan makanan.",
  "Jaringan meristem adalah jaringan dengan sel aktif membelah untuk pertumbuhan memanjang dan membesar. Sementara itu, jaringan dewasa berfungsi lebih spesifik seperti pelindung, penyokong, pengangkut, dan penyimpan hasil fotosintesis.",
];

const baseSidebarSections = [
  { id: "unit-1", title: "Sel Unit Terkecil Kehidupan" },
  { id: "unit-2", title: "Bioproses pada Tumbuhan" },
  { id: "unit-3", title: "Sistem Pertukaran Zat" },
  { id: "unit-4", title: "Koordinasi dan Reproduksi" },
];

const defaultContentTree: ContentSection[] = [
  {
    id: "section-1",
    title: "Sel Unit Terkecil Kehidupan",
    items: [
      {
        id: "s1-l1",
        title: "Komponen Penyusun Sel",
        duration: "04:20",
        type: "lesson",
        hasVideo: true,
        videoUrl: "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?auto=format&fit=crop&w=1400&q=80",
        readingParagraphs: [
          "Komponen penyusun sel terdiri dari membran sel, sitoplasma, dan inti sel yang bekerja sebagai sistem terintegrasi.",
          "Setiap komponen memiliki fungsi spesifik untuk menjaga homeostasis dan kelangsungan aktivitas metabolisme.",
        ],
      },
      {
        id: "s1-l2",
        title: "Struktur dan Fungsi Organ Sel",
        duration: "07:39",
        type: "lesson",
        hasVideo: true,
        videoUrl: "https://images.unsplash.com/photo-1579165466741-7f35e4755660?auto=format&fit=crop&w=1400&q=80",
        readingParagraphs: [
          "Organel seperti mitokondria, ribosom, dan retikulum endoplasma memiliki peran penting dalam proses biosintesis.",
          "Hubungan kerja antar organel menentukan efisiensi sel dalam menghasilkan energi dan protein.",
        ],
      },
      {
        id: "s1-l3",
        title: "Difusi dan Osmosis",
        duration: "03:00",
        type: "lesson",
        hasVideo: false,
        readingParagraphs: [
          "Difusi dan osmosis adalah mekanisme transport pasif yang penting dalam keseimbangan cairan sel.",
          "Perbedaan konsentrasi zat terlarut menjadi pendorong utama perpindahan molekul melintasi membran.",
        ],
      },
      {
        id: "s1-l4",
        title: "Pembelahan Sel",
        duration: "03:00",
        type: "lesson",
        hasVideo: true,
        videoUrl: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1400&q=80",
        readingParagraphs: [
          "Pembelahan sel melalui mitosis dan meiosis memastikan pertumbuhan, perbaikan jaringan, dan reproduksi.",
          "Setiap fase pembelahan memiliki tahapan terstruktur yang harus terjadi secara berurutan.",
        ],
      },
      {
        id: "s1-summary",
        title: "Rangkuman 1 Sel Unit Terkecil Kehidupan",
        duration: "",
        type: "summary",
        hasVideo: false,
        readingParagraphs: [
          "Bab ini membahas struktur dasar sel, peran organel, mekanisme transport membran, serta proses pembelahan sel.",
          "Pemahaman konsep ini menjadi fondasi sebelum mempelajari jaringan dan sistem organ pada bab berikutnya.",
        ],
      },
      {
        id: "s1-quiz",
        title: "Kuis",
        duration: "",
        type: "quiz",
        hasVideo: false,
        readingParagraphs: [
          "Kuis ini menguji pemahaman konsep sel, organel, transport membran, dan pembelahan sel.",
        ],
      },
    ],
  },
  {
    id: "section-2",
    title: "Bioproses pada Tumbuhan",
    items: [
      {
        id: "s2-l1",
        title: "Jaringan pada Tumbuhan",
        duration: "04:20",
        type: "lesson",
        hasVideo: true,
        videoUrl: "https://images.unsplash.com/photo-1470163395405-d2b80e7450ed?auto=format&fit=crop&w=1400&q=80",
        readingParagraphs: defaultReadingParagraphs,
      },
      {
        id: "s2-l2",
        title: "Struktur Organ Tumbuhan",
        duration: "07:39",
        type: "lesson",
        hasVideo: true,
        videoUrl: "https://images.unsplash.com/photo-1516959512470-53955cd40f40?auto=format&fit=crop&w=1400&q=80",
        readingParagraphs: [
          "Organ tumbuhan terdiri dari akar, batang, daun, bunga, buah, dan biji dengan fungsi yang saling mendukung.",
          "Struktur anatomi tiap organ menentukan perannya dalam transportasi, fotosintesis, dan reproduksi.",
        ],
      },
      {
        id: "s2-l3",
        title: "Transportasi Air dan Nutrisi",
        duration: "03:00",
        type: "lesson",
        hasVideo: false,
        readingParagraphs: [
          "Xilem dan floem berperan mengangkut air, mineral, dan hasil fotosintesis ke seluruh bagian tumbuhan.",
          "Mekanisme transpirasi dan tekanan osmotik membantu proses distribusi zat secara kontinu.",
        ],
      },
      {
        id: "s2-summary",
        title: "Rangkuman 2 Bioproses pada Tumbuhan",
        duration: "",
        type: "summary",
        hasVideo: false,
        readingParagraphs: [
          "Bab ini menekankan keterkaitan antara struktur jaringan tumbuhan dan proses fisiologis yang berlangsung.",
        ],
      },
      {
        id: "s2-quiz",
        title: "Kuis",
        duration: "",
        type: "quiz",
        hasVideo: false,
        readingParagraphs: ["Kuis ini menguji konsep jaringan dan organ tumbuhan."],
      },
    ],
  },
  {
    id: "section-3",
    title: "Sistem Pertukaran Zat",
    items: [
      {
        id: "s3-l1",
        title: "Struktur Jantung dan Pembuluh Darah",
        duration: "04:20",
        type: "lesson",
        hasVideo: true,
        videoUrl: "https://images.unsplash.com/photo-1530497610245-94d3c16cda28?auto=format&fit=crop&w=1400&q=80",
        readingParagraphs: ["Pembahasan aliran darah sistemik dan pulmonal secara terintegrasi."],
      },
      {
        id: "s3-summary",
        title: "Rangkuman 3 Sistem Pertukaran Zat",
        duration: "",
        type: "summary",
        hasVideo: false,
        readingParagraphs: ["Ringkasan konsep pertukaran zat pada manusia."],
      },
      {
        id: "s3-quiz",
        title: "Kuis",
        duration: "",
        type: "quiz",
        hasVideo: false,
        readingParagraphs: ["Kuis pertukaran zat."],
      },
    ],
  },
  {
    id: "section-4",
    title: "Koordinasi dan Reproduksi",
    items: [
      {
        id: "s4-l1",
        title: "Sistem Saraf dan Hormon",
        duration: "04:20",
        type: "lesson",
        hasVideo: false,
        readingParagraphs: ["Sistem koordinasi tubuh melibatkan interaksi saraf dan hormon."],
      },
      {
        id: "s4-summary",
        title: "Rangkuman 4 Koordinasi dan Reproduksi",
        duration: "",
        type: "summary",
        hasVideo: false,
        readingParagraphs: ["Ringkasan koordinasi tubuh dan reproduksi."],
      },
      {
        id: "s4-quiz",
        title: "Kuis",
        duration: "",
        type: "quiz",
        hasVideo: false,
        readingParagraphs: ["Kuis koordinasi dan reproduksi."],
      },
    ],
  },
];

function buildPretestQuestionsForSubject(subject: string): PretestQuestion[] {
  return basePretestQuestionTemplates.map((template, index) => ({
    id: index + 1,
    ...template,
    prompt: `[${subject}] ${template.prompt}`,
  }));
}

const perSubjectStatus: Record<
  string,
  {
    pretestRequired: boolean;
    pretestCompletedByDefault: boolean;
  }
> = {
  biologi: { pretestRequired: true, pretestCompletedByDefault: true },
  matematika: { pretestRequired: true, pretestCompletedByDefault: false },
};

export function getMateriConfigBySlug(slug: string): MateriConfig {
  const subjectStatus = perSubjectStatus[slug];
  const pretestRequired = subjectStatus?.pretestRequired ?? false;
  const pretestCompletedByDefault = subjectStatus?.pretestCompletedByDefault ?? true;
  const unlockedByDefault = pretestCompletedByDefault;

  return {
    slug,
    pretestRequired,
    pretestCompletedByDefault,
    progressPercent: unlockedByDefault ? 100 : 30,
    lessonTitle: "Jaringan pada Tumbuhan",
    lessonDuration: "5 min read",
    lessonDate: "5 Maret 2026",
    videoUrl: "https://images.unsplash.com/photo-1470163395405-d2b80e7450ed?auto=format&fit=crop&w=1400&q=80",
    readingTitle: "Lihat Bahan Bacaan",
    readingParagraphs: defaultReadingParagraphs,
    sidebarSections: baseSidebarSections.map((section, index) => ({
      ...section,
      unlocked: unlockedByDefault,
    })),
    summaryUnlocked: unlockedByDefault,
    contentTree: defaultContentTree,
    pretestQuestions: buildPretestQuestionsForSubject(slug),
  };
}
