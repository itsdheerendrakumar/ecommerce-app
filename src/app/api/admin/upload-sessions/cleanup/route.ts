import { asyncHandler } from "@/lib/api-async-handler";
import ApiError from "@/lib/api-error";
import { apiResponse } from "@/lib/api-response";
import { validateToken } from "@/lib/validateToken";
import { cleanupAbandonedUploads } from "@/services/admin/product.service";

export const POST = asyncHandler(async (_request: Request) => {
  const decoded = await validateToken();
  if (decoded.role !== "admin") {
    throw new ApiError(403, "Unauthorized: Admin access required");
  }

  const result = await cleanupAbandonedUploads();

  return Response.json(
    apiResponse("Abandoned uploads cleanup completed", result),
    { status: 200 }
  );
});
