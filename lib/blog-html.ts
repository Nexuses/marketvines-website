import { convertLexicalToHTML } from "@payloadcms/richtext-lexical/html";
import type { SerializedEditorState } from "lexical";
import * as cheerio from "cheerio";
import {
  CATEGORY_LABELS,
  DEFAULT_AUTHOR_AVATAR,
  escapeHtml,
  formatBlogDate,
  getMediaUrl,
  type CmsBlog,
  type CmsMedia,
} from "./blog-types";
import {
  renderBlogNextPrevHtml,
  type BlogNavItem,
} from "./blog-navigation";

function categoryClass(category: CmsBlog["category"]): string {
  return category;
}

function categoryLabel(category: CmsBlog["category"]): string {
  return CATEGORY_LABELS[category] || category;
}

function authorAvatarUrl(blog: CmsBlog): string {
  const fromUpload = getMediaUrl(blog.authorAvatar as CmsMedia | string | null | undefined);
  return fromUpload || DEFAULT_AUTHOR_AVATAR;
}

function featuredImageUrl(blog: CmsBlog): string {
  if (blog.imageUrl?.trim()) return blog.imageUrl.trim();
  return getMediaUrl(blog.featuredImage as CmsMedia | string | null | undefined);
}

/** Masonry blog card — matches existing Insights page markup exactly. */
export function renderBlogCardHtml(blog: CmsBlog): string {
  const href = `/${blog.slug}/`;
  const title = escapeHtml(blog.title);
  const excerpt = escapeHtml(blog.excerpt);
  const author = escapeHtml(blog.author);
  const date = escapeHtml(formatBlogDate(blog.publishedDate));
  const img = escapeHtml(featuredImageUrl(blog));
  const catClass = categoryClass(blog.category);
  const catLabel = escapeHtml(categoryLabel(blog.category));
  const avatar = escapeHtml(authorAvatarUrl(blog));
  const postId = `cms-${blog.id}`;

  return `<article id="post-${postId}" class=" masonry-blog-item post-${postId} post type-post status-publish format-standard has-post-thumbnail category-${catClass}">  
    
  <div class="inner-wrap animated">
    
    <div class="post-content">

      <div class="content-inner">
        
        <a class="entire-meta-link" href="${href}"><span class="screen-reader-text">${title}</span></a>
        
        <span class="post-featured-img"><img decoding="async" width="749" height="502" src="${img}" class="attachment-large size-large skip-lazy wp-post-image" alt="${title}" title="" sizes="(min-width: 1600px) 20vw, (min-width: 1300px) 25vw, (min-width: 1000px) 33.3vw, (min-width: 690px) 50vw, 100vw" srcset="${img} 749w, ${img} 300w, ${img} 600w, ${img} 400w"></span><span class="meta-category"><a class="${catClass}" href="/category/${catClass}/">${catLabel}</a></span>        
        <div class="article-content-wrap">
          
          <div class="post-header">
            <h3 class="title"><a href="${href}"> ${title}</a></h3>
          </div>
          
          <div class="excerpt">${excerpt}</div><div class="grav-wrap"><a href="#"><img alt="${author}" src="${avatar}" srcset="${avatar} 2x" class="avatar avatar-70 photo" height="70" width="70"></a><div class="text"><a href="#" rel="author">${author}</a><span>${date}</span></div></div>
        </div><!--article-content-wrap-->
        
      </div><!--/content-inner-->
        
    </div><!--/post-content-->
      
  </div><!--/inner-wrap-->
    
</article>`;
}

function lexicalToWpHtml(content: unknown): string {
  if (!content || typeof content !== "object") return "";

  let html = convertLexicalToHTML({
    data: content as SerializedEditorState,
    disableContainer: true,
  });

  const $ = cheerio.load(`<div id="__content">${html}</div>`);
  const root = $("#__content");

  root.find("p").each((_, el) => {
    const node = $(el);
    if (!node.attr("class")) node.addClass("wp-block-paragraph");
  });

  root.find("blockquote").each((_, el) => {
    const node = $(el);
    node.attr("class", "wp-block-quote is-layout-flow wp-block-quote-is-layout-flow");
  });

  root.find("figure").each((_, el) => {
    const node = $(el);
    if (!node.hasClass("wp-block-image")) node.addClass("wp-block-image");
  });

  root.find("img").each((_, el) => {
    const node = $(el);
    if (!node.parent().is("figure")) {
      node.wrap('<figure class="wp-block-image"></figure>');
    }
    node.attr("decoding", "async");
  });

  root.find("h2").addClass("wp-block-heading");
  root.find("h3").addClass("wp-block-heading");
  root.find("ul").addClass("wp-block-list");
  root.find("ol").addClass("wp-block-list");

  return root.html() || "";
}

