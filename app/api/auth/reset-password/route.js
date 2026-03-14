import { resetPasswordController } from "@/controllers/auth.controller";
import { createErrorResponse, createSuccessResponse } from "@/utils/api.util";
import { applySessionCookie } from "@/utils/session.util";

export async function POST(request) {
  try {
    const body = await request.json();
    const result = await resetPasswordController(body);
    const response = createSuccessResponse(result);

    if (result.session) {
      applySessionCookie(response, result.session);
    }

    return response;
  } catch (error) {
    return createErrorResponse(error, "Failed to reset password.");
  }
}
