import { notFound } from "next/navigation";
import { getModuleBySlug } from "../../dummy";
import MateriClient from "./MateriClient";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function MateriPage({ params }: PageProps) {
  const { slug } = await params;
  const moduleData = getModuleBySlug(slug);

  if (!moduleData) {
    notFound();
  }

  return <MateriClient moduleData={moduleData} slug={slug} />;
}
