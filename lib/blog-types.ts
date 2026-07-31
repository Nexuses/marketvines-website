export type BlogCategory = "ai-insights" | "growth-insights";

export interface CmsMedia {
  id?: string;
  url?: string | null;
  filename?: string | null;
  alt?: string | null;
}

export interface CmsBlog {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: BlogCategory;
  author: string;
  authorAvatar?: CmsMedia | string | null;
  publishedDate: string;
  imageUrl?: string | null;
  featuredImage?: CmsMedia | string | null;
  content: unknown;
}

export const CATEGORY_LABELS: Record<BlogCategory, string> = {
  "ai-insights": "AI Insights",
  "growth-insights": "Growth Insights",
};

export const DEFAULT_AUTHOR_AVATAR =
  "https://secure.gravatar.com/avatar/df0fec03d07e6c5e2e582514ab31e0417469da51eef577732b266c0b0a69ae85?s=70&d=mm&r=g";

export function formatBlogDate(dateInput: string | Date): string {
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function getMediaUrl(media: CmsMedia | string | null | undefined): string {
  if (!media) return "";
  if (typeof media === "string") return media;
  if (media.url) {
    return media.url.startsWith("/") || media.url.startsWith("http")
      ? media.url
      : `/media/${media.filename || media.url}`;
  }
  if (media.filename) return `/media/${media.filename}`;
  return "";
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
