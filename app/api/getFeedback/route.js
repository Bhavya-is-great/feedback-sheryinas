import { getFeedbackController } from "@/controllers/feedback.controller";
import { createErrorResponse, createSuccessResponse } from "@/utils/api.util";
import { requireApiSession } from "@/utils/routeAuth.util";

export async function GET(request) {
  try {
    const { errorResponse } = await requireApiSession(request);

    if (errorResponse) {
      return errorResponse;
    }

    const result = await getFeedbackController();

    return createSuccessResponse(result);
  } catch (error) {
    return createErrorResponse(error, "Failed to fetch feedbacks.");
  }
}
