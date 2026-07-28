'use client';

import { ReactNode } from 'react';
import HeroSection from './HeroSection';
import FeatureSection from './FeatureSection';
import LogoGrid from './LogoGrid';
import TestimonialSection from './TestimonialSection';
import TextBlock from './TextBlock';

export type SectionType = 'hero' | 'features' | 'logos' | 'testimonials' | 'text' | 'cta' | 'gallery';

export interface Section {
  type: SectionType;
  id?: string;
  data: Record<string, unknown>;
}

interface SectionRendererProps {
  section: Section;
}

export default function SectionRenderer({ section }: SectionRendererProps) {
  const { type, data } = section;

  switch (type) {
    case 'hero':
      return (
        <HeroSection
          title={String(data.title || '')}
          subtitle={data.subtitle ? String(data.subtitle) : undefined}
          description={data.description ? String(data.description) : undefined}
          bulletPoints={Array.isArray(data.bulletPoints) ? data.bulletPoints.map(String) : undefined}
          ctaText={data.ctaText ? String(data.ctaText) : undefined}
          ctaHref={data.ctaHref ? String(data.ctaHref) : undefined}
          backgroundImage={data.backgroundImage ? String(data.backgroundImage) : undefined}
          videoUrl={data.videoUrl ? String(data.videoUrl) : undefined}
          imageUrl={data.imageUrl ? String(data.imageUrl) : undefined}
          imageMobile={data.imageMobile ? String(data.imageMobile) : undefined}
          isDarkBg={Boolean(data.isDarkBg)}
        />
      );

    case 'features':
      return (
        <FeatureSection
          title={String(data.title || '')}
          subtitle={data.subtitle ? String(data.subtitle) : undefined}
          features={Array.isArray(data.features)
            ? data.features.map((f: unknown) => {
                const feature = f as Record<string, unknown>;
                return {
                  icon: feature.icon ? String(feature.icon) : undefined,
                  title: String(feature.title || ''),
                  description: String(feature.description || ''),
                };
              })
            : []}
          isDarkBg={Boolean(data.isDarkBg)}
          layout={(data.layout as 'grid' | 'list') || 'grid'}
        />
      );

    case 'logos':
      return (
        <LogoGrid
          title={String(data.title || '')}
          subtitle={data.subtitle ? String(data.subtitle) : undefined}
          logos={Array.isArray(data.logos)
            ? data.logos.map((l: unknown) => {
                const logo = l as Record<string, unknown>;
                return {
                  src: String(logo.src || ''),
                  alt: String(logo.alt || ''),
                };
              })
            : []}
          isDarkBg={Boolean(data.isDarkBg)}
        />
      );

    case 'testimonials':
      return (
        <TestimonialSection
          title={data.title ? String(data.title) : undefined}
          testimonials={Array.isArray(data.testimonials)
            ? data.testimonials.map((t: unknown) => {
                const testimonial = t as Record<string, unknown>;
                return {
                  text: String(testimonial.text || ''),
                  author: String(testimonial.author || ''),
                  role: testimonial.role ? String(testimonial.role) : undefined,
                  image: testimonial.image ? String(testimonial.image) : undefined,
                  company: testimonial.company ? String(testimonial.company) : undefined,
                };
              })
            : []}
          isDarkBg={Boolean(data.isDarkBg)}
        />
      );

    case 'text':
      return (
        <section className={`py-12 ${Boolean(data.isDarkBg) ? 'bg-gray-900 text-white' : 'bg-white'}`}>
          <div className="container mx-auto px-4">
            <TextBlock
              content={String(data.content || '')}
              maxWidth={(data.maxWidth as 'sm' | 'md' | 'lg' | 'full') || 'full'}
              align={(data.align as 'left' | 'center' | 'right') || 'left'}
              isDarkBg={Boolean(data.isDarkBg)}
            />
          </div>
        </section>
      );

    default:
      return null;
  }
}
