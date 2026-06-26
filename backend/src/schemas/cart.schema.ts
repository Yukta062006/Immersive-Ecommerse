import { z } from "zod";

export const addToCartSchema = z.object({
  body: z.object({
    productId: z.string().min(1, "Product ID is required"),
    variantId: z.string().optional(),
    quantity: z
      .number()
      .int()
      .min(1, "Quantity must be at least 1")
      .max(99, "Quantity must be at most 99")
      .default(1),
  }),
  query: z.object({}).passthrough(),
  params: z.object({}).passthrough(),
});

export const updateCartItemSchema = z.object({
  body: z.object({
    quantity: z
      .number()
      .int()
      .min(1, "Quantity must be at least 1")
      .max(99, "Quantity must be at most 99"),
  }),
  query: z.object({}).passthrough(),
  params: z.object({
    itemId: z.string().min(1, "Item ID is required"),
  }),
});

export const removeCartItemSchema = z.object({
  body: z.object({}).passthrough(),
  query: z.object({}).passthrough(),
  params: z.object({
    itemId: z.string().min(1, "Item ID is required"),
  }),
});

export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
export type RemoveCartItemInput = z.infer<typeof removeCartItemSchema>;
