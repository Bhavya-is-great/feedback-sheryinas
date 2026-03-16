import { connectDB } from "@/config/db.congif";
import mongoose from "mongoose";
import Feedback from "@/models/feedbackModel";
import UserFeedback, { ensureUserFeedbackIndexes } from "@/models/userFeedbackModel";
import { getFutureDate, getIstDayEndMs, getNowMs, getTime, isWithinIstDayRange } from "@/utils/date.util";
import ExpressError from "@/utils/Expresserror.util";

function normalizeFeedbackMessage(message) {
  return String(message || "").trim().replace(/\s+/g, " ");
}

function isFeedbackWindowClosed(feedbackWindow) {
  return !isWithinIstDayRange(feedbackWindow?.dateEnd);
}

function buildFeedbackResponse(feedback, currentUserId) {
  if (!feedback) {
    return null;
  }

  const likes = Array.isArray(feedback.likes) ? feedback.likes : [];
  const currentUserIdString = String(currentUserId || "");
  const normalizedLikes = likes.map((like) =>
    typeof like === "object" && like !== null
      ? {
          id: String(like._id || like.id || ""),
          name: like.name || "User",
        }
      : {
          id: String(like),
          name: "User",
        }
  );
  const likedByMe = normalizedLikes.some((like) => like.id === currentUserIdString);
  const isAnonymous = Boolean(feedback.feedbackWindow?.isAnonymous ?? feedback.isAnonymous);

  return {
    id: String(feedback._id),
    feedbackId: String(feedback.feedbackId),
    feedbackTitle: feedback.feedbackTitle,
    authorId: String(feedback.authorId),
    authorName: isAnonymous ? "User" : feedback.authorName,
    storedAuthorName: feedback.authorName,
    isAnonymous,
    message: feedback.message,
    likesCount: normalizedLikes.length,
    likes: normalizedLikes,
    likedByMe,
    createdAt: feedback.createdAt,
    updatedAt: feedback.updatedAt,
  };
}

async function getFeedbackWindowOrThrow(feedbackId) {
  const normalizedFeedbackId = String(feedbackId || "").trim();

  if (!normalizedFeedbackId) {
    throw new ExpressError(400, "feedbackId is required.");
  }

  const feedbackWindow = await Feedback.findById(normalizedFeedbackId).lean();

  if (!feedbackWindow) {
    throw new ExpressError(404, "Feedback window not found.");
  }

  return feedbackWindow;
}

export async function listUserFeedbacksController(currentUser, feedbackId) {
  await connectDB();
  await ensureUserFeedbackIndexes();
  const feedbackWindow = await getFeedbackWindowOrThrow(feedbackId);

  const feedbacks = await UserFeedback.find({ feedbackId: feedbackWindow._id })
    .populate("likes", "name")
    .lean();

  feedbacks.sort((left, right) => {
    const likesDifference =
      (Array.isArray(right.likes) ? right.likes.length : 0) -
      (Array.isArray(left.likes) ? left.likes.length : 0);

    if (likesDifference !== 0) {
      return likesDifference;
    }

    return getTime(right.createdAt) - getTime(left.createdAt);
  });

  return {
    success: true,
    status: 200,
    data: {
      feedbackWindow: {
        id: String(feedbackWindow._id),
        title: feedbackWindow.title,
        batch: feedbackWindow.batch,
        dateStart: feedbackWindow.dateStart,
        dateEnd: feedbackWindow.dateEnd,
        isAnonymous: Boolean(feedbackWindow.isAnonymous),
      },
      feedbacks: feedbacks.map((feedback) =>
        buildFeedbackResponse(
          {
            ...feedback,
            feedbackWindow,
          },
          currentUser.id
        )
      ),
      currentUserFeedbackId:
        feedbacks.find((feedback) => String(feedback.authorId) === String(currentUser.id))?._id ??
        null,
    },
  };
}

