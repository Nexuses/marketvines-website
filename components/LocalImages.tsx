"use client";

import { useEffect } from "react";

function toLocalImageSrc(url: string): string | null {
  if (!url || url.startsWith("data:") || url.startsWith("/images/")) return null;

  const i0 = url.match(/i0\.wp\.com\/marketvines\.com\/(?:wp-content\/uploads|images\/wp-content)\/([^?&#]+)/i);
  if (i0) return `/images/wp-content/${decodeURIComponent(i0[1])}`;

  const direct = url.match(/marketvines\.com\/wp-content\/uploads\/([^?&#]+)/i);
  if (direct) return `/images/wp-content/${decodeURIComponent(direct[1])}`;

  const staging = url.match(/140\.82\.14\.190\/wp-content\/uploads\/([^?&#]+)/i);
  if (staging) return `/images/wp-content/${decodeURIComponent(staging[1])}`;

  return null;
}

function resolveSrcCandidate(img: HTMLImageElement): string | null {
  const attrs = ["src", "data-src", "data-lazy-src", "data-original", "data-bg"];
  for (const attr of attrs) {
    const val = img.getAttribute(attr);
    if (val && !val.startsWith("data:")) {
      return toLocalImageSrc(val) || (val.startsWith("/") ? val : null) || val;
    }
  }
  return null;
}

function fixImage(img: HTMLImageElement) {
  // body { overflow:hidden } breaks native lazy-loading intersection checks
  img.removeAttribute("loading");
  img.loading = "eager";
  img.classList.remove("lazy", "lazyload", "lazyloading");

  const resolved = resolveSrcCandidate(img);
  if (resolved) {
    const local = toLocalImageSrc(resolved) || resolved;
    if (img.getAttribute("src") !== local) img.src = local;
  }

  const srcset =
    img.getAttribute("srcset") ||
    img.getAttribute("data-srcset") ||
    img.getAttribute("data-lazy-srcset");
  if (srcset && (srcset.includes("i0.wp.com") || srcset.includes("marketvines.com/wp-content") || srcset.includes("/images/"))) {
    const fixed = srcset
      .split(",")
      .map((part) => {
        const pieces = part.trim().split(/\s+/);
        const local = toLocalImageSrc(pieces[0]);
        if (local) return pieces.length > 1 ? `${local} ${pieces.slice(1).join(" ")}` : local;
        return part.trim();
      })
      .join(", ");
    img.srcset = fixed;
    img.removeAttribute("data-srcset");
    img.removeAttribute("data-lazy-srcset");
  }

  img.style.opacity = "1";
  img.style.visibility = "visible";
}

export default function LocalImages({ slug }: { slug: string }) {
  useEffect(() => {
    const root = document.getElementById("mirrored-page-root");
    if (!root) return;

    root.querySelectorAll<HTMLImageElement>("img").forEach(fixImage);

    root.querySelectorAll<HTMLElement>("[style*='background-image']").forEach((el) => {
      const style = el.getAttribute("style");
      if (!style) return;
      const fixed = style.replace(/url\((['"]?)([^)'"]+)\1\)/g, (match, quote, val) => {
        const local = toLocalImageSrc(val);
        return local ? `url(${quote}${local}${quote})` : match;
      });
      if (fixed !== style) el.setAttribute("style", fixed);
    });
  }, [slug]);

  return null;
}
