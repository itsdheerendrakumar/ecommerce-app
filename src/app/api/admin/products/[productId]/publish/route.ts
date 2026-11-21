import { asyncHandler } from "@/lib/api-async-handler";
import ApiError from "@/lib/api-error";
import { apiResponse } from "@/lib/api-response";
import { validateToken } from "@/lib/validateToken";
import { publishProduct } from "@/services/admin/product.service";

export const PATCH = asyncHandler(
  async (_request: Request, context: { params: Promise<Record<string, string>> }) => {
    const decoded = await validateToken();
    if (decoded.role !== "admin") {
      throw new ApiError(403, "Unauthorized: Admin access required");
    }

    const params = await context.params;
    const productId = params?.productId;
    if (!productId) {
      throw new ApiError(400, "Product ID is required");
    }

    const product = await publishProduct(productId, decoded._id);

    return Response.json(
      apiResponse("Product published successfully", product),
      { status: 200 }
    );
  }
);
