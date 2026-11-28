import "server-only";
import { asyncHandler } from "@/lib/api-async-handler";
import { apiResponse } from "@/lib/api-response";
import { validateRoleToken } from "@/lib/validateToken";
import { getDeliveryPartnerStatsService } from "@/services/delivery/order.service";

/**
 * Controller: Returns operational & earnings stats for authenticated delivery partner.
 */
export const GET = asyncHandler(async () => {
  const decoded = await validateRoleToken(
    "delivery-partner",
    "Unauthorized: Delivery partner access required"
  );

  const stats = await getDeliveryPartnerStatsService(decoded._id);

  return Response.json(
    apiResponse("Delivery stats retrieved successfully", stats),
    { status: 200 }
  );
});
