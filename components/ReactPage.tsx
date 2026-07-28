'use client';

import { useEffect } from 'react';
import Navigation from './Navigation';
import Footer from './Footer';
import PageStyles from './PageStyles';
import LocalImages from './LocalImages';
import LegacyScripts from './LegacyScripts';
import HeroYouTube from './HeroYouTube';
import SectionRenderer from './SectionRenderer';

interface PageData {
  slug: string;
  title: string;
  bodyHtml?: string;
  bodyClass?: string;
  bodyAttrs?: Record<string, string>;
  navigation?: {
    logoSrc: string;
    logoAlt: string;
    items: { label: string; href: string; isButton?: boolean }[];
  };
  sections?: Array<{ type: string; id?: string; data: Record<string, unknown> }>;
  footer?: {
    columns: { title: string; links: { label: string; href: string }[] }[];
    copyright: string;
  };
  stylesheets?: string[];
  inlineStyles?: string[];
  scripts?: string[];
  inlineScripts?: string[];
  disableForms?: boolean;
}

interface PageProps {
  page: PageData;
}

export default function ReactPage({ page }: PageProps) {
  const defaultStylesheets = [
    '/css/jetpack-forms-layout.css',
    '/css/grid-system.css',
    '/css/style.css',
    '/css/element-testimonial.css',
    '/css/element-icon-with-text.css',
    '/css/element-wpb-column-border.css',
    '/css/responsive.css',
    '/css/skin-material.css',
    '/css/dashicons.min.css',
    '/css/js_composer.css',
    '/css/salient-dynamic-styles.css',
    '/css/style-non-critical.css',
    '/css/jquery.fancybox.css',
    '/css/core.css',
    '/css/slide-out-right-material.css',
    '/css/slide-out-right-hover.css',
  ];

  const stylesheets = page.stylesheets && page.stylesheets.length > 0 ? page.stylesheets : defaultStylesheets;
  const inlineStyles = page.inlineStyles || [];

  useEffect(() => {
    if (!page.bodyHtml) return;

    const interClass = document.body.classList.contains('font-inter') ? 'font-inter' : '';
    const nextFontClass = [...document.body.classList].find((c) => c.startsWith('__className_')) ?? '';
    document.body.className = [page.bodyClass, interClass, nextFontClass].filter(Boolean).join(' ');
    for (const [key, value] of Object.entries(page.bodyAttrs || {})) {
      document.body.setAttribute(key, value);
    }
    document.title = page.title;

    const handleFormSubmit = (e: Event) => {
      const target = e.target as HTMLFormElement;
      if (target?.matches('form[data-static-form], form')) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    if (page.disableForms) {
      document.addEventListener('submit', handleFormSubmit, true);
    }

    return () => {
      if (page.disableForms) {
        document.removeEventListener('submit', handleFormSubmit, true);
      }
    };
  }, [page]);

  // Mirrored HTML pages: same pipeline as MirroredPage (LocalImages is required)
  if (page.bodyHtml) {
    return (
      <>
        <PageStyles stylesheets={stylesheets} inlineStyles={inlineStyles} />
        <div id="mirrored-page-root" dangerouslySetInnerHTML={{ __html: page.bodyHtml }} />
        <LocalImages slug={page.slug} />
        <HeroYouTube slug={page.slug} />
        <LegacyScripts
          scripts={page.scripts || []}
          inlineScripts={page.inlineScripts || []}
          slug={page.slug}
        />
      </>
    );
  }

  return (
    <>
      <PageStyles stylesheets={stylesheets} inlineStyles={inlineStyles} />
      {page.navigation && (
        <Navigation
          logoSrc={page.navigation.logoSrc}
          logoAlt={page.navigation.logoAlt}
          items={page.navigation.items}
        />
      )}

      <main>
        {page.sections?.map((section, idx) => (
          <SectionRenderer key={section.id || idx} section={section as never} />
        ))}
      </main>

      {page.footer && (
        <Footer
          columns={page.footer.columns}
          copyright={page.footer.copyright}
        />
      )}
    </>
  );
}
