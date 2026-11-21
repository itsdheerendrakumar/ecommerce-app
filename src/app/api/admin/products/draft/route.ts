import { asyncHandler } from "@/lib/api-async-handler";
import ApiError from "@/lib/api-error";
import { apiResponse } from "@/lib/api-response";
import { validateToken } from "@/lib/validateToken";
import { createProductDraftSchema } from "@/lib/validations/product";
import { createProductDraft } from "@/services/admin/product.service";

export const POST = asyncHandler(async (request: Request) => {
  const decoded = await validateToken();
  if (decoded.role !== "admin") {
    throw new ApiError(403, "Unauthorized: Admin access required");
  }

  const body = await request.json();
  const payload = createProductDraftSchema.parse(body);

  const result = await createProductDraft(payload, decoded._id);

  return Response.json(
    apiResponse("Product draft created successfully", result),
    { status: 201 }
  );
});
