import { z } from "zod";

export const addCartItemSchema = z.object({
  productId: z.string().min(1),
  name: z.string().min(1),
  quantity: z.number().int().positive(),
  unitPrice: z.number().nonnegative()
});

export const updateCartItemQuantitySchema = z.object({
  quantity: z.number().int().positive()
});
