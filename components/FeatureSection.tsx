'use client';

interface Feature {
  icon?: string;
  title: string;
  description: string;
}

interface FeatureSectionProps {
  title: string;
  subtitle?: string;
  features: Feature[];
  isDarkBg?: boolean;
  layout?: 'grid' | 'list';
}

export default function FeatureSection({
  title,
  subtitle,
  features,
  isDarkBg = false,
  layout = 'grid',
}: FeatureSectionProps) {
  const bgClass = isDarkBg ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900';

  return (
    <section className={`py-20 ${bgClass}`}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          {subtitle && <p className="text-sm font-semibold text-green-500 uppercase mb-2">{subtitle}</p>}
          <h2 className="text-3xl md:text-4xl font-bold">{title}</h2>
        </div>

        <div
          className={
            layout === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'
              : 'space-y-6 max-w-3xl mx-auto'
          }
        >
          {features.map((feature, idx) => (
            <div key={idx} className="p-6 rounded-lg bg-white shadow-md hover:shadow-lg transition">
              {feature.icon && (
                <div className="mb-4">
                  <img src={feature.icon} alt="" className="w-12 h-12" />
                </div>
              )}
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className={isDarkBg ? 'text-gray-300' : 'text-gray-600'}>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
