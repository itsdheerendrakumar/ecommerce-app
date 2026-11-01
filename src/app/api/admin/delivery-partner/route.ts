import { asyncHandler } from "@/lib/api-async-handler";
import ApiError from "@/lib/api-error";
import { apiResponse } from "@/lib/api-response";
import { validateToken } from "@/lib/validateToken";
import { deliveryPartnerSchema } from "@/lib/validations/delivery-partner";
import { createDeliveryPartner, getUserListing } from "@/services/admin/create-delivery-partner";

export const POST = asyncHandler(async (request: Request) => {
    const decoded = await validateToken();
    if (decoded.role !== "admin")
        throw new ApiError(403, "Unauthorized")
    const body = await request.json();
    const payload = deliveryPartnerSchema.parse(body);
    await createDeliveryPartner(payload);
    return Response.json(apiResponse("Delivery partner created successfully"), { status: 201 })
})

export const GET = asyncHandler(async (request: Request) => {
    const decoded = await validateToken();
    if (decoded.role !== "admin")
        throw new ApiError(403, "Unauthorized")

    const { searchParams } = new URL(request.url);
    const roleParam = searchParams.get("role") || "delivery-partner";
    const role = (roleParam === "customer" ? "customer" : "delivery-partner") as "customer" | "delivery-partner";

    const users = await getUserListing(role);
    return Response.json(apiResponse("Users fetched successfully", users), { status: 200 })
})
