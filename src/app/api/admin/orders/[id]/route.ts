import "server-only";
import { asyncHandler } from "@/lib/api-async-handler";
import ApiError from "@/lib/api-error";
import { apiResponse } from "@/lib/api-response";
import { validateToken } from "@/lib/validateToken";
import { getAdminOrderDetailService } from "@/services/admin/order.service";

/**
 * Controller: Retrieves single order details including PaymentTransaction ledger.
 */
export const GET = asyncHandler(async (_request: any, context: { params: Promise<Record<string, string>> }) => {
  const decoded = await validateToken();
  if (decoded.role !== "admin") {
    throw new ApiError(403, "Unauthorized: Admin access required");
  }

  const { id } = await context.params;
  const order = await getAdminOrderDetailService(id);

  return Response.json(
    apiResponse("Order details retrieved successfully", order),
    { status: 200 }
  );
});
