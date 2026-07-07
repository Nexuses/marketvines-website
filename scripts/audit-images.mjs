import fs from "fs";
import path from "path";

const ROOT = "c:/Users/Ash/Downloads/marketvines";
const PUBLIC = path.join(ROOT, "public");
const PAGES = path.join(ROOT, "content/pages");

const refs = new Set();
const patterns = [
  /\/images\/[^"'\s)>]+/g,
  /url\((['"]?)(\/images\/[^)'"]+)\1\)/g,
  /srcset="([^"]+)"/g,
];

for (const file of fs.readdirSync(PAGES).filter((f) => f.endsWith(".json"))) {
  const data = JSON.parse(fs.readFileSync(path.join(PAGES, file), "utf8"));
  const text = JSON.stringify(data);
  for (const m of text.matchAll(/\/images\/[^"'\s\\)>]+/g)) refs.add(m[0].split("?")[0]);
  for (const m of text.matchAll(/https?:\/\/i0\.wp\.com\/[^"'\s\\)>]+/g)) refs.add(m[0]);
  for (const m of text.matchAll(/https?:\/\/marketvines\.com\/wp-content\/uploads\/[^"'\s\\)>]+/g)) refs.add(m[0]);
}

const missing = [];
const remote = [];
const ok = [];

for (const ref of [...refs].sort()) {
  if (ref.startsWith("http")) {
    remote.push(ref);
    continue;
  }
  const local = path.join(PUBLIC, ref.slice(1).split("/").join(path.sep));
  if (fs.existsSync(local)) ok.push(ref);
  else missing.push(ref);
}

console.log("Total refs:", refs.size);
console.log("OK local:", ok.length);
console.log("Missing local:", missing.length);
missing.forEach((m) => console.log(" MISSING", m));
console.log("Remote URLs still in content:", remote.length);
remote.slice(0, 20).forEach((r) => console.log(" REMOTE", r));
