'use client';

import { useState } from 'react';

interface Testimonial {
  text: string;
  author: string;
  role?: string;
  image?: string;
  company?: string;
}

interface TestimonialSectionProps {
  title?: string;
  testimonials: Testimonial[];
  isDarkBg?: boolean;
}

export default function TestimonialSection({ title, testimonials, isDarkBg = false }: TestimonialSectionProps) {
  const [current, setCurrent] = useState(0);
  const bgClass = isDarkBg ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900';

  const handlePrev = () => setCurrent((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  const handleNext = () => setCurrent((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));

  return (
    <section className={`py-20 ${bgClass}`}>
      <div className="container mx-auto px-4">
        {title && <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">{title}</h2>}

        {testimonials.length === 1 ? (
          <div className="max-w-2xl mx-auto">
            <TestimonialCard testimonial={testimonials[0]} isDark={isDarkBg} />
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <TestimonialCard testimonial={testimonials[current]} isDark={isDarkBg} />
            </div>

            {testimonials.length > 1 && (
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={handlePrev}
                  className={`p-2 rounded-full ${isDarkBg ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-100'} border border-gray-300`}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>

                <div className="flex gap-2">
                  {testimonials.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrent(idx)}
                      className={`w-2 h-2 rounded-full transition ${
                        idx === current
                          ? 'bg-green-500 w-8'
                          : isDarkBg
                          ? 'bg-gray-600 hover:bg-gray-500'
                          : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                    />
                  ))}
                </div>

                <button
                  onClick={handleNext}
                  className={`p-2 rounded-full ${isDarkBg ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-100'} border border-gray-300`}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function TestimonialCard({ testimonial, isDark }: { testimonial: Testimonial; isDark: boolean }) {
  return (
    <div className={`p-8 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
      <div className="flex gap-1 mb-4">
        {[...Array(5)].map((_, i) => (
          <span key={i} className="text-yellow-400">★</span>
        ))}
      </div>
      <p className={`text-lg mb-6 ${isDark ? 'text-gray-300' : 'text-gray-700'} leading-relaxed`}>"{testimonial.text}"</p>
      <div className="flex items-center gap-4">
        {testimonial.image && <img src={testimonial.image} alt={testimonial.author} className="w-12 h-12 rounded-full" />}
        <div>
          <p className="font-semibold">{testimonial.author}</p>
          {testimonial.role && <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{testimonial.role}</p>}
          {testimonial.company && <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{testimonial.company}</p>}
        </div>
      </div>
    </div>
  );
}
