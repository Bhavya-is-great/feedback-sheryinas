import { toggleFeedbackLikeController } from "@/controllers/userFeedback.controller";
import { createSuccessResponse } from "@/utils/api.util";
import { requireApiSession } from "@/utils/routeAuth.util";
import wrapAsync from "@/utils/wrapAsync.util";

export const POST = wrapAsync(async function POST(request) {
  const { session, errorResponse } = await requireApiSession(request);

  if (errorResponse) {
    return errorResponse;
  }

  const body = await request.json();
  const result = await toggleFeedbackLikeController(body, session.user);

  return createSuccessResponse(result);
}, "Failed to update feedback like.");
