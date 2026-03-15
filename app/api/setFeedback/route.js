import {
  createUserFeedbackController,
  updateUserFeedbackController,
} from "@/controllers/userFeedback.controller";
import { createSuccessResponse } from "@/utils/api.util";
import { requireApiSession } from "@/utils/routeAuth.util";
import wrapAsync from "@/utils/wrapAsync.util";

export const POST = wrapAsync(async function POST(request) {
  const { session, errorResponse } = await requireApiSession(request);

  if (errorResponse) {
    return errorResponse;
  }

  const body = await request.json();
  const result = await createUserFeedbackController(body, session.user);

  return createSuccessResponse(result);
}, "Failed to save feedback.");

export const PATCH = wrapAsync(async function PATCH(request) {
  const { session, errorResponse } = await requireApiSession(request);

  if (errorResponse) {
    return errorResponse;
  }

  const body = await request.json();
  const result = await updateUserFeedbackController(body, session.user);

  return createSuccessResponse(result);
}, "Failed to update feedback.");
