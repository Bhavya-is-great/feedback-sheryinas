import { createSuccessResponse } from "@/utils/api.util";
import { getCurrentPendingVerification } from "@/utils/pendingVerification.util";

export async function GET() {
  const pendingVerification = await getCurrentPendingVerification();

  return createSuccessResponse({
    success: true,
    status: 200,
    data: pendingVerification
      ? {
          email: pendingVerification.user.email,
        }
      : null,
  });
}
