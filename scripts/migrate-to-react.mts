import fs from 'fs-extra';
import path from 'path';
import type { PageStructure, SectionData } from '../lib/types';

/**
 * Convert old mirrored page format to new React component structure
 * This script parses HTML and JSON data and creates structured section data
 */

const CONTENT_DIR = path.join(process.cwd(), 'content', 'pages');
const OUTPUT_DIR = path.join(process.cwd(), 'content', 'pages-react');

// Ensure output directory exists
fs.ensureDirSync(OUTPUT_DIR);

interface OldPageData {
  slug: string;
  title: string;
  navigation?: {
    logoSrc: string;
    logoAlt: string;
    items: { label: string; href: string; isButton?: boolean }[];
  };
  [key: string]: unknown;
}

/**
 * Parse HTML to extract sections
 * This is a basic implementation - customize based on your HTML structure
 */
function parseHtmlSections(html: string): SectionData[] {
  const sections: SectionData[] = [];
  
  // This is a simplified parser - in a real scenario, you might use jsdom or similar
  // For now, we'll create a manual mapping based on the page structure
  
  // Extract hero section (first major section with video/image)
  const heroMatch = html.match(/<h1[^>]*>(.+?)<\/h1>/s);
  if (heroMatch) {
    sections.push({
      type: 'hero',
      data: {
        title: heroMatch[1]?.replace(/<[^>]*>/g, '').trim() || '',
        description: 'Strategic & Operational B2B Marketing',
        ctaText: 'Get Started',
        ctaHref: '/book-a-demo/',
      },
    });
  }

  return sections;
}

/**
 * Convert old page format to new structure
 */
function convertPageData(oldData: OldPageData): PageStructure {
  return {
    slug: oldData.slug,
    title: oldData.title,
    navigation: oldData.navigation || {
      logoSrc: 'https://i0.wp.com/marketvines.com/wp-content/uploads/2024/01/MarketVines-Logo.png?fit=1630%2C243&ssl=1',
      logoAlt: 'MarketVines',
      items: [
        { label: 'Growth Services', href: '/lead-generation/' },
        { label: 'Advisory/Events', href: '/events/' },
        { label: 'Insights', href: '/blogs/' },
        { label: 'About Us', href: '/about-us/' },
        { label: 'Contact Us', href: '/contact-us/' },
        { label: 'Talk to an expert', href: '/book-a-demo/', isButton: true },
      ],
    },
    sections: [],
    footer: {
      columns: [
        {
          title: 'Product',
          links: [
            { label: 'Features', href: '#' },
            { label: 'Pricing', href: '#' },
            { label: 'Security', href: '#' },
          ],
        },
        {
          title: 'Company',
          links: [
            { label: 'About', href: '/about-us/' },
            { label: 'Blog', href: '/blogs/' },
            { label: 'Contact', href: '/contact-us/' },
          ],
        },
      ],
      copyright: '© 2024 MarketVines. All rights reserved.',
    },
  };
}

/**
 * Migrate all pages
 */
async function migratePages() {
  try {
    const files = await fs.readdir(CONTENT_DIR);
    const jsonFiles = files.filter((f) => f.endsWith('.json'));

    for (const file of jsonFiles) {
      const filePath = path.join(CONTENT_DIR, file);
      const oldData = await fs.readJSON(filePath);
      
      const newData = convertPageData(oldData);
      
      const outputPath = path.join(OUTPUT_DIR, file);
      await fs.writeJSON(outputPath, newData, { spaces: 2 });
      
      console.log(`✓ Converted ${file}`);
    }

    console.log(`\n✓ All ${jsonFiles.length} pages converted successfully!`);
  } catch (error) {
    console.error('Error migrating pages:', error);
    process.exit(1);
  }
}

// Run migration
migratePages();
