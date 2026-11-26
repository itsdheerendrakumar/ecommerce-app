import "server-only";
import { asyncHandler } from "@/lib/api-async-handler";
import ApiError from "@/lib/api-error";
import { apiResponse } from "@/lib/api-response";
import { validateToken } from "@/lib/validateToken";
import {
  getAdminOverviewService,
  type OverviewRange,
} from "@/services/admin/overview.service";

const ALLOWED_RANGES: OverviewRange[] = ["7d", "30d", "90d", "all"];

/**
 * Controller: Retrieves aggregated executive KPIs, chart datasets, and operational queues for /admin.
 * Zero database queries inside the controller.
 */
export const GET = asyncHandler(async (request: Request) => {
  const decoded = await validateToken();
  if (decoded.role !== "admin") {
    throw new ApiError(403, "Unauthorized: Admin access required");
  }

  const { searchParams } = new URL(request.url);
  const rawRange = (searchParams.get("range") || "30d") as OverviewRange;
  const range: OverviewRange = ALLOWED_RANGES.includes(rawRange) ? rawRange : "30d";

  const overview = await getAdminOverviewService(range);

  return Response.json(
    apiResponse("Admin overview fetched successfully", overview),
    { status: 200 }
  );
});
