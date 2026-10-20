import { connectDb } from "@/lib/db";

export async function POST(request: Request) {
    try {
        await connectDb();

    } catch (error) {
        console.log({ error })
    }
    const body = await request.json();
    console.log(body);
    return Response.json(
        { message: "payload received" },
        { status: 201 }
    )

}