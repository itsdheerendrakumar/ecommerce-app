import { asyncHandler } from "@/lib/api-async-handler";
import ApiError from "@/lib/api-error";
import { apiResponse } from "@/lib/api-response";
import { validateToken } from "@/lib/validateToken";
import { connectDb } from "@/lib/db";
import Product from "@/models/product.model";

export const GET = asyncHandler(async (request: Request) => {
  const decoded = await validateToken();
  if (decoded.role !== "admin") {
    throw new ApiError(403, "Unauthorized: Admin access required");
  }

  await connectDb();

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search");
  const status = searchParams.get("status");
  const category = searchParams.get("category");
  const sortBy = searchParams.get("sortBy");

  const query: Record<string, any> = {};

  if (status && status !== "all") {
    query.status = status;
  }

  if (category && category !== "All") {
    query.category = category;
  }

  if (search && search.trim()) {
    const q = search.trim();
    query.$or = [
      { name: { $regex: q, $options: "i" } },
      { description: { $regex: q, $options: "i" } },
      { category: { $regex: q, $options: "i" } },
      { shortDescription: { $regex: q, $options: "i" } },
    ];
  }

  let sortOption: Record<string, 1 | -1> = { createdAt: -1 };
  if (sortBy === "price-low") {
    sortOption = { price: 1 };
  } else if (sortBy === "price-high") {
    sortOption = { price: -1 };
  } else if (sortBy === "name-asc") {
    sortOption = { name: 1 };
  } else if (sortBy === "name-desc") {
    sortOption = { name: -1 };
  } else if (sortBy === "stock-low") {
    sortOption = { stock: 1 };
  } else if (sortBy === "stock-high") {
    sortOption = { stock: -1 };
  }

  const products = await Product.find(query).sort(sortOption).lean();

  return Response.json(
    apiResponse("Products retrieved successfully", products),
    { status: 200 }
  );
});
