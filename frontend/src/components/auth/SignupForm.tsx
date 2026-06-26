'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';
import { useUIStore } from '@/stores/useUIStore';
import AnimatedInput from '@/components/ui/AnimatedInput';

const steps = ['Account Details', 'Personal Info', 'Complete'];

export default function SignupForm({ redirect = '/' }: { redirect?: string }) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [oauthLoading, setOauthLoading] = useState<'google' | 'github' | null>(null);
  const signup = useAuthStore((s) => s.signup);
  const addToast = useUIStore((s) => s.addToast);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Check for OAuth error query parameter on mount
  useEffect(() => {
    const error = searchParams.get('error');
    if (error) {
      const errorMessages: Record<string, string> = {
        security_validation_failed: 'Security validation failed. Please try again.',
        authentication_failed: 'Authentication failed. Please try again.',
        email_required: 'An email address is required from the provider.',
        account_locked: 'Your account is temporarily locked.',
      };
      const message = errorMessages[error] || 'OAuth authentication failed. Please try again.';
      addToast({ type: 'error', message });
    }
  }, [searchParams, addToast]);

  const handleOAuthLogin = (provider: 'google' | 'github') => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
      addToast({ type: 'error', message: 'OAuth is unavailable. API URL is not configured.' });
      return;
    }
    setOauthLoading(provider);
    try {
      window.location.href = `${apiUrl}/auth/${provider}`;
    } catch {
      addToast({ type: 'error', message: 'OAuth is unavailable. Please try again later.' });
      setOauthLoading(null);
    }
  };

  const passwordStrength = (() => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  })();

  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500'];
  const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong'];

  const validateStep = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (step === 0) {
      if (!name) newErrors.name = 'Required';
      if (!email) newErrors.email = 'Required';
      else if (!/^\S+@\S+\.\S+$/.test(email)) newErrors.email = 'Invalid email';
    }
    if (step === 1) {
      if (!password) newErrors.password = 'Required';
      else if (password.length < 8) newErrors.password = 'Must be at least 8 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep((s) => Math.min(s + 1, steps.length - 1));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < steps.length - 1) {
      handleNext();
      return;
    }

    try {
      await signup(name, email, password);
      addToast({ type: 'success', message: 'Account created!' });
      router.push(redirect);
    } catch {
      setErrors({ general: 'Signup failed. Please try again.' });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors.general && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-xl"
        >
          {errors.general}
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          {step === 0 && (
            <>
              <AnimatedInput label="Full Name" value={name} onChange={setName} error={errors.name} required />
              <AnimatedInput label="Email" type="email" value={email} onChange={setEmail} error={errors.email} required />
            </>
          )}
          {step === 1 && (
            <>
              <AnimatedInput label="Password" type="password" value={password} onChange={setPassword} error={errors.password} required />
              {password && (
                <div className="space-y-1">
                  <div className="flex gap-1">
                    {[0, 1, 2, 3].map((i) => (
                      <motion.div
                        key={i}
                        className={`h-1 flex-1 rounded-full ${i < passwordStrength ? strengthColors[passwordStrength - 1] : 'bg-gray-200 dark:bg-zinc-700'}`}
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ delay: i * 0.1 }}
                      />
                    ))}
                  </div>
                   <p className="text-xs text-gray-500 dark:text-gray-400">
                    Password strength: {strengthLabels[passwordStrength - 1] || 'Too short'}
                  </p>
                </div>
              )}
            </>
          )}
          {step === 2 && (
            <div className="text-center py-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className="w-16 h-16 mx-auto bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4"
              >
                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>
              <p className="text-gray-600 dark:text-gray-400">Ready to create your account!</p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="flex gap-3">
        {step > 0 && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={() => setStep((s) => s - 1)}
            className="flex-1 py-3 border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
          >
            Back
          </motion.button>
        )}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          className="flex-1 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
        >
          {step === steps.length - 1 ? 'Create Account' : 'Next'}
        </motion.button>
      </div>

      {/* Step indicators */}
      <div className="flex justify-center gap-2">
        {steps.map((_, i) => (
          <motion.div
            key={i}
            animate={{ scale: i === step ? 1.2 : 1, backgroundColor: i <= step ? '#6366f1' : '#e5e7eb' }}
            className="w-2 h-2 rounded-full"
          />
        ))}
      </div>

      {/* OAuth section */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200 dark:border-zinc-700" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white dark:bg-zinc-900 text-gray-500 dark:text-gray-400">or continue with</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <motion.button
          whileHover={{ scale: oauthLoading ? 1 : 1.02 }}
          whileTap={{ scale: oauthLoading ? 1 : 0.98 }}
          type="button"
          disabled={oauthLoading !== null}
          onClick={() => handleOAuthLogin('google')}
          className="py-2.5 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {oauthLoading === 'google' ? (
            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
          )}
          {oauthLoading === 'google' ? 'Redirecting...' : 'Google'}
        </motion.button>
        <motion.button
          whileHover={{ scale: oauthLoading ? 1 : 1.02 }}
          whileTap={{ scale: oauthLoading ? 1 : 0.98 }}
          type="button"
          disabled={oauthLoading !== null}
          onClick={() => handleOAuthLogin('github')}
          className="py-2.5 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {oauthLoading === 'github' ? (
            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
          )}
          {oauthLoading === 'github' ? 'Redirecting...' : 'GitHub'}
        </motion.button>
      </div>
    </form>
  );
}
