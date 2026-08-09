'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
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
  const signup = useAuthStore((s) => s.signup);
  const addToast = useUIStore((s) => s.addToast);
  const router = useRouter();

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
    </form>
  );
}
