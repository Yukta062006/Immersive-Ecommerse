import { z } from "zod";

export const signupSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email format"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(100, "Password must be at most 100 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
    name: z
      .string()
      .min(1, "Name is required")
      .max(100, "Name must be at most 100 characters")
      .trim(),
  }),
  query: z.object({}).passthrough(),
  params: z.object({}).passthrough(),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(1, "Password is required"),
  }),
  query: z.object({}).passthrough(),
  params: z.object({}).passthrough(),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
