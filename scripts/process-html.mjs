import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import * as cheerio from "cheerio";
import { imageUrlToLocalPath } from "./download-images.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const RAW_DIR = path.join(ROOT, "content", "raw");
const OUT_DIR = path.join(ROOT, "content", "pages");
const PUBLIC = path.join(ROOT, "public");
const BASE_URL = "https://marketvines.com";

const INTERNAL_PATHS = new Map([
  ["", "/"],
  ["home-2", "/"],
  ["lead-generation", "/lead-generation/"],
  ["events", "/events/"],
  ["blogs", "/blogs/"],
  ["about-us", "/about-us/"],
  ["contact-us", "/contact-us/"],
  ["book-a-demo", "/book-a-demo/"],
  ["ai-conversations-one-voice-five-lanes-wide", "/ai-conversations-one-voice-five-lanes-wide/"],
  ["navigating-ai-mistrust-insights-and-solutions", "/navigating-ai-mistrust-insights-and-solutions/"],
  ["taking-steps-to-construct-trustworthy-ai", "/taking-steps-to-construct-trustworthy-ai/"],
  ["people-coordinating-with-ai-sales-expertise", "/people-coordinating-with-ai-sales-expertise/"],
  ["marketvines-ai-and-expertise-transforming-b2b-growth", "/marketvines-ai-and-expertise-transforming-b2b-growth/"],
  [
    "the-demand-generation-wedding-why-product-management-is-never-in-charge-of-the-party",
    "/the-demand-generation-wedding-why-product-management-is-never-in-charge-of-the-party/",
  ],
  ["94-2", "/94-2/"],
]);

