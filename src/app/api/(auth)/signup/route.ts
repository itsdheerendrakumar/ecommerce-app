import { hashPassword } from "@/lib/bycrypt";
import { signupSchema } from "@/lib/validations/auth";
import { signup } from "@/services/auth";
import { asyncHandler } from "@/lib/api-async-handler";
import { apiResponse } from "@/lib/api-response";

export const POST = asyncHandler(async (request: Request) => {
    const body = await request.json();
    const parseBody = signupSchema.parse(body);
    const hash = await hashPassword(body.password);
    parseBody.password = hash;
    const { confirmPassword, ...rest } = parseBody;

    const response = await signup(rest)

    return Response.json(apiResponse("User created successfully", response))
})