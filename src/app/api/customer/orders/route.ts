import "server-only";
import { asyncHandler } from "@/lib/api-async-handler";
import { apiResponse } from "@/lib/api-response";
import { validateToken } from "@/lib/validateToken";
import { getCustomerOrdersService } from "@/services/order.service";

/**
 * Controller: Returns order history for authenticated customer.
 * Database interaction is delegated to order.service.ts.
 */
export const GET = asyncHandler(async () => {
  const user = await validateToken();
  const orders = await getCustomerOrdersService(user._id);

  return Response.json(
    apiResponse("Customer orders retrieved successfully", orders),
    { status: 200 }
  );
});
