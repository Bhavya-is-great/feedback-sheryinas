import { verifyOtpController } from "@/controllers/auth.controller";
import { createErrorResponse, createSuccessResponse } from "@/utils/api.util";
import { removePendingVerificationCookie } from "@/utils/pendingVerification.util";
import { setSessionCookie } from "@/utils/session.util";

export async function POST(request) {
  try {
    const body = await request.json();
    const result = await verifyOtpController(body);

    if (result.session) {
      await setSessionCookie(result.session);
    }

    await removePendingVerificationCookie();

    return createSuccessResponse(result);
  } catch (error) {
    return createErrorResponse(error, "Failed to verify OTP.");
  }
}
