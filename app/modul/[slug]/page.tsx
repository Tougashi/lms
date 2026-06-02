import ModulDetailClient from './ModulDetailClient';

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ModulDetailPage({ params }: PageProps) {
  const { slug } = await params;
  // 'slug' here is the module UUID from the API
  return <ModulDetailClient params={{ id: slug }} />;
}