export async function createUserFeedbackController(payload, currentUser) {
  const message = normalizeFeedbackMessage(payload?.message);
  const feedbackId = String(payload?.feedbackId || "").trim();

  if (!message) {
    throw new ExpressError(400, "Feedback message is required.");
  }

  if (message.length < 12) {
    throw new ExpressError(400, "Feedback must be at least 12 characters long.");
  }

  if (message.length > 1200) {
    throw new ExpressError(400, "Feedback must be 1200 characters or fewer.");
  }

  await connectDB();
  await ensureUserFeedbackIndexes();
  const feedbackWindow = await getFeedbackWindowOrThrow(feedbackId);

  if (isFeedbackWindowClosed(feedbackWindow)) {
    throw new ExpressError(400, "This feedback event is closed.");
  }

  const existingFeedback = await UserFeedback.findOne({
    feedbackId: feedbackWindow._id,
    authorId: currentUser.id,
  });

  if (existingFeedback) {
    throw new ExpressError(409, "You have already shared feedback for this feedback window.");
  }

  const now = getFutureDate(0);
  const authorObjectId = new mongoose.Types.ObjectId(String(currentUser.id));
  const insertResult = await UserFeedback.collection.insertOne({
    feedbackId: feedbackWindow._id,
    feedbackTitle: feedbackWindow.title,
    authorId: authorObjectId,
    authorName: currentUser.name,
    message,
    likes: [],
    createdAt: now,
    updatedAt: now,
  });

  const feedback = await UserFeedback.findById(insertResult.insertedId);

  return {
    success: true,
    status: 201,
    message: "Feedback shared successfully.",
    data: buildFeedbackResponse(
      {
        ...feedback.toObject(),
        feedbackWindow,
      },
      currentUser.id
    ),
  };
}

export async function updateUserFeedbackController(payload, currentUser) {
  const message = normalizeFeedbackMessage(payload?.message);
  const feedbackId = String(payload?.feedbackId || "").trim();

  if (!feedbackId) {
    throw new ExpressError(400, "feedbackId is required.");
  }

  if (!message) {
    throw new ExpressError(400, "Feedback message is required.");
  }

  if (message.length < 12) {
    throw new ExpressError(400, "Feedback must be at least 12 characters long.");
  }

  if (message.length > 1200) {
    throw new ExpressError(400, "Feedback must be 1200 characters or fewer.");
  }

  await connectDB();
  await ensureUserFeedbackIndexes();

  const feedback = await UserFeedback.findById(feedbackId);

  if (!feedback) {
    throw new ExpressError(404, "Feedback not found.");
  }

  if (String(feedback.authorId) !== String(currentUser.id)) {
    throw new ExpressError(403, "You can only edit your own feedback.");
  }

  const feedbackWindow = await getFeedbackWindowOrThrow(feedback.feedbackId);

  if (isFeedbackWindowClosed(feedbackWindow)) {
    throw new ExpressError(400, "This feedback event is closed.");
  }

  feedback.message = message;
  await feedback.save();

  const hydratedFeedback = await UserFeedback.findById(feedback._id)
    .populate("likes", "name")
    .lean();

  return {
    success: true,
    status: 200,
    message: "Feedback updated successfully.",
    data: buildFeedbackResponse(
      {
        ...hydratedFeedback,
        feedbackWindow,
      },
      currentUser.id
    ),
  };
}

export async function getCurrentUserFeedbackController(currentUser, feedbackId) {
  await connectDB();
  await ensureUserFeedbackIndexes();
  const feedbackWindow = await getFeedbackWindowOrThrow(feedbackId);

  const feedback = await UserFeedback.findOne({
    feedbackId: feedbackWindow._id,
    authorId: currentUser.id,
  })
    .populate("likes", "name")
    .lean();

  return {
    success: true,
    status: 200,
    data: buildFeedbackResponse(
      feedback
        ? {
            ...feedback,
            feedbackWindow,
          }
        : null,
      currentUser.id
    ),
  };
}

export async function toggleFeedbackLikeController(payload, currentUser) {
  const feedbackId = String(payload?.feedbackId || "").trim();

  if (!feedbackId) {
    throw new ExpressError(400, "feedbackId is required.");
  }

  await connectDB();
  await ensureUserFeedbackIndexes();

  const feedback = await UserFeedback.findById(feedbackId);

  if (!feedback) {
    throw new ExpressError(404, "Feedback not found.");
  }

  const currentUserId = String(currentUser.id);
  const alreadyLiked = feedback.likes.some((likeId) => String(likeId) === currentUserId);

  if (alreadyLiked) {
    feedback.likes = feedback.likes.filter((likeId) => String(likeId) !== currentUserId);
  } else {
    feedback.likes.push(currentUser.id);
  }

  await feedback.save();

  const hydratedFeedback = await UserFeedback.findById(feedback._id)
    .populate("likes", "name")
    .lean();
  const feedbackWindow = await getFeedbackWindowOrThrow(feedback.feedbackId);

  return {
    success: true,
    status: 200,
    message: alreadyLiked ? "Like removed." : "Feedback liked.",
    data: buildFeedbackResponse(
      {
        ...hydratedFeedback,
        feedbackWindow,
      },
      currentUser.id
    ),
  };
}
