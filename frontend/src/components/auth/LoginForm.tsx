'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';
import { useUIStore } from '@/stores/useUIStore';
import AnimatedInput from '@/components/ui/AnimatedInput';

export default function LoginForm({ redirect = '/' }: { redirect?: string }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [shaking, setShaking] = useState(false);
  const login = useAuthStore((s) => s.login);
  const addToast = useUIStore((s) => s.addToast);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!email) newErrors.email = 'Required';
    if (!password) newErrors.password = 'Required';
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    try {
      await login(email, password);
      addToast({ type: 'success', message: 'Welcome back!' });
      router.push(redirect);
    } catch {
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
      setErrors({ general: 'Invalid email or password' });
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      animate={shaking ? { x: [-10, 10, -10, 10, 0] } : {}}
      transition={{ duration: 0.4 }}
      className="space-y-4"
    >
      {errors.general && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-xl"
        >
          {errors.general}
        </motion.div>
      )}

      <AnimatedInput
        label="Email"
        type="email"
        value={email}
        onChange={setEmail}
        error={errors.email}
        required
      />

      <AnimatedInput
        label="Password"
        type="password"
        value={password}
        onChange={setPassword}
        error={errors.password}
        required
      />

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        type="submit"
        className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
      >
        Login
      </motion.button>
    </motion.form>
  );
}
