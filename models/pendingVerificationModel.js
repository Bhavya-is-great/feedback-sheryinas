import mongoose from "mongoose";

const pendingVerificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
    },
    otp: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
      expires: 0,
    },
    firstSentAt: {
      type: Date,
      required: true,
    },
    lastSentAt: {
      type: Date,
      required: true,
    },
    resendCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const PendingVerification =
  mongoose.models.PendingVerification ||
  mongoose.model("PendingVerification", pendingVerificationSchema);

export default PendingVerification;
