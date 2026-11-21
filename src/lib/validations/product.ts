import { z } from "zod";

export const PRODUCT_CATEGORIES = [
  "Electronics",
  "Wearables",
  "Furniture",
  "Accessories",
  "Fashion",
  "Home Decor",
] as const;

export const createProductDraftSchema = z.object({
  name: z.string().trim().min(2, "Product name must be at least 2 characters").max(120, "Product name is too long"),
  shortDescription: z.string().trim().max(200, "Short description is too long").optional().default(""),
  description: z.string().trim().min(10, "Description must be at least 10 characters").max(2000, "Description is too long"),
  price: z.coerce.number().positive("Price must be greater than 0"),
  originalPrice: z.coerce.number().positive("Original price must be greater than 0").optional(),
  category: z.string().min(1, "Please select a category"),
  stock: z.coerce.number().int("Stock must be a whole number").min(0, "Stock cannot be negative"),
  features: z.array(z.string().trim().min(1, "Feature cannot be empty")).optional().default([]),
  expectedImages: z.coerce.number().int().min(1, "At least 1 image expected").max(5, "Maximum 5 images allowed").default(1),
});

export type CreateProductDraftInput = z.infer<typeof createProductDraftSchema>;

export const generateUploadSignaturesSchema = z.object({
  count: z.coerce.number().int().min(1).max(5).optional(),
  fileNames: z.array(z.string().trim().min(1)).min(1).max(5).optional(),
});

export type GenerateUploadSignaturesInput = z.infer<typeof generateUploadSignaturesSchema>;

export const registerUploadedAssetSchema = z.object({
  publicId: z.string().trim().min(1, "Public ID is required"),
  secureUrl: z.string().trim().url("Valid secure URL is required"),
});

export type RegisterUploadedAssetInput = z.infer<typeof registerUploadedAssetSchema>;

export const singleImageOrderSchema = z.object({
  publicId: z.string().trim().min(1, "Public ID is required"),
  secureUrl: z.string().trim().url("Valid secure URL is required"),
  isPrimary: z.boolean().default(false),
  position: z.number().int().min(0),
});

export const updateProductImagesSchema = z.object({
  images: z
    .array(singleImageOrderSchema)
    .min(1, "At least one image is required")
    .max(5, "Maximum 5 images allowed")
    .refine(
      (imgs) => imgs.filter((img) => img.isPrimary).length === 1,
      "Exactly one image must be selected as the primary image"
    )
    .refine((imgs) => {
      const positions = imgs.map((img) => img.position);
      const uniquePositions = new Set(positions);
      if (uniquePositions.size !== imgs.length) return false;
      const sorted = [...positions].sort((a, b) => a - b);
      return sorted.every((pos, idx) => pos === idx);
    }, "Image positions must be sequential and zero-indexed without duplicates"),
});

export type UpdateProductImagesInput = z.infer<typeof updateProductImagesSchema>;

export const publishProductSchema = z.object({
  validateImages: z.boolean().optional().default(true),
});
