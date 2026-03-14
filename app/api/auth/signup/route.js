import { signupController } from "@/controllers/auth.controller";
import { createErrorResponse, createSuccessResponse } from "@/utils/api.util";
import { applySessionCookie } from "@/utils/session.util";

export async function POST(request) {
  try {
    const body = await request.json();
    const result = await signupController(body);
    const response = createSuccessResponse(result);

    if (result.session) {
      applySessionCookie(response, result.session);
    }

    return response;
  } catch (error) {
    return createErrorResponse(error, "Failed to create account.");
  }
}
