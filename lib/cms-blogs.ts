import { getPayloadClient } from "./payload";
import type { CmsBlog } from "./blog-types";
import type { MirroredPageData } from "./types";
import { getPageData } from "./pages";
import { buildCmsBlogPageHtml, injectCmsCardsIntoBlogsHtml } from "./blog-html";
import { buildBlogNavigationList, getAdjacentBlogs } from "./blog-navigation";

const BLOG_TEMPLATE_SLUG = "people-coordinating-with-ai-sales-expertise";

function toCmsBlog(doc: Record<string, unknown>): CmsBlog {
  return {
    id: String(doc.id),
    title: String(doc.title || ""),
    slug: String(doc.slug || ""),
    excerpt: String(doc.excerpt || ""),
    category: (doc.category as CmsBlog["category"]) || "ai-insights",
    author: String(doc.author || "Dr. Brad"),
    authorAvatar: (doc.authorAvatar as CmsBlog["authorAvatar"]) ?? null,
    publishedDate: String(doc.publishedDate || new Date().toISOString()),
    imageUrl: doc.imageUrl ? String(doc.imageUrl) : null,
    featuredImage: (doc.featuredImage as CmsBlog["featuredImage"]) ?? null,
    content: doc.content,
  };
}

export async function getPublishedCmsBlogs(): Promise<CmsBlog[]> {
  try {
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: "blogs",
      where: {
        _status: {
          equals: "published",
        },
      },
      sort: "-publishedDate",
      depth: 1,
      limit: 100,
      overrideAccess: false,
    });
    return result.docs.map((doc) => toCmsBlog(doc as unknown as Record<string, unknown>));
  } catch (error) {
    console.error("Failed to load CMS blogs:", error);
    return [];
  }
}

export async function getPublishedCmsBlogBySlug(slug: string): Promise<CmsBlog | null> {
  try {
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: "blogs",
      where: {
        and: [
          { slug: { equals: slug } },
          { _status: { equals: "published" } },
        ],
      },
      depth: 1,
      limit: 1,
      overrideAccess: false,
    });
    const doc = result.docs[0];
    if (!doc) return null;
    return toCmsBlog(doc as unknown as Record<string, unknown>);
  } catch (error) {
    console.error(`Failed to load CMS blog "${slug}":`, error);
    return null;
  }
}

export async function getBlogsListingPage(): Promise<MirroredPageData | null> {
  const page = getPageData("blogs");
  if (!page) return null;

  const cmsBlogs = await getPublishedCmsBlogs();
  if (!cmsBlogs.length) return page;

  return {
    ...page,
    bodyHtml: injectCmsCardsIntoBlogsHtml(page.bodyHtml, cmsBlogs),
  };
}

export async function getCmsBlogPageData(slug: string): Promise<MirroredPageData | null> {
  const blog = await getPublishedCmsBlogBySlug(slug);
  if (!blog) return null;

  const template = getPageData(BLOG_TEMPLATE_SLUG);
  if (!template) return null;

  const allCmsBlogs = await getPublishedCmsBlogs();
  const navList = buildBlogNavigationList(allCmsBlogs);
  const adjacent = getAdjacentBlogs(navList, blog.slug);

  const bodyClass = template.bodyClass
    .replace(/postid-\d+/g, `postid-cms`)
    .replace(/single-format-standard/g, "single-format-standard");

  return {
    ...template,
    slug: blog.slug,
    path: `/${blog.slug}/`,
    title: `${blog.title} – MarketVines`,
    bodyClass,
    bodyHtml: buildCmsBlogPageHtml(template.bodyHtml, blog, adjacent),
    disableForms: true,
  };
}
