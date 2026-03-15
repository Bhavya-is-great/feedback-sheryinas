import {
  getCurrentUserFeedbackController,
  listUserFeedbacksController,
} from "@/controllers/userFeedback.controller";
import { createSuccessResponse } from "@/utils/api.util";
import { requireApiSession } from "@/utils/routeAuth.util";
import wrapAsync from "@/utils/wrapAsync.util";

export const GET = wrapAsync(async function GET(request) {
  const { session, errorResponse } = await requireApiSession(request);

  if (errorResponse) {
    return errorResponse;
  }

  const feedbackId = request.nextUrl.searchParams.get("feedbackId");
  const currentUserResult = await getCurrentUserFeedbackController(session.user, feedbackId);
  const listResult = await listUserFeedbacksController(session.user, feedbackId);

  return createSuccessResponse({
    success: true,
    status: 200,
    data: {
      feedbackWindow: listResult.data.feedbackWindow,
      feedbacks: listResult.data.feedbacks,
      currentUserFeedback: currentUserResult.data,
    },
  });
}, "Failed to fetch user feedbacks.");
