import { asyncHandler } from "@/lib/api-async-handler";
import ApiError from "@/lib/api-error";
import { apiResponse } from "@/lib/api-response";
import { validateToken } from "@/lib/validateToken";
import { connectDb } from "@/lib/db";
import Product from "@/models/product.model";

export const GET = asyncHandler(async (_request: Request) => {
  const decoded = await validateToken();
  if (decoded.role !== "admin") {
    throw new ApiError(403, "Unauthorized: Admin access required");
  }

  await connectDb();

  const products = await Product.find({}).sort({ createdAt: -1 }).lean();

  return Response.json(
    apiResponse("Products retrieved successfully", products),
    { status: 200 }
  );
});
