import { asyncHandler } from "@/lib/api-async-handler";
import ApiError from "@/lib/api-error";
import { apiResponse } from "@/lib/api-response";
import { validateToken } from "@/lib/validateToken";
import { getUserDetail } from "@/services/admin/create-delivery-partner";

export const GET = asyncHandler(
    async (_request, context) => {
        const decoded = await validateToken();
        if (decoded.role !== "admin") {
            throw new ApiError(403, "Unauthorized");
        }

        const params = await context.params;
        const id = params?.id;
        if (!id) {
            throw new ApiError(400, "User ID is required");
        }

        const user = await getUserDetail(id);

        return Response.json(
            apiResponse("User details fetched successfully", user),
            { status: 200 }
        );
    }
);
