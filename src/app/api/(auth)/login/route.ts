import { connectDb } from "@/lib/db";
import { loginSchema } from "@/lib/validations/auth";
import { login } from "@/services/login";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const validatedBody = loginSchema.parse(body);
        const user = await login(validatedBody);
        return Response.json({data: user})

    } catch (error: unknown) {
        console.log({error})
        const errorMessage = error instanceof Error ? error.message : "Internal server error";
        return Response.json({message: errorMessage}, {status: 400})
    }

}