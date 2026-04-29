export type MaterialSection = {
  id: string;
  title: string;
  items: string[];
};

export type ModuleDetail = {
  id: number;
  slug: string;
  title: string;
  teacher: string;
  teacherRole: string;
  teacherAvatarSeed: string;
  image: string;
  isRecommended: boolean;
  isLocked: boolean;
  gradeLabel: string;
  rating: number;
  totalTopics: number;
  totalMaterials: number;
  durationLabel: string;
  totalQuizzes: number;
  completionLabel: string;
  hasCertificate: boolean;
  descriptionParagraphs: string[];
  accessNote: string;
  priceLabel?: string;
  primaryActionLabel: string;
  secondaryActionLabel: string;
  updatedAt: string;
  learningDuration: string;
  difficulty: string;
  learningOutcomes: string[];
  materialSections: MaterialSection[];
};

const defaultOutcomes = [
  "Menelusuri komponen, struktur organel, dan proses pembelahan sel.",
  "Mengungkap rahasia jaringan, organ, serta mekanisme transportasi nutrisi.",
  "Mengenal pusat saraf, hormon, indra, dan sistem pertahanan tubuh.",
  "Memahami cara kerja pompa jantung dan sistem penyaringan alami tubuh.",
];

const defaultSections: MaterialSection[] = [
  {
    id: "unit-1",
    title: "Sel Unit Terkecil Kehidupan",
    items: [
      "Komponen Penyusun Sel",
      "Struktur dan Fungsi Organ Sel",
      "Difusi dan Osmosis",
      "Pembelahan Sel",
    ],
  },
  {
    id: "unit-2",
    title: "Bioproses pada Tumbuhan",
    items: [],
  },
  {
    id: "unit-3",
    title: "Sistem Pertukaran Zat",
    items: [],
  },
  {
    id: "unit-4",
    title: "Koordinasi dan Reproduksi",
    items: [],
  },
];

function createDescriptionParagraphs(subject: string): string[] {
  return [
    `Selamat datang di pembelajaran ${subject} yang disusun bertahap dari konsep paling dasar sampai aplikasi yang paling sering muncul di latihan, penilaian harian, dan ujian sekolah. Setiap topik dibuka dengan pengantar yang ringan, lalu masuk ke konsep inti secara perlahan agar alurnya terasa natural. Kamu tidak hanya diajak menghafal poin-poin penting, tetapi juga memahami alasan di balik konsep tersebut melalui ilustrasi, contoh sederhana, dan pembahasan yang relevan dengan konteks belajar siswa SMA saat ini.`,
    `Di setiap bagian, kamu akan menemukan kombinasi materi inti, contoh kontekstual, ringkasan, serta latihan singkat yang dirancang untuk memperkuat pemahaman secara bertahap. Pendekatan ini membantu kamu tetap fokus saat belajar mandiri karena pembahasannya tidak meloncat-loncat dan tetap konsisten dari awal sampai akhir bab. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.`,
    `Setelah mempelajari seluruh modul, kamu bisa melatih pemahaman melalui kuis berkala, evaluasi topik, dan latihan penerapan konsep agar hasil belajar benar-benar terukur. Materi juga dibuat fleksibel untuk diulang kapan saja, sehingga kamu bisa menyesuaikan ritme belajar sesuai target mingguanmu. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum, sehingga kamu dapat membangun fondasi yang lebih kuat untuk tahap belajar berikutnya.`,
  ];
}

