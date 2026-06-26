export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  width: number;
  height: number;
}

export interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  price: number;
  salePrice?: number;
  stock: number;
  size?: string;
  color?: string;
  colorHex?: string;
  images: ProductImage[];
}

export interface ProductReview {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  title: string;
  comment: string;
  createdAt: string;
  verified: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: number;
  salePrice?: number;
  brand: string;
  category: string;
  subcategory?: string;
  tags: string[];
  images: ProductImage[];
  variants: ProductVariant[];
  reviews: ProductReview[];
  averageRating: number;
  reviewCount: number;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PromoCode {
  code: string;
  description: string;
  discountPercent: number;
  minPurchaseCents: number;
  maxUses: number;
  usedCount: number;
  active: boolean;
}

export interface ProductFilters {
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  sizes?: string[];
  colors?: string[];
  rating?: number;
  sort?: 'newest' | 'price-asc' | 'price-desc' | 'rating' | 'popular';
  search?: string;
}

export interface PaginatedProducts {
  products: Product[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  productCount: number;
}
