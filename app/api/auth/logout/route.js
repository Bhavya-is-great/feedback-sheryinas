import { logoutController } from "@/controllers/auth.controller";
import { createErrorResponse, createSuccessResponse } from "@/utils/api.util";
import { removePendingVerificationCookie } from "@/utils/pendingVerification.util";
import { removeSessionCookie, SESSION_COOKIE_NAME } from "@/utils/session.util";

export async function POST(request) {
  try {
    const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const result = await logoutController(sessionToken);
    await removeSessionCookie();
    await removePendingVerificationCookie();
    return createSuccessResponse(result);
  } catch (error) {
    return createErrorResponse(error, "Failed to log out.");
  }
}
