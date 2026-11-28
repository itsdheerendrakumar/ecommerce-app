import "server-only";
import type { NextRequest } from "next/server";
import { asyncHandler } from "@/lib/api-async-handler";
import { apiResponse } from "@/lib/api-response";
import { validateRoleToken } from "@/lib/validateToken";
import { getAdminOrderDetailService } from "@/services/admin/order.service";

/**
 * Controller: Retrieves single order details including PaymentTransaction ledger.
 */
export const GET = asyncHandler(
  async (_request: NextRequest, context: { params: Promise<Record<string, string>> }) => {
    await validateRoleToken("admin", "Unauthorized: Admin access required");

    const { id } = await context.params;
    const order = await getAdminOrderDetailService(id);

    return Response.json(
      apiResponse("Order details retrieved successfully", order),
      { status: 200 }
    );
  }
);
