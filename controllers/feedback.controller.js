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

export async function updateFeedbackController(feedbackId, payload) {
  const normalizedFeedbackId = String(feedbackId || "").trim();
  const validationError = validateFeedbackPayload(payload);

  if (!normalizedFeedbackId) {
    throw new ExpressError(400, "feedbackId is required.");
  }

  if (validationError) {
    throw new ExpressError(400, validationError);
  }

  await connectDB();

  const feedback = await Feedback.findByIdAndUpdate(
    normalizedFeedbackId,
    buildCreateFeedbackPayload(payload),
    {
      new: true,
      runValidators: true,
    }
  );

  if (!feedback) {
    throw new ExpressError(404, "Feedback window not found.");
  }

  return {
    success: true,
    status: 200,
    message: "Feedback updated successfully.",
    data: feedback,
  };
}

export async function getFeedbackController(options = {}) {
  await connectDB();

  const feedbacks = await Feedback.find({});

  return {
    success: true,
    status: 200,
    data: sortFeedbacksByDateStartDesc(feedbacks, options),
  };
}
