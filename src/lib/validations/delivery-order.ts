import { z } from "zod";

export const updateDeliveryOrderStatusSchema = z.object({
  status: z.enum(["out_for_delivery", "delivered"]),
});

export const updateDutyStatusSchema = z.object({
  duty_status: z.enum(["on-duty", "off-duty"]),
});

export type UpdateDeliveryOrderStatusInput = z.infer<typeof updateDeliveryOrderStatusSchema>;
export type UpdateDutyStatusInput = z.infer<typeof updateDutyStatusSchema>;
