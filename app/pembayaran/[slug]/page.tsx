import PembayaranClient from './PembayaranClient';

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function PembayaranPage({ params }: PageProps) {
  const { slug } = await params;
  return <PembayaranClient params={{ slug }} />;
}
