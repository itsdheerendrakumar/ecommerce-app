import "server-only";
import { v2 as cloudinary, UploadApiResponse } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export function uploadToCloudinary(
  buffer: Buffer,
  folder: string
): Promise<UploadApiResponse> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
      },
      (error, result) => {
        if (error || !result) {
          return reject(error || new Error("Cloudinary upload failed"));
        }
        resolve(result);
      }
    );
    stream.end(buffer);
  });
}

export function extractPublicId(url?: string | null): string | null {
  if (!url || typeof url !== "string") return null;
  const parts = url.split("/upload/");
  if (parts.length < 2) return null;

  let path = parts[1];
  const versionMatch = path.match(/(?:^|\/)v\d+\/(.+)$/);
  if (versionMatch) {
    path = versionMatch[1];
  } else {
    path = path.replace(/^(?:[a-zA-Z]_[^/]+\/)+/, "");
  }

  const dotIndex = path.lastIndexOf(".");
  return dotIndex !== -1 ? path.substring(0, dotIndex) : path;
}

export async function destroyFromCloudinary(publicId?: string | null): Promise<void> {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Failed to delete existing Cloudinary asset:", error);
  }
}

export interface CloudinarySignedUploadConfig {
  apiKey: string;
  cloudName: string;
  signature: string;
  timestamp: number;
  folder: string;
  publicId: string;
  tags?: string;
  context?: string;
}

export function generateUploadSignature(options: {
  folder: string;
  publicId: string;
  tags?: string;
  context?: Record<string, string>;
}): CloudinarySignedUploadConfig {
  const timestamp = Math.round(new Date().getTime() / 1000);
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;

  if (!apiSecret || !apiKey || !cloudName) {
    throw new Error("Cloudinary credentials are not properly configured");
  }

  const paramsToSign: Record<string, any> = {
    folder: options.folder,
    public_id: options.publicId,
    timestamp,
  };

  if (options.tags) {
    paramsToSign.tags = options.tags;
  }

  let serializedContext: string | undefined;
  if (options.context && Object.keys(options.context).length > 0) {
    serializedContext = Object.entries(options.context)
      .map(([k, v]) => `${k}=${v}`)
      .join("|");
    paramsToSign.context = serializedContext;
  }

  const signature = cloudinary.utils.api_sign_request(paramsToSign, apiSecret);

  return {
    apiKey,
    cloudName,
    signature,
    timestamp,
    folder: options.folder,
    publicId: options.publicId,
    tags: options.tags,
    context: serializedContext,
  };
}

export interface VerifiedCloudinaryResource {
  publicId: string;
  secureUrl: string;
  bytes: number;
  format: string;
  width: number;
  height: number;
  tags: string[];
  context?: Record<string, any>;
}

export async function verifyCloudinaryAsset(publicId: string): Promise<VerifiedCloudinaryResource> {
  const resource = await cloudinary.api.resource(publicId, {
    resource_type: "image",
    context: true,
    tags: true,
  });

  return {
    publicId: resource.public_id,
    secureUrl: resource.secure_url,
    bytes: resource.bytes,
    format: resource.format,
    width: resource.width,
    height: resource.height,
    tags: Array.isArray(resource.tags) ? resource.tags : [],
    context: resource.context?.custom,
  };
}

export async function getCloudinaryAssetsByTag(tag: string): Promise<string[]> {
  try {
    const result = await cloudinary.api.resources_by_tag(tag, {
      resource_type: "image",
      max_results: 100,
    });
    return (result.resources || []).map((r: any) => r.public_id);
  } catch (err) {
    console.warn(`Could not fetch Cloudinary assets with tag ${tag}:`, err);
    return [];
  }
}

export async function deleteCloudinaryAssets(publicIds: string[]): Promise<void> {
  if (!publicIds || publicIds.length === 0) return;
  try {
    await cloudinary.api.delete_resources(publicIds, {
      resource_type: "image",
    });
  } catch (error) {
    console.error("Failed to delete Cloudinary resources:", error);
  }
}

export default cloudinary;

