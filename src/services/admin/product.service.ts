import "server-only";
import mongoose from "mongoose";
import { connectDb } from "@/lib/db";
import ApiError from "@/lib/api-error";
import Product, { IProduct } from "@/models/product.model";
import UploadSession, { IUploadSession, IUploadedAsset } from "@/models/upload-session.model";
import {
  CreateProductDraftInput,
  GenerateUploadSignaturesInput,
  RegisterUploadedAssetInput,
  UpdateProductImagesInput,
} from "@/lib/validations/product";
import {
  generateUploadSignature,
  verifyCloudinaryAsset,
  getCloudinaryAssetsByTag,
  deleteCloudinaryAssets,
  CloudinarySignedUploadConfig,
} from "@/lib/cloudinary";

const SESSION_TTL_MS = 60 * 60 * 1000; // 1 hour

export interface CreateProductDraftResult {
  productId: string;
  uploadSessionId: string;
  expiresAt: string;
  product: IProduct;
}

export async function createProductDraft(
  payload: CreateProductDraftInput,
  adminId: string
): Promise<CreateProductDraftResult> {
  await connectDb();

  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  // MongoDB Atlas natively supports multi-document transactions
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const productData = {
      name: payload.name,
      shortDescription: payload.shortDescription || "",
      description: payload.description,
      price: payload.price,
      originalPrice: payload.originalPrice,
      category: payload.category,
      stock: payload.stock,
      features: payload.features || [],
      images: [],
      status: "draft",
      createdBy: new mongoose.Types.ObjectId(adminId),
    };

    // 1. Create Product draft within the transaction session
    const [createdProduct] = await Product.create([productData], { session });

    // 2. Create UploadSession linked to the product within the same transaction session
    const [createdSession] = await UploadSession.create(
      [
        {
          productId: createdProduct._id,
          adminId: new mongoose.Types.ObjectId(adminId),
          status: "pending",
          expectedImages: payload.expectedImages,
          uploadedAssets: [],
          expiresAt,
        },
      ],
      { session }
    );

    // 3. Atomically commit both documents together
    await session.commitTransaction();

    return {
      productId: createdProduct._id.toString(),
      uploadSessionId: createdSession._id.toString(),
      expiresAt: expiresAt.toISOString(),
      product: createdProduct,
    };
  } catch (error: any) {
    // If anything fails, abort and roll back all changes
    await session.abortTransaction();
    throw new ApiError(error.statusCode || 500, error.message || "Failed to create product draft");
  } finally {
    // Always close the session to release connection resources
    await session.endSession();
  }
}

export interface GeneratedSignatureItem {
  id: string;
  signatureConfig: CloudinarySignedUploadConfig;
}

export async function generateUploadSignatures(
  sessionId: string,
  adminId: string,
  payload?: GenerateUploadSignaturesInput
): Promise<{ sessionId: string; signatures: GeneratedSignatureItem[] }> {
  await connectDb();

  if (!mongoose.Types.ObjectId.isValid(sessionId)) {
    throw new ApiError(400, "Invalid upload session ID");
  }

  const uploadSession = await UploadSession.findById(sessionId);
  if (!uploadSession) {
    throw new ApiError(404, "Upload session not found");
  }

  if (uploadSession.adminId.toString() !== adminId) {
    throw new ApiError(403, "Unauthorized: You do not own this upload session");
  }

  if (uploadSession.status === "completed") {
    throw new ApiError(400, "Upload session has already been completed");
  }

  if (uploadSession.expiresAt.getTime() < Date.now()) {
    uploadSession.status = "expired";
    await uploadSession.save();
    throw new ApiError(400, "Upload session has expired");
  }

  const product = await Product.findById(uploadSession.productId);
  if (!product) {
    throw new ApiError(404, "Associated product not found");
  }

  if (product.status !== "draft") {
    throw new ApiError(400, "Signatures can only be generated for draft products");
  }

  const requestedCount = payload?.fileNames?.length || payload?.count || uploadSession.expectedImages;
  const countToSign = Math.min(Math.max(1, requestedCount), 5);

  const folder = `products/${uploadSession.productId}`;
  const sessionTag = `session_${uploadSession._id}`;
  const productTag = `product_${uploadSession.productId}`;
  const tags = `${sessionTag},${productTag}`;

  const signatures: GeneratedSignatureItem[] = [];

  for (let i = 0; i < countToSign; i++) {
    const uniqueSuffix = `${Date.now()}_${i}_${Math.random().toString(36).substring(2, 7)}`;
    const publicId = `${folder}/img_${uniqueSuffix}`;

    const signatureConfig = generateUploadSignature({
      folder,
      publicId,
      tags,
      context: {
        sessionId: uploadSession._id.toString(),
        productId: uploadSession.productId.toString(),
        adminId,
      },
    });

    signatures.push({
      id: uniqueSuffix,
      signatureConfig,
    });
  }

  uploadSession.status = "uploading";
  await uploadSession.save();

  return {
    sessionId: uploadSession._id.toString(),
    signatures,
  };
}

