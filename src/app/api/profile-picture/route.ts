import { asyncHandler } from "@/lib/api-async-handler";
import { apiResponse } from "@/lib/api-response";
import { validateToken } from "@/lib/validateToken";
import { handleProfilePicture } from "@/services/common/profilePicture";
import ApiError from "@/lib/api-error";

export const POST = asyncHandler(async (request: Request) => {
  const decoded = await validateToken();
  const formData = await request.formData();
  const profile_picture = formData.get("profile_picture");

  if (!profile_picture || !(profile_picture instanceof File)) {
    throw new ApiError(400, "Please provide a valid profile picture file");
  }

  const result = await handleProfilePicture(decoded._id, profile_picture);
  return Response.json(
    apiResponse("Profile picture updated successfully", result),
    { status: 200 }
  );
});
