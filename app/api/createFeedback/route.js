import { createFeedbackController, updateFeedbackController } from "@/controllers/feedback.controller";
import { createSuccessResponse } from "@/utils/api.util";
import { requireApiSession } from "@/utils/routeAuth.util";
import wrapAsync from "@/utils/wrapAsync.util";

export const POST = wrapAsync(async function POST(request) {
  const { errorResponse } = await requireApiSession(request, {
    adminOnly: true,
  });

  if (errorResponse) {
    return errorResponse;
  }

  const body = await request.json();
  const result = await createFeedbackController(body);

  return createSuccessResponse(result);
}, "Failed to create feedback.");

export const PATCH = wrapAsync(async function PATCH(request) {
  const { errorResponse } = await requireApiSession(request, {
    adminOnly: true,
  });

  if (errorResponse) {
    return errorResponse;
  }

  const body = await request.json();
  const result = await updateFeedbackController(body.feedbackId, body);

  return createSuccessResponse(result);
}, "Failed to update feedback.");
