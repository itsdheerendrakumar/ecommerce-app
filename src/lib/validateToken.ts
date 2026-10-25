import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { generateJwtToken, verifyToken } from "@/lib/jsonwebtoken";
import type { DecodedTokenPayload } from "@/lib/jsonwebtoken";

export async function validateToken(): Promise<DecodedTokenPayload["data"]> {
  const cookieStore = await cookies();

  const access_token = cookieStore.get("access_token")?.value;
  const refresh_token = cookieStore.get("refresh_token")?.value;

  const decoded = verifyToken(access_token ?? "");

  if (decoded) {
    return decoded.data;
  }

  const refresh_decoded = verifyToken(refresh_token ?? "");

  if (!refresh_decoded) {
    redirect("/login");
  }

  const new_access_token = generateJwtToken(
    refresh_decoded.data,
    "accessToken"
  );

  cookieStore.set("access_token", new_access_token, {
    httpOnly: process.env.MODE !== "dev",
    path: "/",
  });

  return refresh_decoded.data;
}