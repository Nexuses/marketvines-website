import { notFound } from "next/navigation";
import type { Metadata } from "next";
import MirroredPage from "@/components/MirroredPage";
import { getAllPageSlugs, getSlugPageData } from "@/lib/pages";

export function generateStaticParams() {
  return getAllPageSlugs()
    .filter((slug) => slug !== "home")
    .map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = getSlugPageData(slug);
  return { title: page?.title ?? "MarketVines" };
}

export default async function SlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = getSlugPageData(slug);
  if (!page) notFound();
  return <MirroredPage page={page} />;
}
