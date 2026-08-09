'use client';

import { Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows } from '@react-three/drei';
import ProductModel from './ProductModel';
import Hotspot from './Hotspot';

interface HotspotData {
  position: [number, number, number];
  label: string;
  specs: {
    material: string;
    weight: string;
    dimensions: string;
    care?: string;
  };
}

interface ProductViewer3DProps {
  product: {
    name: string;
    category: string;
    color?: string;
    specs?: {
      material?: string;
      weight?: string;
      dimensions?: string;
      care?: string;
    };
  };
  selectedColor?: string;
}

const categoryMap: Record<string, string> = {
  footwear: 'footwear',
  outerwear: 'clothing',
  clothing: 'clothing',
  accessories: 'accessories',
  electronics: 'electronics',
  bags: 'accessories',
};
const defaultHotspots: Record<string, HotspotData[]> = {
  footwear: [
    { position: [1.2, 0.5, 0], label: 'Adaptive Sole', specs: { material: 'TPU', weight: '120g', dimensions: '28cm x 10cm', care: 'Spot clean' } },
    { position: [-1, 0.8, 0.3], label: 'Breathable Upper', specs: { material: 'Flyknit', weight: '85g', dimensions: 'One piece', care: 'Machine wash' } },
    { position: [0, 1.2, -0.5], label: 'Cushioning', specs: { material: 'EVA Foam', weight: '45g', dimensions: '27cm x 9cm', care: 'Air dry' } },
  ],
  clothing: [
    { position: [1, 0.5, 0], label: 'Fabric Blend', specs: { material: '80% Cotton, 20% Poly', weight: '180g', dimensions: 'Varies by size', care: 'Machine wash cold' } },
    { position: [-0.8, 0.8, 0.3], label: 'Stretch Panels', specs: { material: 'Spandex', weight: '15g', dimensions: 'Elastic', care: 'Hand wash' } },
  ],
  accessories: [
    { position: [0.8, 0.6, 0], label: 'Premium Finish', specs: { material: 'Polished Metal', weight: '25g', dimensions: '3cm x 3cm', care: 'Polish with soft cloth' } },
    { position: [-0.5, 0.8, 0.5], label: 'Adjustable Clasp', specs: { material: 'Stainless Steel', weight: '8g', dimensions: '2cm', care: 'Wipe clean' } },
  ],
  electronics: [
    { position: [1, 0.4, 0], label: 'Driver Unit', specs: { material: '40mm Neodymium', weight: '50g', dimensions: '40mm diameter', care: 'Wipe with dry cloth' } },
    { position: [-0.8, 0.7, 0.3], label: 'Noise Cancellation', specs: { material: 'ANC Chip', weight: '2g', dimensions: '5mm x 5mm', care: 'N/A' } },
    { position: [0, 1, -0.5], label: 'Battery', specs: { material: 'Lithium Ion', weight: '30g', dimensions: '50mm x 30mm', care: 'Charge monthly' } },
  ],
};

export default function ProductViewer3DWrapper({ product, selectedColor }: ProductViewer3DProps) {
  const color = selectedColor || '#6366f1';
  const mappedCategory = categoryMap[product.category.toLowerCase()] || 'electronics';
  const hotspots = useMemo(() => defaultHotspots[mappedCategory] || defaultHotspots.electronics, [mappedCategory]);

  return (
    <div className="w-full h-[400px] rounded-2xl overflow-hidden bg-gray-50 relative">
      <Suspense
        fallback={
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        }
      >
        <Canvas camera={{ position: [3, 2, 3], fov: 45 }} dpr={[1, 2]}>
          <ambientLight intensity={0.6} />
          <spotLight position={[10, 10, 0]} angle={0.3} penumbra={1} intensity={1.5} castShadow />
          <pointLight position={[-10, 0, -5]} intensity={0.5} color="#8b5cf6" />
          <pointLight position={[5, 5, 5]} intensity={0.3} color="#f59e0b" />
          <hemisphereLight args={['#b1e1ff', '#b97a20', 0.4]} />

          <ProductModel category={mappedCategory} color={color} />

          {hotspots.map((hotspot, index) => (
            <Hotspot key={index} {...hotspot} />
          ))}

          <ContactShadows position={[0, -1.5, 0]} opacity={0.4} scale={5} blur={2} />

          <OrbitControls
            enableZoom={true}
            enablePan={false}
            minDistance={2}
            maxDistance={8}
            autoRotate
            autoRotateSpeed={1}
          />
        </Canvas>
      </Suspense>

      {/* Controls hint */}
      <div className="absolute bottom-4 left-4 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs text-gray-600">
        Drag to rotate • Scroll to zoom • Click hotspots for details
      </div>
    </div>
  );
}