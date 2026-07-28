'use client';

interface Logo {
  src: string;
  alt: string;
}

interface LogoGridProps {
  title: string;
  subtitle?: string;
  logos: Logo[];
  isDarkBg?: boolean;
}

export default function LogoGrid({ title, subtitle, logos, isDarkBg = false }: LogoGridProps) {
  const bgClass = isDarkBg ? 'bg-gray-900 text-white' : 'bg-white text-gray-900';

  return (
    <section className={`py-16 ${bgClass}`}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h3 className="text-2xl md:text-3xl font-bold mb-2">{title}</h3>
          {subtitle && <p className={`text-lg ${isDarkBg ? 'text-gray-300' : 'text-gray-600'}`}>{subtitle}</p>}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center">
          {logos.map((logo, idx) => (
            <div key={idx} className="flex justify-center items-center h-20">
              <img src={logo.src} alt={logo.alt} className="max-w-full h-auto max-h-16" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
