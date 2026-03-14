import { createFeedbackController } from "@/controllers/feedback.controller";
import { createErrorResponse, createSuccessResponse } from "@/utils/api.util";
import { requireApiSession } from "@/utils/routeAuth.util";

export async function POST(request) {
  try {
    const { errorResponse } = await requireApiSession(request, {
      adminOnly: true,
    });

    if (errorResponse) {
      return errorResponse;
    }

    const body = await request.json();
    const result = await createFeedbackController(body);

    return createSuccessResponse(result);
  } catch (error) {
    return createErrorResponse(error, "Failed to create feedback.");
  }
}
