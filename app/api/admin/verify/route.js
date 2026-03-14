import { NextResponse } from "next/server";
import { requireApiSession } from "@/utils/routeAuth.util";

export async function POST(request) {
  try {
    const { errorResponse } = await requireApiSession(request, {
      adminOnly: true,
    });

    if (errorResponse) {
      return errorResponse;
    }

    return NextResponse.json({
      success: true,
      message: "Admin verified.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to verify admin access.",
      },
      { status: 500 }
    );
  }
}
