'use client';

import { useState, useEffect, useCallback } from 'react';

const TIMELINE = {
  showContent: 200,
  fadeOut: 2000,
  complete: 2500,
} as const;

interface IntroSceneProps {
  onComplete: () => void;
}

function LogoCube() {
  return (
    <div className="relative w-16 h-16 md:w-20 md:h-20">
      <svg viewBox="0 0 80 80" className="w-full h-full" fill="none">
        <defs>
          <linearGradient id="cube-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="50%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
          <filter id="cube-shadow">
            <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#6366f1" floodOpacity="0.5" />
          </filter>
        </defs>
        {/* Back face */}
        <path d="M20 18L60 18L60 58L20 58Z" fill="url(#cube-grad)" opacity="0.2" />
        {/* Left face */}
        <path d="M20 18L10 24V64L20 58Z" fill="url(#cube-grad)" opacity="0.4" />
        {/* Right face */}
        <path d="M60 18L70 24V64L60 58Z" fill="url(#cube-grad)" opacity="0.35" />
        {/* Top face */}
        <path d="M20 18L10 24L40 38L50 32L60 18Z" fill="url(#cube-grad)" opacity="0.55" />
        {/* Front face */}
        <rect x="20" y="18" width="40" height="40" rx="2" fill="url(#cube-grad)" filter="url(#cube-shadow)" opacity="0.9" />
        {/* Letter I */}
        <rect x="35" y="26" width="10" height="24" rx="2" fill="white" />
        <rect x="32" y="23" width="16" height="4" rx="2" fill="white" />
        <rect x="32" y="48" width="16" height="4" rx="2" fill="white" />
        {/* Dot */}
        <circle cx="56" cy="14" r="3" fill="white" opacity="0.9" />
      </svg>
    </div>
  );
}

export default function IntroScene({ onComplete }: IntroSceneProps) {
  const [visible, setVisible] = useState(false);
  const [fading, setFading] = useState(false);

  const finish = useCallback(() => {
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), TIMELINE.showContent);
    const t2 = setTimeout(() => setFading(true), TIMELINE.fadeOut);
    const t3 = setTimeout(finish, TIMELINE.complete);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [finish]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-black transition-opacity duration-500 ${
        fading ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Subtle animated background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-indigo-600/8 blur-[100px] animate-pulse" />
        <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] rounded-full bg-purple-600/5 blur-[80px] animate-pulse" style={{ animationDelay: '0.5s' }} />
      </div>

      {/* Main content */}
      <div className={`relative z-10 flex flex-col items-center gap-5 transition-all duration-700 ease-out ${
        visible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-6 scale-95'
      }`}>
        {/* Logo */}
        <div className="animate-[bounceIn_0.6s_ease-out]">
          <LogoCube />
        </div>

        {/* Brand name — each letter animates */}
        <h1 className="flex gap-[2px] md:gap-1">
          {'IMMERSIVE'.split('').map((char, i) => (
            <span
              key={i}
              className="text-4xl md:text-6xl font-black tracking-wider text-white animate-[letterIn_0.4s_ease-out_both]"
              style={{ animationDelay: `${0.3 + i * 0.06}s` }}
            >
              {char}
            </span>
          ))}
        </h1>

        {/* Underline */}
        <div className="w-0 h-[2px] bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500 animate-[expandLine_0.6s_ease-out_0.8s_forwards]" />

        {/* Tagline */}
        <p className="text-xs md:text-sm tracking-[0.4em] text-white/40 font-light uppercase animate-[fadeIn_0.5s_ease-out_1s_both]">
          The Future of Shopping
        </p>

        {/* Loading dots */}
        <div className="flex gap-1.5 mt-1 animate-[fadeIn_0.4s_ease-out_1.2s_both]">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0s', animationDuration: '0.6s' }} />
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '0.1s', animationDuration: '0.6s' }} />
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '0.2s', animationDuration: '0.6s' }} />
        </div>
      </div>

      <style jsx>{`
        @keyframes bounceIn {
          0% { transform: scale(0.3); opacity: 0; }
          50% { transform: scale(1.1); }
          70% { transform: scale(0.95); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes letterIn {
          0% { opacity: 0; transform: translateY(20px) scale(0.8); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes expandLine {
          0% { width: 0; }
          100% { width: 12rem; }
        }
        @keyframes fadeIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
