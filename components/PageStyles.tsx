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

        /* Homepage priority section HubSpot form */
        .home-priority-hubspot-form,
        [data-hs-form-target] {
          margin-top: 1.25rem;
          max-width: 100%;
        }
        .home-priority-hubspot-form .hbspt-form,
        [data-hs-form-target] .hbspt-form {
          width: 100%;
        }
        .home-priority-hubspot-form iframe.hs-form-iframe,
        [data-hs-form-target] iframe.hs-form-iframe {
          width: 100% !important;
          min-height: 220px !important;
          height: 240px !important;
          display: block !important;
          border: 0 !important;
        }
        .home-priority-hubspot-form .hs-form label,
        [data-hs-form-target] .hs-form label {
          font-size: 14px;
          color: #333;
          margin-bottom: 6px;
          display: block;
        }
        .home-priority-hubspot-form .hs-form input[type="email"],
        .home-priority-hubspot-form .hs-form input[type="text"],
        [data-hs-form-target] .hs-form input[type="email"],
        [data-hs-form-target] .hs-form input[type="text"] {
          width: 100%;
          border: 1px solid #cfcfcf;
          border-radius: 2px;
          padding: 10px 12px;
          font-size: 15px;
          box-sizing: border-box;
        }
        .home-priority-hubspot-form .hs-button,
        .home-priority-hubspot-form input[type="submit"],
        [data-hs-form-target] .hs-button,
        [data-hs-form-target] input[type="submit"] {
          background-color: #f5a623 !important;
          border-color: #f5a623 !important;
          color: #fff !important;
          border-radius: 4px !important;
          padding: 12px 22px !important;
          font-weight: 700 !important;
          margin-top: 12px;
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
