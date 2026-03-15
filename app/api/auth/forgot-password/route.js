import { forgotPasswordController } from "@/controllers/auth.controller";
import { createErrorResponse, createSuccessResponse } from "@/utils/api.util";
import { getSiteBaseUrl } from "@/utils/siteUrl.util";

export async function POST(request) {
  try {
    const body = await request.json();
    const result = await forgotPasswordController(body, getSiteBaseUrl(request.nextUrl.origin));
    return createSuccessResponse(result);
  } catch (error) {
    return createErrorResponse(error, "Failed to send reset link.");
  }
}
