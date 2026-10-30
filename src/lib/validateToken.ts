import "server-only";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jsonwebtoken";
import type { DecodedTokenPayload } from "@/lib/jsonwebtoken";
import ApiError from "@/lib/api-error";

export async function validateToken(): Promise<DecodedTokenPayload["data"]> {
  const cookieStore = await cookies();

  const access_token = cookieStore.get("access_token")?.value;

  if (!access_token) {
    throw new ApiError(401, "Access token missing");
  }

  const decoded = verifyToken(access_token);

  if (!decoded) {
    throw new ApiError(401, "Access token expired or invalid");
  }

  return decoded.data;
}
