"use client";

interface PageStylesProps {
  stylesheets: string[];
  inlineStyles: string[];
}

export default function PageStyles({ stylesheets, inlineStyles }: PageStylesProps) {
  const filtered = stylesheets.filter((href) => !href.includes("fonts.googleapis.com") && !href.includes("/fonts/google-"));
  return (
    <>
      {filtered.map((href) => (
        <link key={href} rel="stylesheet" href={href} />
      ))}
      {inlineStyles.map((styleHtml, i) => (
        <style
          key={`inline-${i}`}
          dangerouslySetInnerHTML={{ __html: styleHtml.replace(/^<style[^>]*>|<\/style>$/gi, "") }}
        />
      ))}
      <style>{`
        .container-wrap {
          padding-top: 0 !important;
        }

        img {
          opacity: 1 !important;
          animation: none !important;
          -webkit-animation: none !important;
        }

        img.img-with-animation {
          opacity: 1 !important;
          animation: none !important;
          -webkit-animation: none !important;
          transform: none !important;
          -webkit-transform: none !important;
        }

        img.img-with-animation[data-animation="fade-in"],
        img.img-with-animation[data-animation="fade-in-from-left"],
        img.img-with-animation[data-animation="fade-in-from-right"],
        img.img-with-animation[data-animation="fade-in-from-bottom"] {
          opacity: 1 !important;
          animation: none !important;
          -webkit-animation: none !important;
          transform: none !important;
          -webkit-transform: none !important;
          transition: none !important;
          -webkit-transition: none !important;
        }

        /* body { overflow:hidden } breaks native lazy-load; force paint */
        .img-with-aniamtion-wrap,
        .img-with-aniamtion-wrap .inner,
        .img-with-aniamtion-wrap .hover-wrap,
        .img-with-aniamtion-wrap .hover-wrap-inner {
          opacity: 1 !important;
          visibility: visible !important;
        }

        html body,
        html body *:not(.fa):not(.fas):not(.far):not(.fab):not(.fal):not(.fad):not(.dashicons):not(.vc-composer-icon):not(
            [class*=" icon-"]
          ):not([class^="icon-"]):not(.nectar-icon):not(.mejs-overlay):not(.mejs-offscreen) {
          font-family: var(--font-inter), "Inter", system-ui, sans-serif !important;
        }
      `}</style>
    </>
  );
}
