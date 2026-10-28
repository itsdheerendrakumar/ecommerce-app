import "server-only";
export class ApiError extends Error {
    statusCode: number;
    errors: unknown[];

    constructor(
        statusCode: number = 500,
        message: string = "Internal Server Error",
        errors: unknown[] = [],
    ) {
        super(message);
        this.statusCode = statusCode;
        this.message = message;        
        this.errors = errors;
        Error.captureStackTrace(this, this.constructor);
    }
}

export default ApiError;