import { asyncHandler } from "@/lib/api-async-handler";
import { apiResponse } from "@/lib/api-response";
import { connectDb } from "@/lib/db";
import { validateToken } from "@/lib/validateToken";
import User from "@/models/user.model";

export const GET = asyncHandler(async () => {
    const decoded = await validateToken();
    await connectDb();
    const user = await User.findById(decoded._id).select("-password");
    return Response.json(apiResponse("User fetched successfully", user), { status: 200 })
})