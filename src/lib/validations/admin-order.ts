import { z } from "zod";

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    "pending",
    "confirmed",
    "processing",
    "shipped",
    "out_for_delivery",
    "delivered",
    "cancelled",
    "returned",
  ]),
  cancel_reason: z.string().trim().max(500).optional(),
});

export const assignDeliveryPartnerSchema = z.object({
  delivery_partner_id: z.string().trim().min(1, "Delivery partner ID is required"),
});

export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type AssignDeliveryPartnerInput = z.infer<typeof assignDeliveryPartnerSchema>;
