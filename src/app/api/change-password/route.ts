import { asyncHandler } from "@/lib/api-async-handler";
import { apiResponse } from "@/lib/api-response";
import { validateToken } from "@/lib/validateToken";
import { changePasswordService } from "@/services/common/changePassword";
import { changePasswordApiSchema } from "@/lib/validations/auth";
import ApiError from "@/lib/api-error";

export const POST = asyncHandler(async (request: Request) => {
  const decoded = await validateToken();
  const body = await request.json();

  const parseResult = changePasswordApiSchema.safeParse(body);
  if (!parseResult.success) {
    const firstError = parseResult.error.issues[0]?.message || "Invalid password data";
    throw new ApiError(400, firstError);
  }

  await changePasswordService(decoded._id, parseResult.data);

  return Response.json(
    apiResponse("Password changed successfully"),
    { status: 200 }
  );
});
