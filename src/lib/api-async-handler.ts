import "server-only";
import type { NextRequest } from "next/server";

type RouteHandler = (
    request: NextRequest,
    context: { params: Promise<Record<string, string>> }
) => Response | Promise<Response>;

export function asyncHandler(handler: RouteHandler) {
    return async (
        request: NextRequest,
        context: { params: Promise<Record<string, string>> }
    ): Promise<Response> => {
        try {
            return await handler(request, context);
        } catch (error: any) {
            return Response.json({ message: error?.message || "Internal server error" }, { status: error.statusCode || 500 })
        }
    };
}
