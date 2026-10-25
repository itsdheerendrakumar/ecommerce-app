import { hashPassword } from "@/lib/bycrypt";
import { signupSchema } from "@/lib/validations/auth";
import { signup } from "@/services/auth";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const parseBody = signupSchema.parse(body);
        const hash = await hashPassword(body.password);
        parseBody.password = hash;
        const { confirmPassword, ...rest } = parseBody;

        const response = await signup(rest)

        return Response.json(response)
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        console.log(errorMessage)
        return Response.json({error: errorMessage}, {status: 400})
    }
}