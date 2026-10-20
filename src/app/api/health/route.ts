import { NextResponse } from "next/server";

export function GET() {
    return NextResponse.json(
        {message: "Server is healthy and running"},
        {status: 200}
    )
}