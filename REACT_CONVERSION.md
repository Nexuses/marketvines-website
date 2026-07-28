# React Components Conversion Guide

## Overview

This project has been refactored to use native React components instead of rendering raw HTML through `dangerouslySetInnerHTML`. The site now supports a **hybrid approach** where:

1. **New pages** use the React component system
2. **Legacy pages** fall back to the old HTML rendering system
3. Both formats can coexist during the migration period

## Architecture

### Component Structure

All React components are located in `/components/`:

- **`Navigation.tsx`** - Header with logo and navigation menu
- **`HeroSection.tsx`** - Hero sections with image, video, and CTA
- **`FeatureSection.tsx`** - Grid or list of feature cards
- **`LogoGrid.tsx`** - Client/customer logo carousel
- **`TestimonialSection.tsx`** - Testimonial carousel
- **`Button.tsx`** - Reusable button component with variants
- **`TextBlock.tsx`** - Text content sections
- **`Footer.tsx`** - Footer with links and copyright
- **`SectionRenderer.tsx`** - Dynamic section renderer
- **`ReactPage.tsx`** - Main page wrapper
- **`PageStyles.tsx`** - Legacy stylesheet loader
- **`MirroredPage.tsx`** - Legacy HTML renderer (kept for backward compatibility)

### Data Structure

#### Old Format (Legacy HTML)
```json
{
  "slug": "home",
  "bodyHtml": "<div>...</div>",
  "stylesheets": [],
  "scripts": []
}
```

#### New Format (React Components)
```json
{
  "slug": "home",
  "title": "Home",
  "navigation": {
    "logoSrc": "...",
    "items": []
  },
  "sections": [
    {
      "type": "hero",
      "id": "hero-main",
      "data": {
        "title": "...",
        "description": "..."
      }
    }
  ],
  "footer": {
    "columns": [],
    "copyright": "..."
  }
}
```

## Section Types

### Hero Section
```json
{
  "type": "hero",
  "data": {
    "title": "string",
    "subtitle": "string (optional)",
    "description": "string (optional)",
    "bulletPoints": ["string"],
    "ctaText": "string",
    "ctaHref": "string",
    "imageUrl": "string",
    "videoUrl": "string",
    "isDarkBg": boolean
  }
}
```

### Features Section
```json
{
  "type": "features",
  "data": {
    "title": "string",
    "features": [
      {
        "icon": "string (URL)",
        "title": "string",
        "description": "string"
      }
    ],
    "layout": "grid" | "list",
    "isDarkBg": boolean
  }
}
```

### Logo Grid Section
```json
{
  "type": "logos",
  "data": {
    "title": "string",
    "logos": [
      {
        "src": "string (URL)",
        "alt": "string"
      }
    ],
    "isDarkBg": boolean
  }
}
```

### Testimonials Section
```json
{
  "type": "testimonials",
  "data": {
    "title": "string",
    "testimonials": [
      {
        "text": "string",
        "author": "string",
        "role": "string",
        "image": "string (URL)",
        "company": "string"
      }
    ],
    "isDarkBg": boolean
  }
}
```

### Text Section
```json
{
  "type": "text",
  "data": {
    "content": "string (HTML)",
    "maxWidth": "sm" | "md" | "lg" | "full",
    "align": "left" | "center" | "right",
    "isDarkBg": boolean
  }
}
```

## Converting Pages

### 1. Create React Page Data

Create a new file in `/content/pages-react/{slug}.json`:

```json
{
  "slug": "about-us",
  "title": "About Us",
  "navigation": {
    "logoSrc": "...",
    "logoAlt": "MarketVines",
    "items": [...]
  },
  "sections": [
    {
      "type": "hero",
      "data": {...}
    }
  ],
  "footer": {...}
}
```

### 2. Pages Load Automatically

The page loading system in `app/page.tsx` and `app/[slug]/page.tsx` automatically:

1. First checks for React page data in `/content/pages-react/`
2. Falls back to legacy HTML in `/content/pages/` if React data doesn't exist
3. Renders the appropriate component

### 3. No Code Changes Needed

No changes to route files are required. The system handles routing automatically.

## Adding New Components

To create a new component type:

1. **Create the component** in `/components/`
2. **Add the type** to `SectionType` in `SectionRenderer.tsx`
3. **Add the renderer** case in `SectionRenderer.tsx`
4. **Use in sections** by setting `type` in JSON

Example:

```tsx
// components/GallerySection.tsx
export default function GallerySection({ images, title }: Props) {
  return (
    <section className="py-20">
      <h2>{title}</h2>
      <div className="grid">
        {images.map(img => <img key={img} src={img} />)}
      </div>
    </section>
  );
}
```

## Styling

### Using Tailwind CSS

All components use Tailwind CSS classes. Customize by:

1. Modifying component `className` attributes
2. Extending `tailwind.config.js`
3. Creating custom CSS in `/app/globals.css`

### Legacy Stylesheets

For pages still using legacy HTML, stylesheets are loaded via `PageStyles` component and the `stylesheets` array in page data.

## Migration Checklist

- [ ] Update one page to React format at a time
- [ ] Test React page renders correctly
- [ ] Compare React page with original in browser
- [ ] Keep legacy JSON until React version is verified
- [ ] Delete legacy data once fully migrated

## Files Modified

- `lib/types.ts` - Added new page structure types
- `lib/pages.ts` - Added React page loading functions
- `app/page.tsx` - Added React fallback
- `app/[slug]/page.tsx` - Added React fallback
- `components/` - New React component library

## Backward Compatibility

The system maintains full backward compatibility:
- Old pages continue to work
- Legacy components still render
- No breaking changes to existing pages

## Performance Benefits

React components provide:
- ✅ Smaller bundle size (no raw HTML in JSON)
- ✅ Better TypeScript support
- ✅ Reusable components
- ✅ Easier maintenance
- ✅ Better accessibility (semantic HTML)
- ✅ Client-side interactivity
- ✅ Responsive design utilities

## Next Steps

1. Convert high-priority pages to React format
2. Test thoroughly
3. Remove legacy HTML data
4. Clean up old components
