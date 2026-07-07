import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import * as cheerio from "cheerio";
import { imageUrlToLocalPath } from "./download-images.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const PUBLIC = path.join(ROOT, "public");
const RAW_DIR = path.join(ROOT, "content", "raw");
const BASE_URL = "https://marketvines.com";

const downloaded = new Set();
const fontCssUrls = new Set();

const FLAT_ASSET_MAP = {
  "wp-content/themes/Nexuses 2025 New/css/build/grid-system.css": "css/grid-system.css",
  "wp-content/themes/Nexuses%202025%20New/css/build/grid-system.css": "css/grid-system.css",
  "wp-content/themes/Nexuses 2025 New/css/build/style.css": "css/style.css",
  "wp-content/themes/Nexuses%202025%20New/css/build/style.css": "css/style.css",
  "wp-content/themes/Nexuses 2025 New/css/build/responsive.css": "css/responsive.css",
  "wp-content/themes/Nexuses%202025%20New/css/build/responsive.css": "css/responsive.css",
  "wp-content/themes/Nexuses 2025 New/css/build/skin-material.css": "css/skin-material.css",
  "wp-content/themes/Nexuses%202025%20New/css/build/skin-material.css": "css/skin-material.css",
  "wp-content/themes/Nexuses 2025 New/css/salient-dynamic-styles.css": "css/salient-dynamic-styles.css",
  "wp-content/themes/Nexuses%202025%20New/css/salient-dynamic-styles.css": "css/salient-dynamic-styles.css",
  "wp-content/themes/Nexuses 2025 New/css/build/plugins/js_composer.css": "css/js_composer.css",
  "wp-content/themes/Nexuses%202025%20New/css/build/plugins/js_composer.css": "css/js_composer.css",
  "wp-content/themes/Nexuses 2025 New/css/build/style-non-critical.css": "css/style-non-critical.css",
  "wp-content/themes/Nexuses%202025%20New/css/build/style-non-critical.css": "css/style-non-critical.css",
  "wp-content/themes/Nexuses 2025 New/css/build/plugins/jquery.fancybox.css": "css/jquery.fancybox.css",
  "wp-content/themes/Nexuses%202025%20New/css/build/plugins/jquery.fancybox.css": "css/jquery.fancybox.css",
  "wp-content/themes/Nexuses 2025 New/css/build/off-canvas/core.css": "css/core.css",
  "wp-content/themes/Nexuses%202025%20New/css/build/off-canvas/core.css": "css/core.css",
  "wp-content/themes/Nexuses 2025 New/css/build/off-canvas/slide-out-right-material.css": "css/slide-out-right-material.css",
  "wp-content/themes/Nexuses%202025%20New/css/build/off-canvas/slide-out-right-material.css": "css/slide-out-right-material.css",
  "wp-content/themes/Nexuses 2025 New/css/build/off-canvas/slide-out-right-hover.css": "css/slide-out-right-hover.css",
  "wp-content/themes/Nexuses%202025%20New/css/build/off-canvas/slide-out-right-hover.css": "css/slide-out-right-hover.css",
  "wp-content/themes/Nexuses 2025 New/js/build/init.js": "js/init.js",
  "wp-content/themes/Nexuses%202025%20New/js/build/init.js": "js/init.js",
  "wp-content/plugins/js_composer_salient/assets/js/dist/js_composer_front.min.js": "js/js_composer_front.min.js",
};

async function fetchText(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": "MarketVinesMirror/1.0" },
  });
  if (!res.ok) throw new Error(`Failed ${url}: ${res.status}`);
  return res.text();
}

