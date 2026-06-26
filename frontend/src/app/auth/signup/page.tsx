'use client';

import { Suspense } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import SignupForm from '@/components/auth/SignupForm';

function SignupContent() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  return (
    <>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Create Account</h1>
        <p className="text-gray-500 dark:text-gray-400">Join the immersive experience</p>
      </div>

      <div className="p-8 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-xl">
        <SignupForm redirect={redirect} />
      </div>

      <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
        Already have an account?{' '}
        <Link href={`/auth/login${redirect !== '/' ? `?redirect=${encodeURIComponent(redirect)}` : ''}`} className="text-indigo-600 font-medium hover:text-indigo-700">
          Sign in
        </Link>
      </p>
    </>
  );
}

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Suspense fallback={<div className="animate-pulse h-64 bg-gray-200 dark:bg-zinc-700 rounded-2xl" />}>
          <SignupContent />
        </Suspense>
      </motion.div>
    </div>
  );
}
