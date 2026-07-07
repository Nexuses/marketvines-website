import fs from "fs";
import path from "path";
import type { MirroredPageData } from "./types";

const CONTENT_DIR = path.join(process.cwd(), "content", "pages");

export function getAllPageSlugs(): string[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  return fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith(".json"))
    .map((f) => f.replace(/\.json$/, ""));
}

export function getPageData(slug: string): MirroredPageData | null {
  const filePath = path.join(CONTENT_DIR, `${slug}.json`);
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as MirroredPageData;
}

export function getHomePageData(): MirroredPageData | null {
  return getPageData("home");
}

export function getSlugPageData(slug: string): MirroredPageData | null {
  if (slug === "home") return null;
  return getPageData(slug);
}
