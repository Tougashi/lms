import type { Metadata } from "next";
import SertifikatClient from "./SertifikatClient";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: "Sertifikat Kelulusan | LMS",
    description: "Sertifikat kelulusan resmi yang diterbitkan setelah menyelesaikan modul pembelajaran.",
  };
}

export default async function SertifikatPage({ params }: PageProps) {
  const { slug } = await params;
  return <SertifikatClient modulId={slug} />;
}
