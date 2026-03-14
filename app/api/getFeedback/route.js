import { getFeedbackController } from "@/controllers/feedback.controller";
import { createErrorResponse, createSuccessResponse } from "@/utils/api.util";

export async function GET() {
  try {
    const result = await getFeedbackController();

    return createSuccessResponse(result);
  } catch (error) {
    return createErrorResponse(error, "Failed to fetch feedbacks.");
  }
}
