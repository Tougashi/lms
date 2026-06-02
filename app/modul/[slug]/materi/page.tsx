import MateriClient from './MateriClient';

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function MateriPage({ params }: PageProps) {
  const { slug } = await params;
  // 'slug' is the module UUID from the API
  return <MateriClient modulId={slug} />;
}
