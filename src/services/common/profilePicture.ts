import "server-only";
import { connectDb } from "@/lib/db";
import User from "@/models/user.model";
import ApiError from "@/lib/api-error";
import {
  uploadToCloudinary,
  destroyFromCloudinary,
  extractPublicId,
} from "@/lib/cloudinary";

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/jpg",
  "image/avif",
];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function handleProfilePicture(userId: string, file: File) {
  // 1. Validation
  if (!file) {
    throw new ApiError(400, "Profile picture is required");
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new ApiError(
      400,
      "Invalid image format. Supported formats: JPEG, PNG, WEBP, AVIF"
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new ApiError(400, "Image size must not exceed 5MB");
  }

  await connectDb();
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // 2. Destroy existing profile picture from Cloudinary if one exists
  if (user.profile_picture) {
    const existingPublicId = extractPublicId(user.profile_picture);
    if (existingPublicId) {
      await destroyFromCloudinary(existingPublicId);
    }
  }

  // 3. Upload new profile picture to Cloudinary inside 'ecommerce/profile'
  const rootFolder = process.env.CLOUDINARY_FOLDER || "ecommerce";
  const targetFolder = `${rootFolder}/profile`;

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const uploadResult = await uploadToCloudinary(buffer, targetFolder);

  // 4. Update and save user in database
  user.profile_picture = uploadResult.secure_url;
  await user.save();

  return {
    profile_picture: user.profile_picture,
  };
}