function buildArticleBody(blog: CmsBlog): string {
  // Hero already shows the featured image — body is rich text only (same as most existing posts).
  return lexicalToWpHtml(blog.content);
}

/** Inject CMS cards into the existing Insights listing HTML (keeps original cards). */
export function injectCmsCardsIntoBlogsHtml(bodyHtml: string, blogs: CmsBlog[]): string {
  if (!blogs.length) return bodyHtml;

  const $ = cheerio.load(`<div id="__root">${bodyHtml}</div>`);
  const container = $("#__root .posts-container").first();
  if (!container.length) return bodyHtml;

  const cardsHtml = blogs.map(renderBlogCardHtml).join("\n");
  container.prepend(cardsHtml);
  return $("#__root").html() || bodyHtml;
}

/** Build a full blog page using an existing mirrored post as the chrome/template. */
export function buildCmsBlogPageHtml(
  templateBodyHtml: string,
  blog: CmsBlog,
  adjacent?: { previous: BlogNavItem | null; next: BlogNavItem | null },
): string {
  const $ = cheerio.load(`<div id="__root">${templateBodyHtml}</div>`);
  const root = $("#__root");
  const href = `/${blog.slug}/`;
  const img = featuredImageUrl(blog);
  const catClass = categoryClass(blog.category);
  const catLabel = categoryLabel(blog.category);
  const postId = `cms-${blog.id}`;
  const date = formatBlogDate(blog.publishedDate);
  const avatar = authorAvatarUrl(blog);

  // --- Hero (#page-header-wrap) — matches existing Insights posts ---
  if (img) {
    root.find(".page-header-bg-image").attr("style", `background-image: url(${img});`);
    const socialImg = root.find("img.hidden-social-img").first();
    socialImg.attr("src", img);
    socialImg.attr("alt", blog.title);
  }

  const headerCategory = root.find("#page-header-bg .section-title.blog-title .inner-wrap > a").first();
  if (headerCategory.length) {
    headerCategory.attr("href", `/category/${catClass}/`);
    headerCategory.attr("class", catClass);
    headerCategory.text(catLabel);
  }

  root.find("#page-header-bg h1.entry-title").text(blog.title);

  const headerMeta = root.find("#page-header-bg #single-below-header");
  headerMeta.find(".meta-author a").text(blog.author);
  headerMeta.find(".meta-date.date.published").text(date);
  headerMeta.find(".meta-date.date.updated").text(date);
  headerMeta.find(".meta-comment-count a").attr("href", `${href}#respond`).text("No Comments");

  // Fallback for templates that use centered heading-title instead of page-header-bg
  root.find(".row.heading-title h1.entry-title").text(blog.title);
  const headingCategory = root.find(".row.heading-title .meta-category a").first();
  if (headingCategory.length) {
    headingCategory.attr("href", `/category/${catClass}/`);
    headingCategory.attr("class", catClass);
    headingCategory.text(catLabel);
  }
  root.find(".row.heading-title #single-below-header .meta-author a").text(blog.author);
  root.find(".row.heading-title #single-below-header .meta-date").first().text(date);
  root
    .find(".row.heading-title #single-below-header .meta-comment-count a")
    .attr("href", `${href}#respond`)
    .text("No Comments");

  // --- Article body ---
  const article = root.find("article.post").first();
  article.attr("id", `post-${postId}`);
  article.attr(
    "class",
    `post-${postId} post type-post status-publish format-standard has-post-thumbnail category-${catClass}`,
  );

  const contentInner = article.find(".content-inner").first();
  if (contentInner.length) {
    contentInner.html(buildArticleBody(blog));
  }

  // --- Author bio ---
  const authorBio = root.find("#author-bio");
  if (authorBio.length) {
    authorBio.find("img.avatar").attr("src", avatar).attr("alt", blog.author);
    authorBio.find(".nectar-author-info-title a").text(blog.author);
  }

  // --- Previous / Next — same markup as existing blog pages ---
  const nextPrev = root.find(".blog_next_prev_buttons").first();
  const navHtml = renderBlogNextPrevHtml(adjacent?.previous ?? null, adjacent?.next ?? null);
  if (nextPrev.length) {
    nextPrev.replaceWith(navHtml);
  }

  root.find("#cancel-comment-reply-link").attr("href", `${href}#respond`);

  return root.html() || templateBodyHtml;
}
