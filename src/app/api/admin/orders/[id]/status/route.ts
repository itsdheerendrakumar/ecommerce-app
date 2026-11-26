import "server-only";
import { asyncHandler } from "@/lib/api-async-handler";
import ApiError from "@/lib/api-error";
import { apiResponse } from "@/lib/api-response";
import { validateToken } from "@/lib/validateToken";
import { updateOrderStatusSchema } from "@/lib/validations/admin-order";
import { updateAdminOrderStatusService } from "@/services/admin/order.service";

/**
 * Controller: Handles order lifecycle status updates by admin.
 */
export const PATCH = asyncHandler(async (request: any, context: { params: Promise<Record<string, string>> }) => {
  const decoded = await validateToken();
  if (decoded.role !== "admin") {
    throw new ApiError(403, "Unauthorized: Admin access required");
  }

  const { id } = await context.params;
  const body = await request.json();

  const parsed = updateOrderStatusSchema.safeParse(body);
  if (!parsed.success) {
    const errorDetails = parsed.error.flatten().fieldErrors;
    throw new ApiError(400, "Invalid status update payload", [errorDetails]);
  }

  const updatedOrder = await updateAdminOrderStatusService(
    id,
    parsed.data.status,
    parsed.data.cancel_reason
  );

  return Response.json(
    apiResponse("Order status updated successfully", updatedOrder),
    { status: 200 }
  );
});
