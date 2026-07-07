# MarketVines — Next.js Mirror

A local Next.js mirror of [marketvines.com](https://marketvines.com) preserving the original Salient/WordPress HTML, CSS, animations, and scripts.

## Setup

```bash
npm install
npm run mirror   # Download all pages + assets from live site
npm run dev      # Start dev server at http://localhost:3000
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run mirror` | Crawl live site + download images + transform HTML to JSON |
| `npm run process` | Re-transform raw HTML only (no download) |
| `npm run qa` | Verify all 14 routes return HTTP 200 |

## Project structure

- `content/raw/` — Raw HTML downloaded from live site
- `content/pages/` — Processed JSON per route (used by Next.js)
- `public/css`, `public/js`, `public/images` — Local assets
- `components/MirroredPage.tsx` — Renders mirrored HTML + legacy scripts
- `scripts/mirror-site.mjs` — Crawler
- `scripts/process-html.mjs` — HTML transformer

## Notes

- Forms on Contact Us and Book a Demo are display-only (no submission).
- Re-run `npm run mirror` to sync changes from the live WordPress site.
