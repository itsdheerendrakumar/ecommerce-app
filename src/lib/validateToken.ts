import "server-only";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jsonwebtoken";
import type { DecodedTokenPayload } from "@/lib/jsonwebtoken";
import ApiError from "@/lib/api-error";

export async function getOptionalUser(): Promise<DecodedTokenPayload["data"] | null> {
  try {
    const cookieStore = await cookies();
    const access_token = cookieStore.get("access_token")?.value;

    if (!access_token) {
      return null;
    }

    const decoded = verifyToken(access_token);
    if (!decoded) {
      return null;
    }
    return decoded.data;
  } catch {
    return null;
  }
}

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

export async function validateRoleToken(
  allowedRoles:
    | DecodedTokenPayload["data"]["role"]
    | Array<DecodedTokenPayload["data"]["role"]>,
  errorMessage = "Unauthorized access"
): Promise<DecodedTokenPayload["data"]> {
  const decoded = await validateToken();
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  if (!roles.includes(decoded.role)) {
    throw new ApiError(403, errorMessage);
  }

  return decoded;
}
