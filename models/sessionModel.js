import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tokenHash: {
      type: String,
      required: true,
      unique: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
      expires: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Session =
  mongoose.models.Session || mongoose.model("Session", sessionSchema);

export default Session;
