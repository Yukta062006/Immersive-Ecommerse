import type { Product, ProductImage, ProductVariant, ProductReview } from '@/types/product';

const categories = ['Footwear', 'Outerwear', 'Accessories', 'Electronics', 'Bags', 'Apparel'];
const brandMap: Record<string, string[]> = {
  Footwear: ['Nike', 'Adidas', 'New Balance', 'Jordan', 'Puma'],
  Outerwear: ['North Face', 'Patagonia', "Levi's", 'Columbia'],
  Accessories: ['Apple', 'Ray-Ban', 'Oakley', 'Samsung'],
  Electronics: ['Apple', 'Samsung', 'Sony', 'Microsoft'],
  Bags: ['North Face', 'Patagonia', 'Samsonite'],
  Apparel: ["Levi's", 'Uniqlo'],
};

const categoryImagePools: Record<string, string[]> = {
  Footwear: [
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff',
    'https://images.unsplash.com/photo-1606107557495-6c3ed0e7ee8e',
    'https://images.unsplash.com/photo-1595950653106-4c717e2be3d4',
    'https://images.unsplash.com/photo-1584735175315-9d5df9b77e79',
    'https://images.unsplash.com/photo-1600180758891-30bd5e601a52',
    'https://images.unsplash.com/photo-1608231387042-66d1773070a5',
    'https://images.unsplash.com/photo-1605348532760-6753d2c43329',
    'https://images.unsplash.com/photo-1551107696-a6b80c2b1098',
    'https://images.unsplash.com/photo-1560769629-975ec4d6252b',
    'https://images.unsplash.com/photo-1514950244242-319a9f2e4b52',
  ],
  Outerwear: [
    'https://images.unsplash.com/photo-1551028719-017410ed4c34',
    'https://images.unsplash.com/photo-1544022613-e87ca75b78c7',
    'https://images.unsplash.com/photo-1495105787522-5334e3ffa0ef',
    'https://images.unsplash.com/photo-1548126032-0795d8b3694c',
    'https://images.unsplash.com/photo-1591047139829-d91aecb6caea',
    'https://images.unsplash.com/photo-1604626178309-2e1073e1d772',
    'https://images.unsplash.com/photo-1557961938-c4c0b6d5fa40',
    'https://images.unsplash.com/photo-1545591814-570b75d4e64c',
  ],
  Accessories: [
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9',
    'https://images.unsplash.com/photo-1520361513632-450a2c9c2b18',
    'https://images.unsplash.com/photo-1589995060055-2523be72c437',
    'https://images.unsplash.com/photo-1518779578993-ec3579fee582',
    'https://images.unsplash.com/photo-1505740420928-c1657e4af6e0',
  ],
  Electronics: [
    'https://images.unsplash.com/photo-1518779578993-ec3579fee582',
    'https://images.unsplash.com/photo-1512408440785-e8efc757edee',
    'https://images.unsplash.com/photo-1553454326-7aff54424e67',
    'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b68',
    'https://images.unsplash.com/photo-1588872659706-865005696a36',
    'https://images.unsplash.com/photo-1468495244123-6c6c332eeece',
  ],
  Bags: [
    'https://images.unsplash.com/photo-1553062407-2a8f5b72f760',
    'https://images.unsplash.com/photo-1622560480609-d83cc13e9ba0',
    'https://images.unsplash.com/photo-1548036328-c9fa7d1386e0',
    'https://images.unsplash.com/photo-1590874103328-eac385727af1',
    'https://images.unsplash.com/photo-1566150905458-5c060b3b9e7e',
  ],
  Apparel: [
    'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3',
    'https://images.unsplash.com/photo-1445205170235-053c90550528',
    'https://images.unsplash.com/photo-1556905055-8f358a7a47ba',
    'https://images.unsplash.com/photo-1585386959984-a415522ef79b',
    'https://images.unsplash.com/photo-1596284766715-19f9d0a53c93',
  ],
};

const colors = [
  { name: 'Black', hex: '#111' },
  { name: 'White', hex: '#f8f8f8' },
  { name: 'Red', hex: '#dc2626' },
  { name: 'Blue', hex: '#3b82f6' },
  { name: 'Green', hex: '#10b981' },
  { name: 'Yellow', hex: '#fbbf24' },
  { name: 'Purple', hex: '#8b5cf6' },
];
const sizes = ['S', 'M', 'L', 'XL', 'One Size'];