const WP_TO_FLAT = [
  [/wp-content\/themes\/Nexuses(?:%20| )2025(?:%20| )New\/css\/build\/grid-system\.css/i, "/css/grid-system.css"],
  [/wp-content\/themes\/Nexuses(?:%20| )2025(?:%20| )New\/css\/build\/style\.css/i, "/css/style.css"],
  [/wp-content\/themes\/Nexuses(?:%20| )2025(?:%20| )New\/css\/build\/responsive\.css/i, "/css/responsive.css"],
  [/wp-content\/themes\/Nexuses(?:%20| )2025(?:%20| )New\/css\/build\/skin-material\.css/i, "/css/skin-material.css"],
  [/wp-content\/themes\/Nexuses(?:%20| )2025(?:%20| )New\/css\/salient-dynamic-styles\.css/i, "/css/salient-dynamic-styles.css"],
  [/wp-content\/themes\/Nexuses(?:%20| )2025(?:%20| )New\/css\/build\/plugins\/js_composer\.css/i, "/css/js_composer.css"],
  [/wp-content\/themes\/Nexuses(?:%20| )2025(?:%20| )New\/css\/build\/style-non-critical\.css/i, "/css/style-non-critical.css"],
  [/wp-content\/themes\/Nexuses(?:%20| )2025(?:%20| )New\/css\/build\/plugins\/jquery\.fancybox\.css/i, "/css/jquery.fancybox.css"],
  [/wp-content\/themes\/Nexuses(?:%20| )2025(?:%20| )New\/css\/build\/off-canvas\/core\.css/i, "/css/core.css"],
  [/wp-content\/themes\/Nexuses(?:%20| )2025(?:%20| )New\/css\/build\/off-canvas\/slide-out-right-material\.css/i, "/css/slide-out-right-material.css"],
  [/wp-content\/themes\/Nexuses(?:%20| )2025(?:%20| )New\/css\/build\/off-canvas\/slide-out-right-hover\.css/i, "/css/slide-out-right-hover.css"],
  [/wp-content\/themes\/Nexuses(?:%20| )2025(?:%20| )New\/css\/build\/elements\/element-testimonial\.css/i, "/css/element-testimonial.css"],
  [/wp-content\/themes\/Nexuses(?:%20| )2025(?:%20| )New\/css\/build\/elements\/element-icon-with-text\.css/i, "/css/element-icon-with-text.css"],
  [/wp-content\/themes\/Nexuses(?:%20| )2025(?:%20| )New\/css\/build\/elements\/element-wpb-column-border\.css/i, "/css/element-wpb-column-border.css"],
  [/wp-includes\/js\/jquery\/jquery\.min\.js/i, "/js/jquery.min.js"],
  [/wp-includes\/js\/jquery\/jquery-migrate\.min\.js/i, "/js/jquery-migrate.min.js"],
  [/wp-content\/themes\/Nexuses(?:%20| )2025(?:%20| )New\/js\/build\/third-party\/jquery\.easing\.min\.js/i, "/js/jquery.easing.min.js"],
  [/wp-content\/themes\/Nexuses(?:%20| )2025(?:%20| )New\/js\/build\/third-party\/jquery\.mousewheel\.min\.js/i, "/js/jquery.mousewheel.min.js"],
  [/wp-content\/themes\/Nexuses(?:%20| )2025(?:%20| )New\/js\/build\/priority\.js/i, "/js/priority.js"],
  [/wp-content\/themes\/Nexuses(?:%20| )2025(?:%20| )New\/js\/build\/third-party\/transit\.min\.js/i, "/js/transit.min.js"],
  [/wp-content\/themes\/Nexuses(?:%20| )2025(?:%20| )New\/js\/build\/third-party\/waypoints\.js/i, "/js/waypoints.js"],
  [/wp-content\/themes\/Nexuses(?:%20| )2025(?:%20| )New\/js\/build\/third-party\/imagesLoaded\.min\.js/i, "/js/imagesLoaded.min.js"],
  [/wp-content\/themes\/Nexuses(?:%20| )2025(?:%20| )New\/js\/build\/third-party\/hoverintent\.min\.js/i, "/js/hoverintent.min.js"],
  [/wp-content\/themes\/Nexuses(?:%20| )2025(?:%20| )New\/js\/build\/third-party\/jquery\.fancybox\.js/i, "/js/jquery.fancybox.js"],
  [/wp-content\/themes\/Nexuses(?:%20| )2025(?:%20| )New\/js\/build\/third-party\/anime\.min\.js/i, "/js/anime.min.js"],
  [/wp-content\/themes\/Nexuses(?:%20| )2025(?:%20| )New\/js\/build\/third-party\/superfish\.js/i, "/js/superfish.js"],
  [/wp-content\/themes\/Nexuses(?:%20| )2025(?:%20| )New\/js\/build\/init\.js/i, "/js/init.js"],
  [/wp-content\/themes\/Nexuses(?:%20| )2025(?:%20| )New\/js\/build\/elements\/nectar-testimonial-slider\.js/i, "/js/nectar-testimonial-slider.js"],
  [/wp-content\/plugins\/salient-core\/js\/third-party\/touchswipe\.min\.js/i, "/js/touchswipe.min.js"],
  [/wp-content\/plugins\/js_composer_salient\/assets\/js\/dist\/js_composer_front\.min\.js/i, "/js/js_composer_front.min.js"],
  [/wp-content\/plugins\/jetpack\/jetpack_vendor\/automattic\/jetpack-forms\/.*?jetpack-forms-layout\.css/i, "/css/jetpack-forms-layout.css"],
  [/wp-includes\/css\/dashicons\.min\.css/i, "/css/dashicons.min.css"],
];

const STRIP_SCRIPT_PATTERNS = [
  /wp-emoji-release/i,
  /stats\.wp\.com/i,
  /jetpack.*stats/i,
  /\/w\.js/i,
  /e-202\d+\.js/i,
  /jp-search\.js/i,
  /i18n-loader\.js/i,
];

