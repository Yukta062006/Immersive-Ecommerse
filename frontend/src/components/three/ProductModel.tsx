'use client';

import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ProductModelProps {
  category: string;
  color: string;
}

// Organic blob geometry generator
interface BlobOptions {
  scaleX?: number;
  scaleY?: number;
  scaleZ?: number;
  distortion?: number;
}

function createBlobGeometry(segments: number = 64, options: BlobOptions = {}): THREE.BufferGeometry {
  const { scaleX = 1, scaleY = 1, scaleZ = 1, distortion: distortionStrength = 0.15 } = options;
  const geometry = new THREE.SphereGeometry(1, segments, segments);
  const positions = geometry.attributes.position;

  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    const y = positions.getY(i);
    const z = positions.getZ(i);

    // Create organic distortion
    const distortion = distortionStrength * Math.sin(x * 3) * Math.cos(y * 2) * Math.sin(z * 4);
    const noise = (distortionStrength * 2 / 3) * (Math.sin(x * 5 + y * 3) + Math.cos(z * 4 + x * 2));

    positions.setX(i, (x * (1 + distortion + noise)) * scaleX);
    positions.setY(i, (y * (1 + distortion + noise)) * scaleY);
    positions.setZ(i, (z * (1 + distortion + noise)) * scaleZ);
  }

  geometry.computeVertexNormals();
  return geometry;
}

// Category-specific geometry
function getCategoryGeometry(category: string): THREE.BufferGeometry {
  switch (category.toLowerCase()) {
    case 'footwear':
      // Elongated blob for shoes
      return createBlobGeometry(64, { scaleX: 1.4, scaleY: 0.7, scaleZ: 0.9, distortion: 0.2 });
    case 'clothing':
      // Flowing fabric-like shape
      return createBlobGeometry(64, { scaleX: 0.9, scaleY: 1.2, scaleZ: 1.1, distortion: 0.15 });
    case 'accessories':
      // Compact, rounded shape
      return createBlobGeometry(64, { scaleX: 0.8, scaleY: 0.8, scaleZ: 0.8, distortion: 0.1 });
    case 'electronics':
      // More angular, tech-inspired
      return createBlobGeometry(64, { scaleX: 1.1, scaleY: 0.6, scaleZ: 0.8, distortion: 0.05 });
    default:
      return createBlobGeometry(64);
  }
}

// Material properties per category
function getCategoryMaterial(category: string) {
  switch (category.toLowerCase()) {
    case 'footwear':
      return { roughness: 0.6, metalness: 0.1, envMapIntensity: 0.5 };
    case 'clothing':
      return { roughness: 0.8, metalness: 0.0, envMapIntensity: 0.3 };
    case 'accessories':
      return { roughness: 0.3, metalness: 0.7, envMapIntensity: 1.0 };
    case 'electronics':
      return { roughness: 0.2, metalness: 0.8, envMapIntensity: 1.2 };
    default:
      return { roughness: 0.5, metalness: 0.3, envMapIntensity: 0.6 };
  }
}

export default function ProductModel({ category, color }: ProductModelProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);

  const geometry = useMemo(() => getCategoryGeometry(category), [category]);
  const materialProps = useMemo(() => getCategoryMaterial(category), [category]);

  // Animate rotation
  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
  });

  // Update color when prop changes
  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.color.set(color);
    }
  }, [color]);

  return (
    <mesh ref={meshRef} geometry={geometry} castShadow receiveShadow>
      <meshStandardMaterial
        ref={materialRef}
        color={color}
        roughness={materialProps.roughness}
        metalness={materialProps.metalness}
        envMapIntensity={materialProps.envMapIntensity}
      />
    </mesh>
  );
}