import api from '@/lib/api';
import type {
  AdminCategory,
  AdminCategoryListResponse,
  AdminCategoryResponse,
  AdminProduct,
  AdminProductListResponse,
  AdminProductResponse,
  AdminSimpleResponse,
  ProductStatus,
} from '@/types/admin';

export interface AdminProductQuery {
  status?: ProductStatus;
  category_id?: string;
  featured?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ProductImagePayload {
  url: string;
  alt?: string;
  width?: number | null;
  height?: number | null;
}

export interface ProductVariantPayload {
  name: string;
  sku: string;
  price: number;
  sale_price?: number | null;
  stock?: number;
  options?: Record<string, string>;
  color?: string | null;
  color_hex?: string | null;
  size?: string | null;
}

export interface ProductPayload {
  name: string;
  slug?: string;
  description: string;
  long_description?: string | null;
  price: number;
  compare_at_price?: number | null;
  sku?: string;
  category_id: string;
  featured?: boolean;
  stock?: number;
  low_stock_threshold?: number;
  status?: ProductStatus;
  weight?: number | null;
  dimensions?: { length?: number | null; width?: number | null; height?: number | null } | null;
  tags?: string[];
  seo_title?: string | null;
  seo_description?: string | null;
  images?: ProductImagePayload[];
  variants?: ProductVariantPayload[];
}

export interface CategoryPayload {
  name: string;
  slug?: string;
  description?: string | null;
  image?: string | null;
  parent_id?: string | null;
  sort_order?: number;
  is_active?: boolean;
}

/** Fetch the paginated admin product list with optional filters. */
export async function fetchAdminProducts(query: AdminProductQuery = {}): Promise<AdminProductListResponse> {
  const params: Record<string, string | number | boolean> = {};
  if (query.status) params.status = query.status;
  if (query.category_id) params.category_id = query.category_id;
  if (query.featured !== undefined) params.featured = query.featured;
  if (query.search) params.search = query.search;
  if (query.page) params.page = query.page;
  if (query.limit) params.limit = query.limit;
  const { data } = await api.get<AdminProductListResponse>('/admin/products', { params });
  return data;
}

/** Fetch a single admin product. */
export async function fetchAdminProduct(id: string): Promise<AdminProductResponse> {
  const { data } = await api.get<AdminProductResponse>(`/admin/products/${id}`);
  return data;
}

/** Create a product. */
export async function createAdminProduct(payload: ProductPayload): Promise<AdminProductResponse> {
  const { data } = await api.post<AdminProductResponse>('/admin/products', payload);
  return data;
}

/** Update a product (full replace). */
export async function updateAdminProduct(id: string, payload: ProductPayload): Promise<AdminProductResponse> {
  const { data } = await api.put<AdminProductResponse>(`/admin/products/${id}`, payload);
  return data;
}

/** Hard-delete a product. */
export async function deleteAdminProduct(id: string): Promise<AdminSimpleResponse> {
  const { data } = await api.delete<AdminSimpleResponse>(`/admin/products/${id}`);
  return data;
}

/** Fetch all categories with active product counts. */
export async function fetchAdminCategories(): Promise<AdminCategoryListResponse> {
  const { data } = await api.get<AdminCategoryListResponse>('/admin/categories');
  return data;
}

/** Create a category. */
export async function createAdminCategory(payload: CategoryPayload): Promise<AdminCategoryResponse> {
  const { data } = await api.post<AdminCategoryResponse>('/admin/categories', payload);
  return data;
}

/** Update a category. */
export async function updateAdminCategory(id: string, payload: CategoryPayload): Promise<AdminCategoryResponse> {
  const { data } = await api.put<AdminCategoryResponse>(`/admin/categories/${id}`, payload);
  return data;
}

/** Delete a category (cascades to its products). */
export async function deleteAdminCategory(id: string): Promise<AdminSimpleResponse> {
  const { data } = await api.delete<AdminSimpleResponse>(`/admin/categories/${id}`);
  return data;
}

export type { AdminCategory, AdminProduct };
