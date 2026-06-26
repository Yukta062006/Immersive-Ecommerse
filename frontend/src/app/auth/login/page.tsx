'use client';

import { Suspense } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import LoginForm from '@/components/auth/LoginForm';

function LoginContent() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  return (
    <>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Welcome Back</h1>
        <p className="text-gray-500 dark:text-gray-400">Sign in to your account</p>
      </div>

      <div className="p-8 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-xl">
        <LoginForm redirect={redirect} />
      </div>

      <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
        Don't have an account?{' '}
        <Link href={`/auth/signup${redirect !== '/' ? `?redirect=${encodeURIComponent(redirect)}` : ''}`} className="text-indigo-600 font-medium hover:text-indigo-700">
          Sign up
        </Link>
      </p>
    </>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Suspense fallback={<div className="animate-pulse h-64 bg-gray-200 dark:bg-zinc-700 rounded-2xl" />}>
          <LoginContent />
        </Suspense>
      </motion.div>
    </div>
  );
}
