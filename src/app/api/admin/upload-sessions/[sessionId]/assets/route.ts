import { asyncHandler } from "@/lib/api-async-handler";
import ApiError from "@/lib/api-error";
import { apiResponse } from "@/lib/api-response";
import { validateToken } from "@/lib/validateToken";
import { registerUploadedAssetSchema } from "@/lib/validations/product";
import { verifyAndRegisterAsset } from "@/services/admin/product.service";

export const POST = asyncHandler(
  async (request: Request, context: { params: Promise<Record<string, string>> }) => {
    const decoded = await validateToken();
    if (decoded.role !== "admin") {
      throw new ApiError(403, "Unauthorized: Admin access required");
    }

    const params = await context.params;
    const sessionId = params?.sessionId;
    if (!sessionId) {
      throw new ApiError(400, "Session ID is required");
    }

    const body = await request.json();
    const payload = registerUploadedAssetSchema.parse(body);

    const result = await verifyAndRegisterAsset(sessionId, decoded._id, payload);

    return Response.json(
      apiResponse(result.message, result.asset),
      { status: 200 }
    );
  }
);
