import fs from "fs";
import path from "path";
import type { MirroredPageData, PageStructure } from "./types";

const CONTENT_DIR = path.join(process.cwd(), "content", "pages");
const REACT_CONTENT_DIR = path.join(process.cwd(), "content", "pages-react");

export function getAllPageSlugs(): string[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  return fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith(".json"))
    .map((f) => f.replace(/\.json$/, ""));
}

// Legacy functions (for HTML rendering)
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

// New React-based functions
export function getReactPageData(slug: string): PageStructure | null {
  const filePath = path.join(REACT_CONTENT_DIR, `${slug}.json`);
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8")) as PageStructure;
  } catch (error) {
    console.error(`Failed to load React page data for ${slug}:`, error);
    return null;
  }
}

export function getHomeReactPageData(): PageStructure | null {
  return getReactPageData("home");
}

export function getSlugReactPageData(slug: string): PageStructure | null {
  if (slug === "home") return null;
  return getReactPageData(slug);
}
