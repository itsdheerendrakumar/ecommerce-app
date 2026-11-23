import { z } from "zod";

export const checkoutAddressSchema = z.object({
  recipient_name: z.string().trim().min(2, "Recipient name must be at least 2 characters"),
  phone: z.string().trim().min(10, "Phone number must be at least 10 digits"),
  address_line_1: z.string().trim().min(3, "Address line 1 is required"),
  address_line_2: z.string().trim().optional(),
  city: z.string().trim().min(2, "City is required"),
  state: z.string().trim().min(2, "State is required"),
  pin_code: z.string().trim().min(4, "Pin code is required"),
});

export const checkoutItemSchema = z.object({
  product_id: z.string().trim().min(1, "Product ID is required"),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1"),
});

export const createPaymentIntentSchema = z.object({
  items: z.array(checkoutItemSchema).min(1, "At least one item is required in cart"),
  shipping_address: checkoutAddressSchema,
  billing_address: checkoutAddressSchema.optional(),
  notes: z.string().trim().max(500, "Notes cannot exceed 500 characters").optional(),
});

export type CheckoutAddressInput = z.infer<typeof checkoutAddressSchema>;
export type CheckoutItemInput = z.infer<typeof checkoutItemSchema>;
export type CreatePaymentIntentInput = z.infer<typeof createPaymentIntentSchema>;
