import { loginController } from "@/controllers/auth.controller";
import { createErrorResponse, createSuccessResponse } from "@/utils/api.util";
import {
  removePendingVerificationCookie,
  setPendingVerificationCookie,
} from "@/utils/pendingVerification.util";
import { removeSessionCookie, setSessionCookie } from "@/utils/session.util";

export async function POST(request) {
  try {
    const body = await request.json();
    const result = await loginController(body);

    if (result.session) {
      await setSessionCookie(result.session);
      await removePendingVerificationCookie();
    }

    if (result.pendingVerification) {
      await removeSessionCookie();
      await setPendingVerificationCookie(result.pendingVerification);
    }

    return createSuccessResponse(result);
  } catch (error) {
    return createErrorResponse(error, "Failed to log in.");
  }
}
