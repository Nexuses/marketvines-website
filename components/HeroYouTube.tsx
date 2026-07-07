"use client";

import { useEffect } from "react";

function extractVideoId(url: string): string {
  const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : "Hd5H1sds6EU";
}

export default function HeroYouTube({ slug }: { slug: string }) {
  useEffect(() => {
    const containers = document.querySelectorAll<HTMLElement>(".nectar-youtube-bg");

    containers.forEach((container, index) => {
      if (container.dataset.ytInit === "true") return;
      container.dataset.ytInit = "true";

      const span = container.querySelector("span");
      const url = span?.textContent?.trim() || "";
      const videoId = extractVideoId(url);

      container.innerHTML = "";
      const iframe = document.createElement("iframe");
      iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&rel=0&modestbranding=1&playsinline=1&iv_load_policy=3&disablekb=1&fs=0`;
      iframe.allow = "autoplay; encrypted-media; picture-in-picture";
      iframe.setAttribute("frameborder", "0");
      iframe.setAttribute("tabindex", "-1");
      iframe.title = "Hero background video";
      iframe.id = `hero-yt-${slug}-${index}`;
      container.appendChild(iframe);
    });
  }, [slug]);

  return null;
}
