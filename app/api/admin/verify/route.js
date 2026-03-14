import { NextResponse } from "next/server";
import { isMainPasswordValid } from "@/utils/adminAuth";

export async function POST(request) {
  try {
    const { password } = await request.json();

    if (!isMainPasswordValid(password)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid admin password.",
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Admin unlocked.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to verify admin password.",
      },
      { status: 500 }
    );
  }
}
