import { asyncHandler } from "@/lib/api-async-handler";
import ApiError from "@/lib/api-error";
import { apiResponse } from "@/lib/api-response";
import { connectDb } from "@/lib/db";
import { getOptionalUser } from "@/lib/validateToken";
import Product, { IProductImage } from "@/models/product.model";
import mongoose from "mongoose";

export const GET = asyncHandler(async (_request, context) => {
  const params = await context.params;
  const id = params?.id;

  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid product ID format");
  }

  await connectDb();

  const user = await getOptionalUser();
  const isAdmin = user?.role === "admin";

  // Draft items will be visible ONLY to the admin user
  const query: Record<string, any> = { _id: id };
  if (!isAdmin) {
    query.status = "published";
  }

  const doc = await Product.findOne(query).lean();
  if (!doc) {
    throw new ApiError(404, "Product not found");
  }

  const sortedImages = (doc.images || [])
    .slice()
    .sort((a: IProductImage, b: IProductImage) => {
      if (a.isPrimary && !b.isPrimary) return -1;
      if (!a.isPrimary && b.isPrimary) return 1;
      return (a.position || 0) - (b.position || 0);
    })
    .map((img: IProductImage) => img.secureUrl);

  const product = {
    _id: doc._id.toString(),
    id: doc._id.toString(),
    name: doc.name,
    shortDescription: doc.shortDescription || doc.description.slice(0, 100),
    description: doc.description,
    price: doc.price,
    originalPrice: doc.originalPrice,
    category: doc.category,
    stock: doc.stock,
    features: doc.features || [],
    images: sortedImages,
    rawImages: doc.images || [],
    rating: 4.8,
    reviews: [],
    status: doc.status,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };

  return Response.json(
    apiResponse("Product details retrieved successfully", product),
    { status: 200 }
  );
});
