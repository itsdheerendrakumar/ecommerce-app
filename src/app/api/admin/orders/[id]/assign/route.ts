import "server-only";
import { asyncHandler } from "@/lib/api-async-handler";
import ApiError from "@/lib/api-error";
import { apiResponse } from "@/lib/api-response";
import { validateToken } from "@/lib/validateToken";
import { assignDeliveryPartnerSchema } from "@/lib/validations/admin-order";
import { assignDeliveryPartnerService } from "@/services/admin/order.service";

/**
 * Controller: Assigns an authorized delivery partner to an order.
 */
export const PATCH = asyncHandler(async (request: any, context: { params: Promise<Record<string, string>> }) => {
  const decoded = await validateToken();
  if (decoded.role !== "admin") {
    throw new ApiError(403, "Unauthorized: Admin access required");
  }

  const { id } = await context.params;
  const body = await request.json();

  const parsed = assignDeliveryPartnerSchema.safeParse(body);
  if (!parsed.success) {
    const errorDetails = parsed.error.flatten().fieldErrors;
    throw new ApiError(400, "Invalid delivery partner assignment payload", [errorDetails]);
  }

  const updatedOrder = await assignDeliveryPartnerService(
    id,
    parsed.data.delivery_partner_id
  );

  return Response.json(
    apiResponse("Delivery partner assigned successfully", updatedOrder),
    { status: 200 }
  );
});
