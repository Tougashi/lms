import { getModuleBySlug, moduleDetails } from "../../dummy";
import MateriClient from "./MateriClient";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function MateriPage({ params }: PageProps) {
  const { slug } = await params;
  const moduleData = getModuleBySlug(slug) ?? moduleDetails[0];

  return <MateriClient moduleData={moduleData} slug={slug} />;
}
