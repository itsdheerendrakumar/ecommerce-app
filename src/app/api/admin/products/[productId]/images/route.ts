import { asyncHandler } from "@/lib/api-async-handler";
import ApiError from "@/lib/api-error";
import { apiResponse } from "@/lib/api-response";
import { validateToken } from "@/lib/validateToken";
import { updateProductImagesSchema } from "@/lib/validations/product";
import { updateProductImages } from "@/services/admin/product.service";

export const PATCH = asyncHandler(
  async (request: Request, context: { params: Promise<Record<string, string>> }) => {
    const decoded = await validateToken();
    if (decoded.role !== "admin") {
      throw new ApiError(403, "Unauthorized: Admin access required");
    }

    const params = await context.params;
    const productId = params?.productId;
    if (!productId) {
      throw new ApiError(400, "Product ID is required");
    }

    const body = await request.json();
    const payload = updateProductImagesSchema.parse(body);

    const product = await updateProductImages(productId, decoded._id, payload);

    return Response.json(
      apiResponse("Product images updated successfully", product),
      { status: 200 }
    );
  }
);
