import "server-only";
import type { NextRequest } from "next/server";
import { asyncHandler } from "@/lib/api-async-handler";
import { apiResponse } from "@/lib/api-response";
import { validateRoleToken } from "@/lib/validateToken";
import { getDeliveryOrdersService } from "@/services/delivery/order.service";

/**
 * Controller: Lists orders assigned to the authenticated delivery partner.
 */
export const GET = asyncHandler(async (request: NextRequest) => {
  const decoded = await validateRoleToken(
    "delivery-partner",
    "Unauthorized: Delivery partner access required"
  );

  const { searchParams } = new URL(request.url);
  const scopeParam = searchParams.get("scope");
  const scope = scopeParam === "history" ? "history" : "active";
  const status = searchParams.get("status") || undefined;
  const search = searchParams.get("search") || undefined;
  const page = parseInt(searchParams.get("page") || "1", 10) || 1;
  const limit = parseInt(searchParams.get("limit") || "10", 10) || 10;

  const result = await getDeliveryOrdersService(decoded._id, {
    scope,
    status,
    search,
    page,
    limit,
  });

  return Response.json(
    apiResponse("Delivery orders retrieved successfully", result.orders, result.meta),
    { status: 200 }
  );
});
