export type ProductStatus = 'active' | 'draft' | 'archived';

export interface AdminCategoryRef {
  _id: string;
  name: string | null;
}

export interface AdminImage {
  url: string;
  alt: string;
  width: number | null;
  height: number | null;
}

export interface AdminVariant {
  _id: string;
  name: string;
  sku: string;
  price: number;
  salePrice: number | null;
  stock: number;
  options: Record<string, string>;
  color: string | null;
  colorHex: string | null;
  size: string | null;
}

export interface AdminProduct {
  _id: string;
  name: string;
  slug: string;
  description: string;
  longDescription: string | null;
  price: number;
  compareAtPrice: number | null;
  sku: string;
  category: AdminCategoryRef;
  images: AdminImage[];
  variants: AdminVariant[];
  ratings: { average: number; count: number };
  tags: string[];
  featured: boolean;
  stock: number;
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AdminPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface AdminProductListResponse {
  success: boolean;
  data: {
    products: AdminProduct[];
    pagination: AdminPagination;
  };
}

export interface AdminProductResponse {
  success: boolean;
  data: {
    product: AdminProduct;
  };
}

export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  productCount: number;
}

export interface AdminCategoryListResponse {
  success: boolean;
  data: {
    categories: AdminCategory[];
  };
}

export interface AdminCategoryResponse {
  success: boolean;
  data: {
    category: AdminCategory;
  };
}

export interface AdminSimpleResponse {
  success: boolean;
  message: string;
}
