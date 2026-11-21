import { asyncHandler } from "@/lib/api-async-handler";
import { apiResponse } from "@/lib/api-response";
import { connectDb } from "@/lib/db";
import Product, { IProductImage } from "@/models/product.model";

export const GET = asyncHandler(async (request: Request) => {
  await connectDb();

  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const search = searchParams.get("search");
  const sortBy = searchParams.get("sortBy");

  const query: Record<string, any> = { status: "published" };

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
  }

  const rawProducts = await Product.find(query).sort(sortOption).lean();

  const products = rawProducts.map((doc: any) => {
    const sortedImages = (doc.images || [])
      .slice()
      .sort((a: IProductImage, b: IProductImage) => {
        if (a.isPrimary && !b.isPrimary) return -1;
        if (!a.isPrimary && b.isPrimary) return 1;
        return (a.position || 0) - (b.position || 0);
      })
      .map((img: IProductImage) => img.secureUrl);

    return {
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
  });

  return Response.json(
    apiResponse("Published products retrieved successfully", products),
    { status: 200 }
  );
});