export async function verifyAndRegisterAsset(
  sessionId: string,
  adminId: string,
  payload: RegisterUploadedAssetInput
): Promise<{ message: string; asset: IUploadedAsset; session: IUploadSession }> {
  await connectDb();

  if (!mongoose.Types.ObjectId.isValid(sessionId)) {
    throw new ApiError(400, "Invalid upload session ID");
  }

  const uploadSession = await UploadSession.findById(sessionId);
  if (!uploadSession) {
    throw new ApiError(404, "Upload session not found");
  }

  if (uploadSession.adminId.toString() !== adminId) {
    throw new ApiError(403, "Unauthorized: You do not own this upload session");
  }

  if (uploadSession.expiresAt.getTime() < Date.now()) {
    uploadSession.status = "expired";
    await uploadSession.save();
    throw new ApiError(400, "Upload session has expired");
  }

  // Prevent duplicate asset registration in session
  const alreadyRegistered = uploadSession.uploadedAssets.some(
    (asset: IUploadedAsset) => asset.publicId === payload.publicId
  );
  if (alreadyRegistered) {
    const existing = uploadSession.uploadedAssets.find((a: IUploadedAsset) => a.publicId === payload.publicId)!;
    return {
      message: "Asset is already verified and registered",
      asset: existing,
      session: uploadSession,
    };
  }

  if (uploadSession.uploadedAssets.length >= 5) {
    throw new ApiError(400, "Upload session asset limit reached (maximum 5 images)");
  }

  // Verify asset via Cloudinary Admin API
  let verifiedResource;
  try {
    verifiedResource = await verifyCloudinaryAsset(payload.publicId);
  } catch (error: any) {
    throw new ApiError(400, `Cloudinary asset verification failed: ${error?.message || "Asset not found"}`);
  }

  // Validate session ownership and tags
  const expectedTag = `session_${uploadSession._id}`;
  if (!verifiedResource.tags.includes(expectedTag)) {
    throw new ApiError(400, "Asset does not match the expected upload session signature");
  }

  const newAsset: IUploadedAsset = {
    publicId: verifiedResource.publicId,
    secureUrl: verifiedResource.secureUrl,
    bytes: verifiedResource.bytes,
    format: verifiedResource.format,
    width: verifiedResource.width,
    height: verifiedResource.height,
    verifiedAt: new Date(),
  };

  uploadSession.uploadedAssets.push(newAsset);
  await uploadSession.save();

  return {
    message: "Asset verified and registered successfully",
    asset: newAsset,
    session: uploadSession,
  };
}