const modelNames: Record<string, string[]> = {
  Footwear: ['Runner', 'Stride', 'Bounce', 'Flex', 'Glide', 'Dash', 'Pulse', 'Surge', 'Drift', 'Cloud'],
  Outerwear: ['Shield', 'Storm', 'Venture', 'Apex', 'Ridge', 'Summit', 'Crest', 'Alpine', 'Bolt', 'Trek'],
  Accessories: ['Pro', 'Elite', 'Prime', 'Core', 'Nova', 'Edge', 'Zen', 'Aura', 'Pulse', 'Vue'],
  Electronics: ['Ultra', 'Max', 'Studio', 'Air', 'Neo', 'Quantum', 'Vision', 'Evo', 'Spark', 'Beam'],
  Bags: ['Trekker', 'Voyager', 'Explorer', 'Commuter', 'Nomad', 'Wayfarer', 'Atlas', 'Roam', 'Trail', 'Haul'],
  Apparel: ['Classic', 'Signature', 'Essential', 'Heritage', 'Comfort', 'Relaxed', 'Slim', 'Modern', 'Vintage', 'Icon'],
};

export function generateExtendedProducts(): Product[] {
  const extra: Product[] = [];
  let nextId = 1000;
  let imgCounter = 0;
  let variantCounter = 0;

  for (const category of categories) {
    const brands = brandMap[category] ?? ['Generic'];
    const imagePool = categoryImagePools[category] ?? categoryImagePools.Footwear;
    const namePool = modelNames[category] ?? modelNames.Apparel;

    for (const brand of brands) {
      for (let i = 0; i < 5; i++) {
        const id = (nextId++).toString();
        const modelName = namePool[(i + brands.indexOf(brand) * 2) % namePool.length];
        const name = `${brand} ${modelName}`;
        const slug = `${brand.toLowerCase().replace(/['\s]+/g, '-')}-${modelName.toLowerCase()}-${id}`;
        const basePrice = 30 + (i + brands.indexOf(brand)) * 8;
        const price = category === 'Electronics' ? basePrice * 4 : category === 'Outerwear' ? basePrice * 2 : basePrice;
        const salePrice = i % 3 === 0 ? Math.round(price * 0.85) : undefined;

        const idx0 = imgCounter % imagePool.length;
        const idx1 = (imgCounter + 1) % imagePool.length;
        const idx2 = (imgCounter + 2) % imagePool.length;
        const idx3 = (imgCounter + 3) % imagePool.length;
        imgCounter++;
        const images: ProductImage[] = [
          { id: `${id}-1`, url: `${imagePool[idx0]}?w=600&h=600&fit=crop`, alt: `${name} front`, width: 600, height: 600 },
          { id: `${id}-2`, url: `${imagePool[idx1]}?w=600&h=600&fit=crop`, alt: `${name} side`, width: 600, height: 600 },
          { id: `${id}-3`, url: `${imagePool[idx2]}?w=600&h=600&fit=crop`, alt: `${name} detail`, width: 600, height: 600 },
          ...(imagePool.length > 3 ? [{ id: `${id}-4`, url: `${imagePool[idx3]}?w=600&h=600&fit=crop`, alt: `${name} back`, width: 600, height: 600 }] : []),
        ];

        const variants: ProductVariant[] = [];
        for (let v = 0; v < 3; v++) {
          const cIdx = (variantCounter + v) % colors.length;
          const sIdx = (variantCounter + v) % sizes.length;
          variantCounter++;
          const color = colors[cIdx];
          const size = sizes[sIdx];
          const vImageIdx = (imgCounter + v) % imagePool.length;
          variants.push({
            id: `v${id}-${v + 1}`,
            name: `${color.name} / ${size}`,
            sku: `${brand.slice(0, 2).toUpperCase()}-${id}-${v + 1}`,
            price,
            salePrice,
            stock: 10 + v * 5,
            size,
            color: color.name,
            colorHex: color.hex,
            images: [{ id: `${id}-v${v + 1}`, url: `${imagePool[vImageIdx]}?w=600&h=600&fit=crop`, alt: `${name} ${color.name}`, width: 600, height: 600 }],
          });
        }

        extra.push({
          id,
          name,
          slug,
          description: `${name} — premium quality and modern design by ${brand}. Crafted with high-performance materials for lasting comfort and style.`,
          shortDescription: `${brand} ${modelName} in ${category.toLowerCase()}`,
          price,
          salePrice,
          brand,
          category,
          subcategory: category,
          tags: [category.toLowerCase(), brand.toLowerCase().replace(/['\s]+/g, '-')],
          images,
          variants,
          reviews: [] as ProductReview[],
          averageRating: 4.2 + (i % 5) * 0.15,
          reviewCount: 0,
          featured: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    }
  }

  return extra;
}
