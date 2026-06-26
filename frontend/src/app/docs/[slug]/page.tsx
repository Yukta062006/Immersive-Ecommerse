'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getDocPage } from '@/lib/data/docs';

export default function DocPage() {
  const params = useParams();
  const slug = params.slug as string;
  const doc = getDocPage(slug);

  if (!doc) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-zinc-950">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Page Not Found</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-6">The page you're looking for doesn't exist.</p>
          <Link href="/" className="text-indigo-600 dark:text-indigo-400 hover:underline">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <Link
          href="/"
          className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline mb-8 inline-block"
        >
          &larr; Back to Home
        </Link>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          {doc.title}
        </h1>
        <p className="text-lg text-gray-500 dark:text-gray-400 mb-12">{doc.description}</p>
        <div className="space-y-10">
          {doc.sections.map((section, i) => (
            <div key={i}>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                {section.title}
              </h2>
              <div className="space-y-3">
                {section.content.map((paragraph, j) => (
                  <p key={j} className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
