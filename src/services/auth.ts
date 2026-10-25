import "server-only";
import { connectDb } from "@/lib/db";
import User from "@/models/user.model";
import type { SignupPayload } from "@/lib/client-api/auth/types";

export type SignupServicePayload = Omit<SignupPayload, "confirmPassword">;

export async function signup(payload: SignupServicePayload): Promise<{ message: string }> {
    await connectDb();
    const isExist = await User.findOne({email: payload.email});
    if(isExist)
        throw new Error("User already exists");
    const user = await User.create(payload);
    return {message: "Account created successfully"}
}