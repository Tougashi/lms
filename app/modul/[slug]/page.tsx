import { notFound } from "next/navigation";
import ModulDetailClient from "./ModulDetailClient";
import { getModuleBySlug } from "../dummy";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ModulDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const moduleData = getModuleBySlug(slug);

  if (!moduleData) {
    notFound();
  }

  return <ModulDetailClient moduleData={moduleData} />;
}
