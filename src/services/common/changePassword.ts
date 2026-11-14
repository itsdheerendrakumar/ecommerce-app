import "server-only";
import { connectDb } from "@/lib/db";
import User from "@/models/user.model";
import ApiError from "@/lib/api-error";
import { comparePassword, hashPassword } from "@/lib/bycrypt";

export interface ChangePasswordServiceParams {
  currentPassword: string;
  newPassword: string;
}

export async function changePasswordService(
  userId: string,
  params: ChangePasswordServiceParams
) {
  const { currentPassword, newPassword } = params;

  if (!currentPassword || !newPassword) {
    throw new ApiError(400, "Current password and new password are required");
  }

  if (currentPassword === newPassword) {
    throw new ApiError(400, "New password must be different from current password");
  }

  await connectDb();

  const user = await User.findById(userId).select("+password");
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (!user.password) {
    throw new ApiError(400, "Password is not configured for this account");
  }

  const isMatched = await comparePassword(user.password, currentPassword);
  if (!isMatched) {
    throw new ApiError(400, "Current password is incorrect");
  }

  const hashedPassword = await hashPassword(newPassword);
  user.password = hashedPassword;
  await user.save();

  return { success: true };
}

