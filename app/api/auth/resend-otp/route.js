import { resendOtpController } from "@/controllers/auth.controller";
import { createErrorResponse, createSuccessResponse } from "@/utils/api.util";
import { setPendingVerificationCookie } from "@/utils/pendingVerification.util";

export async function POST(request) {
  try {
    const body = await request.json();
    const result = await resendOtpController(body);

    if (result.pendingVerification) {
      await setPendingVerificationCookie(result.pendingVerification);
    }

    return createSuccessResponse(result);
  } catch (error) {
    return createErrorResponse(error, "Failed to resend OTP.");
  }
}
