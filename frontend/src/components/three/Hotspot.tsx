'use client';

import { useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

interface HotspotProps {
  position: [number, number, number];
  label: string;
  specs: {
    material: string;
    weight: string;
    dimensions: string;
    care?: string;
  };
}

export default function Hotspot({ position, label, specs }: HotspotProps) {
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  const meshRef = useRef<THREE.Mesh>(null);
  const targetScale = useRef(new THREE.Vector3(1, 1, 1));

  useFrame(() => {
    if (!meshRef.current) return;
    const scale = hovered ? 1.3 : 1;
    targetScale.current.set(scale, scale, scale);
    meshRef.current.scale.lerp(targetScale.current, 0.1);
  });

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onPointerEnter={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerLeave={(e) => {
          e.stopPropagation();
          setHovered(false);
          document.body.style.cursor = 'auto';
        }}
        onClick={(e) => {
          e.stopPropagation();
          setClicked(!clicked);
        }}
      >
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial
          color={hovered ? '#818cf8' : '#6366f1'}
          emissive={hovered ? '#6366f1' : '#000000'}
          emissiveIntensity={hovered ? 0.5 : 0}
        />
      </mesh>

      {/* Pulse ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.1, 0.12, 32]} />
        <meshBasicMaterial
          color="#6366f1"
          transparent
          opacity={hovered ? 0.6 : 0.3}
        />
      </mesh>

      {/* Label */}
      {hovered && !clicked && (
        <Html
          position={[0, 0.15, 0]}
          center
          distanceFactor={5}
          style={{ pointerEvents: 'none' }}
        >
          <div className="bg-gray-900 text-white px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap shadow-lg">
            {label}
          </div>
        </Html>
      )}

      {/* Specs popup */}
      {clicked && (
        <Html
          position={[0, 0.2, 0]}
          center
          distanceFactor={4}
        >
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl p-4 w-56 border border-gray-100 dark:border-zinc-800">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-900 dark:text-white">{label}</h4>
              <button
                onClick={() => setClicked(false)}
                aria-label="Close details"
                className="text-gray-400 hover:text-gray-600 pointer-events-auto"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Material</span>
                <span className="text-gray-900 dark:text-white font-medium">{specs.material}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Weight</span>
                <span className="text-gray-900 dark:text-white font-medium">{specs.weight}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Dimensions</span>
                <span className="text-gray-900 dark:text-white font-medium">{specs.dimensions}</span>
              </div>
              {specs.care && (
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Care</span>
                  <span className="text-gray-900 dark:text-white font-medium">{specs.care}</span>
                </div>
              )}
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}