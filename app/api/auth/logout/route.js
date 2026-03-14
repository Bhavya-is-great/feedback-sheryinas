import { logoutController } from "@/controllers/auth.controller";
import { createErrorResponse, createSuccessResponse } from "@/utils/api.util";
import { clearSessionCookie, SESSION_COOKIE_NAME } from "@/utils/session.util";

export async function POST(request) {
  try {
    const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const result = await logoutController(sessionToken);
    const response = createSuccessResponse(result);

    clearSessionCookie(response);

    return response;
  } catch (error) {
    return createErrorResponse(error, "Failed to log out.");
  }
}