async function fetchBuffer(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": "MarketVinesMirror/1.0" },
  });
  if (!res.ok) throw new Error(`Failed ${url}: ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function stripQuery(url) {
  return url.split("?")[0];
}

function decodePath(p) {
  try {
    return decodeURIComponent(p);
  } catch {
    return p;
  }
}

function resolveLocalRel(absoluteUrl) {
  const parsed = new URL(absoluteUrl);
  let rel = stripQuery(parsed.pathname).replace(/^\//, "");
  rel = decodePath(rel);

  const flatKey = rel.split("?")[0];
  if (FLAT_ASSET_MAP[flatKey]) return FLAT_ASSET_MAP[flatKey];
  const encodedKey = rel.replace(/ /g, "%20");
  if (FLAT_ASSET_MAP[encodedKey]) return FLAT_ASSET_MAP[encodedKey];

  if (rel.startsWith("css/") || rel.startsWith("js/") || rel.startsWith("images/") || rel.startsWith("fonts/")) {
    return rel;
  }

  if (rel.startsWith("wp-content/uploads/")) {
    return `images/wp-content/${rel.slice("wp-content/uploads/".length)}`;
  }

  if (rel.startsWith("wp-includes/") || rel.startsWith("wp-content/")) {
    return rel;
  }

  return null;
}

function toLocalPath(url, pageUrl) {
  if (!url || url.startsWith("data:") || url.startsWith("mailto:") || url.startsWith("tel:") || url.startsWith("#")) {
    return null;
  }

  let absolute = url;
  if (url.startsWith("//")) absolute = `https:${url}`;
  else if (url.startsWith("/")) absolute = `${BASE_URL}${url}`;
  else if (!url.startsWith("http")) absolute = new URL(url, pageUrl).href;

  if (absolute.includes("fonts.googleapis.com/css")) {
    fontCssUrls.add(absolute);
    return null;
  }

  if (absolute.includes("fonts.gstatic.com")) {
    return downloadFontFile(absolute);
  }

  if (absolute.startsWith(BASE_URL) || absolute.startsWith("https://i0.wp.com/marketvines.com")) {
    if (absolute.startsWith("https://i0.wp.com/marketvines.com")) {
      absolute = absolute.replace("https://i0.wp.com/marketvines.com", BASE_URL);
    }
    const imageLocal = imageUrlToLocalPath(absolute);
    if (imageLocal) return imageLocal;
    return resolveLocalRel(absolute);
  }

  return null;
}

async function downloadFontFile(url) {
  const fileName = path.basename(new URL(url).pathname);
  const localRel = `fonts/${fileName}`;
  const localPath = path.join(PUBLIC, localRel);
  if (downloaded.has(localRel)) return localRel;
  downloaded.add(localRel);
  ensureDir(localPath);
  if (!fs.existsSync(localPath)) {
    const buf = await fetchBuffer(url);
    fs.writeFileSync(localPath, buf);
    console.log(`  font: ${localRel}`);
  }
  return localRel;
}

async function downloadAsset(localRel) {
  if (!localRel || downloaded.has(localRel)) return;
  downloaded.add(localRel);

  const localPath = path.join(PUBLIC, localRel);
  ensureDir(localPath);
  if (fs.existsSync(localPath)) return;

  let remotePath = localRel;
  if (localRel.startsWith("images/wp-content/")) {
    remotePath = `wp-content/uploads/${localRel.slice("images/wp-content/".length)}`;
  }

  const remoteUrl = `${BASE_URL}/${remotePath.split(path.sep).join("/")}`;
  try {
    const buf = await fetchBuffer(remoteUrl);
    fs.writeFileSync(localPath, buf);
    console.log(`  asset: ${localRel}`);
  } catch (err) {
    console.warn(`  skip: ${localRel} (${err.message})`);
  }
}

function extractAssetUrls(html, pageUrl) {
  const urls = new Set();
  const $ = cheerio.load(html);

  $("link[href], script[src], img[src], source[src]").each((_, el) => {
    const href = $(el).attr("href") || $(el).attr("src");
    const local = toLocalPath(href, pageUrl);
    if (local && typeof local === "string") urls.add(local);
  });

  $("[srcset]").each((_, el) => {
    const srcset = $(el).attr("srcset") || "";
    for (const part of srcset.split(",")) {
      const u = part.trim().split(/\s+/)[0];
      const local = toLocalPath(u, pageUrl);
      if (local && typeof local === "string") urls.add(local);
    }
  });

  for (const m of html.matchAll(/url\(['"]?([^'")]+)['"]?\)/g)) {
    const local = toLocalPath(m[1], pageUrl);
    if (local && typeof local === "string") urls.add(local);
  }

  return [...urls];
}

async function downloadGoogleFonts() {
  for (const cssUrl of fontCssUrls) {
    if (!cssUrl.includes("/css")) continue;
    try {
      const css = await fetchText(cssUrl);
      const hash = Buffer.from(cssUrl).toString("base64url").slice(0, 20);
      const localCssName = `fonts/google-${hash}.css`;
      const localCssPath = path.join(PUBLIC, localCssName);
      ensureDir(localCssPath);

      let rewritten = css;
      const fontUrls = [...css.matchAll(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/g)];
      for (const m of fontUrls) {
        const localFont = await downloadFontFile(m[1]);
        rewritten = rewritten.replace(m[1], `/${localFont}`);
      }
      fs.writeFileSync(localCssPath, rewritten);
      console.log(`  font css: ${localCssName}`);
    } catch (err) {
      console.warn(`  skip font css: ${cssUrl} (${err.message})`);
    }
  }
}

async function getRoutes() {
  const pages = await fetchText(`${BASE_URL}/wp-json/wp/v2/pages?per_page=100`);
  const posts = await fetchText(`${BASE_URL}/wp-json/wp/v2/posts?per_page=100`);
  const pageList = JSON.parse(pages);
  const postList = JSON.parse(posts);

  const routes = [];
  for (const p of pageList) {
    const slug = p.slug === "home-2" ? "home" : p.slug;
    const url = p.link.endsWith("/") ? p.link : `${p.link}/`;
    routes.push({ slug, url });
  }
  for (const p of postList) {
    const url = p.link.endsWith("/") ? p.link : `${p.link}/`;
    routes.push({ slug: p.slug, url });
  }
  return routes;
}

async function mirrorPage(route) {
  console.log(`Mirroring ${route.url} -> ${route.slug}`);
  const html = await fetchText(route.url);
  const rawPath = path.join(RAW_DIR, `${route.slug}.html`);
  ensureDir(rawPath);
  fs.writeFileSync(rawPath, html, "utf8");

  const assets = extractAssetUrls(html, route.url);
  for (const asset of assets) {
    await downloadAsset(asset);
  }
}

async function main() {
  fs.mkdirSync(RAW_DIR, { recursive: true });
  fs.mkdirSync(PUBLIC, { recursive: true });

  const routes = await getRoutes();
  console.log(`Found ${routes.length} routes`);

  for (const route of routes) {
    await mirrorPage(route);
  }

  await downloadGoogleFonts();
  console.log("Mirror complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