export const moduleDetails: ModuleDetail[] = [
  {
    id: 1,
    slug: "biologi",
    title: "Biologi",
    teacher: "Budi Santoso, S.Pd., M.Si.",
    teacherRole: "Guru Biologi",
    teacherAvatarSeed: "budi-santoso",
    image: "/assets/images/beranda-siswa/matapelajaran.png",
    isRecommended: true,
    isLocked: false,
    gradeLabel: "Jenjang SMA | Kelas 11",
    rating: 4.9,
    totalTopics: 4,
    totalMaterials: 15,
    durationLabel: "10 Jam 15 Menit",
    totalQuizzes: 4,
    completionLabel: "Materi dalam 6 Bulan",
    hasCertificate: true,
    descriptionParagraphs: [
      "Selamat datang di perjalanan eksplorasi bioproses yang akan mengungkap rahasia kehidupan dari skala terkecil hingga sistem organ yang kompleks. Dalam materi Biologi Kelas 11 ini, kamu akan menelusuri mekanisme kerja sel sebagai unit fundamental kehidupan, memahami hubungan antarorganel, serta melihat bagaimana proses biologis saling terhubung dalam satu sistem yang utuh. Penjelasan dibuat runut agar kamu bisa mengikuti alur materi tanpa kehilangan konteks, mulai dari konsep dasar sampai penerapan pada studi kasus sederhana.",
      "Kamu juga akan mempelajari struktur jaringan tumbuhan, sistem organ manusia, mekanisme transportasi zat, serta keterkaitan antara fungsi organ dengan proses metabolisme harian. Setiap pembahasan dilengkapi contoh kontekstual agar konsep tidak terasa abstrak dan lebih mudah divisualisasikan ketika kamu mengerjakan latihan. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua, sehingga pengalaman belajar tetap padat namun tidak terasa terlalu berat di satu waktu.",
      "Di akhir setiap topik, tersedia latihan, kuis, dan evaluasi ringkas untuk membantu kamu mengecek pemahaman sebelum lanjut ke bab berikutnya. Dengan pola belajar bertahap seperti ini, kamu bisa memperkuat fondasi konsep biologi sambil meningkatkan ketelitian saat membaca soal. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat, sehingga kesiapanmu menghadapi tugas sekolah, ulangan, maupun ujian akhir dapat meningkat secara konsisten dari minggu ke minggu.",
    ],
    accessNote: "Gratis mengakses kelas ini",
    primaryActionLabel: "Daftar Gratis",
    secondaryActionLabel: "Kelompok Belajar",
    updatedAt: "15 Maret 2026",
    learningDuration: "6 Bulan",
    difficulty: "Menengah",
    learningOutcomes: defaultOutcomes,
    materialSections: defaultSections,
  },
  {
    id: 2,
    slug: "kimia",
    title: "Kimia",
    teacher: "Dewi Kartika, S.Si., M.Pd.",
    teacherRole: "Guru Kimia",
    teacherAvatarSeed: "dewi-kartika",
    image: "/assets/images/beranda-siswa/matapelajaran.png",
    isRecommended: true,
    isLocked: false,
    gradeLabel: "Jenjang SMA | Kelas 11",
    rating: 4.8,
    totalTopics: 4,
    totalMaterials: 15,
    durationLabel: "10 Jam 15 Menit",
    totalQuizzes: 4,
    completionLabel: "Materi dalam 6 Bulan",
    hasCertificate: true,
    descriptionParagraphs: [
      "Pelajari konsep inti kimia secara runtut mulai dari struktur atom, konfigurasi elektron, ikatan kimia, hingga stoikiometri dan laju reaksi. Setiap topik dijelaskan dengan pendekatan langkah demi langkah agar proses memahami rumus, satuan, dan pola hitungan terasa lebih jelas serta tidak membingungkan. Kamu juga akan diarahkan untuk memahami logika di balik reaksi kimia, bukan sekadar menghafal bentuk persamaan yang muncul di buku.",
      "Materi dilengkapi ilustrasi, contoh hitungan bertahap, dan strategi penyelesaian soal sehingga kamu bisa mengenali pola soal lebih cepat saat latihan maupun ujian. Pembahasan juga menekankan kesalahan umum yang sering terjadi agar kamu bisa menghindari jebakan perhitungan sejak awal. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua, dengan tujuan agar proses belajar tetap terarah sekaligus efisien dalam waktu belajar yang terbatas.",
      "Selain itu, kamu akan mendapatkan latihan terstruktur, kuis topik, dan evaluasi periodik untuk memastikan setiap konsep benar-benar dipahami sebelum melanjutkan ke materi berikutnya. Dengan alur ini, progres belajarmu lebih mudah dipantau dan hasil belajarmu bisa meningkat secara bertahap. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur, sehingga kamu bisa membangun kebiasaan belajar kimia yang lebih konsisten dan percaya diri.",
    ],
    accessNote: "Kelas premium",
    priceLabel: "Rp 250.000",
    primaryActionLabel: "Daftar",
    secondaryActionLabel: "Kelompok Belajar",
    updatedAt: "15 Maret 2026",
    learningDuration: "6 Bulan",
    difficulty: "Menengah",
    learningOutcomes: defaultOutcomes,
    materialSections: defaultSections,
  },
  {
    id: 3,
    slug: "sejarah",
    title: "Sejarah",
    teacher: "Drs. H. Suryo Kusumo, M.Hum.",
    teacherRole: "Guru Sejarah",
    teacherAvatarSeed: "suryo-kusumo",
    image: "/assets/images/beranda-siswa/informatika.png",
    isRecommended: true,
    isLocked: false,
    gradeLabel: "Jenjang SMA | Kelas 11",
    rating: 4.9,
    totalTopics: 4,
    totalMaterials: 15,
    durationLabel: "10 Jam 15 Menit",
    totalQuizzes: 4,
    completionLabel: "Materi dalam 6 Bulan",
    hasCertificate: true,
    descriptionParagraphs: [
      "Modul sejarah ini membantu kamu memahami kronologi peristiwa penting, hubungan sebab-akibat, dan dampaknya terhadap perkembangan bangsa dari masa ke masa. Materi disusun naratif agar alurnya mudah diikuti, sehingga kamu bisa melihat keterkaitan antarperistiwa tanpa harus menghafal secara terpisah. Setiap pembahasan berfokus pada konteks besar supaya kamu memahami mengapa sebuah kejadian menjadi titik balik dalam perjalanan sejarah.",
      "Setiap topik mengajak kamu membaca dinamika sosial, politik, ekonomi, dan budaya pada periode tertentu sehingga pemahaman tidak berhenti di hafalan tahun atau tokoh. Kamu akan dilatih menghubungkan latar belakang, proses, hingga dampak jangka panjang dari sebuah peristiwa. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua, agar pembelajaran sejarah terasa lebih hidup dan relevan dengan pola berpikir analitis.",
      "Untuk memperkuat pemahaman, modul ini juga menyediakan rangkuman, peta konsep, serta evaluasi singkat yang bisa kamu gunakan sebagai checkpoint belajar. Dengan cara ini, kamu dapat menilai topik mana yang sudah dikuasai dan mana yang masih perlu diulang sebelum ujian. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum, sehingga kesiapanmu menghadapi tugas presentasi, ulangan, dan ujian akhir menjadi jauh lebih matang.",
    ],
    accessNote: "Kelas aktif kamu",
    primaryActionLabel: "Lanjutkan Belajar",
    secondaryActionLabel: "Kelompok Belajar",
    updatedAt: "15 Maret 2026",
    learningDuration: "6 Bulan",
    difficulty: "Menengah",
    learningOutcomes: defaultOutcomes,
    materialSections: defaultSections,
  },
  {
    id: 4,
    slug: "sosiologi",
    title: "Sosiologi",
    teacher: "Siti Zulaikha, S.Sos., M.Si.",
    teacherRole: "Guru Sosiologi",
    teacherAvatarSeed: "siti-zulaikha",
    image: "/assets/images/beranda-siswa/sosiologi.png",
    isRecommended: true,
    isLocked: true,
    gradeLabel: "Jenjang SMA | Kelas 11",
    rating: 4.7,
    totalTopics: 4,
    totalMaterials: 15,
    durationLabel: "10 Jam 15 Menit",
    totalQuizzes: 4,
    completionLabel: "Materi dalam 6 Bulan",
    hasCertificate: true,
    descriptionParagraphs: createDescriptionParagraphs("Sosiologi"),
    accessNote: "Gratis mengakses kelas ini",
    primaryActionLabel: "Daftar Gratis",
    secondaryActionLabel: "Kelompok Belajar",
    updatedAt: "15 Maret 2026",
    learningDuration: "6 Bulan",
    difficulty: "Menengah",
    learningOutcomes: defaultOutcomes,
    materialSections: defaultSections,
  },
  {
    id: 5,
    slug: "fisika",
    title: "Fisika",
    teacher: "Dr. Eng. Hendra Wijaya, M.Sc.",
    teacherRole: "Guru Fisika",
    teacherAvatarSeed: "hendra-wijaya",
    image: "/assets/images/beranda-siswa/kimia.png",
    isRecommended: true,
    isLocked: true,
    gradeLabel: "Jenjang SMA | Kelas 11",
    rating: 4.8,
    totalTopics: 4,
    totalMaterials: 15,
    durationLabel: "10 Jam 15 Menit",
    totalQuizzes: 4,
    completionLabel: "Materi dalam 6 Bulan",
    hasCertificate: true,
    descriptionParagraphs: createDescriptionParagraphs("Fisika"),
    accessNote: "Gratis mengakses kelas ini",
    primaryActionLabel: "Daftar Gratis",
    secondaryActionLabel: "Kelompok Belajar",
    updatedAt: "15 Maret 2026",
    learningDuration: "6 Bulan",
    difficulty: "Menengah",
    learningOutcomes: defaultOutcomes,
    materialSections: defaultSections,
  },
  {
    id: 6,
    slug: "ekonomi",
    title: "Ekonomi",
    teacher: "Farhan Pratama, S.E., M.M.",
    teacherRole: "Guru Ekonomi",
    teacherAvatarSeed: "farhan-pratama",
    image: "/assets/images/beranda-siswa/sosiologi.png",
    isRecommended: true,
    isLocked: true,
    gradeLabel: "Jenjang SMA | Kelas 11",
    rating: 4.7,
    totalTopics: 4,
    totalMaterials: 15,
    durationLabel: "10 Jam 15 Menit",
    totalQuizzes: 4,
    completionLabel: "Materi dalam 6 Bulan",
    hasCertificate: true,
    descriptionParagraphs: createDescriptionParagraphs("Ekonomi"),
    accessNote: "Gratis mengakses kelas ini",
    primaryActionLabel: "Daftar Gratis",
    secondaryActionLabel: "Kelompok Belajar",
    updatedAt: "15 Maret 2026",
    learningDuration: "6 Bulan",
    difficulty: "Menengah",
    learningOutcomes: defaultOutcomes,
    materialSections: defaultSections,
  },
  {
    id: 7,
    slug: "informatika",
    title: "Informatika",
    teacher: "Rizky Ramadhan, S.Kom., M.Kom.",
    teacherRole: "Guru Informatika",
    teacherAvatarSeed: "rizky-ramadhan",
    image: "/assets/images/beranda-siswa/informatika.png",
    isRecommended: true,
    isLocked: true,
    gradeLabel: "Jenjang SMA | Kelas 11",
    rating: 4.8,
    totalTopics: 4,
    totalMaterials: 15,
    durationLabel: "10 Jam 15 Menit",
    totalQuizzes: 4,
    completionLabel: "Materi dalam 6 Bulan",
    hasCertificate: true,
    descriptionParagraphs: createDescriptionParagraphs("Informatika"),
    accessNote: "Kelas premium",
    priceLabel: "Rp 250.000",
    primaryActionLabel: "Daftar",
    secondaryActionLabel: "Kelompok Belajar",
    updatedAt: "15 Maret 2026",
    learningDuration: "6 Bulan",
    difficulty: "Menengah",
    learningOutcomes: defaultOutcomes,
    materialSections: defaultSections,
  },
  {
    id: 8,
    slug: "matematika",
    title: "Matematika",
    teacher: "Dr. Ir. H. Bambang Setiawan",
    teacherRole: "Guru Matematika",
    teacherAvatarSeed: "bambang-setiawan",
    image: "/assets/images/beranda-siswa/matematika.png",
    isRecommended: true,
    isLocked: true,
    gradeLabel: "Jenjang SMA | Kelas 11",
    rating: 4.8,
    totalTopics: 4,
    totalMaterials: 15,
    durationLabel: "10 Jam 15 Menit",
    totalQuizzes: 4,
    completionLabel: "Materi dalam 6 Bulan",
    hasCertificate: true,
    descriptionParagraphs: createDescriptionParagraphs("Matematika"),
    accessNote: "Gratis mengakses kelas ini",
    primaryActionLabel: "Daftar Gratis",
    secondaryActionLabel: "Kelompok Belajar",
    updatedAt: "15 Maret 2026",
    learningDuration: "6 Bulan",
    difficulty: "Menengah",
    learningOutcomes: defaultOutcomes,
    materialSections: defaultSections,
  },
  {
    id: 9,
    slug: "bahasa-inggris",
    title: "Bahasa Inggris",
    teacher: "Nadia Azzahra, S.Pd.",
    teacherRole: "Guru Bahasa Inggris",
    teacherAvatarSeed: "nadia-azzahra",
    image: "/assets/images/beranda-siswa/modul.png",
    isRecommended: true,
    isLocked: false,
    gradeLabel: "Jenjang SMA | Kelas 11",
    rating: 4.8,
    totalTopics: 4,
    totalMaterials: 15,
    durationLabel: "10 Jam 15 Menit",
    totalQuizzes: 4,
    completionLabel: "Materi dalam 6 Bulan",
    hasCertificate: true,
    descriptionParagraphs: createDescriptionParagraphs("Bahasa Inggris"),
    accessNote: "Gratis mengakses kelas ini",
    primaryActionLabel: "Daftar Gratis",
    secondaryActionLabel: "Kelompok Belajar",
    updatedAt: "15 Maret 2026",
    learningDuration: "6 Bulan",
    difficulty: "Menengah",
    learningOutcomes: defaultOutcomes,
    materialSections: defaultSections,
  },
];

export function getModuleBySlug(slug: string) {
  return moduleDetails.find((item) => item.slug === slug);
}
