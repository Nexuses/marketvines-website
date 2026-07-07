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
