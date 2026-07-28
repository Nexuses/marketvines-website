'use client';

import Link from 'next/link';

interface NavItem {
  label: string;
  href: string;
  isButton?: boolean;
}

interface NavigationProps {
  items: NavItem[];
  logoSrc: string;
  logoAlt: string;
}

export default function Navigation({ items, logoSrc, logoAlt }: NavigationProps) {
  return (
    <header id="top" className="sticky top-0 z-50 bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-6">
          <Link href="/" className="flex items-center">
            <img src={logoSrc} alt={logoAlt} className="h-8 w-auto" />
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={
                  item.isButton
                    ? 'bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded font-semibold'
                    : 'text-gray-800 hover:text-green-500 font-medium'
                }
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Mobile menu button */}
          <button className="md:hidden">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
