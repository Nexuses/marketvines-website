import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ReactPage from "@/components/ReactPage";
import MirroredPage from "@/components/MirroredPage";
import { getHomeReactPageData, getHomePageData } from "@/lib/pages";

export function generateMetadata(): Metadata {
  // Try React page first, then fall back to legacy
  const reactPage = getHomeReactPageData();
  if (reactPage) {
    return { title: reactPage.title };
  }
  
  const legacyPage = getHomePageData();
  return { title: legacyPage?.title ?? "MarketVines" };
}

export default function HomePage() {
  // Try React page first
  const reactPage = getHomeReactPageData();
  if (reactPage) {
    return <ReactPage page={reactPage} />;
  }

  // Fall back to legacy page
  const legacyPage = getHomePageData();
  if (!legacyPage) notFound();
  return <MirroredPage page={legacyPage} />;
}
