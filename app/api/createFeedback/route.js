import { NextResponse } from "next/server";
import { createFeedbackController } from "@/controllers/feedback.controller";
import { isMainPasswordValid } from "@/utils/adminAuth";
import { createErrorResponse, createSuccessResponse } from "@/utils/api.util";

export async function POST(request) {
  try {
    const adminPassword = request.headers.get("x-admin-password");

    if (!isMainPasswordValid(adminPassword)) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized admin access.",
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const result = await createFeedbackController(body);

    return createSuccessResponse(result);
  } catch (error) {
    return createErrorResponse(error, "Failed to create feedback.");
  }
}
