"use client";

import { useEffect, useRef } from "react";

interface LegacyScriptsProps {
  scripts: string[];
  inlineScripts: string[];
  slug: string;
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const normalized = src.startsWith("/") ? src : `/${src}`;
    const existing = document.querySelector(`script[data-legacy-src="${normalized}"]`);
    if (existing) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = normalized;
    script.async = false;
    script.dataset.legacySrc = normalized;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load ${normalized}`));
    document.body.appendChild(script);
  });
}

function runInlineScript(code: string, key: string) {
  const id = `legacy-inline-${key}`;
  const existing = document.getElementById(id);
  if (existing) existing.remove();
  const script = document.createElement("script");
  script.id = id;
  script.text = code;
  document.body.appendChild(script);
}

export default function LegacyScripts({ scripts, inlineScripts, slug }: LegacyScriptsProps) {
  const loadedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function loadAll() {
      for (const code of inlineScripts) {
        if (cancelled) return;
        runInlineScript(code, `${slug}-pre-${code.slice(0, 20)}`);
      }

      for (const src of scripts) {
        if (cancelled) return;
        try {
          await loadScript(src);
        } catch (err) {
          console.warn(err);
        }
      }

      const win = window as Window & { jQuery?: (fn: () => void) => void };
      if (!cancelled && win.jQuery) {
        win.jQuery(() => {
          window.dispatchEvent(new Event("resize"));
        });
      }
    }

    if (!loadedRef.current) {
      loadedRef.current = true;
      loadAll();
    } else {
      loadAll();
    }

    return () => {
      cancelled = true;
    };
  }, [scripts, inlineScripts, slug]);

  return null;
}
