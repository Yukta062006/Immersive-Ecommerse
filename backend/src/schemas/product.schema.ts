import { z } from "zod";

export const productQuerySchema = z.object({
  body: z.object({}).passthrough(),
  params: z.object({}).passthrough(),
  query: z.object({
    category: z.string().optional(),
    minPrice: z
      .string()
      .optional()
      .transform((val) => (val ? Number(val) : undefined)),
    maxPrice: z
      .string()
      .optional()
      .transform((val) => (val ? Number(val) : undefined)),
    minRating: z
      .string()
      .optional()
      .transform((val) => (val ? Number(val) : undefined)),
    sort: z
      .enum(["price_asc", "price_desc", "rating", "newest", "name"])
      .optional(),
    search: z.string().optional(),
    featured: z
      .string()
      .optional()
      .transform((val) => val === "true"),
    page: z
      .string()
      .optional()
      .transform((val) => (val ? Math.max(1, Number(val)) : 1)),
    limit: z
      .string()
      .optional()
      .transform((val) => (val ? Math.min(50, Math.max(1, Number(val))) : 12)),
  }),
});

export const productIdSchema = z.object({
  body: z.object({}).passthrough(),
  query: z.object({}).passthrough(),
  params: z.object({
    id: z.string().min(1, "Product ID is required"),
  }),
});

export type ProductQueryInput = z.infer<typeof productQuerySchema>;
export type ProductIdInput = z.infer<typeof productIdSchema>;
