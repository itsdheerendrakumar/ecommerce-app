import { asyncHandler } from "@/lib/api-async-handler";
import { apiResponse } from "@/lib/api-response";
import { connectDb } from "@/lib/db";
import { validateToken } from "@/lib/validateToken";
import DeliveryPartner from "@/models/delivery-partner.model";
import User from "@/models/user.model";

export const GET = asyncHandler(async () => {
    const decoded = await validateToken();
    await connectDb();
    const userQuery = User.findById(decoded._id).select("-password");

    if (decoded.role === "delivery-partner") {
        userQuery.populate({
            path: "deliveryPartner",
            model: DeliveryPartner,
        });
    }

    const user = await userQuery;
    return Response.json(apiResponse("User fetched successfully", user), { status: 200 });
});