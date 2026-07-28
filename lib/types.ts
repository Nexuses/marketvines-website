export interface SectionData {
  type: 'hero' | 'features' | 'logos' | 'testimonials' | 'text' | 'cta' | 'gallery';
  id?: string;
  data: Record<string, unknown>;
}

export interface NavigationItem {
  label: string;
  href: string;
  isButton?: boolean;
}

export interface PageStructure {
  slug: string;
  title: string;
  navigation?: {
    logoSrc: string;
    logoAlt: string;
    items: NavigationItem[];
  };
  sections?: SectionData[];
  footer?: {
    columns: { title: string; links: { label: string; href: string }[] }[];
    copyright: string;
  };
  stylesheets?: string[];
  inlineStyles?: string[];
  // Present when pages-react still uses mirrored HTML
  bodyHtml?: string;
  bodyClass?: string;
  bodyAttrs?: Record<string, string>;
  scripts?: string[];
  inlineScripts?: string[];
  disableForms?: boolean;
}

export interface MirroredPageData {
  slug: string;
  path: string;
  title: string;
  bodyClass: string;
  bodyAttrs: Record<string, string>;
  stylesheets: string[];
  inlineStyles: string[];
  bodyHtml: string;
  scripts: string[];
  inlineScripts: string[];
  disableForms: boolean;
}
