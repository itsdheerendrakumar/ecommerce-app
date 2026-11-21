import { NextResponse } from "next/server";
import { cleanupAbandonedUploads } from "@/services/admin/product.service";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  // In production, verify the CRON_SECRET bearer token
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      { message: "Unauthorized: Invalid or missing CRON_SECRET" },
      { status: 401 }
    );
  }

  try {
    const result = await cleanupAbandonedUploads();
    return NextResponse.json(
      {
        success: true,
        message: "Automated cleanup completed successfully",
        data: result,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Automated cron cleanup failed:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Automated cron cleanup failed",
        error: error?.message || "Internal server error",
      },
      { status: 500 }
    );
  }
}

// Allow POST triggers as well (e.g. from external webhook or schedulers)
export const POST = GET;
