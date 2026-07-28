import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ReactPage from "@/components/ReactPage";
import MirroredPage from "@/components/MirroredPage";
import { getAllPageSlugs, getSlugReactPageData, getSlugPageData } from "@/lib/pages";

export function generateStaticParams() {
  return getAllPageSlugs()
    .filter((slug) => slug !== "home")
    .map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  
  // Try React page first
  const reactPage = getSlugReactPageData(slug);
  if (reactPage) {
    return { title: reactPage.title };
  }

  // Fall back to legacy
  const legacyPage = getSlugPageData(slug);
  return { title: legacyPage?.title ?? "MarketVines" };
}

export default async function SlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // Try React page first
  const reactPage = getSlugReactPageData(slug);
  if (reactPage) {
    return <ReactPage page={reactPage} />;
  }

  // Fall back to legacy
  const legacyPage = getSlugPageData(slug);
  if (!legacyPage) notFound();
  return <MirroredPage page={legacyPage} />;
}
