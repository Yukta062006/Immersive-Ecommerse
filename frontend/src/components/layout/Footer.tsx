'use client';

import Link from 'next/link';
import Logo from '@/components/ui/Logo';

const footerLinks = {
  shop: [
    { label: 'New Arrivals', href: '/products?sort=newest' },
    { label: 'Best Sellers', href: '/products?sort=popular' },
    { label: 'Sale', href: '/products?sale=true' },
    { label: 'All Products', href: '/products' },
  ],
  help: [
    { label: 'FAQ', href: '/docs/faq' },
    { label: 'Shipping', href: '/docs/shipping' },
    { label: 'Returns', href: '/docs/returns' },
    { label: 'Contact Us', href: '/docs/contact' },
  ],
  company: [
    { label: 'About Us', href: '/docs/about-us' },
    { label: 'Careers', href: '/docs/careers' },
    { label: 'Sustainability', href: '/docs/sustainability' },
    { label: 'Size Guide', href: '/docs/size-guide' },
  ],
};

const socialLinks = [
  { label: 'Twitter', href: 'https://twitter.com', icon: 'M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z' },
  { label: 'Instagram', href: 'https://instagram.com', icon: 'M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zM17.5 6.5h.01M7.5 2h9A5.5 5.5 0 0122 7.5v9a5.5 5.5 0 01-5.5 5.5h-9A5.5 5.5 0 012 16.5v-9A5.5 5.5 0 017.5 2z' },
  { label: 'Facebook', href: 'https://facebook.com', icon: 'M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z' },
  { label: 'YouTube', href: 'https://youtube.com', icon: 'M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 11.75a29 29 0 00.46 5.33A2.78 2.78 0 003.4 19.1c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 001.94-2 29 29 0 00.46-5.25 29 29 0 00-.46-5.33zM9.75 15.02V8.48l5.75 3.27-5.75 3.27z' },
];

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-2">
            <Link href="/">
              <Logo size="md" />
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed max-w-xs mb-6 mt-4">
              Premium products with a modern shopping experience. Quality you can trust, service you&apos;ll love.
            </p>

            {/* Social */}
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center hover:bg-indigo-600 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={social.icon} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">
                {title}
              </h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Payment & Trust */}
        <div className="border-t border-gray-800 pt-8 mb-8">
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500">
            <span>We accept:</span>
            <div className="flex items-center gap-4">
              {['Visa', 'Mastercard', 'Amex', 'PayPal', 'Apple Pay'].map((method) => (
                <span key={method} className="px-3 py-1 bg-gray-800 rounded text-xs text-gray-400">
                  {method}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} IMMERSIVE. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/docs/privacy-policy" className="text-gray-500 hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/docs/terms-of-service" className="text-gray-500 hover:text-white transition-colors">
              Terms of Service
            </Link>
            <Link href="/docs/cookies" className="text-gray-500 hover:text-white transition-colors">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
