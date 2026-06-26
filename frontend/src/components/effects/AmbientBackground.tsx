'use client';

import { useEffect, useRef } from 'react';

interface Shape {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  rotation: number;
  rotationSpeed: number;
  type: 'circle' | 'square' | 'triangle';
  color: string;
}

export default function AmbientBackground({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    const shapes: Shape[] = [];
    const colors = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#e0e7ff'];

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    const createShapes = () => {
      const count = Math.floor((canvas.offsetWidth * canvas.offsetHeight) / 25000);
      for (let i = 0; i < count; i++) {
        shapes.push({
          x: Math.random() * canvas.offsetWidth,
          y: Math.random() * canvas.offsetHeight,
          size: Math.random() * 40 + 20,
          speedX: (Math.random() - 0.5) * 0.3,
          speedY: (Math.random() - 0.5) * 0.3,
          opacity: Math.random() * 0.08 + 0.02,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.005,
          type: (['circle', 'square', 'triangle'] as const)[Math.floor(Math.random() * 3)],
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }
    };

    const drawShape = (s: Shape) => {
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.rotate(s.rotation);
      ctx.globalAlpha = s.opacity;
      ctx.fillStyle = s.color;

      if (s.type === 'circle') {
        ctx.beginPath();
        ctx.arc(0, 0, s.size / 2, 0, Math.PI * 2);
        ctx.fill();
      } else if (s.type === 'square') {
        ctx.fillRect(-s.size / 2, -s.size / 2, s.size, s.size);
      } else {
        ctx.beginPath();
        ctx.moveTo(0, -s.size / 2);
        ctx.lineTo(s.size / 2, s.size / 2);
        ctx.lineTo(-s.size / 2, s.size / 2);
        ctx.closePath();
        ctx.fill();
      }

      ctx.restore();
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

      shapes.forEach((s) => {
        s.x += s.speedX;
        s.y += s.speedY;
        s.rotation += s.rotationSpeed;

        if (s.x < -s.size) s.x = canvas.offsetWidth + s.size;
        if (s.x > canvas.offsetWidth + s.size) s.x = -s.size;
        if (s.y < -s.size) s.y = canvas.offsetHeight + s.size;
        if (s.y > canvas.offsetHeight + s.size) s.y = -s.size;

        drawShape(s);
      });

      animationId = requestAnimationFrame(animate);
    };

    resize();
    createShapes();
    animate();

    window.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
    />
  );
}
