import * as cheerio from "cheerio";
import { getPageData, getAllPageSlugs } from "./pages";
import { formatBlogDate, getMediaUrl, type CmsBlog } from "./blog-types";

export interface BlogNavItem {
  slug: string;
  title: string;
  image: string;
  publishedDate: string;
  source: "static" | "cms";
}

const NEXT_PREV_ARROW = `<svg class="next-arrow" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 39 12"><line class="top" x1="23" y1="-0.5" x2="29.5" y2="6.5" stroke="#ffffff;"></line><line class="bottom" x1="23" y1="12.5" x2="29.5" y2="5.5" stroke="#ffffff;"></line></svg><span class="line"></span>`;

/** Known static Insight posts (exclude listing / non-post pages). */
const STATIC_BLOG_SLUGS = [
  "ai-conversations-one-voice-five-lanes-wide",
  "navigating-ai-mistrust-insights-and-solutions",
  "taking-steps-to-construct-trustworthy-ai",
  "people-coordinating-with-ai-sales-expertise",
  "marketvines-ai-and-expertise-transforming-b2b-growth",
  "the-demand-generation-wedding-why-product-management-is-never-in-charge-of-the-party",
  "94-2",
] as const;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function extractStaticBlogNavItem(slug: string): BlogNavItem | null {
  const page = getPageData(slug);
  if (!page) return null;

  const $ = cheerio.load(page.bodyHtml);
  const title =
    $("#page-header-bg h1.entry-title").first().text().trim() ||
    $("h1.entry-title").first().text().trim() ||
    page.title.replace(/\s*[–—-]\s*MarketVines.*$/i, "").trim();

  const image =
    $(".page-header-bg-image")
      .first()
      .attr("style")
      ?.match(/url\((['"]?)(.*?)\1\)/)?.[2] ||
    $("img.hidden-social-img").first().attr("src") ||
    $("article .content-inner img").first().attr("src") ||
    "";

  const dateText =
    $("#page-header-bg .meta-date.date.published").first().text().trim() ||
    $("#single-below-header .meta-date").first().text().trim() ||
    "";

  let publishedDate = new Date().toISOString();
  if (dateText) {
    const parsed = new Date(dateText);
    if (!Number.isNaN(parsed.getTime())) publishedDate = parsed.toISOString();
  }

  return {
    slug,
    title,
    image,
    publishedDate,
    source: "static",
  };
}

function cmsToNavItem(blog: CmsBlog): BlogNavItem {
  const image = blog.imageUrl?.trim() || getMediaUrl(blog.featuredImage) || "";
  return {
    slug: blog.slug,
    title: blog.title,
    image,
    publishedDate: blog.publishedDate,
    source: "cms",
  };
}

/** All blogs (static + CMS), oldest → newest. */
export function buildBlogNavigationList(cmsBlogs: CmsBlog[]): BlogNavItem[] {
  const existingSlugs = new Set(getAllPageSlugs());
  const staticItems = STATIC_BLOG_SLUGS.filter((slug) => existingSlugs.has(slug))
    .map(extractStaticBlogNavItem)
    .filter((item): item is BlogNavItem => Boolean(item));

  const staticSlugSet = new Set(staticItems.map((b) => b.slug));
  const cmsItems = cmsBlogs
    .filter((b) => !staticSlugSet.has(b.slug))
    .map(cmsToNavItem);

  return [...staticItems, ...cmsItems].sort(
    (a, b) => new Date(a.publishedDate).getTime() - new Date(b.publishedDate).getTime(),
  );
}

export function getAdjacentBlogs(
  all: BlogNavItem[],
  currentSlug: string,
): { previous: BlogNavItem | null; next: BlogNavItem | null } {
  const index = all.findIndex((b) => b.slug === currentSlug);
  if (index < 0) return { previous: null, next: null };
  return {
    previous: index > 0 ? all[index - 1] : null,
    next: index < all.length - 1 ? all[index + 1] : null,
  };
}

function renderNavSide(
  side: "previous" | "next",
  item: BlogNavItem | null,
  only: boolean,
): string {
  if (!item) {
    return `<li class="${side}-post hidden"></li>`;
  }

  const href = `/${item.slug}/`;
  const title = escapeHtml(item.title);
  const label = side === "previous" ? "Previous Post" : "Next Post";
  const onlyClass = only ? " only" : "";
  const bg = item.image
    ? `<div class="post-bg-img" style="background-image: url(${escapeHtml(item.image)});"></div>`
    : "";

  return `<li class="${side}-post${onlyClass}">${bg}<a href="${href}" aria-label="${title}"></a><h3><span>${label}</span><span class="text">${title}
						 ${NEXT_PREV_ARROW}</span></h3></li>`;
}

/** Exact Salient next/prev markup used on existing blog pages. */
export function renderBlogNextPrevHtml(
  previous: BlogNavItem | null,
  next: BlogNavItem | null,
): string {
  const onlyNext = !previous && Boolean(next);
  const onlyPrev = Boolean(previous) && !next;

  return `<div data-post-header-style="default_minimal" class="blog_next_prev_buttons vc_row-fluid wpb_row full-width-content standard_section" data-style="fullwidth_next_prev" data-midnight="light"><ul class="controls">${renderNavSide("previous", previous, onlyPrev)}${renderNavSide("next", next, onlyNext)}</ul>
			 </div>`;
}

export function formatNavDate(date: string): string {
  return formatBlogDate(date);
}
