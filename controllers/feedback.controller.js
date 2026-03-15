import { connectDB } from "@/config/db.congif";
import Feedback from "@/models/feedbackModel";
import ExpressError from "@/utils/Expresserror.util";
import {
  buildCreateFeedbackPayload,
  sortFeedbacksByDateStartDesc,
  validateFeedbackPayload,
} from "@/utils/feedback.util";

export async function createFeedbackController(payload) {
  const validationError = validateFeedbackPayload(payload);

  if (validationError) {
    throw new ExpressError(400, validationError);
  }

  await connectDB();

  const feedback = await Feedback.create(buildCreateFeedbackPayload(payload));

  return {
    success: true,
    status: 201,
    message: "Feedback created successfully.",
    data: feedback,
  };
}

export async function getFeedbackController() {
  await connectDB();

  const feedbacks = await Feedback.find({});

  return {
    success: true,
    status: 200,
    data: sortFeedbacksByDateStartDesc(feedbacks),
  };
}
