import "server-only";
export function apiResponse<T, X>(message: string, data?: T, meta?: X): {message: string, data?: {data: T}, meta?: X} {
    return {
        message,
        ...data && ({
            data: {data}
        }),
        ...meta && {meta}
    }
}