export async function updateProductImages(
  productId: string,
  adminId: string,
  payload: UpdateProductImagesInput
): Promise<IProduct> {
  await connectDb();

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new ApiError(400, "Invalid product ID");
  }

  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  if (product.createdBy.toString() !== adminId) {
    throw new ApiError(403, "Unauthorized: You do not own this product");
  }

  if (product.status !== "draft") {
    throw new ApiError(400, "Images can only be updated for draft products");
  }

  // Find the upload session for this product
  const uploadSession = await UploadSession.findOne({
    productId: product._id,
    adminId: new mongoose.Types.ObjectId(adminId),
  }).sort({ createdAt: -1 });

  if (!uploadSession) {
    throw new ApiError(400, "No upload session found for this product");
  }

  // Ensure all submitted public IDs have been verified and registered in the session
  const registeredPublicIds = new Set(uploadSession.uploadedAssets.map((a: IUploadedAsset) => a.publicId));
  for (const img of payload.images) {
    if (!registeredPublicIds.has(img.publicId)) {
      throw new ApiError(
        400,
        `Asset "${img.publicId}" has not been verified or registered in this upload session`
      );
    }
  }

  product.images = payload.images.map((img) => ({
    publicId: img.publicId,
    secureUrl: img.secureUrl,
    isPrimary: img.isPrimary,
    position: img.position,
  }));

  await product.save();

  // Mark upload session as completed
  uploadSession.status = "completed";
  await uploadSession.save();

  return product;
}

export async function publishProduct(
  productId: string,
  adminId: string
): Promise<IProduct> {
  await connectDb();

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new ApiError(400, "Invalid product ID");
  }

  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  if (product.createdBy.toString() !== adminId) {
    throw new ApiError(403, "Unauthorized: You do not own this product");
  }

  if (product.status === "published") {
    return product;
  }

  // Validations before publishing
  if (!product.name || product.name.trim().length < 2) {
    throw new ApiError(400, "Product name must be at least 2 characters");
  }

  if (!product.description || product.description.trim().length < 10) {
    throw new ApiError(400, "Product description must be at least 10 characters");
  }

  if (product.price <= 0) {
    throw new ApiError(400, "Product price must be greater than 0");
  }

  if (!product.images || product.images.length === 0) {
    throw new ApiError(400, "Cannot publish product without at least one verified image");
  }

  const primaryImages = product.images.filter((img: any) => img.isPrimary);
  if (primaryImages.length !== 1) {
    throw new ApiError(400, "Product must have exactly one primary image before publishing");
  }

  product.status = "published";
  await product.save();

  return product;
}

export async function cleanupAbandonedUploads(): Promise<{
  expiredSessionsCount: number;
  deletedAssetsCount: number;
}> {
  await connectDb();

  // Find sessions that have expired and were never completed
  const expiredSessions = await UploadSession.find({
    status: { $in: ["pending", "uploading"] },
    expiresAt: { $lt: new Date() },
  });

  if (expiredSessions.length === 0) {
    return { expiredSessionsCount: 0, deletedAssetsCount: 0 };
  }

  // Get all publicIds currently in use by any Product (draft or published)
  const usedPublicIds = await Product.distinct("images.publicId");
  const usedSet = new Set(usedPublicIds.filter(Boolean));

  let totalDeletedAssets = 0;

  for (const session of expiredSessions) {
    const sessionTag = `session_${session._id}`;
    // Discover any assets uploaded with this session tag
    const assetsWithTag = await getCloudinaryAssetsByTag(sessionTag);

    // Also include any assets registered in session.uploadedAssets
    const sessionAssetIds = session.uploadedAssets.map((a: IUploadedAsset) => a.publicId);
    const candidateIds = Array.from(new Set([...assetsWithTag, ...sessionAssetIds]));

    // Filter out assets that are referenced by any product
    const orphanedIds = candidateIds.filter((id) => !usedSet.has(id));

    if (orphanedIds.length > 0) {
      await deleteCloudinaryAssets(orphanedIds);
      totalDeletedAssets += orphanedIds.length;
    }

    session.status = "expired";
    await session.save();
  }

  return {
    expiredSessionsCount: expiredSessions.length,
    deletedAssetsCount: totalDeletedAssets,
  };
}
