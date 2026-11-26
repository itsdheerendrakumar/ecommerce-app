import "server-only";
import { asyncHandler } from "@/lib/api-async-handler";
import ApiError from "@/lib/api-error";
import { apiResponse } from "@/lib/api-response";
import { validateToken } from "@/lib/validateToken";
import { getAdminOrdersService } from "@/services/admin/order.service";

/**
 * Controller: Handles Admin Orders listing & executive stats retrieval.
 * Zero database queries inside the controller.
 */
export const GET = asyncHandler(async (request: Request) => {
  const decoded = await validateToken();
  if (decoded.role !== "admin") {
    throw new ApiError(403, "Unauthorized: Admin access required");
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || undefined;
  const order_status = searchParams.get("order_status") || undefined;
  const payment_status = searchParams.get("payment_status") || undefined;
  const sortBy = searchParams.get("sortBy") || undefined;
  const page = parseInt(searchParams.get("page") || "1", 10) || 1;
  const limit = parseInt(searchParams.get("limit") || "10", 10) || 10;

  const result = await getAdminOrdersService({
    search,
    order_status,
    payment_status,
    sortBy,
    page,
    limit,
  });

  return Response.json(
    apiResponse("Admin orders retrieved successfully", result.orders, {
      ...result.meta,
      stats: result.stats,
    }),
    { status: 200 }
  );
});
