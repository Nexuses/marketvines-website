import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const PUBLIC = path.join(ROOT, "public");
const RAW_DIR = path.join(ROOT, "content", "raw");

const downloaded = new Set();

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function decodeSafe(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function imageUrlToLocalPath(url) {
  if (!url || url.startsWith("data:") || url.startsWith("/images/")) return null;

  let u = url.replace(/&#0?38;/g, "&").replace(/&amp;/g, "&");

  const i0 = u.match(/i0\.wp\.com\/marketvines\.com\/(?:wp-content\/uploads|images\/wp-content)\/([^?&#]+)/i);
  if (i0) return `images/wp-content/${decodeSafe(i0[1])}`;

  const direct = u.match(/marketvines\.com\/wp-content\/uploads\/([^?&#]+)/i);
  if (direct) return `images/wp-content/${decodeSafe(direct[1])}`;

  const staging = u.match(/140\.82\.14\.190\/wp-content\/uploads\/([^?&#]+)/i);
  if (staging) return `images/wp-content/${decodeSafe(staging[1])}`;

  const c0 = u.match(/c0\.wp\.com\/[^/]+\/([^?&#]+\.(?:png|jpe?g|gif|webp|avif|svg))/i);
  if (c0) return `images/wp-content/${decodeSafe(c0[1])}`;

  return null;
}

function extractImageUrls(text) {
  const urls = new Set();
  const patterns = [
    /https?:\/\/i0\.wp\.com\/marketvines\.com\/[^"'\s)>]+/gi,
    /https?:\/\/marketvines\.com\/wp-content\/uploads\/[^"'\s)>]+/gi,
    /https?:\/\/140\.82\.14\.190\/wp-content\/uploads\/[^"'\s)>]+/gi,
  ];
  for (const p of patterns) {
    for (const m of text.matchAll(p)) urls.add(m[0]);
  }
  return [...urls];
}

async function fetchBuffer(url) {
  const res = await fetch(url, { headers: { "User-Agent": "MarketVinesMirror/1.0" } });
  if (!res.ok) throw new Error(`${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

async function downloadImage(url) {
  const localRel = imageUrlToLocalPath(url);
  if (!localRel || downloaded.has(localRel)) return;

  downloaded.add(localRel);
  const localPath = path.join(PUBLIC, localRel.split("/").join(path.sep));
  ensureDir(localPath);
  if (fs.existsSync(localPath)) return;

  const sources = [
    url.split("?")[0],
    url,
    url.replace("i0.wp.com/marketvines.com", "marketvines.com"),
    `https://marketvines.com/wp-content/uploads/${localRel.replace("images/wp-content/", "")}`,
  ];

  for (const src of sources) {
    try {
      const buf = await fetchBuffer(src);
      fs.writeFileSync(localPath, buf);
      console.log(`  image: ${localRel}`);
      return;
    } catch {
      /* try next */
    }
  }
  console.warn(`  skip image: ${localRel}`);
}

async function main() {
  const files = fs.readdirSync(RAW_DIR).filter((f) => f.endsWith(".html"));
  const allUrls = new Set();
  for (const file of files) {
    const html = fs.readFileSync(path.join(RAW_DIR, file), "utf8");
    for (const u of extractImageUrls(html)) allUrls.add(u);
  }
  console.log(`Downloading ${allUrls.size} images...`);
  for (const url of allUrls) {
    await downloadImage(url);
  }
  console.log("Image download complete.");
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isMain) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
