import { z } from "zod";

const addressSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().min(1, "Last name is required").max(100),
  street1: z.string().min(1, "Street address is required").max(200),
  street2: z.string().max(200).optional(),
  city: z.string().min(1, "City is required").max(100),
  state: z.string().min(1, "State is required").max(100),
  postalCode: z.string().min(1, "Postal code is required").max(20),
  country: z.string().min(1, "Country is required").max(2),
  phone: z.string().max(20).optional(),
});

export const createCheckoutSchema = z.object({
  body: z.object({
    shippingAddress: addressSchema,
    billingAddress: addressSchema.optional(),
    shippingMethod: z.enum(["standard", "express", "overnight"]).default("standard"),
    promoCodes: z.array(z.string()).optional(),
    notes: z.string().max(500).optional(),
  }),
  query: z.object({}).passthrough(),
  params: z.object({}).passthrough(),
});

export const verifyPaymentSchema = z.object({
  body: z.object({
    razorpayOrderId: z.string().min(1, "Razorpay order ID is required"),
    razorpayPaymentId: z.string().min(1, "Razorpay payment ID is required"),
    razorpaySignature: z.string().min(1, "Razorpay signature is required"),
    orderId: z.string().min(1, "Order ID is required"),
  }),
  query: z.object({}).passthrough(),
  params: z.object({}).passthrough(),
});

export const orderIdSchema = z.object({
  body: z.object({}).passthrough(),
  query: z.object({}).passthrough(),
  params: z.object({
    id: z.string().min(1, "Order ID is required"),
  }),
});

export type CreateCheckoutInput = z.infer<typeof createCheckoutSchema>;
export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>;
export type OrderIdInput = z.infer<typeof orderIdSchema>;
