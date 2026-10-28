import { asyncHandler } from "@/lib/api-async-handler";
import { apiResponse } from "@/lib/api-response";
import { loginSchema } from "@/lib/validations/auth";
import { login } from "@/services/login";

export const POST = asyncHandler(async (request: Request) => {
  const body = await request.json();
  const validatedBody = loginSchema.parse(body);
  const user = await login(validatedBody);
  return Response.json(apiResponse("Logged in successfully", user), {status: 200})
})