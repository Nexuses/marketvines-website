'use client';

import Link from 'next/link';

interface HeroSectionProps {
  title: string;
  subtitle?: string;
  description?: string;
  bulletPoints?: string[];
  ctaText?: string;
  ctaHref?: string;
  backgroundImage?: string;
  videoUrl?: string;
  imageUrl?: string;
  imageMobile?: string;
  isDarkBg?: boolean;
}

export default function HeroSection({
  title,
  subtitle,
  description,
  bulletPoints,
  ctaText = 'Get Started',
  ctaHref = '#',
  backgroundImage,
  videoUrl,
  imageUrl,
  imageMobile,
  isDarkBg = false,
}: HeroSectionProps) {
  const bgClass = isDarkBg ? 'bg-gray-900 text-white' : 'bg-white text-gray-900';

  return (
    <section
      className={`relative py-20 ${bgClass} overflow-hidden`}
      style={backgroundImage ? { backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover' } : undefined}
    >
      {videoUrl && (
        <div className="absolute inset-0 opacity-30">
          <video
            autoPlay
            muted
            loop
            className="w-full h-full object-cover"
            src={videoUrl}
          />
        </div>
      )}

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            {subtitle && <p className="text-sm font-semibold text-green-500 uppercase mb-2">{subtitle}</p>}
            <h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight`}>{title}</h1>

            {description && <p className="text-lg mb-6 opacity-90">{description}</p>}

            {bulletPoints && bulletPoints.length > 0 && (
              <ul className="mb-8 space-y-2">
                {bulletPoints.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <svg className="w-5 h-5 mt-1 flex-shrink-0 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            )}

            {ctaText && (
              <Link
                href={ctaHref}
                className="inline-block bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-lg font-semibold transition"
              >
                {ctaText}
              </Link>
            )}
          </div>

          {(imageUrl || imageMobile) && (
            <div className="relative">
              <img
                src={imageUrl || imageMobile}
                alt="Hero"
                className="w-full h-auto rounded-lg shadow-xl"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
