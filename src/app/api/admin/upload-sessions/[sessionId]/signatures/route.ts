import { asyncHandler } from "@/lib/api-async-handler";
import ApiError from "@/lib/api-error";
import { apiResponse } from "@/lib/api-response";
import { validateToken } from "@/lib/validateToken";
import { generateUploadSignaturesSchema } from "@/lib/validations/product";
import { generateUploadSignatures } from "@/services/admin/product.service";

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

    let parsedBody;
    try {
      const body = await request.json();
      parsedBody = generateUploadSignaturesSchema.parse(body);
    } catch {
      parsedBody = undefined;
    }

    const result = await generateUploadSignatures(sessionId, decoded._id, parsedBody);

    return Response.json(
      apiResponse("Upload signatures generated successfully", result),
      { status: 200 }
    );
  }
);
