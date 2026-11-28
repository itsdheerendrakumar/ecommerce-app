import "server-only";
import type { NextRequest } from "next/server";
import { asyncHandler } from "@/lib/api-async-handler";
import ApiError from "@/lib/api-error";
import { apiResponse } from "@/lib/api-response";
import { validateRoleToken } from "@/lib/validateToken";
import { updateDutyStatusSchema } from "@/lib/validations/delivery-order";
import { updateDeliveryDutyStatusService } from "@/services/delivery/order.service";

/**
 * Controller: Updates delivery partner availability between "on-duty" and "off-duty".
 */
export const PATCH = asyncHandler(async (request: NextRequest) => {
  const decoded = await validateRoleToken(
    "delivery-partner",
    "Unauthorized: Delivery partner access required"
  );

  const body = await request.json();
  const parsed = updateDutyStatusSchema.safeParse(body);
  if (!parsed.success) {
    const errorDetails = parsed.error.flatten().fieldErrors;
    throw new ApiError(400, "Invalid duty status payload", [errorDetails]);
  }

  const partner = await updateDeliveryDutyStatusService(
    decoded._id,
    parsed.data.duty_status
  );

  return Response.json(
    apiResponse("Duty status updated successfully", partner),
    { status: 200 }
  );
});
