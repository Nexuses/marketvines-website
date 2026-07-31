import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ReactPage from "@/components/ReactPage";
import MirroredPage from "@/components/MirroredPage";
import { getAllPageSlugs, getSlugReactPageData, getSlugPageData } from "@/lib/pages";
import { getBlogsListingPage, getCmsBlogPageData } from "@/lib/cms-blogs";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return getAllPageSlugs()
    .filter((slug) => slug !== "home")
    .map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;

  if (slug === "blogs") {
    const blogsPage = await getBlogsListingPage();
    return { title: blogsPage?.title ?? "Insights – MarketVines" };
  }

  const reactPage = getSlugReactPageData(slug);
  if (reactPage) {
    return { title: reactPage.title };
  }

  const legacyPage = getSlugPageData(slug);
  if (legacyPage) {
    return { title: legacyPage.title };
  }

  const cmsPage = await getCmsBlogPageData(slug);
  return { title: cmsPage?.title ?? "MarketVines" };
}

export default async function SlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  if (slug === "blogs") {
    const blogsPage = await getBlogsListingPage();
    if (!blogsPage) notFound();
    return <MirroredPage page={blogsPage} />;
  }

  const reactPage = getSlugReactPageData(slug);
  if (reactPage) {
    return <ReactPage page={reactPage} />;
  }

  const legacyPage = getSlugPageData(slug);
  if (legacyPage) {
    return <MirroredPage page={legacyPage} />;
  }

  const cmsPage = await getCmsBlogPageData(slug);
  if (!cmsPage) notFound();
  return <MirroredPage page={cmsPage} />;
}
