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

    if (roleParam !== "customer" && roleParam !== "delivery-partner") {
        throw new ApiError(400, "Invalid role. Role must be 'customer' or 'delivery-partner'");
    }

    const page = parseInt(searchParams.get("page") || "1", 10) || 1;
    const limit = parseInt(searchParams.get("limit") || "10", 10) || 10;
    const search = searchParams.get("search") || undefined;
    const startDate = searchParams.get("startDate") || undefined;
    const endDate = searchParams.get("endDate") || undefined;

    const { users, meta } = await getUserListing({
        role: roleParam,
        page,
        limit,
        search,
        startDate,
        endDate,
    });

    return Response.json(apiResponse("Users fetched successfully", users, meta), { status: 200 })
})
