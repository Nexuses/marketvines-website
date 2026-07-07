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
