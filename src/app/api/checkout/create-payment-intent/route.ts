import "server-only";
import { asyncHandler } from "@/lib/api-async-handler";
import { apiResponse } from "@/lib/api-response";
import ApiError from "@/lib/api-error";
import { validateToken } from "@/lib/validateToken";
import { createPaymentIntentSchema } from "@/lib/validations/checkout";
import { createPaymentIntentService } from "@/services/checkout.service";

/**
 * Controller: Handles HTTP Request / Response only.
 * Business logic and database access are encapsulated in checkout.service.ts.
 */
export const POST = asyncHandler(async (request: Request) => {
  // 1. Authenticate user from session token
  const user = await validateToken();

  // 2. Parse & validate request payload with Zod
  const body = await request.json();
  const validationResult = createPaymentIntentSchema.safeParse(body);
  if (!validationResult.success) {
    const errorDetails = validationResult.error.flatten().fieldErrors;
    throw new ApiError(400, "Invalid checkout payload", [errorDetails]);
  }

  // 3. Delegate to business service layer
  const result = await createPaymentIntentService(validationResult.data, user._id);

  // 4. Return HTTP Response
  return Response.json(
    apiResponse("Payment intent created successfully", result),
    { status: 201 }
  );
});