function normalizeAssetPath(url) {
  if (!url) return url;
  // Keep absolute external URLs (e.g. Gravatar) intact
  if (/^https?:\/\//i.test(url) || url.startsWith("//")) {
    if (url.startsWith("//")) return `https:${url}`;
    return url;
  }
  let u = url.split("?")[0];
  if (u.startsWith(BASE_URL)) u = u.slice(BASE_URL.length);
  if (!u.startsWith("/")) u = `/${u}`;

  for (const [pattern, replacement] of WP_TO_FLAT) {
    if (pattern.test(u)) return replacement;
  }

  if (u.includes("/wp-content/uploads/")) {
    u = u.replace("/wp-content/uploads/", "/images/wp-content/");
  }

  if (u.match(/^\/(css|js|images|fonts|wp-content|wp-includes)\//)) {
    return u;
  }

  return u;
}

function rewriteInternalLink(url) {
  if (!url) return url;
  let absolute = url;
  if (url.startsWith("//")) absolute = `https:${url}`;
  else if (url.startsWith("/")) absolute = `${BASE_URL}${url}`;

  if (absolute.startsWith(BASE_URL)) {
    const pathname = new URL(absolute).pathname.replace(/^\/|\/$/g, "");
    if (INTERNAL_PATHS.has(pathname)) return INTERNAL_PATHS.get(pathname);
  }
  return url;
}

function rewriteImageUrl(url) {
  if (!url || url.startsWith("data:") || url.startsWith("mailto:") || url.startsWith("tel:") || url.startsWith("#")) {
    return url;
  }
  const local = imageUrlToLocalPath(url);
  if (local) return `/${local}`;
  return null;
}

function rewriteHtml(html) {
  let out = html.replace(/&#0?38;/g, "&").replace(/&amp;/g, "&");

  out = out.replaceAll("https://marketvines.com", "");
  out = out.replaceAll("http://marketvines.com", "");
  out = out.replaceAll('href="//marketvines.com', 'href="');
  out = out.replaceAll("href='//marketvines.com", "href='");

  out = out.replace(/nectarLove\s*=\s*\{[^}]+\}/g, () =>
    'nectarLove = {"ajaxurl":"/","postID":"48","rooturl":"/","disqusComments":"false","loveNonce":"","mapApiKey":""}'
  );

  out = out.replace(/https?:\/\/marketvines\.com\/wp-admin\/admin-ajax\.php/g, "/");

  // Rewrite i0.wp.com and wp-content image URLs everywhere
  out = out.replace(/https?:\/\/i0\.wp\.com\/marketvines\.com\/[^"'\s)>,]+/gi, (match) => {
    const local = rewriteImageUrl(match);
    return local || match;
  });

  out = out.replace(/https?:\/\/140\.82\.14\.190\/wp-content\/uploads\/[^"'\s)>,]+/gi, (match) => {
    const local = rewriteImageUrl(match);
    return local || match;
  });

  out = out.replace(/https?:\/\/marketvines\.com\/wp-content\/uploads\/[^"'\s)>,]+/gi, (match) => {
    const local = rewriteImageUrl(match);
    return local || match;
  });

  out = out.replace(/srcset=(["'])([^"']+)\1/gi, (match, quote, val) => {
    const parts = val.split(",").map((part) => {
      const pieces = part.trim().split(/\s+/);
      const url = pieces[0];
      // Never rewrite absolute external URLs through normalizeAssetPath
      if (/^https?:\/\//i.test(url) || url.startsWith("//")) {
        const abs = url.startsWith("//") ? `https:${url}` : url;
        const descriptor = pieces.slice(1).join(" ");
        return descriptor ? `${abs} ${descriptor}` : abs;
      }
      const local = rewriteImageUrl(url) || normalizeAssetPath(url);
      const descriptor = pieces.slice(1).join(" ");
      return descriptor ? `${local} ${descriptor}` : local;
    });
    return `srcset=${quote}${parts.join(", ")}${quote}`;
  });

  out = out.replace(/(href|src|content)=(["'])([^"']+)\2/g, (match, attr, quote, val) => {
    if (val.startsWith("mailto:") || val.startsWith("tel:") || val.startsWith("#") || val.startsWith("data:")) {
      return match;
    }
    if (val.includes("fonts.googleapis.com")) return match;

    const imageLocal = rewriteImageUrl(val);
    if (imageLocal) return `${attr}=${quote}${imageLocal}${quote}`;

    if (val.startsWith("http") && !val.includes("youtube.com") && !val.includes("fonts.gstatic.com")) {
      const rewritten = rewriteInternalLink(val);
      if (rewritten !== val) return `${attr}=${quote}${rewritten}${quote}`;
      return match;
    }
    const asset = normalizeAssetPath(val);
    if (asset.startsWith("/")) return `${attr}=${quote}${asset}${quote}`;
    return match;
  });

  out = out.replace(/url\((['"]?)([^)'"]+)\1\)/g, (match, quote, val) => {
    if (val.startsWith("data:")) return match;
    const imageLocal = rewriteImageUrl(val);
    if (imageLocal) return `url(${quote}${imageLocal}${quote})`;
    const asset = normalizeAssetPath(val);
    if (asset.startsWith("/")) return `url(${quote}${asset}${quote})`;
    return match;
  });

  return out;
}

function shouldStripScript(src) {
  if (!src) return false;
  return STRIP_SCRIPT_PATTERNS.some((p) => p.test(src));
}

function normalizeScriptSrc(src) {
  const normalized = normalizeAssetPath(src);
  if (normalized.startsWith("/")) return normalized.slice(1);
  if (src.startsWith("http") && src.includes("youtube.com")) return src;
  return null;
}

function fileExistsForAsset(assetPath) {
  if (!assetPath.startsWith("/")) return false;
  const local = path.join(PUBLIC, assetPath.slice(1).split("/").join(path.sep));
  return fs.existsSync(local);
}

function processFile(slug) {
  const rawPath = path.join(RAW_DIR, `${slug}.html`);
  if (!fs.existsSync(rawPath)) {
    console.warn(`Skip missing raw: ${slug}`);
    return;
  }

  const raw = fs.readFileSync(rawPath, "utf8");
  const $ = cheerio.load(raw);

  const title = $("title").first().text().trim() || "MarketVines";
  const bodyClass = $("body").attr("class") || "";
  const bodyAttrs = {};
  for (const [key, val] of Object.entries($("body").attr() || {})) {
    if (key !== "class") bodyAttrs[key] = val;
  }

  const stylesheets = [];
  $("link[rel='stylesheet'], link[rel='stylesheet preload'], link[id][href*='.css']").each((_, el) => {
    const href = $(el).attr("href");
    if (!href || href.includes("fonts.googleapis.com")) return;
    const normalized = normalizeAssetPath(href);
    if (normalized.endsWith(".css") && fileExistsForAsset(normalized)) {
      stylesheets.push(normalized);
    } else if (normalized.endsWith(".css")) {
      stylesheets.push(normalized);
    }
  });

  const inlineStyles = [];
  $("head style").each((_, el) => {
    inlineStyles.push(rewriteHtml($(el).prop("outerHTML") || ""));
  });

  const scripts = [];
  const inlineScripts = [];
  $("body script").each((_, el) => {
    const src = $(el).attr("src");
    if (src) {
      if (shouldStripScript(src)) return;
      const normalized = normalizeScriptSrc(src);
      if (!normalized) return;
      if (normalized.startsWith("http")) {
        scripts.push(normalized);
      } else {
        scripts.push(normalized);
      }
    } else {
      const content = $(el).html() || "";
      if (content.trim() && !content.includes("wp-emoji") && !content.includes("lazyloadRunObserver") && !content.includes("jpI18nLoader")) {
        inlineScripts.push(content.trim());
      }
    }
  });

  $("body script").remove();

  const disableForms = slug === "contact-us" || slug === "book-a-demo";
  if (disableForms) {
    $("form").each((_, el) => {
      $(el).attr("action", "#");
      $(el).attr("method", "get");
      $(el).attr("data-static-form", "true");
    });
  }

  let bodyHtml = $("body").html() || "";
  bodyHtml = rewriteHtml(bodyHtml);

  const pagePath = slug === "home" ? "/" : `/${slug}/`;

  const output = {
    slug,
    path: pagePath,
    title,
    bodyClass,
    bodyAttrs,
    stylesheets: [...new Set(stylesheets)],
    inlineStyles,
    bodyHtml,
    scripts: [...new Set(scripts)],
    inlineScripts,
    disableForms,
  };

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(path.join(OUT_DIR, `${slug}.json`), JSON.stringify(output, null, 2), "utf8");
  console.log(`Processed ${slug} (${output.scripts.length} scripts, ${output.stylesheets.length} stylesheets)`);
}

function main() {
  const files = fs.readdirSync(RAW_DIR).filter((f) => f.endsWith(".html"));
  for (const file of files) {
    processFile(file.replace(/\.html$/, ""));
  }
  console.log("Transform complete.");
}

main();
