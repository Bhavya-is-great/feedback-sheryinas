import { getFeedbackController } from "@/controllers/feedback.controller";
import { createSuccessResponse } from "@/utils/api.util";
import { requireApiSession } from "@/utils/routeAuth.util";
import wrapAsync from "@/utils/wrapAsync.util";

export const GET = wrapAsync(async function GET(request) {
  const { session, errorResponse } = await requireApiSession(request);

  if (errorResponse) {
    return errorResponse;
  }

  const includeAll = request.nextUrl.searchParams.get("includeAll") === "true";
  const result = await getFeedbackController({
    includeFuture: includeAll && session?.user?.role === "admin",
  });

  return createSuccessResponse(result);
}, "Failed to fetch feedbacks.");
