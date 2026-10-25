import "server-only";

import { connectDb } from "@/lib/db";
import User from "@/models/user.model";
import { comparePassword } from "@/lib/bycrypt";
import { generateJwtToken } from "@/lib/jsonwebtoken";
import { cookies } from 'next/headers'
import type { LoginPayload } from "@/lib/client-api/auth/types";

export async function login(payload: LoginPayload): Promise<{ message: string }> {
    await connectDb();
    const user = await User.findOne({email: payload.email});
    if(!user)
        throw new Error("Invalid credentials");
    console.log("User", user, user.password)

    const isMatched = await comparePassword(user.password, payload.password);
    if(!isMatched)
        throw new Error("Invalid credentials");
    const access_token = generateJwtToken({_id: user._id, role: user.role}, "accessToken")
    const refresh_token = generateJwtToken({_id: user._id, role: user.role}, "refreshToken", payload.rememberMe);
    const cookieStore = await cookies()
    const mode = process.env.MODE
    cookieStore.set({name: "access_token", value: access_token, httpOnly: mode !== "dev"});
    cookieStore.set({name: "refresh_token", value: refresh_token, httpOnly: mode !== "dev"});
    return {message: "Logged in successfully"};
}