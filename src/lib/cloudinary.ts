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

export default cloudinary;

