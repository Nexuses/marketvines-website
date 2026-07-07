import { notFound } from "next/navigation";
import type { Metadata } from "next";
import MirroredPage from "@/components/MirroredPage";
import { getHomePageData } from "@/lib/pages";

export function generateMetadata(): Metadata {
  const page = getHomePageData();
  return { title: page?.title ?? "MarketVines" };
}

export default function HomePage() {
  const page = getHomePageData();
  if (!page) notFound();
  return <MirroredPage page={page} />;
}
