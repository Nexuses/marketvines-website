"use client";

import { useEffect } from "react";
import type { MirroredPageData } from "@/lib/types";
import PageStyles from "./PageStyles";
import LegacyScripts from "./LegacyScripts";
import LocalImages from "./LocalImages";
import HeroYouTube from "./HeroYouTube";

interface MirroredPageProps {
  page: MirroredPageData;
}

export default function MirroredPage({ page }: MirroredPageProps) {
  useEffect(() => {
    const interClass = document.body.classList.contains("font-inter") ? "font-inter" : "";
    const nextFontClass = [...document.body.classList].find((c) => c.startsWith("__className_")) ?? "";
    document.body.className = [page.bodyClass, interClass, nextFontClass].filter(Boolean).join(" ");
    for (const [key, value] of Object.entries(page.bodyAttrs || {})) {
      document.body.setAttribute(key, value);
    }
    document.title = page.title;

    const handleFormSubmit = (e: Event) => {
      const target = e.target as HTMLFormElement;
      if (target?.matches("form[data-static-form], form")) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    if (page.disableForms) {
      document.addEventListener("submit", handleFormSubmit, true);
    }

    return () => {
      if (page.disableForms) {
        document.removeEventListener("submit", handleFormSubmit, true);
      }
    };
  }, [page]);

  return (
    <>
      <PageStyles stylesheets={page.stylesheets} inlineStyles={page.inlineStyles} />
      <div id="mirrored-page-root" dangerouslySetInnerHTML={{ __html: page.bodyHtml }} />
      <LocalImages slug={page.slug} />
      <HeroYouTube slug={page.slug} />
      <LegacyScripts scripts={page.scripts} inlineScripts={page.inlineScripts} slug={page.slug} />
    </>
  );
}
