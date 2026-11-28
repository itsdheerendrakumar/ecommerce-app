import "server-only";
import type { NextRequest } from "next/server";
import { asyncHandler } from "@/lib/api-async-handler";
import ApiError from "@/lib/api-error";
import { apiResponse } from "@/lib/api-response";
import { validateRoleToken } from "@/lib/validateToken";
import { updateDeliveryOrderStatusSchema } from "@/lib/validations/delivery-order";
import { updateDeliveryOrderStatusService } from "@/services/delivery/order.service";

/**
 * Controller: Allows assigned delivery partner to transition order
 * between "shipped" -> "out_for_delivery" -> "delivered".
 */
export const PATCH = asyncHandler(
  async (request: NextRequest, context: { params: Promise<Record<string, string>> }) => {
    const decoded = await validateRoleToken(
      "delivery-partner",
      "Unauthorized: Delivery partner access required"
    );

    const { id } = await context.params;
    const body = await request.json();

    const parsed = updateDeliveryOrderStatusSchema.safeParse(body);
    if (!parsed.success) {
      const errorDetails = parsed.error.flatten().fieldErrors;
      throw new ApiError(400, "Invalid delivery status payload", [errorDetails]);
    }

    const result = await updateDeliveryOrderStatusService(
      decoded._id,
      id,
      parsed.data.status
    );

    return Response.json(
      apiResponse("Delivery status updated successfully", result),
      { status: 200 }
    );
  }
);
