'use client';

import Link from 'next/link';

interface FooterLink {
  label: string;
  href: string;
}

interface FooterColumn {
  title: string;
  links: FooterLink[];
}

interface FooterProps {
  columns: FooterColumn[];
  copyright: string;
  socialLinks?: { icon: string; href: string }[];
}

export default function Footer({ columns, copyright, socialLinks }: FooterProps) {
  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {columns.map((column, idx) => (
            <div key={idx}>
              <h4 className="font-bold text-lg mb-4">{column.title}</h4>
              <ul className="space-y-2">
                {column.links.map((link, linkIdx) => (
                  <li key={linkIdx}>
                    <Link href={link.href} className="text-gray-400 hover:text-white transition">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400">{copyright}</p>
          {socialLinks && (
            <div className="flex gap-4 mt-4 md:mt-0">
              {socialLinks.map((social, idx) => (
                <a key={idx} href={social.href} className="text-gray-400 hover:text-white transition">
                  <img src={social.icon} alt="" className="w-5 h-5" />
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
