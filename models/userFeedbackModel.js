import mongoose from "mongoose";

const userFeedbackSchema = new mongoose.Schema(
  {
    feedbackId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Feedback",
      required: true,
      index: true,
    },
    feedbackTitle: {
      type: String,
      required: true,
      trim: true,
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    authorName: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1200,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

userFeedbackSchema.index({ feedbackId: 1, authorId: 1 }, { unique: true });

const existingUserFeedbackModel = mongoose.models.UserFeedback;

if (existingUserFeedbackModel && !existingUserFeedbackModel.schema.path("feedbackId")) {
  delete mongoose.models.UserFeedback;
}

const UserFeedback =
  mongoose.models.UserFeedback || mongoose.model("UserFeedback", userFeedbackSchema);

let ensureUserFeedbackIndexesPromise = null;

export async function ensureUserFeedbackIndexes() {
  if (!ensureUserFeedbackIndexesPromise) {
    ensureUserFeedbackIndexesPromise = (async () => {
      const indexes = await UserFeedback.collection.indexes();
      const legacyAuthorIndex = indexes.find(
        (index) =>
          index.name === "authorId_1" &&
          index.unique &&
          Object.keys(index.key || {}).length === 1 &&
          index.key?.authorId === 1
      );

      if (legacyAuthorIndex) {
        await UserFeedback.collection.dropIndex("authorId_1");
        await UserFeedback.collection.createIndex({ authorId: 1 }, { name: "authorId_1" });
      }

      const hasCompoundIndex = indexes.some(
        (index) =>
          index.name === "feedbackId_1_authorId_1" &&
          index.unique &&
          index.key?.feedbackId === 1 &&
          index.key?.authorId === 1
      );

      if (!hasCompoundIndex) {
        await UserFeedback.collection.createIndex(
          { feedbackId: 1, authorId: 1 },
          { name: "feedbackId_1_authorId_1", unique: true }
        );
      }
    })().catch((error) => {
      ensureUserFeedbackIndexesPromise = null;
      throw error;
    });
  }

  return ensureUserFeedbackIndexesPromise;
}

export default UserFeedback;
