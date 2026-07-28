"use client";

import { useEffect } from "react";

interface LegacyScriptsProps {
  scripts: string[];
  inlineScripts: string[];
  slug: string;
}

type HubSpotForms = {
  forms: { create: (opts: Record<string, unknown>) => void };
};

function normalizeScriptSrc(src: string): string {
  if (/^https?:\/\//i.test(src) || src.startsWith("//")) return src;
  return src.startsWith("/") ? src : `/${src}`;
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const normalized = normalizeScriptSrc(src);
    const existing = Array.from(document.querySelectorAll<HTMLScriptElement>("script[data-legacy-src]")).find(
      (el) => el.dataset.legacySrc === normalized
    );

    if (existing) {
      if (existing.dataset.legacyLoaded === "1") {
        resolve();
        return;
      }
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error(`Failed to load ${normalized}`)), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = normalized;
    script.async = false;
    script.dataset.legacySrc = normalized;
    script.onload = () => {
      script.dataset.legacyLoaded = "1";
      resolve();
    };
    script.onerror = () => reject(new Error(`Failed to load ${normalized}`));
    document.body.appendChild(script);
  });
}

function waitForHbspt(timeoutMs = 10000): Promise<HubSpotForms | null> {
  return new Promise((resolve) => {
    const start = Date.now();
    const tick = () => {
      const hbspt = (window as unknown as { hbspt?: HubSpotForms }).hbspt;
      if (hbspt?.forms?.create) {
        resolve(hbspt);
        return;
      }
      if (Date.now() - start >= timeoutMs) {
        resolve(null);
        return;
      }
      window.setTimeout(tick, 50);
    };
    tick();
  });
}

function extractHubSpotFormOptions(code: string): Record<string, unknown> | null {
  const match = code.match(/hbspt\.forms\.create\s*\(\s*(\{[\s\S]*\})\s*\)\s*;?\s*$/);
  if (!match) return null;
  try {
    // eslint-disable-next-line no-new-func
    return new Function(`return (${match[1]})`)() as Record<string, unknown>;
  } catch {
    return null;
  }
}

/**
 * Theme/jQuery scripts are useful; mirrored WP inline scripts (hbspt, wp.i18n,
 * JSON blobs) crash React when injected. Only handle HubSpot forms explicitly.
 */
export default function LegacyScripts({ scripts, inlineScripts, slug }: LegacyScriptsProps) {
  useEffect(() => {
    let cancelled = false;

    async function loadAll() {
      for (const src of scripts) {
        if (cancelled) return;
        try {
          await loadScript(src);
        } catch (err) {
          console.warn(err);
        }
      }

      if (cancelled) return;

      const hubSpotInline = inlineScripts.find((code) => /\bhbspt\.forms\.create\s*\(/.test(code));
      if (hubSpotInline && !document.querySelector(`[data-hs-form-mounted="${slug}"]`)) {
        const marker = document.createElement("div");
        marker.hidden = true;
        marker.dataset.hsFormMounted = slug;
        document.body.appendChild(marker);

        const opts = extractHubSpotFormOptions(hubSpotInline) || {};
        // Prefer in-page targets (e.g. homepage priority section) over body append
        const targetEl =
          document.querySelector<HTMLElement>("[data-hs-form-target]") ||
          document.getElementById("home-priority-hubspot-form");
        if (targetEl) {
          if (!targetEl.id) targetEl.id = `hs-form-target-${slug}`;
          opts.target = `#${targetEl.id}`;
        }

        // Keep iframe visible once HubSpot mounts (it often starts at height:0)
        opts.onFormReady = () => {
          const iframe = targetEl?.querySelector<HTMLIFrameElement>("iframe.hs-form-iframe");
          if (iframe) {
            iframe.style.height = "auto";
            iframe.style.minHeight = "220px";
            // Read content height when same-origin / accessible
            try {
              const doc = iframe.contentDocument;
              const h = doc?.body?.scrollHeight;
              if (h && h > 40) iframe.style.height = `${h + 16}px`;
            } catch {
              iframe.style.height = "240px";
            }
          }
        };

        const hbspt = await waitForHbspt();
        if (!cancelled && hbspt) {
          try {
            // Clear any previous empty iframe before recreate
            if (targetEl) targetEl.innerHTML = "";
            hbspt.forms.create(opts);

            const fixHeight = () => {
              const iframe = targetEl?.querySelector<HTMLIFrameElement>("iframe.hs-form-iframe, iframe");
              if (!iframe) return false;
              if (iframe.clientHeight < 40) {
                iframe.style.minHeight = "220px";
                iframe.style.height = "240px";
                iframe.style.display = "block";
                iframe.style.width = "100%";
              }
              return iframe.clientHeight >= 40 || iframe.style.minHeight === "220px";
            };
            [300, 800, 1600, 3200].forEach((ms) => {
              window.setTimeout(() => {
                if (!cancelled) fixHeight();
              }, ms);
            });

            // HubSpot sometimes appends async; relocate orphans into the section
            if (targetEl) {
              const relocate = () => {
                if (targetEl.querySelector(".hbspt-form, .hs-form, iframe.hs-form-iframe")) return true;
                const orphan = document.querySelector<HTMLElement>("body > .hbspt-form");
                if (orphan && !targetEl.contains(orphan)) {
                  targetEl.appendChild(orphan);
                  return true;
                }
                return false;
              };
              if (!relocate()) {
                const times = [200, 600, 1500, 3000];
                times.forEach((ms) => window.setTimeout(() => { if (!cancelled) relocate(); }, ms));
              }
            }
          } catch (err) {
            console.warn("[LegacyScripts] HubSpot form create failed:", err);
          }
        } else if (!hbspt) {
          console.warn("[LegacyScripts] HubSpot embed unavailable; form skipped");
        }
      }

      // Intentionally do NOT eval other inlineScripts (wp.i18n, JSON prefetch, etc.)

      const win = window as Window & { jQuery?: (fn: () => void) => void };
      if (!cancelled && win.jQuery) {
        win.jQuery(() => {
          window.dispatchEvent(new Event("resize"));
        });
      }
    }

    void loadAll();

    return () => {
      cancelled = true;
    };
  }, [scripts, inlineScripts, slug]);

  return null;
}
