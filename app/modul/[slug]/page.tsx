import { notFound } from "next/navigation";
import ModulDetailClient from "./ModulDetailClient";
import { moduleApi, type SiswaModuleItem } from "../../lib/api";

type PageProps = {
  params: Promise<{ slug: string }>;
};

const defaultLearningOutcomes = [
  "Memahami konsep inti secara bertahap dari dasar hingga penerapan.",
  "Mengenali hubungan antar topik agar materi lebih mudah dipelajari.",
  "Melatih pemahaman lewat rangkuman dan evaluasi singkat.",
  "Menyiapkan fondasi yang lebih kuat untuk kuis dan ujian.",
];

const defaultMaterialSections = [
  {
    id: "section-1",
    title: "Pengantar Materi",
    items: ["Ruang lingkup pembelajaran", "Tujuan belajar", "Gambaran umum topik"],
  },
  {
    id: "section-2",
    title: "Materi Inti",
    items: ["Konsep dasar", "Contoh penerapan", "Latihan pemahaman"],
  },
  {
    id: "section-3",
    title: "Evaluasi",
    items: ["Kuis topik", "Rangkuman", "Refleksi hasil belajar"],
  },
];

function buildModuleDetail(apiModule: SiswaModuleItem, slug: string) {
  return {
    id: apiModule.id ? Number.parseInt(apiModule.id, 10) || 0 : 0,
    slug,
    title: apiModule.moduleName,
    teacher: 'Pengajar tersedia pada modul ini',
    teacherRole: 'Guru Pengampu',
    teacherAvatarSeed: apiModule.tutorId || apiModule.moduleName,
    image: '/assets/images/beranda-siswa/modul.png',
    isRecommended: true,
    isLocked: apiModule.isPaid,
    gradeLabel: `${apiModule.level || 'SMA'} | Kelas ${apiModule.class || '10'}`,
    rating: 4.8,
    totalTopics: 4,
    totalMaterials: 15,
    durationLabel: `${apiModule.targetTime || 0} Menit`,
    totalQuizzes: 4,
    completionLabel: 'Materi dalam 6 Bulan',
    hasCertificate: true,
    descriptionParagraphs: [
      apiModule.description || 'Deskripsi modul tersedia melalui data API.',
      'Silakan lanjut membaca detail materi, evaluasi, dan aktivitas belajar yang sudah disiapkan pada modul ini.',
      'Jika kamu sudah terdaftar, kamu bisa melanjutkan ke materi pembelajaran sesuai alur yang disediakan.',
    ],
    accessNote: apiModule.isPaid ? 'Kelas premium' : 'Gratis mengakses kelas ini',
    priceLabel: apiModule.isPaid && apiModule.modulPrice != null ? `Rp ${Number(apiModule.modulPrice).toLocaleString('id-ID')}` : undefined,
    primaryActionLabel: apiModule.isPaid ? 'Daftar' : 'Lanjutkan Belajar',
    secondaryActionLabel: 'Kelompok Belajar',
    difficulty: apiModule.difficulty || 'Menengah',
    updatedAt: apiModule.updatedAt,
    learningDuration: `${apiModule.targetTime || 0} Menit`,
    learningOutcomes: defaultLearningOutcomes,
    materialSections: defaultMaterialSections,
  };
}

export default async function ModulDetailPage({ params }: PageProps) {
  const { slug } = await params;

  let moduleData: ReturnType<typeof buildModuleDetail>;

  try {
    const apiModule = await moduleApi.siswa.detail(slug);
    moduleData = buildModuleDetail(apiModule, slug);
  } catch {
    notFound();
  }

  return <ModulDetailClient moduleData={moduleData} />;
}
