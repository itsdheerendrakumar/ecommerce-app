import { connectDb } from "@/lib/db";
import { validateToken } from "@/lib/validateToken";
import User from "@/models/user.model";

export async function GET() {
    const decoded = await validateToken();
    await connectDb();
    const user = await User.findById(decoded._id).select("-password");
    return Response.json({user})
}